import { useState, useRef, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Camera, Save, Eye, EyeOff, KeyRound, User, Phone, Mail, Droplet, Weight, Calendar } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import axiosInstance from '../../api/axiosInstance';
import { AUTH, PATIENT } from '../../api/endpoints';
import { getApiErrorMessage } from '../../utils/apiError';
import { BENI_SUEF_GOV_AR, BENI_SUEF_MARKAZ_AR, BENI_SUEF_MARKAZ_EN } from '../../data/beniSuefGovernorate';
import { personalFormFromUser, storedAreaFromDisplayMarkaz } from '../../utils/patientProfileForm';
import { setAuthUser } from '../../features/auth/authSlice';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', icon: Icon }) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-start placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition pe-10"
      />
      {Icon && <Icon size={15} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />}
    </div>
  );
}

export default function PatientProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const isEn = String(i18n.language || '').startsWith('en');
  const markazOptions = useMemo(
    () => (isEn ? BENI_SUEF_MARKAZ_EN : BENI_SUEF_MARKAZ_AR),
    [isEn]
  );

  const [activeTab, setActiveTab] = useState('personal');
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [personalForm, setPersonalForm] = useState(() => personalFormFromUser(user || {}, isEn));

  useEffect(() => {
    if (!user?.id) return;
    queueMicrotask(() => {
      setPersonalForm(personalFormFromUser(user, isEn));
    });
  }, [user, isEn]);

  useEffect(() => {
    if (avatarFile) return;
    queueMicrotask(() => {
      setAvatar(user?.avatar || null);
    });
  }, [user?.avatar, avatarFile, user]);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
      setAvatarFile(file);
      toast.info(t('patient.profile.avatarPick'));
    }
  };

  const handleSavePersonal = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', personalForm.name);
      formData.append('email', personalForm.email);
      formData.append('phone', personalForm.phone);
      formData.append('gender', personalForm.gender);
      formData.append('date_of_birth', personalForm.birthDate);
      if (personalForm.height !== '') {
        formData.append('height', String(Number(personalForm.height)));
      }
      if (personalForm.bloodType) formData.append('blood_type', personalForm.bloodType);
      if (personalForm.weight !== '') formData.append('weight', String(personalForm.weight).trim());
      formData.append('governorate', personalForm.governorate || BENI_SUEF_GOV_AR);
      formData.append('area', storedAreaFromDisplayMarkaz(personalForm.markaz));
      if (personalForm.address != null) formData.append('address', personalForm.address);
      if (avatarFile) formData.append('avatar', avatarFile);

      const { data } = await axiosInstance.post(PATIENT.PROFILE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data?.user) {
        dispatch(setAuthUser(data.user));
      }

      setLoading(false);
      toast.success(t('patient.profile.personalSaved'));
    } catch (err) {
      setLoading(false);
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
    }
  };

  const handleSavePassword = async () => {
    if (!passwordForm.currentPassword) {
      toast.error(t('patient.profile.currentPass'));
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error(t('patient.profile.newPassShort'));
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t('patient.profile.passMismatch'));
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.put(AUTH.CHANGE_PASSWORD, {
        current_password: passwordForm.currentPassword,
        password: passwordForm.newPassword,
        password_confirmation: passwordForm.confirmPassword,
      });

      setLoading(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success(t('patient.profile.passwordChanged'));
    } catch (err) {
      setLoading(false);
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
    }
  };

  const tabs = useMemo(
    () => [
      { key: 'personal', label: t('patient.profile.tabPersonal') },
      { key: 'password', label: t('patient.profile.tabPassword') },
    ],
    [t]
  );

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">{t('patient.profile.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('patient.profile.subtitle')}</p>
      </div>

      <div className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 flex items-center gap-5 flex-wrap">
        <div className="flex-1 text-start min-w-0">
          <h3 className="font-bold text-gray-800">{personalForm.name}</h3>
          <p className="text-blue-500 text-sm mt-0.5 break-all">{personalForm.email}</p>
          <p className="text-gray-400 text-xs mt-0.5">
            {t('patient.profile.roleLine', {
              gov: t('patient.profile.govName'),
              markaz: personalForm.markaz,
            })}
          </p>
        </div>
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-blue-100 overflow-hidden">
            {avatar ? (
              <img src={avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={32} className="text-blue-400" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -end-2 w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors"
          >
            <Camera size={14} className="text-white" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
      </div>

      <div className="flex gap-2 bg-white rounded-xl shadow-sm p-1 w-fit">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === key ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'personal' && (
        <div className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 md:p-6 space-y-5">
          <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-3">{t('patient.profile.basicInfo')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={t('patient.profile.fieldName')}>
              <Input
                value={personalForm.name}
                onChange={(v) => setPersonalForm({ ...personalForm, name: v })}
                placeholder={t('patient.profile.phName')}
                icon={User}
              />
            </Field>
            <Field label={t('patient.profile.fieldPhone')}>
              <Input
                value={personalForm.phone}
                onChange={(v) => setPersonalForm({ ...personalForm, phone: v })}
                placeholder="01xxxxxxxxx"
                icon={Phone}
              />
            </Field>
            <Field label={t('patient.profile.fieldEmail')}>
              <Input
                value={personalForm.email}
                onChange={(v) => setPersonalForm({ ...personalForm, email: v })}
                placeholder="example@mail.com"
                type="email"
                icon={Mail}
              />
            </Field>
            <Field label={t('patient.profile.fieldBirth')}>
              <Input value={personalForm.birthDate} onChange={(v) => setPersonalForm({ ...personalForm, birthDate: v })} type="date" icon={Calendar} />
            </Field>
            <Field label={t('patient.profile.fieldGender')}>
              <select
                value={personalForm.gender}
                onChange={(e) => setPersonalForm({ ...personalForm, gender: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none bg-white"
              >
                <option value="male">{t('patient.profile.genderMale')}</option>
                <option value="female">{t('patient.profile.genderFemale')}</option>
              </select>
            </Field>
            <Field label={t('patient.profile.fieldGov')}>
              <input
                readOnly
                value={t('patient.profile.govName')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-start bg-slate-50 text-slate-700"
              />
            </Field>
            <Field label={t('patient.profile.fieldMarkaz')}>
              <select
                value={personalForm.markaz}
                onChange={(e) => setPersonalForm({ ...personalForm, markaz: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none bg-white"
              >
                {markazOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>
            <div className="md:col-span-2">
              <Field label={t('patient.profile.fieldAddress')}>
                <textarea
                  value={personalForm.address}
                  onChange={(e) => setPersonalForm({ ...personalForm, address: e.target.value })}
                  rows={2}
                  placeholder={t('patient.profile.addressPh')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none bg-white"
                />
              </Field>
            </div>
          </div>

          <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-3 mt-2">{t('patient.profile.healthInfo')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label={t('patient.profile.fieldBlood')}>
              <div className="relative">
                <select
                  value={personalForm.bloodType}
                  onChange={(e) => setPersonalForm({ ...personalForm, bloodType: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none bg-white pe-10"
                >
                  <option value="">{t('patient.profile.bloodPlaceholder')}</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <Droplet size={15} className="absolute end-3 top-1/2 -translate-y-1/2 text-red-400 pointer-events-none" />
              </div>
            </Field>
            <Field label={t('patient.profile.fieldWeight')}>
              <div className="relative">
                <input
                  type="number"
                  value={personalForm.weight}
                  onChange={(e) => setPersonalForm({ ...personalForm, weight: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition pe-10"
                />
                <Weight size={15} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </Field>
            <Field label={t('patient.profile.fieldHeight')}>
              <input
                type="number"
                value={personalForm.height}
                onChange={(e) => setPersonalForm({ ...personalForm, height: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </Field>
          </div>

          <button
            type="button"
            onClick={handleSavePersonal}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <Save size={15} />
            )}
            {t('patient.profile.save')}
          </button>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 md:p-6 space-y-4">
          <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-3">{t('patient.profile.changePasswordTitle')}</h3>
          {[
            { label: t('patient.profile.passCurrentLabel'), key: 'currentPassword', show: 'current' },
            { label: t('patient.profile.passNewLabel'), key: 'newPassword', show: 'new' },
            { label: t('patient.profile.passConfirmLabel'), key: 'confirmPassword', show: 'confirm' },
          ].map(({ label, key, show }) => (
            <Field key={key} label={label}>
              <div className="relative">
                <input
                  type={showPass[show] ? 'text' : 'password'}
                  value={passwordForm[key]}
                  onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 ps-10 pe-10 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <KeyRound size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPass({ ...showPass, [show]: !showPass[show] })}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPass[show] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>
          ))}

          {passwordForm.newPassword && (
            <div>
              <p className="text-xs text-gray-400 text-start mb-1">{t('patient.profile.passStrength')}</p>
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1.5 rounded-full transition-colors ${
                      passwordForm.newPassword.length >= i * 3
                        ? i === 1
                          ? 'bg-red-400'
                          : i === 2
                            ? 'bg-yellow-400'
                            : 'bg-green-500'
                        : 'bg-gray-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleSavePassword}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <KeyRound size={15} />
            )}
            {t('patient.profile.passChangeBtn')}
          </button>
        </div>
      )}
    </div>
  );
}

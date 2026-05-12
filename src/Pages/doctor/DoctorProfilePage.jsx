import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Camera, Save, Eye, EyeOff, KeyRound, User, Phone, Mail, MapPin, Clock, Star } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import axiosInstance from '../../api/axiosInstance';
import { AUTH, DOCTOR } from '../../api/endpoints';
import { getApiErrorMessage } from '../../utils/apiError';
import { getApiOrigin } from '../../utils/apiOrigin';
import { setAuthUser } from '../../features/auth/authSlice';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{label}</label>
      {children}
    </div>
  );
}

function SaveBtn({ label, onClick, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
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
      {label}
    </button>
  );
}

export default function DoctorProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const specialties = useMemo(() => t('doctor.profile.specialties', { returnObjects: true }) || [], [t]);
  const governorates = useMemo(() => t('doctor.profile.governorates', { returnObjects: true }) || [], [t]);
  const weekDays = useMemo(() => t('doctor.profile.weekDays', { returnObjects: true }) || [], [t]);

  const [activeTab, setActiveTab] = useState('personal');
  const apiOrigin = getApiOrigin();
  const [avatar, setAvatar] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [personalForm, setPersonalForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    specialtyIdx: 0,
    governorateIdx: 0,
    address: '',
    bio: user?.bio || '',
    consultationPrice: user?.consultation_price ? String(user.consultation_price) : '',
    workDayIndices: [0, 1, 2, 3, 4],
    startTime: '09:00',
    endTime: '17:00',
    sessionDuration: '30',
  });

  useEffect(() => {
    const normalizeAvatarUrl = (avatarValue) => {
      if (!avatarValue) return null;
      if (String(avatarValue).startsWith('http')) return avatarValue;
      return `${apiOrigin}/storage/${avatarValue}`;
    };

    const resolveIndexByValue = (arr, value) => {
      if (!value) return 0;
      const idx = arr.findIndex((v) => String(v).toLowerCase() === String(value).toLowerCase());
      return idx >= 0 ? idx : 0;
    };

    const hydrateFromUser = (u) => {
      if (!u) return;
      setAvatar(normalizeAvatarUrl(u.avatar || u.avatar_url || null));
      setPersonalForm((prev) => ({
        ...prev,
        name: u.name || '',
        phone: u.phone || '',
        email: u.email || '',
        specialtyIdx: resolveIndexByValue(specialties, u.specialty),
        governorateIdx: resolveIndexByValue(governorates, u.governorate),
        address: u.address || '',
        bio: u.bio || '',
        consultationPrice: u.consultation_price ? String(u.consultation_price) : '',
      }));
    };

    let cancelled = false;

    const loadProfile = async () => {
      try {
        const res = await axiosInstance.get(AUTH.ME);
        const freshUser = res.data?.user || null;
        if (cancelled || !freshUser) return;
        dispatch(setAuthUser(freshUser));
        hydrateFromUser(freshUser);
      } catch {
        if (!cancelled) {
          hydrateFromUser(user);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [apiOrigin, dispatch, governorates, specialties, user]);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  const specialtyLabel = specialties[personalForm.specialtyIdx] ?? '';
  const governorateLabel = governorates[personalForm.governorateIdx] ?? '';

  const toggleDay = (dayIdx) => {
    setPersonalForm((prev) => ({
      ...prev,
      workDayIndices: prev.workDayIndices.includes(dayIdx)
        ? prev.workDayIndices.filter((d) => d !== dayIdx)
        : [...prev.workDayIndices, dayIdx].sort((a, b) => a - b),
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
      setAvatarFile(file);
      toast.info(t('doctor.profile.toastAvatar'));
    }
  };

  const handleSavePersonal = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', personalForm.name);
      formData.append('email', personalForm.email);
      formData.append('phone', personalForm.phone);
      formData.append('specialty', specialtyLabel || '');
      formData.append('governorate', governorateLabel || '');
      formData.append('address', personalForm.address || '');
      formData.append('bio', personalForm.bio || '');
      formData.append('consultation_price', String(Number(personalForm.consultationPrice || 0)));
      if (avatarFile) formData.append('avatar', avatarFile);

      await axiosInstance.post(DOCTOR.PROFILE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const meRes = await axiosInstance.get(AUTH.ME);
      if (meRes.data?.user) {
        dispatch(setAuthUser(meRes.data.user));
      }

      setLoading(false);
      setAvatarFile(null);
      toast.success(t('doctor.profile.toastPersonalSaved'));
    } catch (err) {
      setLoading(false);
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
    }
  };

  const handleSavePassword = async () => {
    if (!passwordForm.currentPassword) {
      toast.error(t('doctor.profile.toastEnterCurrent'));
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error(t('doctor.profile.toastPasswordShort'));
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t('doctor.profile.toastPasswordMismatch'));
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
      toast.success(t('doctor.profile.toastPasswordChanged'));
    } catch (err) {
      setLoading(false);
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
    }
  };

  const previewDays = personalForm.workDayIndices.map((i) => weekDays[i]).filter(Boolean).join(t('doctor.profile.dayJoiner'));

  const sessionOptions = ['15', '20', '30', '45', '60'];

  const tabs = useMemo(
    () => [
      { key: 'personal', label: t('doctor.profile.tabPersonal') },
      { key: 'schedule', label: t('doctor.profile.tabSchedule') },
      { key: 'password', label: t('doctor.profile.tabPassword') },
    ],
    [t]
  );

  const passwordFields = useMemo(
    () => [
      { label: t('doctor.profile.currentPassword'), key: 'currentPassword', show: 'current' },
      { label: t('doctor.profile.newPassword'), key: 'newPassword', show: 'new' },
      { label: t('doctor.profile.confirmPassword'), key: 'confirmPassword', show: 'confirm' },
    ],
    [t]
  );

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen">
      <div className="text-start">
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">{t('doctor.profile.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('doctor.profile.subtitle')}</p>
      </div>

      <div className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 flex items-center gap-5 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock size={15} className="text-blue-400 shrink-0" />
            <span>{t('doctor.profile.sessionLine', { minutes: personalForm.sessionDuration })}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Star size={15} className="text-yellow-400 shrink-0" />
            <span>{t('doctor.profile.ratingLine', { value: '4.9' })}</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold text-blue-600">
            <span>{personalForm.consultationPrice}</span>
            <span className="text-gray-400 font-normal text-xs">{t('doctor.profile.currency')}</span>
            <span className="text-gray-400 font-normal text-xs">{t('doctor.profile.perConsult')}</span>
          </div>
        </div>
        <div className="flex-1 text-start min-w-0">
          <h3 className="font-bold text-gray-800 truncate">{personalForm.name}</h3>
          <p className="text-blue-500 text-sm mt-0.5">{specialtyLabel}</p>
          <p className="text-gray-400 text-xs mt-0.5 flex items-center justify-start gap-1">
            <MapPin size={11} className="shrink-0" />
            {governorateLabel}
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

      <div className="flex gap-2 bg-white rounded-xl shadow-sm p-1 w-fit flex-wrap">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === key ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'personal' && (
        <div className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 md:p-6 space-y-5">
          <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-3 text-start">{t('doctor.profile.sectionProfessional')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={t('doctor.profile.fullName')}>
              <div className="relative">
                <input
                  type="text"
                  value={personalForm.name}
                  onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pe-10 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <User size={15} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </Field>
            <Field label={t('doctor.profile.phone')}>
              <div className="relative">
                <input
                  type="text"
                  value={personalForm.phone}
                  onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pe-10 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <Phone size={15} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </Field>
            <Field label={t('doctor.profile.email')}>
              <div className="relative">
                <input
                  type="email"
                  value={personalForm.email}
                  onChange={(e) => setPersonalForm({ ...personalForm, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pe-10 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <Mail size={15} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </Field>
            <Field label={t('doctor.profile.specialty')}>
              <select
                value={personalForm.specialtyIdx}
                onChange={(e) => setPersonalForm({ ...personalForm, specialtyIdx: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none bg-white"
              >
                {specialties.map((s, i) => (
                  <option key={s} value={i}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('doctor.profile.governorate')}>
              <select
                value={personalForm.governorateIdx}
                onChange={(e) => setPersonalForm({ ...personalForm, governorateIdx: Number(e.target.value) })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none bg-white"
              >
                {governorates.map((g, i) => (
                  <option key={g} value={i}>
                    {g}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('doctor.profile.consultationPrice')}>
              <input
                type="number"
                value={personalForm.consultationPrice}
                onChange={(e) => setPersonalForm({ ...personalForm, consultationPrice: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </Field>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{t('doctor.profile.address')}</label>
              <input
                type="text"
                value={personalForm.address}
                onChange={(e) => setPersonalForm({ ...personalForm, address: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{t('doctor.profile.bio')}</label>
              <textarea
                value={personalForm.bio}
                onChange={(e) => setPersonalForm({ ...personalForm, bio: e.target.value })}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
              />
            </div>
          </div>
          <SaveBtn label={t('doctor.profile.saveChanges')} onClick={handleSavePersonal} loading={loading} />
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 md:p-6 space-y-5">
          <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-3 text-start">{t('doctor.profile.sectionSchedule')}</h3>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 text-start">{t('doctor.profile.workDaysLabel')}</label>
            <div className="flex flex-wrap gap-2 justify-start">
              {weekDays.map((day, idx) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(idx)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    personalForm.workDayIndices.includes(idx) ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label={t('doctor.profile.startTime')}>
              <input
                type="time"
                value={personalForm.startTime}
                onChange={(e) => setPersonalForm({ ...personalForm, startTime: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </Field>
            <Field label={t('doctor.profile.endTime')}>
              <input
                type="time"
                value={personalForm.endTime}
                onChange={(e) => setPersonalForm({ ...personalForm, endTime: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </Field>
            <Field label={t('doctor.profile.sessionDuration')}>
              <select
                value={personalForm.sessionDuration}
                onChange={(e) => setPersonalForm({ ...personalForm, sessionDuration: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none bg-white"
              >
                {sessionOptions.map((d) => (
                  <option key={d} value={d}>
                    {t('doctor.profile.sessionMinutes', { n: d })}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 text-start">
            <p className="text-xs font-bold text-blue-600 mb-1">{t('doctor.profile.schedulePreviewTitle')}</p>
            <p className="text-sm text-gray-700">{t('doctor.profile.schedulePreviewLine', { days: previewDays, start: personalForm.startTime, end: personalForm.endTime })}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t('doctor.profile.scheduleSessionNote', { duration: personalForm.sessionDuration })}</p>
          </div>

          <SaveBtn label={t('doctor.profile.saveChanges')} onClick={handleSavePersonal} loading={loading} />
        </div>
      )}

      {activeTab === 'password' && (
        <div className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 md:p-6 space-y-4">
          <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-3 text-start">{t('doctor.profile.sectionPassword')}</h3>
          {passwordFields.map(({ label, key, show }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{label}</label>
              <div className="relative">
                <input
                  type={showPass[show] ? 'text' : 'password'}
                  value={passwordForm[key]}
                  onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                  placeholder={t('doctor.profile.passwordPlaceholder')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 ps-10 pe-10 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <KeyRound size={15} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPass({ ...showPass, [show]: !showPass[show] })}
                  className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPass[show] ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleSavePassword}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            <KeyRound size={15} />
            {t('doctor.profile.changePassword')}
          </button>
        </div>
      )}
    </div>
  );
}

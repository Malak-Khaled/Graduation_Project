import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { registerUser } from '../../features/auth/authSlice';
import { useToast } from '../../context/ToastContext';
import BrandLogo from '../../components/BrandLogo';
import MedicalBackground from '../../components/MedicalBackground';
import PublicFooter from '../../components/PublicFooter';
import PublicNavbar from '../../components/PublicNavbar';
import { User, Camera, Eye, EyeOff, Mail, Phone, Lock, MapPin, Home, Weight, Droplet, Ruler } from 'lucide-react';
import { useDirection } from '../../hooks/useDirection';
import { BENI_SUEF_GOV_AR, GOVERNORATES_AR, AREAS_BY_GOV_AR } from '../../data/beniSuefGovernorate';

const GOVERNORATES = GOVERNORATES_AR;
const AREAS = AREAS_BY_GOV_AR;
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^01\d{9}$/;

async function prefetchPatientDashboard() {
  await Promise.all([
    import('../dashboard/DashboardLayout'),
    import('../dashboard/DashboardHome'),
    import('../dashboard/AppointmentsPage'),
  ]);
}

function InputField({ label, icon: Icon, type = 'text', value, onChange, placeholder, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{label}</label>
      {children || (
        <div className="relative">
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 ps-10 text-sm text-start placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white/80"
          />
          {Icon && <Icon size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />}
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const { t } = useTranslation();
  const { isLtr } = useDirection();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef(null);

  const [avatar, setAvatar] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '', phone: '', email: '', bloodType: '', weight: '',
    birthDate: '', gender: '', height: '',
    governorate: BENI_SUEF_GOV_AR, area: '', address: '', password: '', confirmPassword: '',
  });

  const set = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  const validateRegisterForm = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      return t('register.errors.basicFields');
    }

    if (!EMAIL_REGEX.test(form.email.trim())) {
      return t('register.errors.emailInvalid');
    }

    if (form.phone && !PHONE_REGEX.test(form.phone.trim())) {
      return t('register.errors.phoneInvalid');
    }

    if (form.password.length < 8) {
      return t('register.errors.passwordShort');
    }

    if (form.password !== form.confirmPassword) {
      return t('register.errors.passwordMismatch');
    }

    if (!PHONE_REGEX.test(form.phone.trim())) return t('register.errors.phoneRequired');
    if (!form.governorate || !form.area) return t('register.errors.locationRequired');
    if (!form.birthDate) return t('register.errors.birthRequired');
    if (!form.gender) return t('register.errors.genderRequired');
    const h = Number(form.height);
    if (!form.height || Number.isNaN(h)) return t('register.errors.heightRequired');
    if (h < 80 || h > 230) return t('register.errors.heightInvalid');

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateRegisterForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'confirmPassword') return;
      if (k === 'birthDate') {
        formData.append('date_of_birth', typeof v === 'string' ? v.trim() : v);
        return;
      }
      if (k === 'height') {
        formData.append('height', String(Number(v)));
        return;
      }
      if (k === 'bloodType') {
        formData.append('blood_type', typeof v === 'string' ? v.trim() : v);
        return;
      }
      formData.append(k, typeof v === 'string' ? v.trim() : v);
    });
    formData.append('password_confirmation', form.confirmPassword.trim());
    formData.append('role', 'patient');
    if (avatar) formData.append('avatar', avatar);

    const result = await dispatch(registerUser(formData));
    setLoading(false);

    if (registerUser.fulfilled.match(result)) {
      prefetchPatientDashboard().catch(() => {});
      toast.success(t('register.success'));
      navigate('/dashboard');
    } else {
      toast.error(result.payload || t('authErrors.registerFailed'));
    }
  };

  return (
    <div style={{ fontFamily: 'Cairo, sans-serif' }}>
      <MedicalBackground />
      <PublicNavbar />
      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 w-full">

        <div className="text-center mb-6">
          <BrandLogo className="h-20 w-20 object-contain mx-auto" />
          <h1 className="text-xl font-extrabold text-blue-600 mt-2">{t('register.brand')}</h1>
          <p className="text-gray-400 text-sm">{t('register.tagline')}</p>
        </div>

        <div className="card-hover bg-white/85 backdrop-blur-md rounded-2xl shadow-xl p-6 w-full max-w-lg">

          <h2 className="text-center font-extrabold text-blue-600 mb-2">
            {t('register.title')}
          </h2>
          <p className="text-center text-xs text-gray-500 mb-5">
            {t('register.subtitle')}
          </p>

          <div className="flex flex-col items-center mb-5">
            <div
              className="relative w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:border-blue-400 hover:shadow-md motion-reduce:hover:scale-100"
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
              role="button"
              tabIndex={0}
            >
              {avatar ? (
                <img src={URL.createObjectURL(avatar)} alt="" className="w-full h-full object-cover" />
              ) : (
                <Camera size={24} className="text-gray-400" />
              )}
              <div className="absolute bottom-0 end-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Camera size={12} className="text-white" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">{t('register.avatarHint')}</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setAvatar(e.target.files[0])} />
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputField label={t('register.fullName')} icon={User} value={form.name} onChange={set('name')} placeholder={t('register.placeholders.name')} />
              <InputField label={t('register.phone')} icon={Phone} value={form.phone} onChange={set('phone')} placeholder="01xxxxxxxxx" />
              <InputField label={t('register.email')} icon={Mail} value={form.email} onChange={set('email')} placeholder="example@mail.com" type="email" />
              <InputField label={t('register.bloodType')}>
                <div className="relative">
                  <select
                    value={form.bloodType}
                    onChange={(e) => set('bloodType')(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 ps-10 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none bg-white/80"
                  >
                    <option value="">{t('register.bloodPlaceholder')}</option>
                    {BLOOD_TYPES.map((b) => <option key={b}>{b}</option>)}
                  </select>
                  <Droplet size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-red-400" />
                </div>
              </InputField>
              <InputField label={t('register.birthDate')}>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => set('birthDate')(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white/80"
                />
              </InputField>
              <InputField label={t('register.gender')}>
                <div className="relative">
                  <select
                    value={form.gender}
                    onChange={(e) => set('gender')(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 ps-10 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none bg-white/80"
                  >
                    <option value="">{t('register.genderPh')}</option>
                    <option value="male">{t('register.genderMale')}</option>
                    <option value="female">{t('register.genderFemale')}</option>
                  </select>
                  <User size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </InputField>
              <InputField label={t('register.weight')} icon={Weight} value={form.weight} onChange={set('weight')} placeholder={t('register.placeholders.weight')} type="number" />
              <InputField label={t('register.height')} icon={Ruler} value={form.height} onChange={set('height')} placeholder={t('register.heightPh')} type="number" />
              <InputField label={t('register.governorate')}>
                <div className="relative">
                  <select
                    value={form.governorate}
                    onChange={(e) => {
                      set('governorate')(e.target.value);
                      set('area')('');
                    }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 ps-10 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none bg-white/80"
                  >
                    {GOVERNORATES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <MapPin size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </InputField>
              <InputField label={t('register.area')}>
                <div className="relative">
                  <select
                    value={form.area}
                    onChange={(e) => set('area')(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 ps-10 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none bg-white/80"
                  >
                    <option value="">{t('register.areaPh')}</option>
                    {(AREAS[form.governorate] || []).map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <Home size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </InputField>
            </div>
            <InputField label={t('register.address')} icon={Home} value={form.address} onChange={set('address')} placeholder={t('register.addressPh')} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{t('register.password')}</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => set('password')(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 ps-10 pe-9 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white/80"
                />
                <Lock size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{t('register.confirmPassword')}</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => set('confirmPassword')(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full border-2 rounded-xl px-4 py-2.5 ps-10 pe-9 text-sm text-start focus:outline-none transition bg-white/80 ${
                    form.confirmPassword && form.confirmPassword !== form.password ? 'border-red-300' :
                      form.confirmPassword && form.confirmPassword === form.password ? 'border-green-400' : 'border-gray-200'
                  }`}
                />
                <Lock size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-5 transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-blue-500/30 motion-reduce:hover:scale-100 motion-reduce:active:scale-100 bg-blue-600 text-white font-bold py-3.5 rounded-xl text-sm hover:bg-blue-700 disabled:opacity-60 disabled:hover:scale-100 disabled:active:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <>
                {!isLtr && <span>←</span>}
                <span>{t('register.submit')}</span>
                {isLtr && <span>→</span>}
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            {t('register.hasAccount')}{' '}
            <Link to="/login" className="text-blue-600 font-semibold transition-all duration-200 hover:underline hover:text-blue-700 hover:scale-105 motion-reduce:hover:scale-100 inline-block">{t('register.loginLink')}</Link>
          </p>

          <div className="flex items-center justify-center gap-1 mt-3">
            <span className="text-xs text-gray-400">{t('register.secureNote')}</span>
            <span className="text-green-500">✓</span>
          </div>
        </div>
        </div>
        <PublicFooter />
      </div>
    </div>
  );
}

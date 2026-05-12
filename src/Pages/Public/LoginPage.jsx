import { useMemo, useState } from 'react';
import BrandLogo from '../../components/BrandLogo';
import MedicalBackground from '../../components/MedicalBackground';
import PublicFooter from '../../components/PublicFooter';
import PublicNavbar from '../../components/PublicNavbar';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Lock, Mail, Phone, Shield, Stethoscope, User } from 'lucide-react';
import { loginUser, clearError } from '../../features/auth/authSlice';
import { useDirection } from '../../hooks/useDirection';

const ROLE_DEFS = [
  { key: 'admin', icon: Shield, inputType: 'email', inputIcon: Mail },
  { key: 'doctor', icon: Stethoscope, inputType: 'text', inputIcon: Mail },
  { key: 'patient', icon: User, inputType: 'text', inputIcon: Phone },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^01\d{9}$/;

async function prefetchRolePages(role) {
  if (role === 'admin') {
    await Promise.all([
      import('../admin/AdminLayout'),
      import('../admin/AdminHome'),
      import('../admin/AdminAppointmentsPage'),
    ]);
    return;
  }

  if (role === 'doctor') {
    await Promise.all([
      import('../doctor/DoctorLayout'),
      import('../doctor/DoctorHome'),
      import('../doctor/DoctorAppointmentsPage'),
    ]);
    return;
  }

  await Promise.all([
    import('../dashboard/DashboardLayout'),
    import('../dashboard/DashboardHome'),
    import('../dashboard/AppointmentsPage'),
  ]);
}

export default function LoginPage() {
  const { t } = useTranslation();
  const { isLtr } = useDirection();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { loading, error } = useSelector((state) => state.auth);
  const [selectedRole, setSelectedRole] = useState('patient');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const roles = useMemo(
    () =>
      ROLE_DEFS.map((d) => ({
        ...d,
        label: t(`login.roles.${d.key}.label`),
        title: t(`login.roles.${d.key}.title`),
        inputLabel: t(`login.roles.${d.key}.inputLabel`),
        placeholder: t(`login.roles.${d.key}.placeholder`),
        btnLabel: t(`login.roles.${d.key}.btnLabel`),
        note: t(`login.roles.${d.key}.note`),
      })),
    [t]
  );

  const currentRole = roles.find((r) => r.key === selectedRole);
  const InputIcon = currentRole.inputIcon;

  const handleRoleChange = (key) => {
    setSelectedRole(key);
    setIdentifier('');
    setPassword('');
    dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || !password.trim()) {
      toast.error(t('login.errors.fillFields'));
      return;
    }

    if (selectedRole === 'admin' && !EMAIL_REGEX.test(cleanIdentifier)) {
      toast.error(t('login.errors.adminEmail'));
      return;
    }

    if (selectedRole !== 'admin' && !EMAIL_REGEX.test(cleanIdentifier) && !PHONE_REGEX.test(cleanIdentifier)) {
      toast.error(t('login.errors.emailOrPhone'));
      return;
    }

    if (password.length < 6) {
      toast.error(t('login.errors.passwordLen'));
      return;
    }

    const result = await dispatch(loginUser({ identifier: cleanIdentifier, password, role: selectedRole }));
    if (loginUser.fulfilled.match(result)) {
      const role = result.payload.user.role;
      toast.success(
        t('login.welcomeTitle', { name: result.payload.user.name }),
        t('login.welcomeSub')
      );
      prefetchRolePages(role).catch(() => {});
      if (role === 'admin') navigate('/admin');
      else if (role === 'doctor') navigate('/doctor');
      else navigate('/dashboard');
    } else {
      toast.error(result.payload || t('authErrors.wrongCredentials'));
    }
  };

  return (
    <div style={{ fontFamily: 'Cairo, sans-serif' }}>
      <MedicalBackground />
      <PublicNavbar cta={{ to: '/register', labelKey: 'publicNav.register' }} />
      <div className="relative z-10 min-h-screen flex flex-col" style={{ backgroundColor: 'transparent' }}>
        <div className="flex-1 flex items-center justify-center py-8 px-4 w-full">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <BrandLogo className="h-20 w-20 object-contain mx-auto mb-3" />
              <p className="text-gray-500 text-sm mt-1">{t('login.tagline')}</p>
            </div>
            <div className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8">
              <div className="mb-1">
                <p className="text-center text-sm text-gray-500 mb-3">{t('login.chooseAccount')}</p>
                <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-xl">
                  {roles.map((role) => {
                    const RoleIcon = role.icon;
                    const isActive = selectedRole === role.key;
                    return (
                      <button
                        key={role.key}
                        type="button"
                        onClick={() => handleRoleChange(role.key)}
                        className={`flex flex-col items-center gap-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200 ${isActive ? 'bg-blue-600 text-white shadow-md scale-100' : 'text-gray-500 hover:text-gray-700 hover:scale-[1.03] motion-reduce:hover:scale-100'}`}
                      >
                        <RoleIcon size={15} />
                        {role.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-blue-600 font-bold text-sm md:text-base whitespace-nowrap">{currentRole.title}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 text-start">{currentRole.inputLabel}</label>
                  <div className="relative">
                    <input
                      type={currentRole.inputType}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={currentRole.placeholder}
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 ps-11 text-sm text-start placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <div className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <InputIcon size={18} />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1 gap-2">
                    <label className="block text-sm font-semibold text-gray-700">{t('login.password')}</label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-blue-600 transition-all duration-200 hover:underline hover:text-blue-700 hover:scale-105 motion-reduce:hover:scale-100 inline-block shrink-0"
                    >
                      {t('login.forgot')}
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 ps-11 pe-11 text-sm text-start placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <div className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock size={18} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 text-start">{error}</div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-blue-500/30 motion-reduce:hover:scale-100 motion-reduce:active:scale-100 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:hover:scale-100 disabled:active:scale-100 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm mt-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      {t('login.loggingIn')}
                    </>
                  ) : (
                    <>
                      <span>{isLtr ? '→' : '←'}</span>
                      {currentRole.btnLabel}
                    </>
                  )}
                </button>
              </form>
              <div className="mt-5 flex items-center justify-center gap-2 text-gray-400 text-xs">
                <Lock size={12} />
                <span>{currentRole.note}</span>
              </div>
              {selectedRole === 'doctor' && (
                <p className="mt-3 text-center text-xs text-gray-400">{t('login.doctorNote')}</p>
              )}
              {selectedRole === 'patient' && (
                <p className="mt-4 text-center text-sm text-gray-500">
                  {t('login.noAccount')}{' '}
                  <Link
                    to="/register"
                    className="text-blue-600 font-semibold transition-all duration-200 hover:underline hover:text-blue-700 hover:scale-105 motion-reduce:hover:scale-100 inline-block"
                  >
                    {t('login.createAccount')}
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
        <PublicFooter />
      </div>
    </div>
  );
}

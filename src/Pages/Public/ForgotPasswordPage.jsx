import { useMemo, useState } from 'react';
import BrandLogo from '../../components/BrandLogo';
import MedicalBackground from '../../components/MedicalBackground';
import PublicFooter from '../../components/PublicFooter';
import PublicNavbar from '../../components/PublicNavbar';
import { useToast } from '../../context/ToastContext';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowRight, ArrowLeft, CheckCircle, KeyRound, Eye, EyeOff } from 'lucide-react';
import { useDirection } from '../../hooks/useDirection';
import axiosInstance from '../../api/axiosInstance';
import { AUTH } from '../../api/endpoints';
import { getApiErrorMessage } from '../../utils/apiError';

const STEPS = ['email', 'otp', 'password'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^01\d{9}$/;

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { isLtr } = useDirection();
  const [step, setStep] = useState('email');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const toast = useToast();
  const [error, setError] = useState('');

  const stepLabels = useMemo(() => {
    const v = t('public.forgot.steps', { returnObjects: true });
    return Array.isArray(v) ? v : [];
  }, [t]);

  const handleSendOtp = async () => {
    const clean = identifier.trim();
    if (!EMAIL_REGEX.test(clean) && !PHONE_REGEX.test(clean)) {
      setError(t('public.forgot.errIdentifier'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await axiosInstance.post(AUTH.FORGOT_PASSWORD, { identifier: clean });
      setLoading(false);
      setStep('otp');
      toast.info(t('public.forgot.toastOtp'));
    } catch (err) {
      setLoading(false);
      setError(getApiErrorMessage(err, t('public.forgot.errIdentifier')));
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError(t('public.forgot.errOtp'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await axiosInstance.post(AUTH.VERIFY_OTP, {
        identifier: identifier.trim(),
        otp: code,
      });
      setLoading(false);
      setStep('password');
      toast.success(t('public.forgot.toastVerify'));
    } catch (err) {
      setLoading(false);
      setError(getApiErrorMessage(err, t('public.forgot.errOtp')));
    }
  };

  const handleResetPassword = async () => {
    if (password.length < 8) {
      setError(t('public.forgot.errPassShort'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('public.forgot.errPassMismatch'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await axiosInstance.post(AUTH.RESET_PASSWORD, {
        identifier: identifier.trim(),
        otp: otp.join(''),
        password,
        password_confirmation: confirmPassword,
      });
      setLoading(false);
      setDone(true);
      toast.success(t('public.forgot.toastReset'));
    } catch (err) {
      setLoading(false);
      setError(getApiErrorMessage(err, t('public.forgot.errPassMismatch')));
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const progressWidth = step === 'email' ? '33%' : step === 'otp' ? '66%' : '100%';
  const BackArrow = isLtr ? ArrowLeft : ArrowRight;

  return (
    <div className="relative z-10 min-h-screen bg-transparent flex flex-col" style={{ fontFamily: 'Cairo, sans-serif' }}>
      <MedicalBackground />
      <PublicNavbar />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 w-full max-w-md">

          <div className="flex justify-center mb-6">
            <BrandLogo className="h-20 w-20 object-contain" />
          </div>

          {!done ? (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2 gap-1">
                  {stepLabels.map((label, i) => {
                    const isActive = STEPS.indexOf(step) >= i;
                    return (
                      <span key={label} className={`text-xs font-semibold text-center flex-1 min-w-0 ${isActive ? 'text-blue-600' : 'text-gray-300'}`}>
                        {label}
                      </span>
                    );
                  })}
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: progressWidth }} />
                </div>
              </div>

              {step === 'email' && (
                <div className="space-y-5">
                  <div className="text-start">
                    <h2 className="text-xl font-extrabold text-gray-800">{t('public.forgot.emailTitle')}</h2>
                    <p className="text-gray-400 text-sm mt-1">{t('public.forgot.emailHint')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 text-start">{t('public.forgot.emailLabel')}</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => {
                          setIdentifier(e.target.value);
                          setError('');
                        }}
                        placeholder={t('public.forgot.identifierPh')}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 ps-11 text-sm text-start placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                      <Mail size={17} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  {error && <p className="text-red-500 text-xs text-start">{error}</p>}
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading || !identifier}
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : (
                      t('public.forgot.sendOtp')
                    )}
                  </button>
                </div>
              )}

              {step === 'otp' && (
                <div className="space-y-5">
                  <div className="text-start">
                    <h2 className="text-xl font-extrabold text-gray-800">{t('public.forgot.otpTitle')}</h2>
                    <p className="text-gray-400 text-sm mt-1">
                      {t('public.forgot.otpSent')}{' '}
                      <span className="text-blue-600 font-semibold">{identifier}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 my-4" dir="ltr">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={`w-11 h-12 text-center text-lg font-bold border-2 rounded-xl focus:outline-none transition-all ${
                          digit ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 focus:border-blue-400'
                        }`}
                      />
                    ))}
                  </div>

                  {error && <p className="text-red-500 text-xs text-start">{error}</p>}

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.join('').length < 6}
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : (
                      t('public.forgot.verify')
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setOtp(['', '', '', '', '', '']);
                      setError('');
                    }}
                    className="w-full text-gray-400 text-sm hover:text-blue-600 transition-colors flex items-center justify-center gap-1"
                  >
                    <BackArrow size={14} />
                    {t('public.forgot.changeEmail')}
                  </button>

                  <p className="text-center text-xs text-gray-400">
                    {t('public.forgot.noCode')}{' '}
                    <button type="button" onClick={handleSendOtp} className="text-blue-600 font-semibold hover:underline">
                      {t('public.forgot.resend')}
                    </button>
                  </p>
                </div>
              )}

              {step === 'password' && (
                <div className="space-y-5">
                  <div className="text-start">
                    <h2 className="text-xl font-extrabold text-gray-800">{t('public.forgot.newPassTitle')}</h2>
                    <p className="text-gray-400 text-sm mt-1">{t('public.forgot.newPassHint')}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 text-start">{t('public.forgot.newPassLabel')}</label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError('');
                        }}
                        placeholder={t('public.forgot.newPassPh')}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 ps-11 pe-10 text-sm text-start placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                      <KeyRound size={17} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {password && (
                      <div className="mt-2 flex gap-1">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`flex-1 h-1 rounded-full transition-colors ${
                              password.length >= i * 3
                                ? i === 1 ? 'bg-red-400' : i === 2 ? 'bg-yellow-400' : 'bg-green-500'
                                : 'bg-gray-100'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 text-start">{t('public.forgot.confirmLabel')}</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError('');
                        }}
                        placeholder={t('public.forgot.confirmPh')}
                        className={`w-full border-2 rounded-xl px-4 py-3 ps-11 pe-10 text-sm text-start placeholder-gray-400 focus:outline-none transition ${
                          confirmPassword && confirmPassword !== password ? 'border-red-300 focus:ring-2 focus:ring-red-300' :
                            confirmPassword && confirmPassword === password ? 'border-green-400 focus:ring-2 focus:ring-green-300' :
                              'border-gray-200 focus:ring-2 focus:ring-blue-500'
                        }`}
                      />
                      <KeyRound size={17} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-xs text-start">{error}</p>}

                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={loading || !password || !confirmPassword}
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : (
                      t('public.forgot.resetBtn')
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-800">{t('public.forgot.successTitle')}</h2>
              <p className="text-gray-400 text-sm">{t('public.forgot.successText')}</p>
              <Link
                to="/login"
                className="block w-full bg-blue-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-blue-700 transition-colors text-center mt-4"
              >
                {t('public.forgot.login')}
              </Link>
            </div>
          )}

          {!done && (
            <div className="text-center mt-5">
              <Link to="/login" className="text-gray-400 text-sm hover:text-blue-600 transition-colors inline-flex items-center justify-center gap-1">
                <BackArrow size={14} />
                {t('public.forgot.backLogin')}
              </Link>
            </div>
          )}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}

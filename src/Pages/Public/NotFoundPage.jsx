import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BrandLogo from '../../components/BrandLogo';
import MedicalBackground from '../../components/MedicalBackground';
import PublicFooter from '../../components/PublicFooter';
import { useSelector } from 'react-redux';
import { Home, ArrowRight } from 'lucide-react';

export default function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token, role } = useSelector((state) => state.auth);

  const getDashboardLink = () => {
    if (!token) return '/';
    if (role === 'admin') return '/admin';
    if (role === 'doctor') return '/doctor';
    return '/dashboard';
  };

  return (
    <div style={{ fontFamily: 'Cairo, sans-serif' }} className="relative">
      <MedicalBackground />
      <div className="relative z-10 min-h-screen bg-transparent flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="text-center max-w-md">

            {/* Logo */}
            <div className="flex justify-center mb-8">
              <BrandLogo className="h-20 w-20 object-contain" />
            </div>

            {/* 404 */}
            <div className="relative mb-6">
              <p className="text-8xl md:text-9xl font-extrabold text-blue-600 opacity-10 select-none leading-none">404</p>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-6xl md:text-7xl font-extrabold text-blue-600 leading-none">404</p>
                </div>
              </div>
            </div>

            {/* Message */}
            <h1 className="text-2xl font-extrabold text-gray-800 mt-4">{t('notFound.title')}</h1>
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">
              {t('notFound.description')}
            </p>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
              <button onClick={() => navigate(-1)}
                className="flex items-center gap-2 border border-gray-200 text-gray-600 px-5 py-3 rounded-xl text-sm font-semibold hover:border-blue-400 hover:text-blue-600 transition-colors">
                <ArrowRight size={16} />
                {t('notFound.back')}
              </button>
              <Link to={getDashboardLink()}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                <Home size={16} />
                {t('notFound.home')}
              </Link>
            </div>
          </div>
        </div>
        <PublicFooter />
      </div>
    </div>
  );
}
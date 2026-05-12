import { createElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FloatingAI from '../../components/FloatingAI';
import MedicalBackground from '../../components/MedicalBackground';
import PublicFooter from '../../components/PublicFooter';
import PublicNavbar from '../../components/PublicNavbar';
import { Link } from 'react-router-dom';
import { Heart, Shield, Clock, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDirection } from '../../hooks/useDirection';

const VALUE_ICONS = [Heart, Shield, Clock, Star];

export default function AboutPage() {
  const { t } = useTranslation();
  const { isLtr } = useDirection();

  const stats = useMemo(() => {
    const v = t('public.about.stats', { returnObjects: true });
    return Array.isArray(v) ? v : [];
  }, [t]);

  const values = useMemo(() => {
    const list = t('public.about.values', { returnObjects: true });
    const arr = Array.isArray(list) ? list : [];
    return arr.map((item, i) => ({
      ...item,
      icon: VALUE_ICONS[i % VALUE_ICONS.length],
    }));
  }, [t]);

  const timeline = useMemo(() => {
    const v = t('public.about.timeline', { returnObjects: true });
    return Array.isArray(v) ? v : [];
  }, [t]);

  const team = useMemo(() => {
    const v = t('public.about.teamMembers', { returnObjects: true });
    return Array.isArray(v) ? v : [];
  }, [t]);

  const Chevron = isLtr ? ChevronRight : ChevronLeft;

  return (
    <div style={{ fontFamily: 'Cairo, sans-serif' }}>
      <MedicalBackground />
      <div className="relative z-10">
        <PublicNavbar active="about" />

        <section className="py-12 md:py-16 px-4 md:px-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-center md:text-start">
              <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full">{t('public.about.badge')}</span>
              <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mt-4 leading-tight">
                {t('public.about.headlineA')}
                <br />
                <span className="text-blue-600 transition-all duration-300 hover:text-blue-700 hover:scale-[1.02] motion-reduce:hover:scale-100 inline-block cursor-default">
                  {t('public.about.headlineB')}
                </span>
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed mt-4 max-w-md mx-auto md:mx-0">
                {t('public.about.lead')}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-6 flex-wrap">
                <Link
                  to="/register"
                  className="transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-blue-500/30 motion-reduce:hover:scale-100 motion-reduce:active:scale-100 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-700"
                >
                  {t('public.about.ctaJoin')}
                </Link>
                <Link
                  to="/contact"
                  className="border border-gray-200 text-gray-600 px-6 py-3 rounded-xl text-sm font-bold hover:border-blue-600 hover:text-blue-600 transition-all duration-300 hover:scale-[1.02] hover:shadow-md motion-reduce:hover:scale-100"
                >
                  {t('public.about.ctaContact')}
                </Link>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="group relative w-72 h-72 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-xl transition-all duration-500 hover:shadow-blue-500/20 hover:shadow-2xl hover:scale-[1.02] motion-reduce:hover:scale-100">
                <img src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&q=80" alt={t('public.about.imgTeam')} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 motion-reduce:group-hover:scale-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
                <div className="absolute bottom-4 start-4 end-4 text-white text-center">
                  <p className="font-bold text-lg">{t('public.about.teamTitle')}</p>
                  <p className="text-xs text-blue-200">{t('public.about.teamSub')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-blue-600 py-10 px-4 md:px-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl md:text-4xl font-extrabold text-white">{value}</p>
                <p className="text-blue-200 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12 md:py-16 px-4 md:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800">{t('public.about.valuesTitle')}</h2>
              <p className="text-gray-400 text-sm mt-2 max-w-lg mx-auto">{t('public.about.valuesSub')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {values.map(({ icon, title, desc, color }) => (
                <div key={title} className="group card-hover bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm text-center cursor-default">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110 motion-reduce:group-hover:scale-100 ${color}`}>
                    {createElement(icon, { size: 22 })}
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2 transition-colors duration-300 group-hover:text-blue-700">{title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed transition-colors duration-300 group-hover:text-gray-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 px-4 md:px-8 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800">{t('public.about.timelineTitle')}</h2>
              <p className="text-gray-400 text-sm mt-2">{t('public.about.timelineSub')}</p>
            </div>
            <div className="relative">
              <div className={`absolute top-0 bottom-0 w-0.5 bg-blue-100 ${isLtr ? 'left-4 md:left-1/2' : 'right-4 md:right-1/2'}`} />
              <div className="space-y-8">
                {timeline.map(({ year, title, desc }, i) => (
                  <div
                    key={year}
                    className={`flex items-start gap-4 ${i % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'} flex-row`}
                  >
                    <div className="flex-1 md:w-1/2">
                      <div className="bg-gray-50 rounded-2xl p-4 shadow-sm text-start">
                        <span className="text-blue-600 font-extrabold text-lg">{year}</span>
                        <h3 className="font-bold text-gray-800 mt-1">{title}</h3>
                        <p className="text-gray-400 text-xs mt-1 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 z-10 mt-2">
                      <span className="w-3 h-3 bg-white rounded-full" />
                    </div>
                    <div className="flex-1 md:w-1/2 hidden md:block" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 px-4 md:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800">{t('public.about.teamGridTitle')}</h2>
              <p className="text-gray-400 text-sm mt-2">{t('public.about.teamGridSub')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {team.map(({ name, role, img, specialty }) => (
                <div key={name} className="group card-hover bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm text-center cursor-default">
                  <div className="overflow-hidden rounded-2xl w-20 h-20 mx-auto mb-3 ring-2 ring-transparent group-hover:ring-blue-200/80 transition-all duration-300">
                    <img src={img} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 motion-reduce:group-hover:scale-100" />
                  </div>
                  <p className="font-bold text-gray-800 text-sm transition-colors group-hover:text-blue-700">{name}</p>
                  <p className="text-blue-600 text-xs mt-0.5">{role}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{specialty}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-blue-500/30 motion-reduce:hover:scale-100 motion-reduce:active:scale-100 bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-blue-700"
              >
                {isLtr ? (
                  <>
                    <Chevron size={16} />
                    <span>{t('public.about.bookCta')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('public.about.bookCta')}</span>
                    <Chevron size={16} />
                  </>
                )}
              </Link>
            </div>
          </div>
        </section>

        <PublicFooter />
      </div>
      <FloatingAI role="patient" />
    </div>
  );
}

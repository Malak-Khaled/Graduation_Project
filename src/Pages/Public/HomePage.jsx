import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FloatingAI from '../../components/FloatingAI';
import MedicalBackground from '../../components/MedicalBackground';
import PublicFooter from '../../components/PublicFooter';
import PublicNavbar from '../../components/PublicNavbar';
import { useDirection } from '../../hooks/useDirection';
import { Link } from 'react-router-dom';
import {
  Stethoscope, Ambulance, HeartPulse,
  ChevronLeft, ChevronRight,
  UserRound, Calendar, ChevronDown,
} from 'lucide-react';
import { PUBLIC_DOCTORS } from '../../data/publicDoctors';
import { getDoctorProfiles, getSpecialtyOptionsFromDoctors, matchesSpecialty, SPECIALTY_ALL_AR } from '../../utils/specialtyFilter';

/** Survives React Strict Mode remounts so sections do not flip back to hidden. */
const sectionRevealDone = new Set();

function useSectionReveal(stableKey) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (typeof window.IntersectionObserver === 'undefined') {
      sectionRevealDone.add(stableKey);
      return true;
    }
    return sectionRevealDone.has(stableKey);
  });
  useEffect(() => {
    if (sectionRevealDone.has(stableKey)) {
      return;
    }
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          sectionRevealDone.add(stableKey);
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [stableKey]);
  return [ref, visible];
}

const doctors = PUBLIC_DOCTORS.slice(0, 15);

const SERVICE_ICONS = [Stethoscope, Ambulance, HeartPulse];
const SPECIALTY_ICONS = ['❤️', '🧠', '👶', '🦷', '🏃', '👁️'];

function Hero() {
  const { t, i18n } = useTranslation();
  const [specialty, setSpecialty] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [apptDate, setApptDate] = useState('');

  const doctorProfiles = useMemo(() => getDoctorProfiles(PUBLIC_DOCTORS), []);
  const specialtyOptions = useMemo(() => getSpecialtyOptionsFromDoctors(doctorProfiles), [doctorProfiles]);

  const doctorsForSpecialty = useMemo(
    () => doctorProfiles.filter((d) => matchesSpecialty(d.specialty, specialty || SPECIALTY_ALL_AR)),
    [doctorProfiles, specialty]
  );

  const doctorsForSearch = useMemo(
    () =>
      doctorsForSpecialty.filter((d) =>
        String(d.name || '')
          .toLowerCase()
          .includes(String(doctorSearch || '').toLowerCase())
      ),
    [doctorSearch, doctorsForSpecialty]
  );

  const today = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  const bookingTo = useMemo(() => {
    const q = new URLSearchParams();
    if (specialty && specialty !== SPECIALTY_ALL_AR) q.set('specialty', specialty);
    if (doctorId) q.set('doctor', doctorId);
    if (apptDate) q.set('date', apptDate);
    const qs = q.toString();
    return qs ? `/login?${qs}` : '/login';
  }, [specialty, doctorId, apptDate]);

  const fieldClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50/90 text-slate-800 text-sm py-2.5 ps-3 pe-9 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition';
  const dateFieldClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50/90 text-slate-800 text-sm py-2.5 ps-3 pe-3 outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition';

  return (
    <section
      className="relative isolate overflow-hidden min-h-[min(88vh,820px)] flex flex-col"
      style={{ fontFamily: 'Cairo, system-ui, sans-serif' }}
    >
      <div
        className="absolute inset-0 -z-10 origin-center transform bg-slate-200 bg-[url('/home-hero-bg.png')] bg-cover bg-[position:center_22%] sm:bg-right bg-no-repeat rtl:scale-x-[-1]"
        role="img"
        aria-label={t('home.imgAlt')}
      />
      <div className="relative z-10 max-w-6xl mx-auto w-full flex-1 flex flex-col justify-center px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-xl w-full text-center md:text-start">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight [text-shadow:0_1px_2px_rgba(255,255,255,0.7)]">
            <span className="whitespace-pre-wrap">{t('home.hero.titleLine')}</span>{' '}
            <span className="text-blue-600">{t('home.hero.titleHighlight')}</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-4 max-w-lg mx-auto md:mx-0 leading-relaxed [text-shadow:0_1px_1px_rgba(255,255,255,0.8)]">
            {t('home.hero.sub')}
          </p>
        </div>

        <div className="mt-8 md:mt-10 w-full max-w-5xl mx-auto md:mx-0 pb-2">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-slate-800 mb-1.5">
                    <Stethoscope className="w-5 h-5 text-blue-500 shrink-0" strokeWidth={2} />
                    <span className="text-sm font-bold">{t('home.hero.booking.specialty')}</span>
                  </div>
                  <div className="relative">
                    <select
                      className={fieldClass}
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      aria-label={t('home.hero.booking.specialty')}
                    >
                      <option value="">{t('home.hero.booking.phSpecialty')}</option>
                      {specialtyOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute top-1/2 -translate-y-1/2 end-3 w-4 h-4 text-slate-400"
                      aria-hidden
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {specialtyOptions.slice(0, 8).map((s) => (
                      <button
                        key={`hero-chip-${s}`}
                        type="button"
                        onClick={() => setSpecialty(s === SPECIALTY_ALL_AR ? '' : s)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                          (specialty || SPECIALTY_ALL_AR) === s
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-slate-800 mb-1.5">
                    <UserRound className="w-5 h-5 text-blue-500 shrink-0" strokeWidth={2} />
                    <span className="text-sm font-bold">{t('home.hero.booking.doctor')}</span>
                  </div>
                  <input
                    type="text"
                    className={`${fieldClass} mb-2`}
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    placeholder={t('admin.doctors.searchPh')}
                    aria-label={t('admin.doctors.searchPh')}
                  />
                  <div className="relative">
                    <select
                      className={fieldClass}
                      value={doctorId}
                      onChange={(e) => setDoctorId(e.target.value)}
                      aria-label={t('home.hero.booking.doctor')}
                    >
                      <option value="">{t('home.hero.booking.phDoctor')}</option>
                      {doctorsForSearch.map((d) => (
                        <option key={d.id} value={String(d.id)}>
                          {d.name} — {d.specialty}{d.center ? ` — ${d.center}` : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute top-1/2 -translate-y-1/2 end-3 w-4 h-4 text-slate-400"
                      aria-hidden
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-slate-800 mb-1.5">
                    <Calendar className="w-5 h-5 text-blue-500 shrink-0" strokeWidth={2} />
                    <span className="text-sm font-bold">{t('home.hero.booking.date')}</span>
                  </div>
                  <input
                    type="date"
                    min={today}
                    className={dateFieldClass}
                    value={apptDate}
                    onChange={(e) => setApptDate(e.target.value)}
                    aria-label={t('home.hero.booking.date')}
                    lang={i18n.language}
                  />
                </div>
              </div>

              <Link
                to={bookingTo}
                className="shrink-0 w-full lg:w-auto text-center transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-blue-500/30 motion-reduce:hover:scale-100 bg-blue-600 text-white font-bold py-3 px-8 rounded-xl text-sm hover:bg-blue-700 whitespace-nowrap"
              >
                {t('home.hero.booking.cta')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  const { t } = useTranslation();
  const [sectionRef, revealed] = useSectionReveal('home-services');
  const services = useMemo(() => {
    const list = t('home.services', { returnObjects: true });
    const arr = Array.isArray(list) ? list : [];
    return arr.map((item, i) => ({
      ...item,
      icon: SERVICE_ICONS[i % SERVICE_ICONS.length],
    }));
  }, [t]);
  return (
    <section id="services" ref={sectionRef} className="py-10 md:py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
        {services.map((service, i) => {
          const ServiceIcon = service.icon;
          return (
            <div
              key={service.label}
              style={{ transitionDelay: revealed ? `${i * 90}ms` : '0ms' }}
              className={`group card-hover bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm flex flex-col items-center text-center gap-3 cursor-default transition-all duration-500 ease-out motion-reduce:transition-none ${
                revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              } motion-reduce:opacity-100 motion-reduce:translate-y-0`}
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0">
                <ServiceIcon size={22} className="text-blue-600 transition-colors group-hover:text-blue-700" />
              </div>
              <h3 className="font-bold text-gray-800 transition-colors duration-300 group-hover:text-blue-600">{service.label}</h3>
              <p className="text-xs text-gray-500 transition-colors duration-300 group-hover:text-gray-600">{service.sub}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Doctors() {
  const { t } = useTranslation();
  const { isLtr } = useDirection();
  const [sectionRef, revealed] = useSectionReveal('home-doctors');
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);
  const cardsPerSlide = 3;
  const doctorSlides = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < doctors.length; i += cardsPerSlide) {
      chunks.push(doctors.slice(i, i + cardsPerSlide));
    }
    return chunks;
  }, []);
  const totalSlides = doctorSlides.length;

  const goNext = () => {
    setActiveSlide((s) => (s + 1) % totalSlides);
  };
  const goPrev = () => {
    setActiveSlide((s) => (s - 1 + totalSlides) % totalSlides);
  };

  useEffect(() => {
    if (paused || totalSlides <= 1) return;
    const timer = window.setInterval(() => {
      setActiveSlide((s) => (s + 1) % totalSlides);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [paused, totalSlides]);

  return (
    <section ref={sectionRef} className="py-10 md:py-14 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="text-start min-w-0">
            <h2 className={`text-xl md:text-2xl font-extrabold text-gray-800 inline-block cursor-default transition-all duration-300 hover:text-blue-600 hover:scale-[1.02] motion-reduce:hover:scale-100 ${isLtr ? 'origin-left' : 'origin-right'}`}>{t('home.doctors.title')}</h2>
            <p className="text-gray-400 text-sm mt-1 hidden sm:block transition-colors duration-300 hover:text-gray-500">{t('home.doctors.subtitle')}</p>
          </div>
          <Link to="/doctors" className={`group text-blue-600 text-sm font-semibold flex items-center gap-1 shrink-0 transition-all duration-300 hover:gap-2 hover:text-blue-700 hover:underline underline-offset-4 ${isLtr ? 'text-end flex-row' : 'text-start flex-row-reverse'}`}>
            {isLtr ? (
              <>
                <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0" />
                {t('home.doctors.viewAll')}
              </>
            ) : (
              <>
                {t('home.doctors.viewAll')}
                <ChevronLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-0.5 motion-reduce:group-hover:translate-x-0" />
              </>
            )}
          </Link>
        </div>
        <div
          className={`relative transition-all duration-500 ease-out ${
            revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          } motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0]?.clientX || 0;
            touchDeltaX.current = 0;
          }}
          onTouchMove={(e) => {
            const x = e.touches[0]?.clientX || 0;
            touchDeltaX.current = x - touchStartX.current;
          }}
          onTouchEnd={() => {
            if (Math.abs(touchDeltaX.current) < 42) return;
            if (touchDeltaX.current < 0) {
              isLtr ? goNext() : goPrev();
            } else {
              isLtr ? goPrev() : goNext();
            }
          }}
        >
          <div className="overflow-hidden rounded-[26px]">
            <div
              className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{ transform: `translateX(${isLtr ? '-' : ''}${activeSlide * 100}%)` }}
            >
              {doctorSlides.map((slide, slideIdx) => (
                <div key={`slide-${slideIdx}`} className="w-full shrink-0 px-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {slide.map((doc) => (
                      <div key={doc.id} className="group bg-white/90 border border-gray-200 rounded-[24px] overflow-hidden shadow-sm flex flex-col cursor-default transition-all duration-500 hover:shadow-xl hover:shadow-cyan-100/80">
                        <div className="relative mx-2.5 mt-2.5 rounded-[20px] bg-cyan-50 overflow-hidden aspect-[5/4]">
                          <img
                            src={doc.img}
                            alt={doc.name}
                            className="absolute inset-0 block w-full h-full object-contain object-top p-2 transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                          />
                        </div>
                        <div className="px-3.5 pt-3 pb-4 text-center">
                          {doc.center && (
                            <span className="inline-block text-[10px] font-semibold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-full mb-1">
                              {doc.center}
                            </span>
                          )}
                          <p className="font-bold text-gray-800 text-sm md:text-base">{doc.name}</p>
                          <p className="text-cyan-600 text-xs md:text-sm mt-1 font-semibold">{doc.specialty}</p>
                          <p className="text-[11px] md:text-xs text-gray-400 mt-2 leading-relaxed min-h-8 line-clamp-2">
                            {doc.center
                              ? [doc.subtitle, doc.address].filter(Boolean).join(' — ') || doc.notes || ''
                              : `${t('home.doctors.subtitle')} - ${doc.reviews}+`}
                          </p>
                          <Link
                            to={`/login?doctor=${doc.id}`}
                            className="mt-3 inline-flex items-center justify-center bg-cyan-500 text-white text-xs md:text-sm font-semibold px-4 md:px-5 py-1.5 rounded-md transition-colors duration-200 hover:bg-cyan-600"
                          >
                            {t('home.hero.booking.cta')}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={isLtr ? goPrev : goNext}
            className="absolute top-1/2 -translate-y-1/2 start-2 md:start-3 w-9 h-9 rounded-full bg-white/95 border border-gray-200 text-gray-600 flex items-center justify-center shadow-sm hover:bg-white hover:text-blue-600 transition-colors"
            aria-label="previous doctor"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={isLtr ? goNext : goPrev}
            className="absolute top-1/2 -translate-y-1/2 end-2 md:end-3 w-9 h-9 rounded-full bg-white/95 border border-gray-200 text-gray-600 flex items-center justify-center shadow-sm hover:bg-white hover:text-blue-600 transition-colors"
            aria-label="next doctor"
          >
            <ChevronRight size={16} />
          </button>

          <div className="flex items-center justify-center gap-2 mt-4">
            {doctorSlides.map((slide, idx) => (
              <button
                key={`dot-${idx}-${slide[0]?.id || 'x'}`}
                type="button"
                onClick={() => setActiveSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === activeSlide ? 'w-6 bg-blue-600' : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Specialties() {
  const { t } = useTranslation();
  const { isLtr } = useDirection();
  const [sectionRef, revealed] = useSectionReveal('home-specialties');
  const specialties = useMemo(() => {
    const list = t('home.specialties', { returnObjects: true });
    const arr = Array.isArray(list) ? list : [];
    return arr.map((item, i) => ({
      ...item,
      icon: SPECIALTY_ICONS[i % SPECIALTY_ICONS.length],
    }));
  }, [t]);
  return (
    <section ref={sectionRef} className="py-10 md:py-14 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className={`text-xl md:text-2xl font-extrabold text-gray-800 inline-block cursor-default transition-all duration-300 hover:text-blue-600 hover:scale-[1.02] motion-reduce:hover:scale-100 ${isLtr ? 'origin-center' : 'origin-right'}`}>{t('home.specialtiesSection.title')}</h2>
          <p className="text-gray-400 text-sm mt-2 max-w-lg mx-auto transition-colors duration-300 hover:text-gray-500 cursor-default">
            {t('home.specialtiesSection.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {specialties.map(({ label, sub, icon }, i) => (
            <div
              key={label}
              style={{ transitionDelay: revealed ? `${i * 70}ms` : '0ms' }}
              className={`group card-hover bg-white/80 backdrop-blur-sm rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all duration-500 ease-out motion-reduce:transition-none ${
                revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              } motion-reduce:opacity-100 motion-reduce:translate-y-0`}
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:bg-blue-100 motion-reduce:group-hover:scale-100">{icon}</div>
              <div className="text-start">
                <p className="font-bold text-gray-800 text-sm transition-colors duration-300 group-hover:text-blue-700">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5 transition-colors duration-300 group-hover:text-gray-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div style={{ fontFamily: 'Cairo, sans-serif' }}>
      <MedicalBackground />
      <div className="relative z-10">
        <PublicNavbar active="home" />
        <Hero />
        <Services />
        <Doctors />
        <Specialties />
        <PublicFooter />
      </div>
      <FloatingAI role="patient" />
    </div>
  );
}
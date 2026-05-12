import { useTranslation } from 'react-i18next';
import FloatingAI from '../../components/FloatingAI';
import MedicalBackground from '../../components/MedicalBackground';
import PublicFooter from '../../components/PublicFooter';
import PublicNavbar from '../../components/PublicNavbar';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PUBLIC_DOCTORS } from '../../data/publicDoctors';
import { getDoctorProfiles, getSpecialtyOptionsFromDoctors, matchesSpecialty, SPECIALTY_ALL_AR, specialtyFromLegacyIndex } from '../../utils/specialtyFilter';

export default function DoctorsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const doctors = getDoctorProfiles(PUBLIC_DOCTORS);
  const specialtyOptions = getSpecialtyOptionsFromDoctors(doctors);
  const specialtyParam = searchParams.get('specialty') || '';
  const rawSpecialty = specialtyFromLegacyIndex(specialtyParam) || specialtyParam || SPECIALTY_ALL_AR;
  const normalizedSpecialty = specialtyOptions.includes(rawSpecialty) ? rawSpecialty : SPECIALTY_ALL_AR;
  const visibleDoctors = doctors.filter((doc) => matchesSpecialty(doc.specialty, normalizedSpecialty));

  return (
    <div style={{ fontFamily: 'Cairo, sans-serif' }}>
      <MedicalBackground />
      <div className="relative z-10">
        <PublicNavbar active="doctors" />

        <section className="py-10 md:py-14 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center md:text-start mb-10">
              <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full inline-block">{t('public.doctorsPage.badge')}</span>
              <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mt-4">{t('public.doctorsPage.heroTitle')}</h1>
              <p className="text-gray-500 text-sm mt-3 max-w-xl mx-auto md:mx-0">
                {t('public.doctorsPage.heroLead')}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6">
                <select
                  value={normalizedSpecialty}
                  onChange={(e) => {
                    const s = e.target.value;
                    if (!s || s === SPECIALTY_ALL_AR) {
                      navigate('/doctors');
                      return;
                    }
                    navigate(`/doctors?specialty=${encodeURIComponent(s)}`);
                  }}
                  className="border border-gray-200 text-gray-700 px-4 py-3 rounded-xl text-sm font-bold bg-white"
                >
                  {specialtyOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
                >
                  {t('public.doctorsPage.bookCta')}
                </Link>
                <Link
                  to="/register"
                  className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl text-sm font-bold hover:border-blue-600 hover:text-blue-600 transition-colors"
                >
                  {t('public.doctorsPage.registerCta')}
                </Link>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-4">
                {specialtyOptions.map((s) => (
                  <button
                    key={`chip-${s}`}
                    type="button"
                    onClick={() => {
                      if (!s || s === SPECIALTY_ALL_AR) {
                        navigate('/doctors');
                        return;
                      }
                      navigate(`/doctors?specialty=${encodeURIComponent(s)}`);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      normalizedSpecialty === s
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {visibleDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="group bg-white/95 border border-gray-200 rounded-[24px] overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-cyan-100/80 hover:-translate-y-1 motion-reduce:hover:translate-y-0"
                >
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
                    {doc.subtitle && (
                      <p className="text-[11px] md:text-xs text-gray-500 mt-1 leading-snug">{doc.subtitle}</p>
                    )}
                    {doc.degree && (
                      <p className="text-[10px] md:text-[11px] text-gray-500 mt-1 leading-snug">{doc.degree}</p>
                    )}
                    <p className="text-[11px] md:text-xs text-gray-400 mt-2 leading-relaxed min-h-8">
                      {doc.address || doc.notes || t('public.doctorsPage.heroLead')}
                    </p>
                    {doc.notes && doc.address && (
                      <p className="text-[10px] md:text-[11px] text-gray-400 mt-1 leading-snug line-clamp-3">{doc.notes}</p>
                    )}
                    <Link
                      to={`/login?doctor=${doc.id}`}
                      className="mt-3 inline-flex items-center justify-center bg-cyan-500 text-white text-xs md:text-sm font-semibold px-4 md:px-5 py-1.5 rounded-md transition-colors duration-200 hover:bg-cyan-600"
                    >
                      {t('public.doctorsPage.bookCta')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            {!visibleDoctors.length && (
              <p className="text-center text-sm text-gray-500 mt-8">{t('public.doctorsPage.heroLead')}</p>
            )}
          </div>
        </section>
        <PublicFooter />
      </div>
      <FloatingAI role="patient" />
    </div>
  );
}

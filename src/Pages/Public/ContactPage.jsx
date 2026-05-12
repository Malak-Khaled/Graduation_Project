import { createElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FloatingAI from '../../components/FloatingAI';
import MedicalBackground from '../../components/MedicalBackground';
import PublicFooter from '../../components/PublicFooter';
import PublicNavbar from '../../components/PublicNavbar';
import { Phone, Mail, MapPin, Send, Instagram, Twitter } from 'lucide-react';

export default function ContactPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  const sidebarItems = [
    { icon: Phone, label: t('public.contact.sidebarPhoneLabel'), value: t('public.contact.sidebarPhoneValue') },
    { icon: Mail, label: t('public.contact.sidebarEmailLabel'), value: t('public.contact.sidebarEmailValue') },
    { icon: MapPin, label: t('public.contact.sidebarLocationLabel'), value: t('public.contact.sidebarLocationValue') },
  ];

  return (
    <div style={{ fontFamily: 'Cairo, sans-serif' }}>
      <MedicalBackground />
      <div className="relative z-10">
        <PublicNavbar active="contact" />

        <section className="overflow-hidden">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-stretch">
            <div className="group hidden md:block w-80 flex-shrink-0 relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80" alt={t('public.contact.imageAlt')} className="w-full h-full object-cover min-h-[280px] transition-transform duration-700 group-hover:scale-110 motion-reduce:group-hover:scale-100" />
              <div className="absolute bottom-4 end-4 bg-white rounded-xl px-3 py-2 shadow-lg flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center"><span className="text-white text-xs">🤖</span></div>
                <div>
                  <p className="text-xs font-bold text-gray-700">{t('public.contact.sidebarSupportTitle')}</p>
                  <p className="text-xs text-green-500">{t('public.contact.sidebarSupportLine')}</p>
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center px-6 md:px-12 py-10">
              <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full w-fit mb-4">{t('public.contact.heroBadge')}</span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight inline-block cursor-default transition-all duration-300 hover:text-blue-600 hover:scale-[1.02] motion-reduce:hover:scale-100">
                {t('public.contact.heroTitle')}
              </h1>
              <p className="text-gray-500 text-sm mt-3 leading-relaxed max-w-md transition-colors duration-300 hover:text-gray-600 cursor-default">
                {t('public.contact.heroLead')}
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-14 px-4 md:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">

            <div className="card-hover flex-1 bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <Mail size={18} className="text-blue-600" />
                <h2 className="font-bold text-gray-800 text-lg">{t('public.contact.formCardTitle')}</h2>
              </div>
              {sent ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">✅</div>
                  <p className="font-bold text-gray-800 text-lg">{t('public.contact.successTitle')}</p>
                  <p className="text-gray-500 text-sm">{t('public.contact.successSub')}</p>
                  <button type="button" onClick={() => setSent(false)} className="mt-2 text-blue-600 text-sm font-semibold hover:underline">
                    {t('public.contact.sendAnother')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">{t('public.contact.labelName')}</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder={t('public.contact.phName')}
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-start placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">{t('public.contact.labelEmail')}</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="example@mail.com"
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-start placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{t('public.contact.labelSubject')}</label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder={t('public.contact.phSubject')}
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-start placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{t('public.contact.labelMessage')}</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder={t('public.contact.phMessage')}
                      required
                      rows={5}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-start placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-blue-500/30 motion-reduce:hover:scale-100 motion-reduce:active:scale-100 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:hover:scale-100 disabled:active:scale-100 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        {t('public.contact.sending')}
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        {t('public.contact.submitBtn')}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            <div className="w-full md:w-72 flex flex-col gap-5">
              <div className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 cursor-default">
                <h3 className="font-bold text-gray-800 mb-4 transition-colors hover:text-blue-700 cursor-default">{t('public.contact.sidebarContactTitle')}</h3>
                <div className="space-y-4">
                  {sidebarItems.map(({ icon, label, value }) => (
                    <div key={label} className="group flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 motion-reduce:group-hover:scale-100">
                        {createElement(icon, { size: 16, className: 'text-blue-600' })}
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">{label}</p>
                        <p className="text-sm font-semibold text-gray-700">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-hover-panel bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden" style={{ height: '200px' }}>
                <iframe
                  title={t('public.contact.mapTitle')}
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d55418.37854084258!2d31.07!3d29.07!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1458407953b1ed11%3A0xe1e8ab21fc9c3a4f!2sBeni%20Suef%2C%20Egypt!5e0!3m2!1sen!2seg!4v1700000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                />
              </div>
              <div className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 text-center">
                <p className="font-bold text-gray-800 text-sm mb-1">{t('public.contact.followTitle')}</p>
                <p className="text-gray-400 text-xs mb-4">{t('public.contact.followSub')}</p>
                <div className="flex items-center justify-center gap-3">
                  <a href="https://instagram.com" className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-blue-500/30 motion-reduce:hover:scale-100 motion-reduce:active:scale-100 hover:bg-blue-100" aria-label="Instagram"><Instagram size={16} className="text-blue-600" /></a>
                  <a href="https://twitter.com" className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-blue-500/30 motion-reduce:hover:scale-100 motion-reduce:active:scale-100 hover:bg-blue-100" aria-label="Twitter"><Twitter size={16} className="text-blue-600" /></a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <PublicFooter />
      </div>
      <FloatingAI role="patient" />
    </div>
  );
}

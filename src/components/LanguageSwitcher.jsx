import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher({ className = '' }) {
  const { i18n, t } = useTranslation();
  const lng = i18n.resolvedLanguage || i18n.language || 'ar';

  return (
    <div
      className={`inline-flex rounded-xl border border-gray-200 bg-white/90 p-0.5 text-xs font-bold shadow-sm ${className}`}
      role="group"
      aria-label={t('language.switcherAria')}
    >
      <button
        type="button"
        onClick={() => i18n.changeLanguage('ar')}
        className={`rounded-lg px-2.5 py-1 transition-colors ${
          lng.startsWith('ar') ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        {t('language.ar')}
      </button>
      <button
        type="button"
        onClick={() => i18n.changeLanguage('en')}
        className={`rounded-lg px-2.5 py-1 transition-colors ${
          lng.startsWith('en') ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        {t('language.en')}
      </button>
    </div>
  );
}

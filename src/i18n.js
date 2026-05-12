import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { deepMerge } from './utils/deepMerge';

import arCommon from './locales/ar/common.js';
import enCommon from './locales/en/common.js';
import arHome from './locales/ar/home.js';
import enHome from './locales/en/home.js';
import arAuth from './locales/ar/auth.js';
import enAuth from './locales/en/auth.js';
import arPatient from './locales/ar/patientDashboard.js';
import enPatient from './locales/en/patientDashboard.js';
import arAdmin from './locales/ar/admin.js';
import enAdmin from './locales/en/admin.js';
import arDoctor from './locales/ar/doctor.js';
import enDoctor from './locales/en/doctor.js';
import arPublic from './locales/ar/publicPages.js';
import enPublic from './locales/en/publicPages.js';
import arComponents from './locales/ar/components.js';
import enComponents from './locales/en/components.js';

const arBundles = [arCommon, arHome, arAuth, arPatient, arAdmin, arDoctor, arPublic, arComponents];
const enBundles = [enCommon, enHome, enAuth, enPatient, enAdmin, enDoctor, enPublic, enComponents];

const arTranslation = arBundles.reduce((acc, b) => deepMerge(acc, b), {});
const enTranslation = enBundles.reduce((acc, b) => deepMerge(acc, b), {});

function syncDocumentLanguage(lng) {
  const code = (lng || 'ar').split('-')[0];
  const isEn = code === 'en';
  document.documentElement.lang = isEn ? 'en' : 'ar';
  document.documentElement.dir = isEn ? 'ltr' : 'rtl';
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: arTranslation },
      en: { translation: enTranslation },
    },
    fallbackLng: 'ar',
    supportedLngs: ['ar', 'en'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  })
  .then(() => {
    syncDocumentLanguage(i18n.resolvedLanguage || i18n.language);
  });

i18n.on('languageChanged', (lng) => {
  syncDocumentLanguage(lng);
});

export default i18n;

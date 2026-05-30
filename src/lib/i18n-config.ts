import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from '@/i18n/en.json';
import hi from '@/i18n/hi.json';
import te from '@/i18n/te.json';
import kn from '@/i18n/kn.json';

// Define resources
const resources = {
  en: { translation: en },
  hi: { translation: hi },
  te: { translation: te },
  kn: { translation: kn },
};

// Detect language from browser or localStorage  
const getDefaultLanguage = (): string => {
  if (typeof window === 'undefined') return 'en';

  try {
    // Check localStorage first
    const stored = localStorage.getItem('language');
    if (stored && Object.keys(resources).includes(stored)) {
      return stored;
    }

    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (Object.keys(resources).includes(browserLang)) {
      return browserLang;
    }
  } catch {
    // localStorage not available (SSR or other issues)
  }

  return 'en';
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: typeof window !== 'undefined' ? getDefaultLanguage() : 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Disable suspense for SSR compatibility
    },
  });

// Change language function
export const changeLanguage = (lang: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
  }
  return i18n.changeLanguage(lang);
};

// Available languages for UI
export const availableLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
];

export default i18n;

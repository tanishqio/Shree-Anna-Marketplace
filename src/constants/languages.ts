/**
 * Supported languages on the Shree Anna platform.
 * Used for language switching, i18n, and voice features.
 */

export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी', flag: '🇮🇳' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', flag: '🇮🇳' },
] as const;

export type LanguageCode = typeof LANGUAGES[number]['code'];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const LANGUAGE_MAP = Object.fromEntries(
  LANGUAGES.map(l => [l.code, l])
) as Record<LanguageCode, typeof LANGUAGES[number]>;

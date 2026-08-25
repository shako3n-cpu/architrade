import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ka from '@/locales/ka.json'
import en from '@/locales/en.json'
import { DEFAULT_LANGUAGE, LANGUAGES, type Language } from '@/config/site'

/**
 * ============================================================================
 * TRANSLATION SETUP
 * ----------------------------------------------------------------------------
 * The URL is the single source of truth for the active language: /ka, /en.
 * localStorage only decides where a first-time visitor gets sent from "/".
 *
 * To add a new interface string: add the key to BOTH files in
 * src/locales/, then read it in a component with  t('your.key').
 * ============================================================================
 */

const STORAGE_KEY = 'archtrade.language'

/** Type guard — narrows an untrusted string (URL param) to a Language. */
export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value)
}

/**
 * The visitor's remembered choice, if it is still a language we ship.
 * Falls back to Georgian. Wrapped in try/catch because localStorage throws in
 * private-browsing modes rather than simply being unavailable.
 */
export function getStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (isLanguage(stored)) return stored
  } catch {
    /* storage blocked — fall through to the default */
  }
  return DEFAULT_LANGUAGE
}

export function setStoredLanguage(language: Language) {
  try {
    localStorage.setItem(STORAGE_KEY, language)
  } catch {
    /* storage blocked — the URL still carries the language, so this is safe */
  }
}

i18n.use(initReactI18next).init({
  resources: {
    ka: { translation: ka },
    en: { translation: en },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  // React already escapes everything it renders.
  interpolation: { escapeValue: false },
  // A missing key should be loud in development and silent in production.
  saveMissing: false,
  returnNull: false,
})

export default i18n

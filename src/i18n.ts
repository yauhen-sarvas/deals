import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import de from './locales/de.json'
import ja from './locales/ja.json'
import es from './locales/es.json'
import zh from './locales/zh.json'
import { STORAGE_KEYS } from './constants/storage'

const SUPPORTED_LOCALES = ['en', 'de', 'ja', 'es', 'zh']
const saved = localStorage.getItem(STORAGE_KEYS.LOCALE) ?? ''
const initialLocale = SUPPORTED_LOCALES.includes(saved) ? saved : 'en'

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: 'en',
  messages: { en, de, ja, es, zh },
})

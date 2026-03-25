import { enUS, ms } from 'date-fns/locale'

export const defaultLanguage = 'ms'

export const supportedLanguages = [
  {
    code: 'ms',
    label: 'BM',
    name: 'Bahasa Melayu',
  },
  {
    code: 'en',
    label: 'EN',
    name: 'English',
  },
]

export function normalizeLanguage(value) {
  if (!value) {
    return defaultLanguage
  }

  const normalizedValue = String(value).trim().toLowerCase()

  return supportedLanguages.some((language) => language.code === normalizedValue)
    ? normalizedValue
    : defaultLanguage
}

export function getDateFnsLocale(language) {
  return normalizeLanguage(language) === 'en' ? enUS : ms
}

export function getIntlLocale(language) {
  return normalizeLanguage(language) === 'en' ? 'en-MY' : 'ms-MY'
}

export function getNextLanguage(language) {
  return normalizeLanguage(language) === 'en' ? 'ms' : 'en'
}

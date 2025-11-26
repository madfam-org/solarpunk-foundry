/**
 * @solarpunk/core - Localization
 *
 * Authoritative locale and internationalization constants.
 * These define which languages the ecosystem officially supports.
 *
 * Changes to this file require governance approval.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// SUPPORTED LOCALES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Officially supported locales across the ecosystem.
 * Apps MUST support at least the default locale.
 * Apps SHOULD support all listed locales for full ecosystem compatibility.
 */
export const locales = ['en', 'es', 'pt'] as const;

/**
 * Locale type derived from supported locales
 */
export type Locale = (typeof locales)[number];

/**
 * Default locale for the ecosystem
 */
export const defaultLocale: Locale = 'es';

/**
 * Fallback locale when requested locale is unavailable
 */
export const fallbackLocale: Locale = 'en';

// ═══════════════════════════════════════════════════════════════════════════════
// LOCALE METADATA
// ═══════════════════════════════════════════════════════════════════════════════

export interface LocaleMetadata {
  /** ISO 639-1 code */
  code: Locale;
  /** Native name of the language */
  nativeName: string;
  /** English name of the language */
  englishName: string;
  /** Text direction */
  direction: 'ltr' | 'rtl';
  /** Date format pattern */
  dateFormat: string;
  /** Number decimal separator */
  decimalSeparator: string;
  /** Number thousands separator */
  thousandsSeparator: string;
}

export const localeMetadata: Record<Locale, LocaleMetadata> = {
  en: {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    decimalSeparator: '.',
    thousandsSeparator: ',',
  },
  es: {
    code: 'es',
    nativeName: 'Español',
    englishName: 'Spanish',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    decimalSeparator: ',',
    thousandsSeparator: '.',
  },
  pt: {
    code: 'pt',
    nativeName: 'Português',
    englishName: 'Portuguese',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    decimalSeparator: ',',
    thousandsSeparator: '.',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// LOCALE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if a string is a valid supported locale
 */
export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

/**
 * Get locale from string with fallback
 */
export function parseLocale(value: string | undefined | null): Locale {
  if (value && isValidLocale(value)) {
    return value;
  }
  return fallbackLocale;
}

/**
 * Get locale metadata with fallback
 */
export function getLocaleMetadata(locale: string): LocaleMetadata {
  const validLocale = parseLocale(locale);
  return localeMetadata[validLocale];
}

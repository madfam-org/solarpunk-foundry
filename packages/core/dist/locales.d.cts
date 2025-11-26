/**
 * @solarpunk/core - Localization
 *
 * Authoritative locale and internationalization constants.
 * These define which languages the ecosystem officially supports.
 *
 * Changes to this file require governance approval.
 */
/**
 * Officially supported locales across the ecosystem.
 * Apps MUST support at least the default locale.
 * Apps SHOULD support all listed locales for full ecosystem compatibility.
 */
declare const locales: readonly ["en", "es", "pt"];
/**
 * Locale type derived from supported locales
 */
type Locale = (typeof locales)[number];
/**
 * Default locale for the ecosystem
 */
declare const defaultLocale: Locale;
/**
 * Fallback locale when requested locale is unavailable
 */
declare const fallbackLocale: Locale;
interface LocaleMetadata {
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
declare const localeMetadata: Record<Locale, LocaleMetadata>;
/**
 * Check if a string is a valid supported locale
 */
declare function isValidLocale(value: string): value is Locale;
/**
 * Get locale from string with fallback
 */
declare function parseLocale(value: string | undefined | null): Locale;
/**
 * Get locale metadata with fallback
 */
declare function getLocaleMetadata(locale: string): LocaleMetadata;

export { type Locale, type LocaleMetadata, defaultLocale, fallbackLocale, getLocaleMetadata, isValidLocale, localeMetadata, locales, parseLocale };

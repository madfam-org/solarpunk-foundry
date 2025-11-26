/**
 * @solarpunk/core - Currencies
 *
 * Authoritative currency constants for the ecosystem.
 * These define which currencies are officially supported for transactions.
 *
 * Changes to this file require governance approval.
 */
/**
 * Officially supported currencies across the ecosystem.
 * Apps handling payments MUST support at least the default currency.
 */
declare const currencies: readonly ["MXN", "USD", "EUR"];
/**
 * Currency type derived from supported currencies
 */
type Currency = (typeof currencies)[number];
/**
 * Default currency for the ecosystem (Mexican Peso - home market)
 */
declare const defaultCurrency: Currency;
/**
 * Fallback currency for international contexts
 */
declare const fallbackCurrency: Currency;
interface CurrencyMetadata {
    /** ISO 4217 code */
    code: Currency;
    /** Currency symbol */
    symbol: string;
    /** Full name */
    name: string;
    /** Decimal places for display */
    decimals: number;
    /** Symbol position */
    symbolPosition: 'before' | 'after';
    /** Associated locales (primary markets) */
    locales: string[];
}
declare const currencyMetadata: Record<Currency, CurrencyMetadata>;
/**
 * Check if a string is a valid supported currency
 */
declare function isValidCurrency(value: string): value is Currency;
/**
 * Get currency from string with fallback
 */
declare function parseCurrency(value: string | undefined | null): Currency;
/**
 * Get currency metadata with fallback
 */
declare function getCurrencyMetadata(currency: string): CurrencyMetadata;
/**
 * Format a monetary amount according to currency rules
 */
declare function formatCurrency(amount: number, currency: Currency, options?: {
    showCode?: boolean;
}): string;

export { type Currency, type CurrencyMetadata, currencies, currencyMetadata, defaultCurrency, fallbackCurrency, formatCurrency, getCurrencyMetadata, isValidCurrency, parseCurrency };

/**
 * @solarpunk/core - Currencies
 *
 * Authoritative currency constants for the ecosystem.
 * These define which currencies are officially supported for transactions.
 *
 * Changes to this file require governance approval.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// SUPPORTED CURRENCIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Officially supported currencies across the ecosystem.
 * Apps handling payments MUST support at least the default currency.
 */
export const currencies = ['MXN', 'USD', 'EUR'] as const;

/**
 * Currency type derived from supported currencies
 */
export type Currency = (typeof currencies)[number];

/**
 * Default currency for the ecosystem (Mexican Peso - home market)
 */
export const defaultCurrency: Currency = 'MXN';

/**
 * Fallback currency for international contexts
 */
export const fallbackCurrency: Currency = 'USD';

// ═══════════════════════════════════════════════════════════════════════════════
// CURRENCY METADATA
// ═══════════════════════════════════════════════════════════════════════════════

export interface CurrencyMetadata {
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

export const currencyMetadata: Record<Currency, CurrencyMetadata> = {
  MXN: {
    code: 'MXN',
    symbol: '$',
    name: 'Mexican Peso',
    decimals: 2,
    symbolPosition: 'before',
    locales: ['es-MX'],
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimals: 2,
    symbolPosition: 'before',
    locales: ['en-US'],
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimals: 2,
    symbolPosition: 'after',
    locales: ['es-ES', 'pt-PT'],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// CURRENCY UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if a string is a valid supported currency
 */
export function isValidCurrency(value: string): value is Currency {
  return currencies.includes(value as Currency);
}

/**
 * Get currency from string with fallback
 */
export function parseCurrency(value: string | undefined | null): Currency {
  if (value && isValidCurrency(value)) {
    return value;
  }
  return fallbackCurrency;
}

/**
 * Get currency metadata with fallback
 */
export function getCurrencyMetadata(currency: string): CurrencyMetadata {
  const validCurrency = parseCurrency(currency);
  return currencyMetadata[validCurrency];
}

/**
 * Format a monetary amount according to currency rules
 */
export function formatCurrency(
  amount: number,
  currency: Currency,
  options?: { showCode?: boolean }
): string {
  const meta = currencyMetadata[currency];
  const formatted = amount.toFixed(meta.decimals);
  const parts = formatted.split('.');

  // Add thousands separator (using locale-appropriate separator)
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const decimalPart = parts[1];

  const number = `${integerPart}.${decimalPart}`;

  let result: string;
  if (meta.symbolPosition === 'before') {
    result = `${meta.symbol}${number}`;
  } else {
    result = `${number}${meta.symbol}`;
  }

  if (options?.showCode) {
    result = `${result} ${currency}`;
  }

  return result;
}

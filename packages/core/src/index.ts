/**
 * @solarpunk/core
 *
 * Authoritative organizational constants for the MADFAM/Solarpunk ecosystem.
 *
 * This package contains DECISIONS, not implementations:
 * - Brand identity (colors, fonts, spacing)
 * - Supported locales and currencies
 * - Analytics event taxonomy
 * - Legal information
 * - Product registry
 *
 * Apps MUST use these values for ecosystem consistency.
 * Changes to this package require governance approval.
 *
 * @packageDocumentation
 */

// ═══════════════════════════════════════════════════════════════════════════════
// BRAND IDENTITY
// ═══════════════════════════════════════════════════════════════════════════════

export {
  brand,
  colors,
  gradients,
  typography,
  spacing,
  breakpoints,
  shadows,
  radii,
  zIndex,
  type BrandColors,
  type BrandGradients,
  type BrandTypography,
  type BrandSpacing,
  type BrandBreakpoints,
  type BrandShadows,
  type BrandRadii,
  type BrandZIndex,
} from './brand';

// ═══════════════════════════════════════════════════════════════════════════════
// LOCALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

export {
  locales,
  defaultLocale,
  fallbackLocale,
  localeMetadata,
  isValidLocale,
  parseLocale,
  getLocaleMetadata,
  type Locale,
  type LocaleMetadata,
} from './locales';

// ═══════════════════════════════════════════════════════════════════════════════
// CURRENCIES
// ═══════════════════════════════════════════════════════════════════════════════

export {
  currencies,
  defaultCurrency,
  fallbackCurrency,
  currencyMetadata,
  isValidCurrency,
  parseCurrency,
  getCurrencyMetadata,
  formatCurrency,
  type Currency,
  type CurrencyMetadata,
} from './currencies';

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

export {
  eventCategories,
  analyticsEvents,
  type EventCategory,
  type AnalyticsEventName,
  type AnalyticsEvent,
  type EventProps,
  type BaseEventProps,
  // Individual event prop types for type-safe tracking
  type UserSignedUpProps,
  type UserSignedInProps,
  type UserSignedOutProps,
  type UserUpgradedProps,
  type FunnelStartedProps,
  type FunnelStepCompletedProps,
  type FunnelConvertedProps,
  type FunnelAbandonedProps,
  type PageViewedProps,
  type FeatureUsedProps,
  type ContentViewedProps,
  type SearchPerformedProps,
  type LeadCapturedProps,
  type DemoRequestedProps,
  type QuoteRequestedProps,
  type PurchaseCompletedProps,
  type ErrorOccurredProps,
  type FeedbackSubmittedProps,
} from './events';

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

export {
  ecosystemLayers,
  licenseTypes,
  products,
  productIds,
  getProductsByLayer,
  getProductsByLicense,
  getPublicProducts,
  getProductsByPhase,
  isValidProductId,
  getProduct,
  getProductGitHubUrl,
  getProductWebsiteUrl,
  type EcosystemLayer,
  type LicenseType,
  type Product,
  type ProductId,
} from './products';

// ═══════════════════════════════════════════════════════════════════════════════
// LEGAL & COMPLIANCE
// ═══════════════════════════════════════════════════════════════════════════════

export {
  company,
  contacts,
  legalUrls,
  compliance,
  getCopyrightNotice,
  licenseHeaders,
  socialLinks,
  footerLinks,
} from './legal';

// src/brand.ts
var brand = {
  /** Official company/organization name */
  name: "MADFAM",
  /** Full legal entity name */
  legalName: "Innovaciones MADFAM SAS de CV",
  /** Brand tagline */
  tagline: "From Bits to Atoms. High Tech, Deep Roots.",
  /** Brand philosophy */
  philosophy: "Solarpunk Foundry",
  /** Primary website */
  website: "https://madfam.io",
  /** GitHub organization */
  github: "https://github.com/madfam-io"
};
var colors = {
  /**
   * Primary Brand Colors (extracted from MADFAM logo)
   * These are the core identity colors - use prominently
   */
  primary: {
    green: "#2c8136",
    greenLight: "#52b788",
    greenDark: "#1e5128",
    purple: "#58326f",
    purpleLight: "#7d4f96",
    purpleDark: "#3d1e4f",
    yellow: "#eebc15",
    yellowLight: "#f7d64a",
    yellowDark: "#d4a20d"
  },
  /**
   * Solarpunk Heritage Palette
   * Extended colors representing our sustainable tech vision
   */
  solarpunk: {
    solarOrange: "#ff6b35",
    solarAmber: "#ffa500",
    leafGreen: "#52b788",
    forestGreen: "#2d6a4f",
    skyBlue: "#4ecdc4",
    oceanBlue: "#006ba6",
    earthBrown: "#956633",
    terracotta: "#c65d00"
  },
  /**
   * Corporate Professional Palette
   * For enterprise contexts and professional communications
   */
  corporate: {
    deepBlue: "#1e3a8a",
    navyBlue: "#1e293b",
    charcoal: "#1f2937",
    graphite: "#374151",
    pearl: "#f9fafb",
    silver: "#e5e7eb",
    slate: "#64748b",
    steel: "#475569"
  },
  /**
   * Semantic Colors
   * Consistent meaning across all applications
   */
  semantic: {
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6"
  },
  /**
   * Dark Mode Colors
   */
  dark: {
    background: "#0f172a",
    surface: "#1e293b",
    border: "#334155",
    textPrimary: "#f1f5f9",
    textSecondary: "#cbd5e1",
    textMuted: "#94a3b8"
  },
  /**
   * Light Mode Colors
   */
  light: {
    background: "#ffffff",
    surface: "#f8fafc",
    border: "#e2e8f0",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    textMuted: "#64748b"
  }
};
var gradients = {
  /** Solarpunk Heritage */
  solar: "linear-gradient(135deg, #ff6b35 0%, #ffa500 100%)",
  nature: "linear-gradient(135deg, #52b788 0%, #2c8136 100%)",
  ocean: "linear-gradient(135deg, #4ecdc4 0%, #006ba6 100%)",
  /** Corporate Evolution */
  professional: "linear-gradient(135deg, #1e3a8a 0%, #58326f 100%)",
  innovation: "linear-gradient(135deg, #58326f 0%, #eebc15 100%)",
  trust: "linear-gradient(135deg, #1e293b 0%, #1e3a8a 100%)",
  /** Hybrid Harmony (bridging solarpunk and corporate) */
  bridge: "linear-gradient(135deg, #2c8136 0%, #58326f 50%, #eebc15 100%)",
  spectrum: "linear-gradient(90deg, #2c8136, #52b788, #4ecdc4, #58326f, #eebc15)",
  sunrise: "linear-gradient(135deg, #eebc15 0%, #ff6b35 50%, #58326f 100%)"
};
var typography = {
  /** Font families */
  fonts: {
    heading: "Inter",
    body: "Inter",
    mono: "JetBrains Mono"
  },
  /** Font weights */
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  /** Font size scale (rem) */
  sizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem"
  },
  /** Line heights */
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75
  }
};
var spacing = {
  /** Spacing scale (rem) - follows 4px grid */
  px: "1px",
  0: "0",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  2.5: "0.625rem",
  3: "0.75rem",
  3.5: "0.875rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  7: "1.75rem",
  8: "2rem",
  9: "2.25rem",
  10: "2.5rem",
  12: "3rem",
  14: "3.5rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  28: "7rem",
  32: "8rem",
  36: "9rem",
  40: "10rem",
  44: "11rem",
  48: "12rem",
  52: "13rem",
  56: "14rem",
  60: "15rem",
  64: "16rem",
  72: "18rem",
  80: "20rem",
  96: "24rem"
};
var breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px"
};
var shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
  none: "none"
};
var radii = {
  none: "0",
  sm: "0.125rem",
  DEFAULT: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "0.75rem",
  "2xl": "1rem",
  "3xl": "1.5rem",
  full: "9999px"
};
var zIndex = {
  hide: -1,
  auto: "auto",
  base: 0,
  docked: 10,
  dropdown: 1e3,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800
};

// src/locales.ts
var locales = ["en", "es", "pt"];
var defaultLocale = "es";
var fallbackLocale = "en";
var localeMetadata = {
  en: {
    code: "en",
    nativeName: "English",
    englishName: "English",
    direction: "ltr",
    dateFormat: "MM/DD/YYYY",
    decimalSeparator: ".",
    thousandsSeparator: ","
  },
  es: {
    code: "es",
    nativeName: "Espa\xF1ol",
    englishName: "Spanish",
    direction: "ltr",
    dateFormat: "DD/MM/YYYY",
    decimalSeparator: ",",
    thousandsSeparator: "."
  },
  pt: {
    code: "pt",
    nativeName: "Portugu\xEAs",
    englishName: "Portuguese",
    direction: "ltr",
    dateFormat: "DD/MM/YYYY",
    decimalSeparator: ",",
    thousandsSeparator: "."
  }
};
function isValidLocale(value) {
  return locales.includes(value);
}
function parseLocale(value) {
  if (value && isValidLocale(value)) {
    return value;
  }
  return fallbackLocale;
}
function getLocaleMetadata(locale) {
  const validLocale = parseLocale(locale);
  return localeMetadata[validLocale];
}

// src/currencies.ts
var currencies = ["MXN", "USD", "EUR"];
var defaultCurrency = "MXN";
var fallbackCurrency = "USD";
var currencyMetadata = {
  MXN: {
    code: "MXN",
    symbol: "$",
    name: "Mexican Peso",
    decimals: 2,
    symbolPosition: "before",
    locales: ["es-MX"]
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    decimals: 2,
    symbolPosition: "before",
    locales: ["en-US"]
  },
  EUR: {
    code: "EUR",
    symbol: "\u20AC",
    name: "Euro",
    decimals: 2,
    symbolPosition: "after",
    locales: ["es-ES", "pt-PT"]
  }
};
function isValidCurrency(value) {
  return currencies.includes(value);
}
function parseCurrency(value) {
  if (value && isValidCurrency(value)) {
    return value;
  }
  return fallbackCurrency;
}
function getCurrencyMetadata(currency) {
  const validCurrency = parseCurrency(currency);
  return currencyMetadata[validCurrency];
}
function formatCurrency(amount, currency, options) {
  const meta = currencyMetadata[currency];
  const formatted = amount.toFixed(meta.decimals);
  const parts = formatted.split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const decimalPart = parts[1];
  const number = `${integerPart}.${decimalPart}`;
  let result;
  if (meta.symbolPosition === "before") {
    result = `${meta.symbol}${number}`;
  } else {
    result = `${number}${meta.symbol}`;
  }
  if (options?.showCode) {
    result = `${result} ${currency}`;
  }
  return result;
}

// src/events.ts
var eventCategories = [
  "user",
  // User lifecycle events
  "auth",
  // Authentication events
  "navigation",
  // Page/screen navigation
  "engagement",
  // User engagement with content
  "conversion",
  // Business conversion events
  "error",
  // Error tracking
  "feature",
  // Feature usage tracking
  "feedback"
  // User feedback events
];
var analyticsEvents = {
  // User lifecycle
  "user.signed_up": {},
  "user.signed_in": {},
  "user.signed_out": {},
  "user.upgraded": {},
  // Conversion funnel
  "funnel.started": {},
  "funnel.step_completed": {},
  "funnel.converted": {},
  "funnel.abandoned": {},
  // Engagement
  "page.viewed": {},
  "feature.used": {},
  "content.viewed": {},
  "search.performed": {},
  // Business
  "lead.captured": {},
  "demo.requested": {},
  "quote.requested": {},
  "purchase.completed": {},
  // Error
  "error.occurred": {},
  // Feedback
  "feedback.submitted": {}
};

// src/products.ts
var ecosystemLayers = {
  soil: {
    name: "The Soil",
    description: "The bedrock. Infrastructure layer.",
    order: 1
  },
  roots: {
    name: "The Roots",
    description: "Sensing & Input. Data harvesting layer.",
    order: 2
  },
  stem: {
    name: "The Stem",
    description: "Core Standards & Verification. Structural logic layer.",
    order: 3
  },
  fruit: {
    name: "The Fruit",
    description: "User Platforms. Value creation layer.",
    order: 4
  }
};
var licenseTypes = {
  "AGPL-3.0": {
    name: "GNU Affero General Public License v3.0",
    openSource: true,
    purpose: "Prevents cloud capture, ensures source availability"
  },
  "MPL-2.0": {
    name: "Mozilla Public License 2.0",
    openSource: true,
    purpose: "File-level copyleft, allows proprietary integration"
  },
  "Proprietary": {
    name: "Proprietary",
    openSource: false,
    purpose: "Commercial protection for competitive advantage"
  }
};
var products = {
  // ─────────────────────────────────────────────────────────────────────────────
  // Layer 1: The Soil (Infrastructure)
  // ─────────────────────────────────────────────────────────────────────────────
  enclii: {
    id: "enclii",
    name: "Enclii",
    description: "Sovereign PaaS. Bare-metal hosting.",
    layer: "soil",
    domain: "enclii.dev",
    repo: "enclii",
    githubOrg: "madfam-io",
    license: "AGPL-3.0",
    isPublic: true,
    phase: 1
  },
  janua: {
    id: "janua",
    name: "Janua",
    description: "The Gatekeeper. Identity, SSO, and Revenue Management.",
    layer: "soil",
    domain: "janua.dev",
    repo: "janua",
    githubOrg: "madfam-io",
    license: "AGPL-3.0",
    defaultPort: 8001,
    isPublic: true,
    phase: 1
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // Layer 2: The Roots (Sensing & Input)
  // ─────────────────────────────────────────────────────────────────────────────
  fortuna: {
    id: "fortuna",
    name: "Fortuna",
    description: "The Problem Hunter. Market gap intelligence.",
    layer: "roots",
    domain: "fortuna.tube",
    repo: "fortuna",
    githubOrg: "aureo-labs",
    license: "Proprietary",
    isPublic: false,
    phase: 2
  },
  forgesight: {
    id: "forgesight",
    name: "ForgeSight",
    description: "The Pricer. Real-time manufacturing cost data.",
    layer: "roots",
    domain: "forgesight.quest",
    repo: "forgesight",
    githubOrg: "aureo-labs",
    license: "Proprietary",
    defaultPort: 8100,
    isPublic: false,
    phase: 2
  },
  blueprintTube: {
    id: "blueprintTube",
    name: "BlueprintTube",
    description: "The Librarian. 3D model indexing and rating.",
    layer: "roots",
    domain: "blueprint.tube",
    repo: "blueprint-harvester",
    githubOrg: "aureo-labs",
    license: "Proprietary",
    isPublic: false,
    phase: 2
  },
  bloomScroll: {
    id: "bloomScroll",
    name: "BloomScroll",
    description: "The Filter. Slow Web content aggregator.",
    layer: "roots",
    domain: "bloomscroll.app",
    repo: "bloom-scroll",
    githubOrg: "madfam-io",
    license: "MPL-2.0",
    isPublic: true,
    phase: 2
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // Layer 3: The Stem (Core Standards & Verification)
  // ─────────────────────────────────────────────────────────────────────────────
  geomCore: {
    id: "geomCore",
    name: "geom-core",
    description: "The Physics Standard. C++ geometry analysis library.",
    layer: "stem",
    domain: "geom-core.dev",
    repo: "geom-core",
    githubOrg: "madfam-io",
    license: "MPL-2.0",
    isPublic: true,
    phase: 3
  },
  avala: {
    id: "avala",
    name: "AVALA",
    description: "The Human Standard. Applied learning verification.",
    layer: "stem",
    domain: "avala.mx",
    repo: "avala",
    githubOrg: "madfam-io",
    license: "AGPL-3.0",
    isPublic: true,
    phase: 3
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // Layer 4: The Fruit (User Platforms)
  // ─────────────────────────────────────────────────────────────────────────────
  sim4d: {
    id: "sim4d",
    name: "Sim4D",
    description: "The Creator. Web-based CAD guided by geom-core.",
    layer: "fruit",
    domain: "sim4d.io",
    repo: "sim4d",
    githubOrg: "madfam-io",
    license: "MPL-2.0",
    defaultPort: 5173,
    isPublic: true,
    phase: 3
  },
  forj: {
    id: "forj",
    name: "Forj",
    description: "The Bazaar. Decentralized fabrication storefronts.",
    layer: "fruit",
    domain: "forj.design",
    repo: "forj",
    githubOrg: "aureo-labs",
    license: "Proprietary",
    isPublic: false,
    phase: 4
  },
  cotiza: {
    id: "cotiza",
    name: "Cotiza Studio",
    description: "The Merchant. Automated quoting engine.",
    layer: "fruit",
    domain: "cotiza.studio",
    repo: "digifab-quoting",
    githubOrg: "aureo-labs",
    license: "Proprietary",
    defaultPort: 8200,
    isPublic: false,
    phase: 4
  },
  dhanam: {
    id: "dhanam",
    name: "Dhanam",
    description: "The Treasury. Unified budgeting and wealth tracking.",
    layer: "fruit",
    domain: "dhan.am",
    repo: "dhanam",
    githubOrg: "madfam-io",
    license: "AGPL-3.0",
    defaultPort: 8500,
    isPublic: true,
    phase: 1
  },
  coforma: {
    id: "coforma",
    name: "Coforma Studio",
    description: "The Ear. Customer Advisory Board and feedback.",
    layer: "fruit",
    domain: "coforma.studio",
    repo: "coforma-studio",
    githubOrg: "aureo-labs",
    license: "Proprietary",
    isPublic: false,
    phase: 1
  },
  galvana: {
    id: "galvana",
    name: "Galvana",
    description: "The Reactor. Electrochemistry simulation platform.",
    layer: "fruit",
    domain: "galvana.io",
    repo: "electrochem-sim",
    githubOrg: "madfam-io",
    license: "MPL-2.0",
    isPublic: true,
    phase: 5
  },
  // ─────────────────────────────────────────────────────────────────────────────
  // Operations (not in biological layers but essential)
  // ─────────────────────────────────────────────────────────────────────────────
  primavera3d: {
    id: "primavera3d",
    name: "Primavera3D",
    description: "Internal 3D printing operations (dogfooding target).",
    layer: "fruit",
    domain: "primavera3d.com",
    repo: "primavera3d",
    githubOrg: "madfam-io",
    license: "Proprietary",
    isPublic: false,
    phase: 4
  }
};
var productIds = Object.keys(products);
function getProductsByLayer(layer) {
  return Object.values(products).filter((p) => p.layer === layer);
}
function getProductsByLicense(license) {
  return Object.values(products).filter((p) => p.license === license);
}
function getPublicProducts() {
  return Object.values(products).filter((p) => p.isPublic);
}
function getProductsByPhase(phase) {
  return Object.values(products).filter((p) => p.phase === phase);
}
function isValidProductId(value) {
  return value in products;
}
function getProduct(id) {
  return products[id];
}
function getProductGitHubUrl(id) {
  const product = products[id];
  return `https://github.com/${product.githubOrg}/${product.repo}`;
}
function getProductWebsiteUrl(id) {
  const product = products[id];
  return `https://${product.domain}`;
}

// src/legal.ts
var company = {
  /** Legal entity name */
  legalName: "Innovaciones MADFAM SAS de CV",
  /** Trade name / DBA */
  tradeName: "MADFAM",
  /** Country of incorporation */
  country: "Mexico",
  /** Tax ID (RFC in Mexico) */
  taxId: "IMA230101XXX",
  // Placeholder - replace with actual
  /** Year of incorporation */
  foundedYear: 2023,
  /** Registered address */
  address: {
    street: "",
    // To be filled
    city: "Ciudad de M\xE9xico",
    state: "CDMX",
    postalCode: "",
    country: "Mexico"
  }
};
var contacts = {
  /** General support */
  support: "support@madfam.io",
  /** Privacy/data protection inquiries */
  privacy: "privacy@madfam.io",
  /** Security vulnerabilities (responsible disclosure) */
  security: "security@madfam.io",
  /** Legal inquiries */
  legal: "legal@madfam.io",
  /** Business/partnerships */
  business: "business@madfam.io",
  /** Technical inquiries */
  tech: "tech@madfam.io"
};
var legalUrls = {
  /** Privacy Policy */
  privacyPolicy: "https://madfam.io/legal/privacy",
  /** Terms of Service */
  termsOfService: "https://madfam.io/legal/terms",
  /** Cookie Policy */
  cookiePolicy: "https://madfam.io/legal/cookies",
  /** Acceptable Use Policy */
  acceptableUse: "https://madfam.io/legal/acceptable-use",
  /** Data Processing Agreement (for B2B) */
  dpa: "https://madfam.io/legal/dpa",
  /** Security Policy */
  security: "https://madfam.io/security",
  /** Open Source Licenses */
  licenses: "https://madfam.io/legal/licenses",
  /** Trademark Guidelines */
  trademark: "https://madfam.io/legal/trademark"
};
var compliance = {
  /** Data protection regulations we comply with */
  dataProtection: [
    "LFPDPPP",
    // Mexico's Federal Law on Protection of Personal Data
    "GDPR"
    // For EU users (if applicable)
  ],
  /** Financial regulations (for Dhanam) */
  financial: [
    "CNBV"
    // Comisión Nacional Bancaria y de Valores guidelines
  ],
  /** Education/certification regulations (for AVALA) */
  education: [
    "CONOCER",
    // Consejo Nacional de Normalización y Certificación
    "SEP"
    // Secretaría de Educación Pública recognition
  ]
};
function getCopyrightNotice(startYear) {
  const start = startYear ?? company.foundedYear;
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const yearRange = start === currentYear ? `${currentYear}` : `${start}-${currentYear}`;
  return `\xA9 ${yearRange} ${company.legalName}. All rights reserved.`;
}
var licenseHeaders = {
  "AGPL-3.0": `
/**
 * Copyright (c) ${(/* @__PURE__ */ new Date()).getFullYear()} ${company.legalName}
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */`.trim(),
  "MPL-2.0": `
/**
 * Copyright (c) ${(/* @__PURE__ */ new Date()).getFullYear()} ${company.legalName}
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */`.trim(),
  "Proprietary": `
/**
 * Copyright (c) ${(/* @__PURE__ */ new Date()).getFullYear()} ${company.legalName}
 * All rights reserved.
 *
 * This software is proprietary and confidential. Unauthorized copying,
 * distribution, or use of this software, via any medium, is strictly prohibited.
 */`.trim()
};
var socialLinks = {
  github: "https://github.com/madfam-io",
  twitter: "https://twitter.com/madfam_io",
  linkedin: "https://linkedin.com/company/madfam"
  // Add more as needed
};
var footerLinks = {
  legal: [
    { label: "Privacy Policy", href: legalUrls.privacyPolicy },
    { label: "Terms of Service", href: legalUrls.termsOfService },
    { label: "Cookie Policy", href: legalUrls.cookiePolicy }
  ],
  company: [
    { label: "About", href: "https://madfam.io/about" },
    { label: "Careers", href: "https://madfam.io/careers" },
    { label: "Contact", href: "https://madfam.io/contact" }
  ],
  resources: [
    { label: "Documentation", href: "https://docs.madfam.io" },
    { label: "Blog", href: "https://madfam.io/blog" },
    { label: "Status", href: "https://status.madfam.io" }
  ]
};

export { analyticsEvents, brand, breakpoints, colors, company, compliance, contacts, currencies, currencyMetadata, defaultCurrency, defaultLocale, ecosystemLayers, eventCategories, fallbackCurrency, fallbackLocale, footerLinks, formatCurrency, getCopyrightNotice, getCurrencyMetadata, getLocaleMetadata, getProduct, getProductGitHubUrl, getProductWebsiteUrl, getProductsByLayer, getProductsByLicense, getProductsByPhase, getPublicProducts, gradients, isValidCurrency, isValidLocale, isValidProductId, legalUrls, licenseHeaders, licenseTypes, localeMetadata, locales, parseCurrency, parseLocale, productIds, products, radii, shadows, socialLinks, spacing, typography, zIndex };
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.js.map
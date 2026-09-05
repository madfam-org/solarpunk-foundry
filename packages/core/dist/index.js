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
  github: "https://github.com/madfam-org"
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

// src/products.generated.ts
var PRODUCT_PROJECTION = {
  schema: "madfam-product-projection/v1",
  generatedFrom: "internal-devops/ecosystem/registry/products.yaml",
  registryVersion: 4,
  lastUpdated: "2026-09-05",
  exportPrivateRepoNames: true,
  /** sha256 of the vendored projection.public.json this module was rendered from. */
  sourceSha256: "b9a1a315eedcb1c3c3cf13fc7c8c17a0fa12048f51750488885192594091cb6e"
};
var generatedProducts = {
  enclii: {
    id: "enclii",
    name: "Enclii",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "soil",
    repo: "enclii",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    domain: "enclii.dev",
    hosts: [
      "app.enclii.dev",
      "api.enclii.dev",
      "admin.enclii.dev",
      "status.enclii.dev",
      "docs.enclii.dev"
    ],
    infraHosts: [
      "npm.madfam.io",
      "status.madfam.io",
      "grafana.enclii.dev",
      "prometheus.enclii.dev",
      "alertmanager.enclii.dev"
    ],
    site: {
      category: "Infrastructure",
      track: "platform",
      order: 1,
      icon: "\u2601\uFE0F",
      bannerKeyword: "DEPLOYMENT",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "community",
        "pro",
        "madfam"
      ],
      adminTier: "admin"
    }
  },
  janua: {
    id: "janua",
    name: "Janua",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "soil",
    repo: "janua",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    domain: "janua.dev",
    hosts: [
      "docs.janua.dev"
    ],
    infraHosts: [
      "auth.madfam.io"
    ],
    site: {
      category: "Infrastructure",
      track: "platform",
      order: 2,
      icon: "\u{1F510}",
      bannerKeyword: "AUTHENTICATION",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "community",
        "pro",
        "enterprise"
      ],
      adminTier: "admin"
    }
  },
  selva: {
    id: "selva",
    name: "Selva",
    aliases: [
      "Selva Office"
    ],
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "fruit",
    repo: "selva-office",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    domain: "selva.town",
    hosts: [
      "www.selva.town",
      "app.selva.town",
      "api.selva.town",
      "admin.selva.town",
      "ws.selva.town",
      "gw.selva.town"
    ],
    infraHosts: [
      "inference.selva.town"
    ],
    site: {
      category: "Infrastructure",
      track: "platform",
      order: 3,
      icon: "\u{1F333}",
      bannerKeyword: "AI AGENT OFFICE",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "maker",
        "studio",
        "enterprise"
      ],
      adminTier: "admin",
      checkoutSlug: "selva"
    }
  },
  forgesight: {
    id: "forgesight",
    name: "Forgesight",
    aliases: [
      "Forge Sight",
      "ForgeSight"
    ],
    siteSlug: "forge-sight",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    dataLicense: "DATA_LICENSE",
    layer: "roots",
    repo: "forgesight",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    domain: "forgesight.quest",
    hosts: [
      "app.forgesight.quest",
      "api.forgesight.quest",
      "admin.forgesight.quest"
    ],
    infraHosts: [],
    site: {
      category: "Intelligence",
      track: "self-serve",
      order: 4,
      icon: "\u{1F3ED}",
      bannerKeyword: "INDUSTRY INTELLIGENCE",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "essentials",
        "pro",
        "madfam"
      ],
      adminTier: "admin",
      checkoutSlug: "forgesight"
    }
  },
  dhanam: {
    id: "dhanam",
    name: "Dhanam",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "fruit",
    repo: "dhanam",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    openCoreRepo: "dhanam-core",
    isPublic: false,
    domain: "dhan.am",
    hosts: [
      "app.dhan.am",
      "api.dhan.am",
      "admin.dhan.am"
    ],
    infraHosts: [],
    site: {
      category: "Intelligence",
      track: "self-serve",
      order: 5,
      icon: "\u{1F4B0}",
      bannerKeyword: "BUDGETING & WEALTH",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "community",
        "essentials",
        "pro",
        "madfam"
      ],
      adminTier: "admin",
      checkoutSlug: "dhanam"
    }
  },
  fortuna: {
    id: "fortuna",
    name: "Fortuna",
    lifecycle: "degraded",
    lifecycleVerified: "2026-08-24",
    license: "Proprietary",
    layer: "roots",
    repo: "fortuna",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    domain: "fortuna.tube",
    hosts: [
      "api.fortuna.tube"
    ],
    infraHosts: [],
    site: {
      category: "Intelligence",
      track: "self-serve",
      order: 6,
      icon: "\u{1F52E}",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "free",
        "pro",
        "madfam"
      ],
      adminTier: "admin"
    }
  },
  rondelio: {
    id: "rondelio",
    name: "Rondelio",
    lifecycle: "live",
    lifecycleVerified: "2026-07-09",
    license: "Proprietary",
    layer: "fruit",
    repo: "rondelio",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    domain: "rondel.io",
    hosts: [
      "www.rondel.io",
      "api.rondel.io",
      "play.rondel.io",
      "studio.rondel.io",
      "admin.rondel.io",
      "sim.rondel.io"
    ],
    infraHosts: [],
    site: {
      category: "Intelligence",
      track: "self-serve",
      order: 7,
      icon: "\u{1F3B2}",
      bannerKeyword: "GAMES",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "free",
        "pro",
        "madfam"
      ],
      adminTier: "admin"
    }
  },
  karafiel: {
    id: "karafiel",
    name: "Karafiel",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "stem",
    repo: "karafiel",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    domain: "karafiel.mx",
    hosts: [
      "app.karafiel.mx",
      "api.karafiel.mx",
      "admin.karafiel.mx"
    ],
    infraHosts: [],
    site: {
      category: "Standards",
      track: "self-serve",
      order: 8,
      icon: "\u{1F4DC}",
      bannerKeyword: "COMPLIANCE & CFDI",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "free",
        "contador",
        "despacho",
        "firma"
      ],
      adminTier: "admin",
      checkoutSlug: "karafiel"
    }
  },
  tezca: {
    id: "tezca",
    name: "Tezca",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "stem",
    repo: "tezca",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    domain: "tezca.mx",
    hosts: [
      "api.tezca.mx",
      "admin.tezca.mx"
    ],
    infraHosts: [],
    site: {
      category: "Standards",
      track: "self-serve",
      order: 9,
      icon: "\u2696\uFE0F",
      bannerKeyword: "LEGAL OPS",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "community",
        "essentials",
        "institutional"
      ],
      adminTier: "admin",
      checkoutSlug: "tezca"
    }
  },
  avala: {
    id: "avala",
    name: "Avala",
    acronym: "Alineamiento y Verificaci\xF3n de Aprendizajes y Logros Acreditables",
    aliases: [
      "AVALA"
    ],
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "stem",
    repo: "avala",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    domain: "avala.studio",
    hosts: [
      "app.avala.studio",
      "admin.avala.studio",
      "api.avala.studio"
    ],
    infraHosts: [],
    site: {
      category: "Standards",
      track: "ecosystem",
      order: 10,
      icon: "\u{1F393}",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "institution",
        "issuer",
        "enterprise"
      ],
      adminTier: "admin"
    }
  },
  yantra4d: {
    id: "yantra4d",
    name: "Yantra4D",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "fruit",
    repo: "yantra4d",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    domain: "yantra4d.com",
    hosts: [
      "app.yantra4d.com",
      "api.yantra4d.com",
      "admin.yantra4d.com"
    ],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "ecosystem",
      order: 11,
      icon: "\u{1F4D0}",
      bannerKeyword: "PHYGITAL FABRICATION",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "guest",
        "essentials",
        "pro",
        "madfam"
      ],
      adminTier: "admin",
      checkoutSlug: "yantra4d"
    }
  },
  cotiza: {
    id: "cotiza",
    name: "Cotiza",
    aliases: [
      "Cotiza Studio"
    ],
    siteSlug: "cotiza-studio",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "Proprietary",
    layer: "fruit",
    repo: "digifab-quoting",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    domain: "cotiza.studio",
    hosts: [
      "api.cotiza.studio"
    ],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "ecosystem",
      order: 12,
      icon: "\u{1F4CA}",
      bannerKeyword: "QUOTING ENGINE",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "maker",
        "creator-pro",
        "business",
        "enterprise"
      ],
      adminTier: "admin",
      checkoutSlug: "cotiza"
    }
  },
  "pravara-mes": {
    id: "pravara-mes",
    name: "Pravara MES",
    aliases: [
      "Pravara-MES"
    ],
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "fruit",
    repo: "pravara-mes",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    domain: "mes.madfam.io",
    hosts: [
      "mes-api.madfam.io"
    ],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "ecosystem",
      order: 13,
      icon: "\u2699\uFE0F",
      bannerKeyword: "MANUFACTURING",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "free",
        "pro",
        "madfam"
      ],
      adminTier: "admin"
    }
  },
  voxa: {
    id: "voxa",
    name: "Voxa",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "Apache-2.0",
    layer: "fruit",
    repo: "voxa",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    domain: "voxa.madfam.io",
    hosts: [],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "self-serve",
      order: 14,
      icon: "\u{1F5E3}\uFE0F",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "free",
        "family",
        "clinic"
      ],
      adminTier: "admin",
      checkoutSlug: "voxa"
    }
  },
  "phynd-crm": {
    id: "phynd-crm",
    name: "PhyndCRM",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "fruit",
    repo: "phynd-crm",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    domain: "phynd.app",
    hosts: [
      "crm.madfam.io"
    ],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "self-serve",
      order: 15,
      icon: "\u{1F91D}",
      bannerKeyword: "CLIENT PORTAL & CRM",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "free",
        "pro",
        "madfam"
      ],
      adminTier: "admin"
    }
  },
  ceq: {
    id: "ceq",
    name: "CEQ",
    lifecycle: "degraded",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "fruit",
    repo: "ceq",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    domain: "ceq.lol",
    hosts: [
      "app.ceq.lol",
      "api.ceq.lol",
      "ws.ceq.lol"
    ],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "self-serve",
      order: 16,
      icon: "\u{1F3A8}",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "free",
        "pro",
        "madfam"
      ],
      adminTier: "admin"
    }
  },
  acervo: {
    id: "acervo",
    name: "Acervo",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "UNLICENSED",
    layer: "fruit",
    repo: "acervo",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    domain: "acervo.madfam.io",
    hosts: [],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "self-serve",
      order: 17,
      icon: "\u{1F4DA}",
      showInBanner: true
    },
    commerce: {
      tiers: [],
      adminTier: "admin"
    }
  },
  kalya: {
    id: "kalya",
    name: "kalya",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "UNLICENSED",
    layer: "fruit",
    repo: "kalya",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    domain: "kalya.app",
    hosts: [
      "www.kalya.app",
      "kalya.madfam.io"
    ],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "self-serve",
      order: 18,
      icon: "\u{1F4C5}",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "free",
        "solo",
        "team",
        "biz"
      ],
      adminTier: "admin",
      checkoutSlug: "kalya",
      tierLabels: {
        free: "Gratis",
        solo: "Solo",
        team: "Equipo",
        biz: "Negocio"
      }
    }
  },
  symbiosis: {
    id: "symbiosis",
    name: "Symbiosis HCM",
    lifecycle: "live",
    lifecycleVerified: "2026-09-05",
    license: "AGPL-3.0",
    layer: "fruit",
    repo: "symbiosis-hcm",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    domain: "hcm.madfam.io",
    hosts: [
      "hcm-app.madfam.io",
      "hcm-admin.madfam.io",
      "hcm-api.madfam.io"
    ],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "self-serve",
      order: 19,
      icon: "\u{1F9EC}",
      showInBanner: false
    },
    commerce: {
      tiers: [
        "free",
        "team",
        "biz"
      ],
      adminTier: "admin",
      checkoutSlug: "symbiosis",
      tierLabels: {
        free: "Gratis",
        team: "Equipo",
        biz: "Negocio"
      }
    }
  },
  "crea-map": {
    id: "crea-map",
    name: "MAP \u2014 Modelo de Acompa\xF1amiento Personalizado",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "UNLICENSED",
    layer: "fruit",
    repo: "crea-map",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    domain: "crea-map.madfam.io",
    hosts: [],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "ecosystem",
      order: 20,
      icon: "\u{1F5FA}\uFE0F",
      showInBanner: false
    },
    commerce: {
      tiers: [
        "membership"
      ],
      adminTier: "admin",
      checkoutSlug: "crea-map",
      tierLabels: {
        membership: "Acceso de equipo"
      }
    }
  },
  nauta: {
    id: "nauta",
    name: "Nauta",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "UNLICENSED",
    layer: "fruit",
    repo: "nauta",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    domain: "cto.madfam.io",
    hosts: [
      "crea.madfam.io"
    ],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "platform",
      order: 21,
      icon: "\u{1F9ED}",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "erp",
        "vcto"
      ],
      adminTier: "admin",
      tierLabels: {
        erp: "ERP",
        vcto: "vCTO"
      }
    }
  },
  meridian: {
    id: "meridian",
    name: "Meridian",
    lifecycle: "degraded",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "stem",
    repo: "meridian",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    domain: "meridian.madfam.io",
    hosts: [
      "meridian-app.madfam.io",
      "meridian-api.madfam.io",
      "meridian-admin.madfam.io"
    ],
    infraHosts: [],
    site: {
      category: "Standards",
      track: "ecosystem",
      order: 22,
      icon: "\u{1F6C2}",
      showInBanner: true
    },
    commerce: {
      tiers: [],
      adminTier: "admin"
    }
  },
  "fashion-cabinet": {
    id: "fashion-cabinet",
    name: "Fashion Cabinet",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "AGPL-3.0",
    layer: "stem",
    repo: "fashion-cabinet",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    domain: "fashioncabi.net",
    hosts: [
      "www.fashioncabi.net",
      "fc.madfam.io"
    ],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "ecosystem",
      order: 23,
      icon: "\u{1F457}",
      showInBanner: true
    },
    commerce: {
      tiers: [],
      adminTier: "admin"
    }
  },
  factlas: {
    id: "factlas",
    name: "Factlas",
    lifecycle: "live",
    lifecycleVerified: "2026-08-24",
    license: "Proprietary",
    layer: "roots",
    repo: "factlas",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    domain: "factl.as",
    hosts: [
      "api.factl.as"
    ],
    infraHosts: [],
    site: {
      category: "Intelligence",
      track: "ecosystem",
      order: 24,
      icon: "\u{1F30E}",
      showInBanner: true
    },
    commerce: {
      tiers: [
        "pilot",
        "analyst",
        "institutional"
      ],
      adminTier: "admin"
    }
  },
  periplo: {
    id: "periplo",
    name: "Periplo",
    lifecycle: "incubating",
    lifecycleVerified: "2026-08-24",
    license: "UNLICENSED",
    layer: "fruit",
    repo: "periplo",
    githubOrg: "madfam-org",
    repoVisibility: "private",
    isPublic: false,
    hosts: [],
    infraHosts: [],
    site: {
      category: "Applications",
      track: "self-serve",
      order: 25,
      icon: "\u{1F4CD}",
      showInBanner: false
    },
    commerce: {
      tiers: [
        "free",
        "essentials",
        "pro"
      ],
      adminTier: "admin"
    }
  },
  "geom-core": {
    id: "geom-core",
    name: "geom-core",
    lifecycle: "incubating",
    lifecycleVerified: "2026-09-04",
    license: "Apache-2.0",
    layer: "stem",
    repo: "geom-core",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    hosts: [],
    infraHosts: [],
    site: {
      category: "Standards",
      track: "ecosystem",
      order: 26,
      icon: "\u{1F9EE}",
      showInBanner: false
    },
    commerce: {
      tiers: [],
      adminTier: "admin"
    }
  },
  fragua: {
    id: "fragua",
    name: "Fragua",
    lifecycle: "incubating",
    lifecycleVerified: "2026-09-04",
    license: "AGPL-3.0",
    layer: "soil",
    repo: "enclii",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    hosts: [],
    infraHosts: [],
    site: {
      category: "Infrastructure",
      track: "platform",
      order: 27,
      icon: "\u2692\uFE0F",
      showInBanner: false
    },
    commerce: {
      tiers: [
        "arranque",
        "equipo",
        "escala",
        "dedicada"
      ],
      adminTier: "admin",
      tierLabels: {
        arranque: "Arranque",
        equipo: "Equipo",
        escala: "Escala",
        dedicada: "Dedicada"
      }
    }
  },
  enclii_depot: {
    id: "enclii_depot",
    name: "Enclii Depot",
    lifecycle: "incubating",
    lifecycleVerified: "2026-09-04",
    license: "AGPL-3.0",
    layer: "soil",
    repo: "enclii",
    githubOrg: "madfam-org",
    repoVisibility: "public",
    isPublic: true,
    hosts: [],
    infraHosts: [],
    site: {
      category: "Infrastructure",
      track: "platform",
      order: 28,
      icon: "\u{1F5C4}\uFE0F",
      showInBanner: false
    },
    commerce: {
      tiers: [
        "community",
        "pro",
        "premium",
        "madfam"
      ],
      adminTier: "admin",
      tierLabels: {
        community: "Comunidad",
        pro: "Est\xE1ndar",
        premium: "Alta disponibilidad",
        madfam: "Dedicado"
      }
    }
  }
};
var generatedRetiredProducts = {
  penny: {
    id: "penny",
    name: "PENNY",
    lifecycle: "retired",
    retiredOn: "2026-07-25",
    successorSlug: "selva",
    redirectTo: "https://selva.town"
  },
  sim4d: {
    id: "sim4d",
    name: "Sim4D",
    lifecycle: "retired",
    retiredOn: "2026-08-30",
    successorSlug: "yantra4d",
    redirectTo: "https://yantra4d.com"
  },
  spark: {
    id: "spark",
    name: "SPARK",
    lifecycle: "retired",
    retiredOn: "2026-04-08"
  }
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
  "Apache-2.0": {
    name: "Apache License 2.0",
    openSource: true,
    purpose: "Permissive with an explicit patent grant; libraries meant to be embedded"
  },
  MIT: {
    name: "MIT License",
    openSource: true,
    purpose: "Maximally permissive; shared packages and developer tooling"
  },
  "CERN-OHL-W-2.0": {
    name: "CERN Open Hardware Licence Version 2 - Weakly Reciprocal",
    openSource: true,
    purpose: "Open hardware designs; reciprocal for the design itself"
  },
  Proprietary: {
    name: "Proprietary",
    openSource: false,
    purpose: "Commercial protection for competitive advantage"
  },
  UNLICENSED: {
    name: "Proprietary (no licence granted)",
    openSource: false,
    purpose: "The SPDX form docs/LICENSING_STRATEGY.md prescribes for a proprietary manifest; a product carrying it grants no licence at all"
  }
};
var lifecycles = {
  incubating: { name: "Incubating", renderable: true, live: false },
  beta: { name: "Beta", renderable: true, live: true },
  live: { name: "Live", renderable: true, live: true },
  degraded: { name: "Degraded", renderable: true, live: false },
  retired: { name: "Retired", renderable: false, live: false }
};
var productStatuses = {
  active: { name: "Active", renderable: true },
  retired: { name: "Retired", renderable: false }
};
var products = generatedProducts;
var retiredProducts = generatedRetiredProducts;
var productIds = Object.keys(products);
function isRetired(product) {
  return product.lifecycle === "retired";
}
function getActiveProducts() {
  return Object.values(products).filter((p) => !isRetired(p));
}
function getProductsByLayer(layer) {
  return getActiveProducts().filter((p) => p.layer === layer);
}
function getProductsByLicense(license) {
  return getActiveProducts().filter((p) => p.license === license);
}
function getProductsByLifecycle(...stages) {
  return getActiveProducts().filter((p) => stages.includes(p.lifecycle));
}
function getPublicProducts() {
  return getActiveProducts().filter((p) => p.isPublic === true);
}
function getSurfaceProducts() {
  return getActiveProducts().filter(
    (p) => typeof p.domain === "string" && !p.infraHosts.includes(p.domain)
  );
}
function isValidProductId(value) {
  return value in products;
}
function isRetiredProductId(value) {
  return value in retiredProducts;
}
function getProduct(id) {
  return products[id];
}
function getRetiredProduct(id) {
  return retiredProducts[id];
}
function getProductGitHubUrl(id) {
  const product = products[id];
  if (!product.repo || !product.githubOrg) return null;
  return `https://github.com/${product.githubOrg}/${product.repo}`;
}
function getProductWebsiteUrl(id) {
  if (isRetiredProductId(id)) {
    const tombstone = retiredProducts[id];
    return tombstone.redirectTo ?? null;
  }
  const product = products[id];
  return product.domain ? `https://${product.domain}` : null;
}
var registryVersion = PRODUCT_PROJECTION.registryVersion;

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
  github: "https://github.com/madfam-org",
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

export { PRODUCT_PROJECTION, analyticsEvents, brand, breakpoints, colors, company, compliance, contacts, currencies, currencyMetadata, defaultCurrency, defaultLocale, ecosystemLayers, eventCategories, fallbackCurrency, fallbackLocale, footerLinks, formatCurrency, getActiveProducts, getCopyrightNotice, getCurrencyMetadata, getLocaleMetadata, getProduct, getProductGitHubUrl, getProductWebsiteUrl, getProductsByLayer, getProductsByLicense, getProductsByLifecycle, getPublicProducts, getRetiredProduct, getSurfaceProducts, gradients, isRetired, isRetiredProductId, isValidCurrency, isValidLocale, isValidProductId, legalUrls, licenseHeaders, licenseTypes, lifecycles, localeMetadata, locales, parseCurrency, parseLocale, productIds, productStatuses, products, radii, registryVersion, retiredProducts, shadows, socialLinks, spacing, typography, zIndex };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map
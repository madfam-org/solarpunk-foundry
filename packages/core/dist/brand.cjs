'use strict';

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

exports.brand = brand;
exports.breakpoints = breakpoints;
exports.colors = colors;
exports.gradients = gradients;
exports.radii = radii;
exports.shadows = shadows;
exports.spacing = spacing;
exports.typography = typography;
exports.zIndex = zIndex;
//# sourceMappingURL=out.js.map
//# sourceMappingURL=brand.cjs.map
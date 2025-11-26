/**
 * Tailwind CSS Configuration Template
 *
 * This is a TEMPLATE - copy to your app's tailwind.config.ts
 * Each app owns its Tailwind configuration.
 *
 * Uses @solarpunk/core for brand colors and design tokens.
 *
 * Usage:
 *   1. Copy this file to your app: cp tailwind.config.ts ~/your-app/tailwind.config.ts
 *   2. Install @solarpunk/core: pnpm add @solarpunk/core
 *   3. Adjust content paths for your app structure
 *   4. Add app-specific customizations as needed
 */

import type { Config } from 'tailwindcss';
import {
  colors,
  typography,
  spacing,
  breakpoints,
  shadows,
  radii,
} from '@solarpunk/core';

const config: Config = {
  // Adjust these paths for your app structure
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  darkMode: 'class',

  theme: {
    // ─────────────────────────────────────────────────────────────────────────
    // COLORS (from @solarpunk/core)
    // ─────────────────────────────────────────────────────────────────────────
    colors: {
      // Transparent & current
      transparent: 'transparent',
      current: 'currentColor',

      // Primary brand colors
      'brand-green': colors.primary.green,
      'brand-green-light': colors.primary.greenLight,
      'brand-green-dark': colors.primary.greenDark,
      'brand-purple': colors.primary.purple,
      'brand-purple-light': colors.primary.purpleLight,
      'brand-purple-dark': colors.primary.purpleDark,
      'brand-yellow': colors.primary.yellow,
      'brand-yellow-light': colors.primary.yellowLight,
      'brand-yellow-dark': colors.primary.yellowDark,

      // Solarpunk palette
      solar: {
        orange: colors.solarpunk.solarOrange,
        amber: colors.solarpunk.solarAmber,
        leaf: colors.solarpunk.leafGreen,
        forest: colors.solarpunk.forestGreen,
        sky: colors.solarpunk.skyBlue,
        ocean: colors.solarpunk.oceanBlue,
        earth: colors.solarpunk.earthBrown,
        terracotta: colors.solarpunk.terracotta,
      },

      // Corporate palette
      corp: {
        'deep-blue': colors.corporate.deepBlue,
        navy: colors.corporate.navyBlue,
        charcoal: colors.corporate.charcoal,
        graphite: colors.corporate.graphite,
        pearl: colors.corporate.pearl,
        silver: colors.corporate.silver,
        slate: colors.corporate.slate,
        steel: colors.corporate.steel,
      },

      // Semantic colors
      success: colors.semantic.success,
      warning: colors.semantic.warning,
      error: colors.semantic.error,
      info: colors.semantic.info,

      // Dark mode
      dark: {
        bg: colors.dark.background,
        surface: colors.dark.surface,
        border: colors.dark.border,
        'text-primary': colors.dark.textPrimary,
        'text-secondary': colors.dark.textSecondary,
        'text-muted': colors.dark.textMuted,
      },

      // Light mode
      light: {
        bg: colors.light.background,
        surface: colors.light.surface,
        border: colors.light.border,
        'text-primary': colors.light.textPrimary,
        'text-secondary': colors.light.textSecondary,
        'text-muted': colors.light.textMuted,
      },

      // Standard colors (keep some Tailwind defaults)
      white: '#ffffff',
      black: '#000000',
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
        950: '#030712',
      },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // TYPOGRAPHY (from @solarpunk/core)
    // ─────────────────────────────────────────────────────────────────────────
    fontFamily: {
      sans: [typography.fonts.body, 'system-ui', 'sans-serif'],
      heading: [typography.fonts.heading, 'system-ui', 'sans-serif'],
      mono: [typography.fonts.mono, 'monospace'],
    },

    fontSize: {
      xs: [typography.sizes.xs, { lineHeight: '1rem' }],
      sm: [typography.sizes.sm, { lineHeight: '1.25rem' }],
      base: [typography.sizes.base, { lineHeight: '1.5rem' }],
      lg: [typography.sizes.lg, { lineHeight: '1.75rem' }],
      xl: [typography.sizes.xl, { lineHeight: '1.75rem' }],
      '2xl': [typography.sizes['2xl'], { lineHeight: '2rem' }],
      '3xl': [typography.sizes['3xl'], { lineHeight: '2.25rem' }],
      '4xl': [typography.sizes['4xl'], { lineHeight: '2.5rem' }],
      '5xl': [typography.sizes['5xl'], { lineHeight: '1' }],
      '6xl': [typography.sizes['6xl'], { lineHeight: '1' }],
    },

    fontWeight: {
      light: String(typography.weights.light),
      normal: String(typography.weights.regular),
      medium: String(typography.weights.medium),
      semibold: String(typography.weights.semibold),
      bold: String(typography.weights.bold),
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SPACING (from @solarpunk/core)
    // ─────────────────────────────────────────────────────────────────────────
    spacing: spacing,

    // ─────────────────────────────────────────────────────────────────────────
    // BREAKPOINTS (from @solarpunk/core)
    // ─────────────────────────────────────────────────────────────────────────
    screens: breakpoints,

    // ─────────────────────────────────────────────────────────────────────────
    // SHADOWS (from @solarpunk/core)
    // ─────────────────────────────────────────────────────────────────────────
    boxShadow: shadows,

    // ─────────────────────────────────────────────────────────────────────────
    // BORDER RADIUS (from @solarpunk/core)
    // ─────────────────────────────────────────────────────────────────────────
    borderRadius: radii,

    // ─────────────────────────────────────────────────────────────────────────
    // EXTENSIONS (app-specific additions)
    // ─────────────────────────────────────────────────────────────────────────
    extend: {
      // Add app-specific customizations here
      // Example:
      // animation: {
      //   'fade-in': 'fadeIn 0.3s ease-in-out',
      // },
      // keyframes: {
      //   fadeIn: {
      //     '0%': { opacity: '0' },
      //     '100%': { opacity: '1' },
      //   },
      // },
    },
  },

  plugins: [
    // Add plugins as needed:
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/aspect-ratio'),
  ],
};

export default config;

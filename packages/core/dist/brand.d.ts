/**
 * @solarpunk/core - Brand Identity
 *
 * Authoritative brand constants for the MADFAM/Solarpunk ecosystem.
 * These values are organizational decisions - apps MUST use these for brand consistency.
 *
 * Changes to this file require governance approval.
 */
declare const brand: {
    /** Official company/organization name */
    readonly name: "MADFAM";
    /** Full legal entity name */
    readonly legalName: "Innovaciones MADFAM SAS de CV";
    /** Brand tagline */
    readonly tagline: "From Bits to Atoms. High Tech, Deep Roots.";
    /** Brand philosophy */
    readonly philosophy: "Solarpunk Foundry";
    /** Primary website */
    readonly website: "https://madfam.io";
    /** GitHub organization */
    readonly github: "https://github.com/madfam-io";
};
declare const colors: {
    /**
     * Primary Brand Colors (extracted from MADFAM logo)
     * These are the core identity colors - use prominently
     */
    readonly primary: {
        readonly green: "#2c8136";
        readonly greenLight: "#52b788";
        readonly greenDark: "#1e5128";
        readonly purple: "#58326f";
        readonly purpleLight: "#7d4f96";
        readonly purpleDark: "#3d1e4f";
        readonly yellow: "#eebc15";
        readonly yellowLight: "#f7d64a";
        readonly yellowDark: "#d4a20d";
    };
    /**
     * Solarpunk Heritage Palette
     * Extended colors representing our sustainable tech vision
     */
    readonly solarpunk: {
        readonly solarOrange: "#ff6b35";
        readonly solarAmber: "#ffa500";
        readonly leafGreen: "#52b788";
        readonly forestGreen: "#2d6a4f";
        readonly skyBlue: "#4ecdc4";
        readonly oceanBlue: "#006ba6";
        readonly earthBrown: "#956633";
        readonly terracotta: "#c65d00";
    };
    /**
     * Corporate Professional Palette
     * For enterprise contexts and professional communications
     */
    readonly corporate: {
        readonly deepBlue: "#1e3a8a";
        readonly navyBlue: "#1e293b";
        readonly charcoal: "#1f2937";
        readonly graphite: "#374151";
        readonly pearl: "#f9fafb";
        readonly silver: "#e5e7eb";
        readonly slate: "#64748b";
        readonly steel: "#475569";
    };
    /**
     * Semantic Colors
     * Consistent meaning across all applications
     */
    readonly semantic: {
        readonly success: "#10b981";
        readonly warning: "#f59e0b";
        readonly error: "#ef4444";
        readonly info: "#3b82f6";
    };
    /**
     * Dark Mode Colors
     */
    readonly dark: {
        readonly background: "#0f172a";
        readonly surface: "#1e293b";
        readonly border: "#334155";
        readonly textPrimary: "#f1f5f9";
        readonly textSecondary: "#cbd5e1";
        readonly textMuted: "#94a3b8";
    };
    /**
     * Light Mode Colors
     */
    readonly light: {
        readonly background: "#ffffff";
        readonly surface: "#f8fafc";
        readonly border: "#e2e8f0";
        readonly textPrimary: "#0f172a";
        readonly textSecondary: "#475569";
        readonly textMuted: "#64748b";
    };
};
declare const gradients: {
    /** Solarpunk Heritage */
    readonly solar: "linear-gradient(135deg, #ff6b35 0%, #ffa500 100%)";
    readonly nature: "linear-gradient(135deg, #52b788 0%, #2c8136 100%)";
    readonly ocean: "linear-gradient(135deg, #4ecdc4 0%, #006ba6 100%)";
    /** Corporate Evolution */
    readonly professional: "linear-gradient(135deg, #1e3a8a 0%, #58326f 100%)";
    readonly innovation: "linear-gradient(135deg, #58326f 0%, #eebc15 100%)";
    readonly trust: "linear-gradient(135deg, #1e293b 0%, #1e3a8a 100%)";
    /** Hybrid Harmony (bridging solarpunk and corporate) */
    readonly bridge: "linear-gradient(135deg, #2c8136 0%, #58326f 50%, #eebc15 100%)";
    readonly spectrum: "linear-gradient(90deg, #2c8136, #52b788, #4ecdc4, #58326f, #eebc15)";
    readonly sunrise: "linear-gradient(135deg, #eebc15 0%, #ff6b35 50%, #58326f 100%)";
};
declare const typography: {
    /** Font families */
    readonly fonts: {
        readonly heading: "Inter";
        readonly body: "Inter";
        readonly mono: "JetBrains Mono";
    };
    /** Font weights */
    readonly weights: {
        readonly light: 300;
        readonly regular: 400;
        readonly medium: 500;
        readonly semibold: 600;
        readonly bold: 700;
    };
    /** Font size scale (rem) */
    readonly sizes: {
        readonly xs: "0.75rem";
        readonly sm: "0.875rem";
        readonly base: "1rem";
        readonly lg: "1.125rem";
        readonly xl: "1.25rem";
        readonly '2xl': "1.5rem";
        readonly '3xl': "1.875rem";
        readonly '4xl': "2.25rem";
        readonly '5xl': "3rem";
        readonly '6xl': "3.75rem";
    };
    /** Line heights */
    readonly lineHeights: {
        readonly tight: 1.25;
        readonly normal: 1.5;
        readonly relaxed: 1.75;
    };
};
declare const spacing: {
    /** Spacing scale (rem) - follows 4px grid */
    readonly px: "1px";
    readonly 0: "0";
    readonly 0.5: "0.125rem";
    readonly 1: "0.25rem";
    readonly 1.5: "0.375rem";
    readonly 2: "0.5rem";
    readonly 2.5: "0.625rem";
    readonly 3: "0.75rem";
    readonly 3.5: "0.875rem";
    readonly 4: "1rem";
    readonly 5: "1.25rem";
    readonly 6: "1.5rem";
    readonly 7: "1.75rem";
    readonly 8: "2rem";
    readonly 9: "2.25rem";
    readonly 10: "2.5rem";
    readonly 12: "3rem";
    readonly 14: "3.5rem";
    readonly 16: "4rem";
    readonly 20: "5rem";
    readonly 24: "6rem";
    readonly 28: "7rem";
    readonly 32: "8rem";
    readonly 36: "9rem";
    readonly 40: "10rem";
    readonly 44: "11rem";
    readonly 48: "12rem";
    readonly 52: "13rem";
    readonly 56: "14rem";
    readonly 60: "15rem";
    readonly 64: "16rem";
    readonly 72: "18rem";
    readonly 80: "20rem";
    readonly 96: "24rem";
};
declare const breakpoints: {
    readonly sm: "640px";
    readonly md: "768px";
    readonly lg: "1024px";
    readonly xl: "1280px";
    readonly '2xl': "1536px";
};
declare const shadows: {
    readonly sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)";
    readonly DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)";
    readonly md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)";
    readonly lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
    readonly xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)";
    readonly '2xl': "0 25px 50px -12px rgb(0 0 0 / 0.25)";
    readonly inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)";
    readonly none: "none";
};
declare const radii: {
    readonly none: "0";
    readonly sm: "0.125rem";
    readonly DEFAULT: "0.25rem";
    readonly md: "0.375rem";
    readonly lg: "0.5rem";
    readonly xl: "0.75rem";
    readonly '2xl': "1rem";
    readonly '3xl': "1.5rem";
    readonly full: "9999px";
};
declare const zIndex: {
    readonly hide: -1;
    readonly auto: "auto";
    readonly base: 0;
    readonly docked: 10;
    readonly dropdown: 1000;
    readonly sticky: 1100;
    readonly banner: 1200;
    readonly overlay: 1300;
    readonly modal: 1400;
    readonly popover: 1500;
    readonly skipLink: 1600;
    readonly toast: 1700;
    readonly tooltip: 1800;
};
type BrandColors = typeof colors;
type BrandGradients = typeof gradients;
type BrandTypography = typeof typography;
type BrandSpacing = typeof spacing;
type BrandBreakpoints = typeof breakpoints;
type BrandShadows = typeof shadows;
type BrandRadii = typeof radii;
type BrandZIndex = typeof zIndex;

export { type BrandBreakpoints, type BrandColors, type BrandGradients, type BrandRadii, type BrandShadows, type BrandSpacing, type BrandTypography, type BrandZIndex, brand, breakpoints, colors, gradients, radii, shadows, spacing, typography, zIndex };

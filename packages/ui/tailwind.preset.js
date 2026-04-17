/**
 * @madfam/ui Tailwind CSS Preset
 * φ-based golden ratio design system with solarpunk aesthetics
 */

const PHI = 1.618033988749895

/** Generate φ-scaled spacing values */
function phiSpacing(base = 4, steps = 8) {
  const spacing = {}
  for (let i = -2; i <= steps; i++) {
    const value = base * Math.pow(PHI, i)
    spacing[`phi-${i + 2}`] = `${value.toFixed(3)}px`
  }
  return spacing
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      // φ-based spacing scale
      spacing: {
        ...phiSpacing(),
      },

      // Golden ratio font sizes
      fontSize: {
        'phi-xs': ['0.618rem', { lineHeight: '1' }],
        'phi-sm': ['0.786rem', { lineHeight: '1.25' }],
        'phi-base': ['1rem', { lineHeight: '1.5' }],
        'phi-lg': ['1.272rem', { lineHeight: '1.5' }],
        'phi-xl': ['1.618rem', { lineHeight: '1.4' }],
        'phi-2xl': ['2.058rem', { lineHeight: '1.3' }],
        'phi-3xl': ['2.618rem', { lineHeight: '1.2' }],
        'phi-4xl': ['3.33rem', { lineHeight: '1.1' }],
        'phi-5xl': ['4.236rem', { lineHeight: '1' }],
      },

      // Solarpunk color palette
      colors: {
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        electric: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },

      // Custom shadows for glassmorphism
      boxShadow: {
        'amber-1': '0 4px 12px rgba(0,0,0,.25), 0 0 8px rgba(245,158,11,.05)',
        'amber-2': '0 8px 24px rgba(0,0,0,.35), 0 0 16px rgba(245,158,11,.08)',
        'amber-3': '0 12px 36px rgba(0,0,0,.45), 0 0 24px rgba(245,158,11,.12)',
        'glass': '0 8px 32px rgba(0,0,0,.3)',
        'glass-lg': '0 16px 48px rgba(0,0,0,.4)',
      },

      // Glass backdrop blur
      backdropBlur: {
        'glass': '12px',
        'glass-lg': '24px',
      },

      // Animation timing
      transitionDuration: {
        'phi-1': '150ms',
        'phi-2': '243ms',
        'phi-3': '393ms',
        'phi-4': '636ms',
      },

      // Custom border radius
      borderRadius: {
        'phi': '0.618rem',
        'phi-lg': '1rem',
        'phi-xl': '1.618rem',
        'phi-2xl': '2.618rem',
      },

      // Animation keyframes
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },

      animation: {
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

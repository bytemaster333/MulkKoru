/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ── Brand ──────────────────────────────────────────
        brand: {
          DEFAULT: '#3525cd',
          50:  '#eeecfb',
          100: '#d5d0f6',
          200: '#aba1ed',
          300: '#8172e4',
          400: '#5748da',
          500: '#3525cd',
          600: '#2b1ea4',
          700: '#21177c',
          800: '#161053',
          900: '#0b0829',
        },
        accent: {
          DEFAULT: '#6d5ce7',
          light:   '#9d8ef0',
        },
        // ── Semantic ──────────────────────────────────────
        success:  '#10b981',
        warning:  '#f59e0b',
        danger:   '#ef4444',
        info:     '#3b82f6',
        // ── Surfaces ──────────────────────────────────────
        surface: {
          dark:    '#0f0f23',
          card:    '#1a1a3e',
          border:  '#2d2d5e',
          muted:   '#6b7280',
        },
      },
      fontFamily: {
        sans:    ['System'],
        mono:    ['monospace'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};

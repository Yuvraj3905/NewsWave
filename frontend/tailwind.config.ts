import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef2f3',
          100: '#fde3e5',
          200: '#fbc8cc',
          300: '#f59ba2',
          400: '#ec6975',
          500: '#dc2640',
          600: '#c11432',
          700: '#a30f2c',
          800: '#7a0a20',
          900: '#091a3a',
        },
        navy: {
          50: '#eef2f8',
          100: '#d6deec',
          200: '#aebed8',
          300: '#7e93bd',
          400: '#4d68a1',
          500: '#2c4880',
          600: '#1d3464',
          700: '#152549',
          800: '#0e1a36',
          900: '#091a3a',
        },
        accent: {
          500: '#dc2640',
          600: '#a30f2c',
        },
        ink: {
          900: '#091a3a',
          700: '#152549',
          500: '#4d68a1',
          300: '#aebed8',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Source Serif Pro"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)',
        cardHover:
          '0 8px 24px rgba(15, 23, 42, 0.12), 0 2px 6px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;

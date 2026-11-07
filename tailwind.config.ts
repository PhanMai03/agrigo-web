import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      maxWidth: {
        '7xl': '1360px',
      },
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        earth: {
          50: '#fafafa',
          100: '#f1f5f3',
          200: '#e2e8e5',
          500: '#84928b',
          700: '#52615a',
          900: '#17231e',
        },
        harvest: '#f59e0b',
        soil: '#795548',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Be Vietnam Pro', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Be Vietnam Pro', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        vietnam: ['Be Vietnam Pro', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;

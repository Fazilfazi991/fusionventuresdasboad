/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#17212b',
        muted: '#637083',
        line: '#dfe5ec',
        cloud: '#f6f8fb',
        brand: '#2563eb',
        mint: '#0f9f7a',
        amber: '#d97706',
        rose: '#e11d48',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 45px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};

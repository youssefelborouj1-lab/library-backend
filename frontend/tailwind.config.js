/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a5bcfc',
          400: '#8196f8',
          500: '#6171f3',
          600: '#4d53e8',
          700: '#3f43cd',
          800: '#3438a5',
          900: '#2e3383',
        },
        dark: {
          900: '#0d0f1a',
          800: '#141626',
          700: '#1c1f35',
          600: '#252847',
          500: '#2f3357',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Lexend', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

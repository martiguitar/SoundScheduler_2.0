/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          300: '#4ECBD9',
          400: '#3BBAC8',
          500: '#2AA9B7'
        },
        secondary: {
          400: '#F471B5',
          500: '#EC4899'
        },
        neutral: {
          100: '#FFFFFF',
          200: '#C1C2C5',
          300: '#909296',
          400: '#737373',
          500: '#5C5F66',
          600: '#373A40',
          700: '#2C2E33',
          800: '#25262B',
          900: '#1A1B1E'
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(78, 203, 217, 0.1)'
      }
    },
  },
  plugins: [],
};
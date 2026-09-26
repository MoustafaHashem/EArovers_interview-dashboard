/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'Tahoma', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f1f6fb',
          100: '#dfeaf5',
          200: '#b9d3e9',
          300: '#8bb6d9',
          400: '#5893c2',
          500: '#3a75a8',
          600: '#2c5c88',
          700: '#254a6e',
          800: '#213e5b',
          900: '#1f354d',
        },
      },
    },
  },
  plugins: [],
}

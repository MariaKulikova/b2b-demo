/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        'brand-dark': '#1E1F29',
        'brand-blue': '#030BF2',
        'brand-orange': '#F25603',
        blue: {
          50: '#E6E7FE',
          100: '#CDCFFD',
          200: '#9B9FFB',
          300: '#696FF9',
          400: '#373FF7',
          500: '#030BF2',
          600: '#0209C2',
          700: '#020791',
          800: '#010461',
          900: '#010230',
        },
      },
    },
  },
  plugins: [],
}
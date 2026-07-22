/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        egypt: {
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            500: '#10b981',
            600: '#059669',
            700: '#006838',
            800: '#004d28',
            900: '#00331a',
          },
          gold: {
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
          }
        }
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
        tajawal: ['Tajawal', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

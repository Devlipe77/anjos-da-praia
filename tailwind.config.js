/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        sand: {
          50: '#fdfbf7',
          100: '#f7f2e8',
          200: '#eee3cb',
          300: '#e1cca5',
          400: '#d0ad78',
          500: '#c29254',
          600: '#b07943',
        }
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        // Cores principais
        primary: {
          DEFAULT: '#FF6B35', // Coral / Sol
          dark: '#E8531F',    // Hover
        },
        secondary: {
          DEFAULT: '#0B6EFD', // Azul-oceano
          dark: '#0857CC',    // Hover
        },
        sand: {
          DEFAULT: '#F9F1E7', // Areia clara
        },
        // Neutros
        graphite: '#1A1D1F',  // Texto principal
        stonegray: '#6B7280', // Texto secundário
        mist: '#E5E7EB',      // Bordas / divisores
        page: '#F9FAFB',      // Fundo geral da página
        // Feedback
        brand: {
          success: '#16A34A',
          'success-bg': '#DCFCE7',
          warning: '#F59E0B',
          'warning-bg': '#FEF3C7',
          danger: '#DC2626',
          'danger-bg': '#FEE2E2',
        },
        tropical: {
          turquoise: '#14B8A6',
          pool: '#38BDF8',
          sunset: '#FB923C',
          shell: '#FDA4AF',
        }
      }
    },
  },
  plugins: [],
}

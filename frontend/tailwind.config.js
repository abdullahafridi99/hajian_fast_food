/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E63946',
          dark: '#D62828',
          light: '#FAD2E1',
        },
        secondary: {
          DEFAULT: '#FFC300',
          dark: '#E0AB00',
          light: '#FFF3C2',
        },
        accent: {
          DEFAULT: '#FF6B00',
          dark: '#E05E00',
          light: '#FFE2CC',
        },
        dark: {
          DEFAULT: '#1E293B',
          light: '#334155',
          darker: '#0F172A',
        },
        light: {
          DEFAULT: '#F8FAFC',
          gray: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
        'premium-hover': '0 20px 40px -15px rgba(230, 57, 70, 0.2)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-medium': 'float 4s ease-in-out infinite',
        'float-fast': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        }
      }
    },
  },
  plugins: [],
}

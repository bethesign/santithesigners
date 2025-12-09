/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App*.tsx",
    "./main.tsx",
  ],
  theme: {
    extend: {
      colors: {
        christmas: {
          red: '#D42426',
          green: '#165B33',
          darkGreen: '#0B301A',
          gold: '#F8B229',
          offWhite: '#F0F4F8'
        },
        brand: {
          primary: '#4a9960',
          'primary-light': '#a8e6b5',
          'primary-dark': '#2d5f3d',
          secondary: '#ff6b6b',
          gold: '#ffd700',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'swing': 'swing 3s ease-in-out infinite',
        'snow': 'fall linear infinite',
      },
      keyframes: {
        swing: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        fall: {
          '0%': { transform: 'translateY(-10vh)' },
          '100%': { transform: 'translateY(110vh)' }
        }
      }
    },
  },
  plugins: [],
}

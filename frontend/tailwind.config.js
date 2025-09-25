/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tesla: {
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
          950: '#082f49',
        },
        neon: {
          blue: '#00c8ff',
          purple: '#8b5cf6',
          pink: '#ec4899',
        }
      },
      backgroundImage: {
        'tesla-gradient': 'radial-gradient(circle, #0f1b29 0%, #050a10 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(20, 25, 35, 0.6) 0%, rgba(15, 20, 30, 0.8) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(0, 200, 255, 0.3)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
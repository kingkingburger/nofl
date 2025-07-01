
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#121212',
        'dark-surface': '#1E1E1E',
        'primary-text': '#E0E0E0',
        'secondary-text': '#A0A0A0',
        'accent': '#03DAC6',
        'accent-glow': 'rgba(3, 218, 198, 0.3)',
        'warning': '#FFD700',
        'warning-glow': 'rgba(255, 215, 0, 0.3)',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      keyframes: {
        flash: {
          '0%, 100%': { boxShadow: '0 0 20px var(--warning-glow)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)' },
        }
      },
      animation: {
        flash: 'flash 1.5s infinite ease-in-out',
      }
    },
  },
  plugins: [],
}

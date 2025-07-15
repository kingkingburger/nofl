
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a1a1a',
        secondary: '#2a2a2a',
        accent: '#03DAC6',
        text: '#e0e0e0',
        'secondary-text': '#a0a0a0',
        warning: '#FFD700',
        'dark-bg': '#121212',
        'dark-surface': '#1e1e1e',
        'accent-light': '#00E0A8', // 액센트의 밝은 버전
        'accent-glow': 'rgba(0, 200, 150, 0.4)',
        'warning-glow': 'rgba(255, 215, 0, 0.4)',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
        'inner-glow': 'inset 0 0 10px rgba(0, 200, 150, 0.2)', // 내부 빛 효과
      },
      keyframes: {
        flash: {
          '0%, 100%': { boxShadow: '0 0 20px var(--warning-glow)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 15px var(--tw-colors-accent-glow)' },
          '50%': { boxShadow: '0 0 25px var(--tw-colors-accent-glow)' },
        }
      },
      animation: {
        flash: 'flash 1.5s infinite ease-in-out',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s infinite ease-in-out',
      }
    },
  },
  plugins: [],
}


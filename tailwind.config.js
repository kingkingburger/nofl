/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 재정의된 다크 테마 색상 팔레트
        'dark-bg': '#0A0A0A', // 더 깊은 배경색
        'dark-surface': '#1A1A1A', // 카드, 패널 등 표면 색상
        'primary-text': '#E0E0E0',
        'secondary-text': '#A0A0A0',
        'accent': '#00C896', // 더 생동감 있는 액센트 색상 (에메랄드 그린 계열)
        'accent-glow': 'rgba(0, 200, 150, 0.4)',
        'warning': '#FFD700',
        'warning-glow': 'rgba(255, 215, 0, 0.4)',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      keyframes: {
        flash: {
          '0%, 100%': { boxShadow: '0 0 20px var(--warning-glow)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        flash: 'flash 1.5s infinite ease-in-out',
        'fade-in': 'fade-in 0.5s ease-out forwards',
      }
    },
  },
  plugins: [],
}
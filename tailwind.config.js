
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 재정의된 다크 테마 색상 팔레트 (더욱 깊이감 있는 톤)
        'dark-bg': '#080808', // 가장 깊은 배경색
        'dark-surface': '#181818', // 카드, 패널 등 표면 색상
        'primary-text': '#E0E0E0',
        'secondary-text': '#A0A0A0',
        'accent': '#00C896', // 생동감 있는 에메랄드 그린
        'accent-light': '#00E0A8', // 액센트의 밝은 버전
        'accent-glow': 'rgba(0, 200, 150, 0.4)',
        'warning': '#FFD700',
        'warning-glow': 'rgba(255, 215, 0, 0.4)',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        // 입체감을 위한 커스텀 그림자
        '3xl': '0 20px 50px rgba(0, 0, 0, 0.8)', // 깊은 그림자
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

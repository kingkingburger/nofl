/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        // 커스텀 컬러 팔레트 정의
        'deep-dark': '#121212',
        'subtle-gray': '#1e1e1e',
        'accent-gold': '#c89b3c',
        'light-gray': '#888888',
      },
      boxShadow: {
        'gold-glow': '0 0 15px 5px rgba(200, 155, 60, 0.4)',
      }
    },
  },
  plugins: [],
}
/** @type {import('postcss').ProcessOptions} */
export default {
  plugins: {
    "@tailwindcss/postcss": {},   // Tailwind PostCSS 플러그인
    autoprefixer: {}              // 벤더 프리픽서
  }
}
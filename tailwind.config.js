
/** @type {import('tailwindcss').Config} */
/**
 * Tailwind CSS 설정 파일입니다.
 * 이 파일에서 Tailwind의 동작을 커스터마이징할 수 있습니다.
 * https://tailwindcss.com/docs/configuration
 */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  /**
   * theme: 디자인 시스템을 정의하는 곳입니다.
   * 색상, 글꼴, 간격, 중단점(breakpoint) 등 프로젝트의 시각적 요소를 확장(extend)하거나 재정의(override)할 수 있습니다.
   * extend: 기존 Tailwind의 기본 설정을 유지하면서 새로운 값을 추가합니다.
   */
  theme: {
    extend: {},
  },
  /**
   * plugins: 추가적인 기능을 제공하는 Tailwind 플러그인을 등록하는 곳입니다.
   * 예: @tailwindcss/forms, @tailwindcss/typography 등
   */
  plugins: [],
}

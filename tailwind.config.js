
/** @type {import('tailwindcss').Config} */
/**
 * Tailwind CSS 설정 파일입니다.
 * 이 파일에서 Tailwind의 동작을 커스터마이징할 수 있습니다.
 * https://tailwindcss.com/docs/configuration
 */
export default {
  /**
   * content: Tailwind가 CSS를 생성할 때 스캔할 파일들의 경로를 지정합니다.
   * 여기에 포함된 파일들에서 사용된 Tailwind 클래스만 최종 CSS 파일에 포함됩니다.
   * 이를 통해 프로덕션 빌드에서 사용하지 않는 스타일을 제거(purge)하여 파일 크기를 최적화합니다.
   * - `./index.html`: 기본 HTML 파일
   * - `./src/**/*.{js,ts,jsx,tsx}`: src 폴더 내의 모든 JavaScript, TypeScript, JSX, TSX 파일
   */
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

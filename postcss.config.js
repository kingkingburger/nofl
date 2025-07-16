
/**
 * PostCSS 설정 파일입니다.
 * PostCSS는 CSS를 JavaScript 플러그인을 사용하여 변환하는 도구입니다.
 * Tailwind CSS는 PostCSS 플러그인으로 작동하므로 이 설정이 필요합니다.
 */
export default {
  plugins: {
    /**
     * tailwindcss: Tailwind CSS 플러그인을 PostCSS에 추가합니다.
     * 이 플러그인은 Tailwind의 유틸리티 클래스(@tailwind, @apply 등)를
     * 일반 CSS로 변환하는 역할을 합니다.
     */
    '@tailwindcss/postcss': {},
    /**
     * autoprefixer: 다양한 브라우저 공급업체 접두사(vendor prefix)를
     * 자동으로 추가해주는 플러그인입니다. 예를 들어, `-webkit-`, `-moz-` 등을
     * CSS 규칙에 맞게 추가하여 크로스 브라우징 호환성을 높여줍니다.
     */
    autoprefixer: {},
  },
};

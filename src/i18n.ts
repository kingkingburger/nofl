import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi) // 번역 파일을 백엔드에서 불러옵니다.
  .use(LanguageDetector) // 사용자의 브라우저 언어를 감지합니다.
  .use(initReactI18next) // i18next를 react-i18next에 바인딩합니다.
  .init({
    supportedLngs: ['en', 'ko'], // 지원할 언어 목록
    fallbackLng: 'ko', // 기본 언어
    debug: process.env.NODE_ENV === 'development', // 개발 환경에서만 디버그 모드 활성화
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['cookie'],
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json', // 번역 파일 경로
    },
    react: {
      useSuspense: false, // Suspense 사용 여부
    },
  });

export default i18n;

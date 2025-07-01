import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),      // React 지원
    tailwindcss() // Vite용 Tailwind 플러그인
  ],
});
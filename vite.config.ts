import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/nofl/' : '/',
  assetsInclude: ['*.wasm'],
  optimizeDeps: {
    exclude: ['*.wasm']
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
}))

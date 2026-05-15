import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    /** يوجّه طلبات `/api` إلى Laravel على الجهاز المحلي أثناء `npm run dev` (مع VITE_API_BASE_URL=/api). */
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/playwright-report/**', '**/.{idea,git,cache,output,temp}/**'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    pool: 'threads',
    testTimeout: 10000,
    hookTimeout: 10000,
  },
})

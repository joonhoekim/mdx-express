import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  css: {
    // PostCSS 플러그인 충돌 방지 (Tailwind CSS 4 + Vite 호환 문제)
    postcss: {},
  },
  test: {
    include: ['__tests__/**/*.test.ts'],
    testTimeout: 60_000,
    css: false,
  },
});

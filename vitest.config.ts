import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    include: ['__tests__/**/*.test.ts'],
    testTimeout: 60_000,
    css: false,
  },
});

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    // Playwright specs in e2e/ run via `pnpm test:e2e`, not vitest.
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
});

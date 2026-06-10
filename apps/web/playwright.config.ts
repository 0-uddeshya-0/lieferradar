import { defineConfig } from '@playwright/test';

// Runs against the demo build (VITE_DEMO_MODE=true) served by `vite preview`.
// `pnpm test:e2e` builds first, so dist/ always matches the source under test.
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173/lieferradar/',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm exec vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173/lieferradar/',
    reuseExistingServer: false,
    env: { VITE_DEMO_MODE: 'true' },
  },
});

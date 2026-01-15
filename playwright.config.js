import { defineConfig } from '@playwright/test';
import { env } from './src/config/env.js';

export default defineConfig({
  testDir: './tests',
  globalSetup: './tests/global.setup.js',

  timeout: 60_000,
  expect: { timeout: 10_000 },

  retries: env.retries,
  workers: env.workers,
  fullyParallel: true,

  // ✅ Report həmişə eyni yerdə olsun ki CI upload tapsın
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    baseURL: env.baseUrl,
    headless: env.headless,

    // ✅ Fail zamanı debug faylları qalsın
    // env.trace məsələn: 'on-first-retry' / 'retain-on-failure'
    trace: env.trace,
    // env.video: 'retain-on-failure' (tövsiyə)
    video: env.video,
    // env.screenshot: 'only-on-failure' (tövsiyə)
    screenshot: env.screenshot,

    // ✅ storageState path sabit qalsın (setup bunu yaradacaq)
    storageState: 'artifacts/admin.storageState.json',
  },

  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});

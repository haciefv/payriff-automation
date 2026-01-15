import { defineConfig } from '@playwright/test';
import { env } from './src/config/env.js';
import globalSetup from './tests/global.setup.js';

export default defineConfig({
  testDir: './tests',
  globalSetup: './tests/global.setup.js',
  timeout: 60_000,
  expect: { timeout: 10_000 },

  retries: env.retries,
  workers: env.workers,
  fullyParallel: true,

  reporter: [
    ['html', { outputFolder: 'artifacts/playwright-report', open: 'never' }],
  ],

  use: {
    baseURL: env.baseUrl,
    headless: env.headless,

    trace: env.trace,
    video: env.video,
    screenshot: env.screenshot,

    // AUTH state (CI-də setup job bunu yaradacaq)
    storageState: 'artifacts/admin.storageState.json',
  },

  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});

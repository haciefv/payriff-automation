import { defineConfig } from '@playwright/test';
import { env } from './src/config/env.js';

export default defineConfig({
  testDir: './tests',
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: env.baseUrl,
    headless: false,
    // IMPORTANT: do not set storageState here
  },
});

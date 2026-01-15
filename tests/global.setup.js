import fs from 'fs';
import { chromium } from '@playwright/test';
import { env } from '../src/config/env.js';
import { LoginPage } from '../src/pages/login.page.js';

const STATE_PATH = 'artifacts/admin.storageState.json';

export default async () => {
  if (fs.existsSync(STATE_PATH)) return;

  const browser = await chromium.launch();

  // ✅ baseURL burada verilir
  const context = await browser.newContext({
    baseURL: env.baseUrl,
  });

  const page = await context.newPage();

  const login = new LoginPage(page);
  await login.loginSmart(env.adminEmail, env.adminPassword, env.adminOtp);

  await context.storageState({ path: STATE_PATH });
  await browser.close();
};

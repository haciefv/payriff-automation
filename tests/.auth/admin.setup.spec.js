import { test as setup } from '@playwright/test';
import { env } from '../../src/config/env.js';
import { LoginPage } from '../../src/pages/login.page.js';

setup.use({ storageState: undefined });

setup('auth: admin storageState', async ({ page }) => {
  const login = new LoginPage(page);

  const res = await login.loginSmart(env.adminEmail, env.adminPassword, env.adminOtp);
  console.log('Login result:', res); // usedOtp true/false görəcəksən

  await page.context().storageState({ path: 'artifacts/admin.storageState.json' });
});

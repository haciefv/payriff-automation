import { test, expect } from '@playwright/test';

test.use({ storageState: 'artifacts/admin.storageState.json' });

test('smoke: authenticated user can open dashboard', async ({ page }) => {
  await page.goto('https://dashboard.payriff.com/', { waitUntil: 'domcontentloaded' });
  
});

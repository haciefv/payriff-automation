import { test } from '@playwright/test';
import { TransactionsPage } from '../../src/pages/transactions.page.js';

test('smoke: transactions page loads', async ({ page }) => {
  const tx = new TransactionsPage(page);
  await tx.open();
});

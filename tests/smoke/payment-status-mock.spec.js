import { test, expect } from '@playwright/test';
import { TransactionsPage } from '../../src/pages/transactions.page.js';

test('smoke: can search by transaction id (mock id)', async ({ page }) => {
  const tx = new TransactionsPage(page);
  await tx.open();

  const fakeTxId = '00000000-0000-0000-0000-000000000000';
  await tx.search(fakeTxId);

  // nəticə yoxdursa da UI error/toast yox, page sağlam qalmalıdır
  await expect(page).toHaveURL(/transactions/i);
});

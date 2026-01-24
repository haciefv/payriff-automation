// import { test, expect } from '@playwright/test';

// test.use({ storageState: 'artifacts/admin.storageState.json' });

// // test('smoke: Regular 3DS payment', async ({ page }) => {
// //     await page.goto('https://dashboard.payriff.com/', { waitUntil: 'domcontentloaded' });
// // // Base Pgae
// //     await page.locator('body > div:nth-child(1) > div:nth-child(1) > nav:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > ul:nth-child(2) > li:nth-child(4) > div:nth-child(1) > div:nth-child(1)').click()
// //     await page.locator("a[id='Create an invoice']").click();

// // // Create an Invoice
// //     await page.locator('#createAnInvoiceFirstName').fill('Haji');
// //     await page.locator('#createAnInvoiceLastName').fill('Haciyev');
// //     await page.locator('#createAnInvoiceEmail').fill('haji@test.com');
// //     await page.locator('#createAnInvoicePhoneNumber').fill('0500000000');
// //     await page.locator("div[class='MuiBox-root css-6zqv2r'] button:nth-child(1)").click()
// //     await page.locator('#createAnInvoiceBookingId').fill('INV-TEST-001');
// //     await page.locator('#createAnInvoiceAmount').fill('0.02');
// //     await page.locator('#createAnInvoiceDescription').fill('Smoke test invoice');
// //     await page.locator("body > div:nth-child(1) > div:nth-child(1) > main:nth-child(3) > div:nth-child(2) > form:nth-child(2) > div:nth-child(4) > div:nth-child(2) > div:nth-child(4) > div:nth-child(1) > div:nth-child(2)").click()
// //     await page.locator("#ES1093703").click()
// //     await page.getByRole('button', { name: /Create invoice/i }).click();


// // // Invoices page 
// //     await page.locator(`//tr[td[normalize-space()='01']]//button`).click()
// //     await page.locator("#Send").click();
// //     await page.locator(".MuiBox-root.css-pgc10q").click();


// // // Payment page https://pay.payriff.com/r/3ZCkX?type=preview
// //     await page.getByTestId('cardHolder').fill('HAJI HACIYEV');
// //     await page.getByTestId('cardNumber').fill('4111 1111 1111 1111');
// //     await page.getByTestId('expiredDate').fill('12/30');
// //     await page.getByTestId('cvv').fill('123');
// //     await page.getByTestId('submit-payment').click();

// // });
// test('smoke: Regular 3DS payment', async ({ page }) => {


// })
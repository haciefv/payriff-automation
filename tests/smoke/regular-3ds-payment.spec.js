// tests/smoke/regular-3ds-payment.spec.js
import { test, expect } from "@playwright/test";
import BasePage from "../../src/pages/base.page.js";
import { CreateInvoicePage } from "../../src/pages/create-invoice.page.js";
import { InvoicesPage } from "../../src/pages/invoices.page.js";
import { PaymentPage } from "../../src/pages/payment.page.js";
import { telegramNotify } from "../../src/utils/telegramNotify.js";
import { clearOtp, waitForOtp } from "../../src/utils/otpClient.js";
import { env } from "../../src/config/env.js";

test.use({ storageState: "artifacts/admin.storageState.json" });

// helper: URL normalize
function normalizeBaseUrl(url) {
  return String(url || "").replace(/\/+$/, "");
}

test("smoke: Regular 3DS payment", async ({ page }) => {
  test.setTimeout(180_000);

  const userId = env.telegramUserId || process.env.TELEGRAM_USER_ID;
  if (!userId) throw new Error("TELEGRAM_USER_ID is missing (CI variables or .env)");

  const otpServerUrl = normalizeBaseUrl(env.otpServerUrl || process.env.OTP_SERVER_URL);
  if (!otpServerUrl) throw new Error("OTP_SERVER_URL is missing (CI variables or .env)");

  const base = new BasePage(page);
  const create = new CreateInvoicePage(page);
  const invoices = new InvoicesPage(page);

  // --- Create invoice ---
  await base.openDashboard();
  await base.goToCreateInvoice();

  await create.fillFirstName("Haji");
  await create.fillLastName("Haciyev");
  await create.fillEmail("haji@test.com");
  await create.fillPhone("0500000000");

  await create.chooseApp("#ES1093703");

  const bookingId = `INV-TEST-${Date.now()}`;
  await create.fillBookingId(bookingId);
  await create.fillAmount("0.02");
  await create.selectExpiry3Days();
  await create.fillDescription("Smoke test invoice");

  await create.submitCreateInvoice();

  // --- Open invoice details & open pay page in new tab ---
  await invoices.openRow01Details();

  await page.getByRole("menuitem", { name: "Send" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByText(/invoice details/i).waitFor();

  const [payPage] = await Promise.all([
    page.context().waitForEvent("page"),
    dialog.locator('a[href*="pay.payriff.com/r/"]').click(),
  ]);

  await payPage.waitForLoadState("domcontentloaded");

  // --- Pay with card ---
  const payment = new PaymentPage(payPage);
  await payment.pay(env.card);

  

  // --- Wait for 3DS ACS page ---
  await payPage.waitForURL(/3dsecure\.az\/way4acs\/.*challenge/i, { timeout: 60_000 });

  // OTP state: əvvəl təmizlə
  await clearOtp(payPage.request, userId, { baseUrl: otpServerUrl, failSilently: true });

  try {
    // Telegram notify test-i öldürməsin (external)
    try {
      await telegramNotify(payPage.request, "🟡 3DS PAGE. OTP waiting... (2 min timeout)");
    } catch (e) {
      console.warn("telegramNotify ignored:", String(e));
    }

    // OTP input (daha tolerant locator)
    const otpInput = payPage.locator("#psw_id, input[name='PASSWORD'], input[type='password']").first();
    await otpInput.waitFor({ state: "visible", timeout: 60_000 });

    // OTP-ni serverdən al (util ilə)
    const otpCode = await waitForOtp(payPage.request, userId, {
      baseUrl: otpServerUrl,
      timeoutMs: 120_000,
      intervalMs: 2000,
    });

    await otpInput.fill(String(otpCode));
    await payPage.locator("#btnSubmit").click();

    // optional: success assertion (səndə hansı element/URL varsa onunla dəyiş)
    // await expect(payPage).toHaveURL(/success|paid/i, { timeout: 60_000 });
  } finally {
    // OTP state: sonda da təmizlə (best-effort)
    await clearOtp(payPage.request, userId, { baseUrl: otpServerUrl, failSilently: true });
  }
});

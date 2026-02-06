import { test, expect } from "@playwright/test";
import BasePage from "../../src/pages/base.page.js";
import { CreateInvoicePage } from "../../src/pages/create-invoice.page.js";
import { InvoicesPage } from "../../src/pages/invoices.page.js";
import { PaymentPage } from "../../src/pages/payment.page.js";
import { telegramNotify } from "../../src/utils/telegramNotify.js";
import { waitForOtp, clearOtp } from "../../src/utils/otpClient.js";
import { env } from "../../src/config/env.js";

test.use({ storageState: "artifacts/admin.storageState.json" });

test("smoke: Regular 3DS payment", async ({ page }) => {
  const userId = process.env.TELEGRAM_USER_ID;
  if (!userId) throw new Error("TELEGRAM_USER_ID is missing in env");

  const otpServerUrl = process.env.OTP_SERVER_URL;
  if (!otpServerUrl) throw new Error("OTP_SERVER_URL is missing in env");

  const base = new BasePage(page);
  const create = new CreateInvoicePage(page);
  const invoices = new InvoicesPage(page);

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

  await invoices.openRow01Details();

  await page.getByRole("menuitem", { name: "Send" }).click();

  const dialog = page.getByRole("dialog");
  await dialog.getByText(/invoice details/i).waitFor();

  const [payPage] = await Promise.all([
    page.context().waitForEvent("page"),
    dialog.locator('a[href*="pay.payriff.com/r/"]').click(),
  ]);

  await payPage.waitForLoadState("domcontentloaded");

  const payment = new PaymentPage(payPage);

  await payment.pay({
    holder: env.card.holder,
    number: env.card.number, // boşluqsuz
    exp: env.card.exp,
    cvv: env.card.cvv,
  });

  await payPage.waitForURL(/acs\d?\.3dsecure\.az\/way4acs\/.*challenge/i, {
    timeout: 60_000,
  });

  // --- OTP flow (production-grade) ---
  // Clear previous OTPs and only accept OTP created after this point
  const minAt = Date.now();

  await clearOtp(payPage.request, userId);
  await telegramNotify(payPage.request, "🟡 3DS PAGE. OTP waiting... (2 min timeout)");

  const otpInput = payPage.locator('input#psw_id[name="PASSWORD"]');
  await otpInput.waitFor({ state: "visible", timeout: 60_000 });

  // Preferred: use otpClient helper
  let otpCode;
  try {
    otpCode = await waitForOtp(payPage.request, userId, {
      timeoutMs: 120_000,
      intervalMs: 2000,
      minAt,
    });
  } catch (e) {
    // Fallback: polling (keeps test resilient if helper changes)
    await expect
      .poll(
        async () => {
          const res = await payPage.request.get(
            `${otpServerUrl.replace(/\/+$/, "")}/otp/${encodeURIComponent(userId)}`
          );
          if (!res.ok()) return null;
          const data = await res.json().catch(() => ({}));
          const otp = data?.otp ?? null;
          if (otp?.code && typeof otp.at === "number" && otp.at >= minAt) return otp.code;
          return null;
        },
        { timeout: 120_000, intervals: [2000] }
      )
      .not.toBeNull();

    // re-fetch once to get the code
    const res = await payPage.request.get(
      `${otpServerUrl.replace(/\/+$/, "")}/otp/${encodeURIComponent(userId)}`
    );
    const data = await res.json().catch(() => ({}));
    otpCode = data?.otp?.code;
  }

  await otpInput.fill("");
  await otpInput.type(String(otpCode), { delay: 50 });

  await payPage.locator("#btnSubmit").click();
});

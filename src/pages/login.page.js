import { expect } from '@playwright/test';
import { OtpPage } from './otp.page.js';
import BasePage from './base.page.js';

export class LoginPage extends BasePage  {
  constructor(page) {
     super(page);

    this.email = page.locator('#email');
    this.password = page.locator('#password');
    this.submit = page.locator('#Login');

    this.error = page.locator('.MuiAlert-message, [role="alert"], .toast-error');
    this.otpContainer = page.locator('#authPageOtp');
  }
async open() {
  await this.page.goto('/auth', { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await expect(this.email).toBeVisible({ timeout: 15_000 });
}

  async loginSmart(email, password, otpCode = '111111') {
    await this.open();

    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();

    const waitTimeout = 10_000;
    const start = Date.now();
    let outcome;

    while (Date.now() - start < waitTimeout) {
      const url = new URL(this.page.url());

      // 1) OTP: /auth?formType=otp
      if (url.pathname === '/auth' && url.searchParams.get('formType') === 'otp') {
        outcome = 'OTP';
        break;
      }

      // 2) OTP via UI marker (URL bəzən gec update olur)
      if (await this.otpContainer.isVisible().catch(() => false)) {
        outcome = 'OTP';
        break;
      }

      // 3) Dashboard bypass: https://dashboard.payriff.com/
      if (url.hostname === 'dashboard.payriff.com' && url.pathname === '/') {
        outcome = 'DASHBOARD';
        break;
      }

      // 4) Fail: error message
      if (await this.error.isVisible().catch(() => false)) {
        outcome = 'ERROR';
        break;
      }

      // 5) Fail fallback: stayed on /auth (no otp param) AFTER click
      // (bu şərti tez trigger etməmək üçün 1-2 saniyə grace veririk)
      if (Date.now() - start > 1500 && url.pathname === '/auth' && !url.searchParams.has('formType')) {
        outcome = 'AUTH';
        break;
      }

      await this.page.waitForTimeout(5000);
    }

    if (!outcome) throw new Error('Login check timed out after 10s (no outcome)');

    if (outcome === 'DASHBOARD') return { ok: true, usedOtp: false };

    if (outcome === 'OTP') {
      const otp = new OtpPage(this.page);
      await otp.submitOtp(otpCode);
      await expect(this.page).toHaveURL('https://dashboard.payriff.com/', { timeout: 20_000 });
      return { ok: true, usedOtp: true };
    }

    const errText = (await this.error.isVisible().catch(() => false))
      ? await this.error.innerText()
      : 'Invalid credentials (stayed on /auth)';

    throw new Error(`Login failed. Outcome=${outcome}. Error=${errText}`);
  }
}

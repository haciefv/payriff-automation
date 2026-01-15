import { expect } from '@playwright/test';
import BasePage from './base.page.js';

export class OtpPage extends BasePage {
  constructor(page) {
    super(page);
    this.container = page.locator('#authPageOtp');
    this.inputs = this.container.locator('input[autocomplete="one-time-code"]');

    // varsa click edəcəyik (textlər səndə fərqli ola bilər)
    this.verifyBtn = page.locator(
      'button[type="submit"], button:has-text("Verify"), button:has-text("Confirm"), button:has-text("Continue")'
    );
  }

  async submitOtp(code) {
    if (!/^\d{6}$/.test(code)) throw new Error(`OTP must be 6 digits. Got: ${code}`);

    await expect(this.container).toBeVisible();
    await expect(this.inputs).toHaveCount(6);

    // MUI OTP üçün stabil
    await this.inputs.first().click();
    await this.page.keyboard.type(code);

    // verify button varsa click et
    const btn = this.verifyBtn.first();
    if (await btn.isVisible().catch(() => false)) {
      await Promise.all([
        this.page.waitForLoadState('networkidle').catch(() => { }),
        btn.click(),
      ]);
    }
  }
}

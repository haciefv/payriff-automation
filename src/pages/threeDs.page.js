export class ThreeDsPage {
  constructor(page) {
    this.page = page;
    // Səndəki 3dsecure.az challenge page-lərdə adətən input type=password olur
    this.otpInput = page.locator('input[type="password"], input[name*="otp" i], input[id*="otp" i]');
    this.submitBtn = page.getByRole('button', { name: /submit|confirm|continue|təsdiq|göndər|next/i })
      .or(page.locator('button[type="submit"]'));
  }

  async waitUntilLoaded() {
    // Challenge səhifəsi tam yüklənsin
    await this.page.waitForLoadState("domcontentloaded");
    await this.otpInput.first().waitFor({ state: "visible", timeout: 30000 });
  }

  async enterOtpAndSubmit(otp) {
    await this.otpInput.first().fill(String(otp));
    await this.submitBtn.first().click();
  }
}

export class InvoicesPage {
  constructor(page) {
    this.page = page;

    this.row01Actions = page.locator(`//tr[td[normalize-space()='01']]//button`);
    this.sendBtn = page.locator('#Send');
    this.openPaymentBtn = page.locator('.MuiBox-root.css-pgc10q');
  }

  async openRow01Details() {
    await this.row01Actions.click();
  }

  async sendInvoiceAndOpenPayment() {
    await this.sendBtn.click();
    await this.openPaymentBtn.click();
  }
}

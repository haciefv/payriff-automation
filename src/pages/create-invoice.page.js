export class CreateInvoicePage {
  constructor(page) {
    this.page = page;

    // Customer
    this.firstNameInput = page.locator('#createAnInvoiceFirstName');
    this.lastNameInput = page.locator('#createAnInvoiceLastName');
    this.emailInput = page.locator('#createAnInvoiceEmail');
    this.phoneInput = page.locator('#createAnInvoicePhoneNumber');

    // App / installment
    this.installmentDropdown =
      page.getByTestId('paymentDetails.merchant').locator('button[type="button"]');
    // this.appOptionEs1093703 = page.locator('#ES1093703');

    // Invoice details
    this.bookingIdInput = page.locator('#createAnInvoiceBookingId');
    this.amountInput = page.locator('#createAnInvoiceAmount');
    this.descriptionInput = page.locator('#createAnInvoiceDescription');
    this.expDate3Days = page.getByTestId('3-days');

    // Submit
    this.createInvoiceBtn = page.getByRole('button', { name: /Create invoice/i });
  }

  // ================= CUSTOMER =================
  async fillFirstName(value) {
    await this.firstNameInput.fill(value);
  }

  async fillLastName(value) {
    await this.lastNameInput.fill(value);
  }

  async fillEmail(value) {
    await this.emailInput.fill(value);
  }

  async fillPhone(value) {
    await this.phoneInput.fill(value);
  }

  // ================= INVOICE =================
  async fillBookingId(value) {
    await this.bookingIdInput.fill(value);
  }

  async fillAmount(value) {
    await this.amountInput.fill(String(value));
  }

  async fillDescription(value) {
    await this.descriptionInput.fill(value);
  }

  async selectExpiry3Days() {
    await this.expDate3Days.click();
  }

  // ================= APP =================
  async openInstallmentDropdown() {
    await this.installmentDropdown.click();
  }

  async chooseApp(value) {
    await this.openInstallmentDropdown();
    await this.page.locator(value).click()
  }

  // ================= SUBMIT =================
  async submitCreateInvoice() {
    await this.createInvoiceBtn.click();
  }
}

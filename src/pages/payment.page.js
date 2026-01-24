export class PaymentPage {
  constructor(page) {
    this.page = page;

    this.cardHolder = page.getByTestId('cardHolder');
    this.cardNumber = page.getByTestId('cardNumber');
    this.expiredDate = page.getByTestId('expiredDate');
    this.cvv = page.getByTestId('cvv');
    this.submit = page.getByTestId('submit-payment');
  }

  async pay({ holder, number, exp, cvv }) {
    await this.cardHolder.fill(holder);
    await this.cardNumber.fill(number);
    await this.expiredDate.fill(exp);
    await this.cvv.fill(cvv);
    await this.submit.click();
  }
}

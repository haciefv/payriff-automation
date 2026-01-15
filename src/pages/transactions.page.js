import { expect } from '@playwright/test';
import BasePage from './base.page.js';


export class TransactionsPage extends BasePage {
  constructor(page) {
    super(page);
    this.menuTransactions = page.getByTestId('menu-transactions');
    this.table = page.getByTestId('transactions-table');
    this.searchInput = page.getByTestId('transactions-search');
    this.statusFilter = page.getByTestId('transactions-status-filter');
  }

  async open() {
    // UI-də route fərqli olsa dəyiş
    await this.page.goto('/transactions');
    await expect(this.table).toBeVisible();
  }

  async search(text) {
    await this.searchInput.fill(text);
    await this.searchInput.press('Enter');
  }
}

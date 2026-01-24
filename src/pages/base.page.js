export default class BasePage {
    constructor(page, options = {}) {
        this.page = page;
        this.defaultTimeout = options.defaultTimeout ?? 15000;

        this.page.setDefaultTimeout(this.defaultTimeout);
        this.page.setDefaultNavigationTimeout(this.defaultTimeout);
    }

    /* ================= NAVIGATION ================= */

    async goto(url, options = {}) {
        return this.page.goto(url, {
            waitUntil: 'domcontentloaded',
            ...options,
        });
    }
    async openDashboard() {
        await this.goto('/');              // və ya tam url
        await this.waitForURL(/dashboard/);
    }

    async goToCreateInvoice() {
        await this.page.locator('body > div:nth-child(1) > div:nth-child(1) > nav:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > ul:nth-child(2) > li:nth-child(4) > div:nth-child(1) > div:nth-child(1)').click()
        await this.page.locator("a[id='Create an invoice']").click();
    }

    async waitForURL(urlOrRegex, options = {}) {
        return this.page.waitForURL(urlOrRegex, {
            timeout: this.defaultTimeout,
            ...options,
        });
    }

    /* ================= LOCATOR HELPERS ================= */

    locator(selector) {
        return this.page.locator(selector);
    }

    getByTestId(id) {
        return this.page.getByTestId(id);
    }

    getByRole(role, options) {
        return this.page.getByRole(role, options);
    }

    getByText(text, options = {}) {
        return this.page.getByText(text, options);
    }

    /* ================= ACTIONS ================= */

    async click(selector, options = {}) {
        await this.page.locator(selector).waitFor({ state: 'visible' });
        return this.page.locator(selector).click(options);
    }

    async fill(selector, value, options = {}) {
        const locator = this.page.locator(selector);
        await locator.waitFor({ state: 'visible' });
        await locator.fill(value, options);
    }

    async typeSlow(selector, value, delay = 50) {
        const locator = this.page.locator(selector);
        await locator.waitFor({ state: 'visible' });
        await locator.fill('');
        await locator.type(value, { delay });
    }

    async press(selector, key) {
        const locator = this.page.locator(selector);
        await locator.waitFor({ state: 'visible' });
        await locator.press(key);
    }

    /* ================= ASSERT / STATE ================= */

    async isVisible(selector, options = {}) {
        return this.page.locator(selector).isVisible(options);
    }

    async waitVisible(selector, timeout = this.defaultTimeout) {
        return this.page.locator(selector).waitFor({
            state: 'visible',
            timeout,
        });
    }

    async waitHidden(selector, timeout = this.defaultTimeout) {
        return this.page.locator(selector).waitFor({
            state: 'hidden',
            timeout,
        });
    }

    async getText(selector) {
        const text = await this.page.locator(selector).textContent();
        return text?.trim();
    }

    /* ================= NETWORK ================= */

    async waitForResponse(urlPart, status = 200) {
        return this.page.waitForResponse(
            (res) => res.url().includes(urlPart) && res.status() === status
        );
    }

    async waitForRequest(urlPart) {
        return this.page.waitForRequest((req) =>
            req.url().includes(urlPart)
        );
    }

    /* ================= IFRAME ================= */

    async frameByUrl(urlPart) {
        return this.page.frame({ url: new RegExp(urlPart) });
    }

    async frameByName(name) {
        return this.page.frame({ name });
    }

    /* ================= UTIL ================= */

    async screenshot(pathOrOptions = {}) {
        const opts =
            typeof pathOrOptions === 'string'
                ? { path: pathOrOptions }
                : pathOrOptions;

        return this.page.screenshot({
            fullPage: true,
            ...opts,
        });
    }

    async reload() {
        return this.page.reload({ waitUntil: 'domcontentloaded' });
    }

    async pause() {
        await this.page.pause();
    }

    setDefaultTimeout(ms) {
        this.defaultTimeout = ms;
        this.page.setDefaultTimeout(ms);
        this.page.setDefaultNavigationTimeout(ms);
    }
}

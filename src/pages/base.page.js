export default class BasePage {
    constructor(page, options = {}) {
        this.page = page;
        this.defaultTimeout = options.defaultTimeout ?? 5000;
        this.page.setDefaultTimeout(this.defaultTimeout);
    }

    async goto(url, options = {}) {
        return this.page.goto(url, options);
    }

    async click(selector, options = {}) {
        return this.page.locator(selector).click(options);
    }

    async fill(selector, value, options = {}) {
        return this.page.locator(selector).fill(value, options);
    }

    async getText(selector) {
        const text = await this.page.locator(selector).textContent();
        return text?.trim();
    }

    async isVisible(selector, options = {}) {
        return this.page.locator(selector).isVisible(options);
    }

    async screenshot(pathOrOptions = {}) {
        const opts =
            typeof pathOrOptions === 'string'
                ? { path: pathOrOptions }
                : pathOrOptions;
        return this.page.screenshot(opts);
    }

    setDefaultTimeout(ms) {
        this.defaultTimeout = ms;
        this.page.setDefaultTimeout(ms);
    }
}


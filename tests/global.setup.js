import fs from 'fs';
import { chromium } from '@playwright/test';
import { env } from '../src/config/env.js';
import { LoginPage } from '../src/pages/login.page.js';

const STATE_PATH = 'artifacts/admin.storageState.json';

export default async () => {
    if (fs.existsSync(STATE_PATH)) return;

    const browser = await chromium.launch();

    // ✅ baseURL burada verilir
    const context = await browser.newContext({
        baseURL: env.baseUrl,
    });

    const page = await context.newPage();

    const login = new LoginPage(page);
    function mask(v, { keepStart = 2, keepEnd = 2 } = {}) {
        if (v === undefined || v === null) return '<<UNDEFINED>>';
        const s = String(v);
        if (s.length <= keepStart + keepEnd) return '*'.repeat(Math.max(4, s.length));
        return `${s.slice(0, keepStart)}***${s.slice(-keepEnd)}`;
    }

    function info(name, value, opts) {
        console.log(`[CI-ENV] ${name} = ${mask(value, opts)} (len=${value ? String(value).length : 0})`);
    }

    // global.setup.js içinde login çağırmazdan əvvəl:
    info('ADMIN_EMAIL', process.env.ADMIN_EMAIL, { keepStart: 3, keepEnd: 5 });
    info('ADMIN_PASSWORD', process.env.ADMIN_PASSWORD, { keepStart: 0, keepEnd: 0 });
    info('ADMIN_OTP', process.env.ADMIN_OTP, { keepStart: 0, keepEnd: 2 });
    info('BASE_URL', process.env.BASE_URL, { keepStart: 8, keepEnd: 8 });

    await login.loginSmart(env.adminEmail, env.adminPassword, env.adminOtp);

    await context.storageState({ path: STATE_PATH });
    await browser.close();
};

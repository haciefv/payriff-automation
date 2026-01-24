# Payriff Playwright Automation

End-to-end UI automation framework built with **Playwright** for Payriff CRM / Admin panel.  
Supports **local run** and **GitHub Actions CI** with environment-based configuration.

---

## 🚀 Tech Stack
- Playwright
- Node.js 18+ / 20
- JavaScript (ESM)
- GitHub Actions
- HTML Report (Playwright)

---

## 📂 Project Structure
```
.
├── src/
│   ├── pages/              # Page Objects
│   └── config/
│       └── env.js          # Environment config (CI + local)
├── tests/
│   ├── smoke/              # Smoke tests
│   └── global.setup.js     # Auth / storageState setup
├── artifacts/
│   └── admin.storageState.json
├── playwright.config.js
├── package.json
└── README.md
```

---

## 🔐 Environment Variables

### Required variables
These are mandatory (local `.env` or GitHub Actions):

| Variable | Description |
|--------|------------|
| BASE_URL | Application base URL |
| ADMIN_EMAIL | Admin login email |
| ADMIN_PASSWORD | Admin password |
| ADMIN_OTP | OTP / 2FA code |

---

## ▶️ Local Run

### Install dependencies
```bash
npm install
```

### Create `.env` file
```env
BASE_URL=https://example.com
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=*******
ADMIN_OTP=******
```

### Run tests
```bash
npx playwright test
```

### Open report
```bash
npx playwright show-report
```

---

## 🔑 Authentication Flow
- Login is executed once in `global.setup.js`
- Auth state is saved to:
```
artifacts/admin.storageState.json
```
- All tests reuse this state

---

## 📊 Reports & Artifacts
- HTML report: `playwright-report/`
- Screenshots / videos / traces on failure
- CI uploads reports as GitHub Artifacts

---

## 🤖 GitHub Actions CI

### Environments
Supported environments:
- dev
- sb
- Prod

Secrets location:
```
Settings → Environments → <env> → Secrets / Variables
```

### Environment auto-selection
- dev branch → dev
- sb branch → sb
- others → Prod

---

## 🧪 Debugging in CI
Masked logs example:
```
[CI-ENV] ADMIN_EMAIL = pay***l.com
[CI-ENV] ADMIN_PASSWORD = ******
[CI-ENV] BASE_URL = https://***riff.com
```

---

## 📩 Optional: Email Reports
Framework supports emailing Playwright report ZIP via Gmail SMTP (App Password).

---

## ❗ Common Issues

### BASE_URL is required
- Check Variables vs Secrets
- Use vars.BASE_URL || secrets.BASE_URL in CI

### Element not found in CI
- Possible auth redirect or route change
- Inspect trace.zip:
```bash
npx playwright show-trace trace.zip
```

---

---

✅ CI-ready  
✅ Environment-aware  
✅ Secure secrets handling  

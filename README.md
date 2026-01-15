📦 Tech Stack

Playwright

Node.js (ESM)

JavaScript

dotenv

GitHub / GitHub Actions (CI ready)

✅ Requirements

Node.js 18+ (recommended: Node 20)

Git

Internet access (for Playwright browsers)

Check versions:

node -v

npm -v

🚀 First Time Setup
Install dependencies

npm ci

Install Playwright browsers

npx playwright install

🔐 Environment Configuration
Create .env

Copy example file:

.env.example → .env
(Windows: copy manually)

Fill required variables in .env

BASE_URL=https://dashboard.payriff.com

ADMIN_EMAIL=your_email
ADMIN_PASSWORD=your_password
ADMIN_OTP=your_otp_if_required

IMPORTANT: .env is ignored by git and must NOT be committed.

▶️ Running Tests

Run all tests:

npx playwright test

Run smoke tests only:

npm run test:smoke

🔑 Authentication & storageState

Auth state file:

artifacts/admin.storageState.json

Framework uses Playwright globalSetup.

If the file does NOT exist:

Login is executed automatically

storageState is generated

If the file exists:

Login is skipped

Tests start immediately

Works both locally and in CI.

📊 Reports

Open HTML report:

npm run report

Report location:

artifacts/playwright-report/

👥 Team Workflow

Branch naming:

feature/<name>-<description>

Flow:

Create branch

Open Pull Request

Review

Merge to main

⚠️ Important Notes

Do NOT commit:

.env

node_modules

artifacts

test-results

Always keep Playwright version in CI in sync with package.json.

Happy Testing 🚀
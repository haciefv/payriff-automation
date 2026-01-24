import 'dotenv/config';

function req(name) {
  const v = process.env[name];
  if (!v) {
    throw new Error(`${name} is required (check CI variables or .env)`);
  }
  return v;
}

export const env = {
  // ---- App ----
  envName: process.env.ENV || 'staging',
  baseUrl: req('BASE_URL'),
  apiUrl: process.env.API_URL || '',

  // ---- Admin ----
  adminEmail: req('ADMIN_EMAIL'),
  adminPassword: req('ADMIN_PASSWORD'),
  adminOtp: process.env.ADMIN_OTP || null, // CI-də Telegram OTP istifadə oluna bilər

  // ---- Card ----
  card: {
    holder: req('CARD_HOLDER'),
    number: req('CARD_NUMBER'), // boşluqsuz saxlanır
    exp: req('CARD_EXP'),
    // cvv: req('CARD_CVV'),
    cvv: '077',
  },

  // ---- OTP / Telegram ----
  otpServerUrl: req('OTP_SERVER_URL'),
  telegramBotToken: req('TELEGRAM_BOT_TOKEN'),
  telegramAllowedUserIds: req('TELEGRAM_ALLOWED_USER_IDS')
    .split(',')
    .map(x => x.trim()),
  telegramUserId: req('TELEGRAM_USER_ID'),

  // ---- Playwright runtime ----
  headless: (process.env.HEADLESS ?? 'true') === 'true',

  // 🔴 3DS üçün ALWAYS 1 (env-də 4 olsa belə override edilir)
  workers: 1,

  retries: Number(process.env.RETRIES || 1),
  trace: process.env.TRACE || 'on-first-retry',
  video: process.env.VIDEO || 'retain-on-failure',
  screenshot: process.env.SCREENSHOT || 'only-on-failure',
};

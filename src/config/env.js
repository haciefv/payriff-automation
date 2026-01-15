import 'dotenv/config';

function req(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is required (check CI variables or .env)`);
  return v;
}

export const env = {
  envName: process.env.ENV || 'staging',
  baseUrl: req('BASE_URL'),
  apiUrl: process.env.API_URL || '',
  adminEmail: req('ADMIN_EMAIL'),
  adminPassword: req('ADMIN_PASSWORD'),
  adminOtp :req('ADMIN_OTP'),

  headless: (process.env.HEADLESS ?? 'true') === 'true',
  workers: Number(process.env.WORKERS || 4),
  retries: Number(process.env.RETRIES || 1),

  trace: process.env.TRACE || 'on-first-retry',
  video: process.env.VIDEO || 'retain-on-failure',
  screenshot: process.env.SCREENSHOT || 'only-on-failure',
};

// src/utils/otp.util.js

export async function waitForOtp(request, userId) {
  const TIMEOUT_MS = 2 * 60 * 1000; // 2 dəq
  const POLL_MS = 2000;            // 2 saniyə
  const endAt = Date.now() + TIMEOUT_MS;

  while (Date.now() < endAt) {
    const res = await request.get(
      `${process.env.OTP_SERVER_URL}/otp/${encodeURIComponent(userId)}`
    );

    const data = await res.json();

    if (data?.otp?.code) {
      return String(data.otp.code);
    }

    await new Promise((r) => setTimeout(r, POLL_MS));
  }

  return null; // timeout
}

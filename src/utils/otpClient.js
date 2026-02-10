// src/utils/otpClient.js

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function baseUrl() {
  const url = process.env.OTP_SERVER_URL;
  if (!url) throw new Error("OTP_SERVER_URL is missing in env");
  return url.replace(/\/+$/, "");
}

export async function clearOtp(request, userId) {
  if (!userId) throw new Error("clearOtp: userId is required");

  // clear endpoint varsa:
  const res = await request.delete(
    `${baseUrl()}/clear/${encodeURIComponent(String(userId))}`,
    { timeout: 10_000 }
  );

  // serverdə delete route varsa 200 verəcək; yoxdursa testin qırılmasın:
  if (!res.ok()) {
    // fallback: ignore (optional)
    // console.warn("clearOtp failed:", res.status());
  }
}

export async function waitForOtp(request, userId, opts = {}) {
  if (!userId) throw new Error("waitForOtp: userId is required");

  const timeoutMs = opts.timeoutMs ?? 120_000;
  const intervalMs = opts.intervalMs ?? 2000;
  const minAt = opts.minAt ?? Date.now();

  const start = Date.now();
  let last = null;

  while (Date.now() - start < timeoutMs) {
    const res = await request.get(
      `${baseUrl()}/otp/${encodeURIComponent(String(userId))}`,
      { timeout: 10_000 }
    );

    if (res.ok()) {
      const data = await res.json().catch(() => ({}));
      const otp = data?.otp ?? null;
      if (otp?.code) last = otp;

      // fresh OTP qaytarsın
      if (otp?.code && typeof otp.at === "number" && otp.at >= minAt) {
        return otp.code;
      }
    }

    const jitter = Math.floor(Math.random() * 250);
    await sleep(intervalMs + jitter);
  }

  throw new Error(
    `OTP timeout after ${timeoutMs}ms. Last seen: ${last ? JSON.stringify(last) : "none"}`
  );
}

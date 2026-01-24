// src/utils/otpClient.js

function normalizeBaseUrl(baseUrl) {
  const v = baseUrl || process.env.OTP_SERVER_URL || "http://127.0.0.1:5055";
  return v.replace(/\/+$/, ""); // sondakı "/" sil
}

export async function clearOtp(
  request,
  userId,
  { baseUrl, timeoutMs = 3000, failSilently = true } = {}
) {
  const b = normalizeBaseUrl(baseUrl);
  const url = `${b}/clear/${encodeURIComponent(userId)}`;

  try {
    const res = await request.delete(url, { timeout: timeoutMs });

    // cleanup => default warn
    if (!res.ok()) {
      const body = await res.text().catch(() => "");
      const msg = `OTP clear failed: ${res.status()} ${body} (url=${url})`;
      if (!failSilently) throw new Error(msg);
      console.warn(msg);
    }
  } catch (e) {
    const msg = `OTP clear skipped: ${String(e)} (url=${url})`;
    if (!failSilently) throw new Error(msg);
    console.warn(msg);
  }
}

export async function waitForOtp(
  request,
  userId,
  { baseUrl, timeoutMs = 120_000, intervalMs = 2000, perRequestTimeoutMs = 8000 } = {}
) {
  const b = normalizeBaseUrl(baseUrl);
  const deadline = Date.now() + timeoutMs;
  let lastErr;

  while (Date.now() < deadline) {
    try {
      const res = await request.get(`${b}/otp/${encodeURIComponent(userId)}`, {
        timeout: perRequestTimeoutMs,
      });

      if (res.ok()) {
        const data = await res.json().catch(() => ({}));
        const code = data?.otp?.code;
        if (code) return String(code).trim();
      } else {
        // qeyri-200 cavablar üçün də info saxla
        lastErr = new Error(`OTP server responded ${res.status()}`);
      }
    } catch (e) {
      lastErr = e;
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error(
    `OTP not received within ${timeoutMs}ms. baseUrl=${b}. Last error: ${lastErr ? String(lastErr) : "none"}`
  );
}

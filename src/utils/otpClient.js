function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeBaseUrl(url) {
  return String(url || "").replace(/\/+$/, "");
}

function resolveBaseUrl(opts = {}) {
  const url = opts.baseUrl || process.env.OTP_SERVER_URL;
  if (!url) throw new Error("OTP_SERVER_URL is missing in env");
  return normalizeBaseUrl(url);
}

function getOtpTimestamp(otp) {
  const value = otp?.createdAt ?? otp?.at;
  return typeof value === "number" ? value : null;
}

function pickFirstFreshOtp(history, minAt) {
  if (!Array.isArray(history)) return null;

  let candidate = null;

  for (const item of history) {
    if (!item?.code) continue;

    const timestamp = getOtpTimestamp(item);
    if (timestamp === null) continue;
    if (typeof minAt === "number" && timestamp < minAt) continue;

    if (!candidate || timestamp < getOtpTimestamp(candidate)) {
      candidate = item;
    }
  }

  return candidate;
}

function summarizeOtp(otp) {
  if (!otp) return "none";

  return JSON.stringify({
    code: otp.code ? "[redacted]" : null,
    source: otp.source ?? null,
    deviceId: otp.deviceId ?? null,
    createdAt: otp.createdAt ?? otp.at ?? null,
  });
}

async function readJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export async function clearOtp(request, userId, opts = {}) {
  if (!userId) throw new Error("clearOtp: userId is required");

  try {
    const res = await request.delete(
      `${resolveBaseUrl(opts)}/clear/${encodeURIComponent(String(userId))}`,
      { timeout: 10_000 }
    );

    return res.ok();
  } catch (error) {
    if (opts.failSilently) return false;
    throw error;
  }
}

export async function waitForOtp(request, userId, opts = {}) {
  if (!userId) throw new Error("waitForOtp: userId is required");

  const timeoutMs = opts.timeoutMs ?? 120_000;
  const intervalMs = opts.intervalMs ?? 2000;
  const minAt = opts.minAt ?? Date.now();
  const failSilently = opts.failSilently ?? false;
  const baseUrl = resolveBaseUrl(opts);
  const startedAt = Date.now();
  const otpUrl = `${baseUrl}/otp/${encodeURIComponent(String(userId))}`;
  const historyUrl = `${baseUrl}/history/${encodeURIComponent(String(userId))}`;

  let lastSeen = null;
  let lastError = null;
  let canUseHistory = true;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      if (canUseHistory) {
        const historyRes = await request.get(historyUrl, { timeout: 10_000 });

        if (historyRes.ok()) {
          const historyData = await readJson(historyRes);
          const history = Array.isArray(historyData?.history) ? historyData.history : [];

          if (history[0]?.code) lastSeen = history[0];

          const firstFreshOtp = pickFirstFreshOtp(history, minAt);
          if (firstFreshOtp?.code) {
            return String(firstFreshOtp.code);
          }
        } else if (historyRes.status() === 404) {
          canUseHistory = false;
        }
      }

      const otpRes = await request.get(otpUrl, { timeout: 10_000 });
      if (otpRes.ok()) {
        const data = await readJson(otpRes);
        const otp = data?.otp ?? null;
        const timestamp = getOtpTimestamp(otp);

        if (otp?.code) lastSeen = otp;

        if (
          otp?.code &&
          typeof timestamp === "number" &&
          timestamp >= minAt
        ) {
          return String(otp.code);
        }
      }
    } catch (error) {
      lastError = error;
      if (!failSilently) {
        // Ignore transient polling errors until timeout.
      }
    }

    const jitter = Math.floor(Math.random() * 250);
    await sleep(intervalMs + jitter);
  }

  if (failSilently) return null;

  const errorDetail = lastError ? ` Last error: ${lastError.message}` : "";
  throw new Error(
    `OTP timeout after ${timeoutMs}ms. Last seen: ${summarizeOtp(lastSeen)}.${errorDetail}`
  );
}

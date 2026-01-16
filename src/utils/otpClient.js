export async function startSession(sessionId, baseUrl = process.env.OTP_SERVER_URL || "http://localhost:5055") {
  const res = await fetch(`${baseUrl}/start-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `start-session failed: HTTP ${res.status}`);
  return data;
}

export async function waitForOtp(sessionId, {
  baseUrl = process.env.OTP_SERVER_URL || "http://localhost:5055",
  timeoutMs = 180000,
  intervalMs = 1000
} = {}) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const res = await fetch(`${baseUrl}/get-otp?sessionId=${encodeURIComponent(sessionId)}`);
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const otp = data?.otp;
      if (otp) return String(otp).trim();
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }

  throw new Error(`OTP not received within ${timeoutMs}ms for sessionId=${sessionId}`);
}

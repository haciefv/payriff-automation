const sessions = new Map();

/**
 * session = {
 *   createdAt: number,
 *   otp: string | null
 * }
 */

function startSession(sessionId) {
  if (!sessionId) throw new Error("sessionId is required");

  const existing = sessions.get(sessionId);
  if (existing) return existing;

  const data = { createdAt: Date.now(), otp: null };
  sessions.set(sessionId, data);
  return data;
}

function setOtp(sessionId, otp) {
  if (!sessionId) throw new Error("sessionId is required");
  if (!otp) throw new Error("otp is required");

  const s = sessions.get(sessionId) ?? startSession(sessionId);
  s.otp = String(otp).trim();
  sessions.set(sessionId, s);
  return s;
}

function getOtp(sessionId) {
  if (!sessionId) throw new Error("sessionId is required");
  const s = sessions.get(sessionId);
  return s?.otp ?? null;
}

function hasSession(sessionId) {
  return sessions.has(sessionId);
}

module.exports = {
  startSession,
  setOtp,
  getOtp,
  hasSession
};

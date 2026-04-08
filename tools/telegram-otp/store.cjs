// tools/telegram-otp/store.cjs
// In-memory store: userId -> { lastOtp, history[] }
// Note: Server restart olanda state sifirlanir (bu normaldir).

const HISTORY_LIMIT = 50;
const DUPLICATE_WINDOW_MS = 30_000;

const state = new Map();

function ensure(userId) {
  const id = String(userId);
  if (!state.has(id)) state.set(id, { lastOtp: null, history: [] });
  return state.get(id);
}

function normalizeText(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text ? text : null;
}

function cloneEntry(item) {
  return item ? { ...item } : null;
}

function pushOtp(userId, code, meta = {}) {
  const id = String(userId).trim();
  const normalizedCode = String(code).trim();
  const s = ensure(id);
  const now = Date.now();

  const duplicate = s.history.find(
    (item) =>
      item.code === normalizedCode &&
      typeof item.createdAt === "number" &&
      now - item.createdAt <= DUPLICATE_WINDOW_MS
  );

  if (duplicate) {
    return { item: cloneEntry(duplicate), deduplicated: true };
  }

  const item = {
    code: normalizedCode,
    createdAt: now,
    at: now,
    source: normalizeText(meta.source) || "unknown",
    deviceId: normalizeText(meta.deviceId),
    note: normalizeText(meta.note),
  };

  s.lastOtp = item;
  s.history.unshift(item);

  if (s.history.length > HISTORY_LIMIT) {
    s.history = s.history.slice(0, HISTORY_LIMIT);
  }

  return { item: cloneEntry(item), deduplicated: false };
}

function getLastOtp(userId) {
  const s = ensure(userId);
  return cloneEntry(s.lastOtp);
}

function getHistory(userId) {
  const s = ensure(userId);
  return s.history.map(cloneEntry);
}

function clearUser(userId) {
  const id = String(userId);
  state.delete(id);
  return true;
}

module.exports = {
  pushOtp,
  getLastOtp,
  getHistory,
  clearUser,
};

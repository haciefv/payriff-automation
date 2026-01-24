// tools/telegram-otp/store.cjs
// In-memory store: userId -> { lastOtp, history[] }
// Note: Server restart olanda state sıfırlanır (bu normaldır).

const state = new Map();

function ensure(userId) {
  const id = String(userId);
  if (!state.has(id)) state.set(id, { lastOtp: null, history: [] });
  return state.get(id);
}

function pushOtp(userId, code, meta = {}) {
  const s = ensure(userId);
  const item = { code: String(code), at: Date.now(), ...meta };

  s.lastOtp = item;
  s.history.unshift(item);

  // history limit
  if (s.history.length > 50) s.history = s.history.slice(0, 50);

  return item;
}

function getLastOtp(userId) {
  const s = ensure(userId);
  return s.lastOtp; // null ola bilər
}

function getHistory(userId) {
  const s = ensure(userId);
  return s.history;
}

function clearUser(userId) {
  const id = String(userId);
  state.set(id, { lastOtp: null, history: [] });
  return true;
}

module.exports = {
  pushOtp,
  getLastOtp,
  getHistory,
  clearUser,
};

// tools/telegram-otp/server.cjs
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { pushOtp, getLastOtp, getHistory, clearUser } = require("./store.cjs");

const PORT = Number(process.env.OTP_SERVER_PORT || 5055);
const MOBILE_PUSH_TOKEN = (process.env.MOBILE_PUSH_TOKEN || "").trim();

function normalizeText(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text ? text : null;
}

function normalizeSource(value) {
  return (normalizeText(value) || "unknown").toLowerCase();
}

function isMobileOrigin(source) {
  return /ios|mobile|shortcut/.test(source);
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "16kb" }));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/otp", (req, res) => {
  const body = req.body || {};
  const userId = normalizeText(body.userId);
  const code = normalizeText(body.code);
  const source = normalizeSource(body.source);
  const deviceId = normalizeText(body.deviceId);
  const note = normalizeText(body.note);

  if (!userId || !code) {
    return res.status(400).json({
      ok: false,
      error: "userId and code are required",
    });
  }

  if (isMobileOrigin(source) && MOBILE_PUSH_TOKEN) {
    const providedToken = normalizeText(req.get("x-mobile-token"));
    if (providedToken !== MOBILE_PUSH_TOKEN) {
      return res.status(401).json({
        ok: false,
        error: "invalid mobile token",
      });
    }
  }

  const { item, deduplicated } = pushOtp(userId, code, {
    source,
    deviceId,
    note,
  });

  console.log("[telegram-otp] OTP accepted", {
    userId,
    source: item.source,
    deviceId: item.deviceId,
    deduplicated,
    createdAt: item.createdAt,
    codeLength: item.code.length,
  });

  return res.json({
    ok: true,
    deduplicated,
    item,
  });
});

app.get("/otp/:userId", (req, res) => {
  const userId = String(req.params.userId);
  const otp = getLastOtp(userId);
  res.json({ ok: true, otp });
});

app.get("/history/:userId", (req, res) => {
  const userId = String(req.params.userId);
  res.json({ ok: true, history: getHistory(userId) });
});

app.delete("/clear/:userId", (req, res) => {
  const userId = String(req.params.userId);
  clearUser(userId);
  res.json({ ok: true, userId });
});

app.use((err, req, res, next) => {
  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({
      ok: false,
      error: "invalid JSON body",
    });
  }

  console.error("[telegram-otp] Unexpected server error:", err?.message || err);
  return res.status(500).json({
    ok: false,
    error: "internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`[telegram-otp] OTP server started: http://127.0.0.1:${PORT}`);
});

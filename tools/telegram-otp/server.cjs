// tools/telegram-otp/server.cjs
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { pushOtp, getLastOtp, getHistory, clearUser } = require("./store.cjs");

const PORT = Number(process.env.OTP_SERVER_PORT || 5055);

const app = express();
app.use(cors());
app.use(express.json());

// health
app.get("/health", (req, res) => res.json({ ok: true }));

// OTP push (bot buraya yazır)
app.post("/otp", (req, res) => {
  const { userId, code, source } = req.body || {};
  if (!userId || !code) {
    return res
      .status(400)
      .json({ ok: false, error: "userId and code are required" });
  }

  const item = pushOtp(String(userId), String(code), {
    source: source || "unknown",
  });
  return res.json({ ok: true, item });
});

// OTP read (Playwright burdan oxuyur)
app.get("/otp/:userId", (req, res) => {
  const userId = String(req.params.userId);
  const otp = getLastOtp(userId);
  res.json({ otp });
});

// history (debug)
app.get("/history/:userId", (req, res) => {
  const userId = String(req.params.userId);
  res.json({ history: getHistory(userId) });
});

// clear
app.delete("/clear/:userId", (req, res) => {
  const userId = String(req.params.userId);
  clearUser(userId);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`[telegram-otp] OTP server started: http://127.0.0.1:${PORT}`);
});

// tools/telegram-otp/bot.cjs
require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OTP_SERVER = process.env.OTP_SERVER_URL || "http://127.0.0.1:5055";

const ALLOWED_USER_IDS = (process.env.TELEGRAM_ALLOWED_USER_IDS || "")
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);

if (!BOT_TOKEN) {
  console.error("[telegram-otp] TELEGRAM_BOT_TOKEN is required");
  process.exit(1);
}

function isAllowed(userId) {
  if (ALLOWED_USER_IDS.length === 0) return false;
  return ALLOWED_USER_IDS.includes(String(userId));
}

async function fetchJson(url, options = {}) {
  console.log("[HTTP →]", options.method || "GET", url);

  const res = await fetch(url, options);
  const text = await res.text();

  console.log("[HTTP ←]", res.status, text);

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function clearRemote(userId) {
  try {
    await fetchJson(`${OTP_SERVER}/clear/${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });
    return true;
  } catch {
    return false;
  }
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.on("message", async (msg) => {
  console.log("\n[TELEGRAM IN]");
  console.dir(msg, { depth: null });

  const chatId = msg.chat.id;
  const userId = String(msg.from?.id || "");
  const text = (msg.text || "").trim();

  if (!isAllowed(userId)) {
    return bot.sendMessage(chatId, "⛔ Access denied.");
  }

  // /clear
  if (text === "/clear") {
    const ok = await clearRemote(userId);
    return bot.sendMessage(
      chatId,
      ok ? "✅ Cleared (history + lastOtp)." : "❌ Clear failed (OTP server?)"
    );
  }

  // /help
  if (text === "/help" || text === "/start") {
    return bot.sendMessage(
      chatId,
      "Komandalar:\n" +
        "/clear — OTP & history sil\n" +
        "OTP kodunu (məs: 123456) göndər → save olacaq"
    );
  }

  // OTP save (4–8 rəqəm)
  const otpMatch = text.match(/\b(\d{4,8})\b/);
  if (otpMatch) {
    const code = otpMatch[1];

    try {
      await fetchJson(`${OTP_SERVER}/otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          code,
          source: "telegram",
        }),
      });

      return bot.sendMessage(chatId, `✅ OTP saved: ${code}`);
    } catch (e) {
      return bot.sendMessage(chatId, `❌ OTP save failed: ${e.message}`);
    }
  }

  return bot.sendMessage(chatId, "OTP kodunu göndər (məs: 123456) və ya /clear");
});

console.log("[telegram-otp] Bot started");
console.log("[telegram-otp] OTP server:", OTP_SERVER);
console.log(
  "[telegram-otp] Allowed IDs:",
  ALLOWED_USER_IDS.length ? ALLOWED_USER_IDS.join(",") : "(none)"
);

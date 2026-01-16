const TelegramBot = require("node-telegram-bot-api");

const OTP_SERVER = process.env.OTP_SERVER_URL || "http://localhost:5055";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ALLOWED_USER_IDS = (process.env.TELEGRAM_ALLOWED_USER_IDS || "")
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);

if (!BOT_TOKEN) {
  console.error("[telegram-otp] TELEGRAM_BOT_TOKEN is required");
  process.exit(1);
}

function isAllowed(userId) {
  if (ALLOWED_USER_IDS.length === 0) return true; // istəyirsən buranı sərtləşdirərik
  return ALLOWED_USER_IDS.includes(String(userId));
}

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return data;
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/^\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `OK. OTP bot aktivdir.\nGöndər: otp <sessionId> <otp>\nMəs: otp demo-1 123456`
  );
});

bot.on("message", async (msg) => {
  try {
    if (!msg.text) return;
    const userId = msg.from?.id;

    if (!isAllowed(userId)) {
      return bot.sendMessage(msg.chat.id, "Access denied.");
    }

    const text = msg.text.trim();

    // format: otp <sessionId> <otp>
    const m = text.match(/^otp\s+(\S+)\s+(\S+)\s*$/i);
    if (!m) return;

    const sessionId = m[1];
    const otp = m[2];

    await postJson(`${OTP_SERVER}/set-otp`, { sessionId, otp });
    await bot.sendMessage(msg.chat.id, `✅ OTP qəbul olundu. sessionId=${sessionId}`);
  } catch (e) {
    await bot.sendMessage(msg.chat.id, `❌ Error: ${e.message}`);
  }
});

console.log("[telegram-otp] bot started (polling)");

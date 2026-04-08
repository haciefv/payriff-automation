// tools/telegram-otp/bot.cjs
require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OTP_SERVER = String(
  process.env.OTP_SERVER_URL ||
    `http://127.0.0.1:${process.env.OTP_SERVER_PORT || 5055}`
).replace(/\/+$/, "");
const ALLOWED_USER_IDS = parseCsv(process.env.TELEGRAM_ALLOWED_USER_IDS || "");
const OTP_CHANNEL_IDS = new Set(parseCsv(process.env.TELEGRAM_OTP_CHANNEL_IDS || ""));
const CHANNEL_TARGET_USER_ID = String(
  process.env.TELEGRAM_CHANNEL_TARGET_USER_ID || process.env.TELEGRAM_USER_ID || ""
).trim();
const OTP_REGEX = /\b(\d{4,8})\b/;

if (!BOT_TOKEN) {
  console.error("[telegram-otp] TELEGRAM_BOT_TOKEN is required");
  process.exit(1);
}

function parseCsv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isAllowed(userId) {
  return ALLOWED_USER_IDS.includes(String(userId));
}

function isAllowedChannel(channelId) {
  return OTP_CHANNEL_IDS.has(String(channelId));
}

function getMessageText(msg) {
  return [msg?.text, msg?.caption].filter(Boolean).join("\n").trim();
}

function extractOtp(text) {
  const match = String(text || "").match(OTP_REGEX);
  return match ? match[1] : null;
}

function summarizeResponse(payload) {
  if (!payload || typeof payload !== "object") return payload;

  const summary = { ...payload };
  if (summary.item && typeof summary.item === "object") {
    summary.item = {
      ...summary.item,
      code: summary.item.code ? "[redacted]" : summary.item.code,
    };
  }

  return summary;
}

async function fetchJson(url, options = {}) {
  const method = options.method || "GET";
  console.log("[telegram-otp] HTTP ->", method, url);

  const res = await fetch(url, options);
  const text = await res.text();

  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = text;
  }

  console.log("[telegram-otp] HTTP <-", res.status, summarizeResponse(payload));

  if (!res.ok) {
    const error = new Error(`HTTP ${res.status}`);
    error.status = res.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

async function postOtp({ userId, code, source, deviceId, note }) {
  return fetchJson(`${OTP_SERVER}/otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: String(userId),
      code: String(code),
      source,
      deviceId,
      note,
    }),
  });
}

async function clearRemote(userId) {
  try {
    await fetchJson(`${OTP_SERVER}/clear/${encodeURIComponent(userId)}`, {
      method: "DELETE",
    });
    return true;
  } catch (error) {
    console.warn("[telegram-otp] Clear failed:", error.message);
    return false;
  }
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.on("message", async (msg) => {
  if (msg?.chat?.type === "channel") return;

  const chatId = msg.chat.id;
  const userId = String(msg.from?.id || "");
  const text = getMessageText(msg);

  console.log("[telegram-otp] Message received", {
    chatId,
    userId,
    chatType: msg.chat?.type || "unknown",
  });

  if (text === "/myid") {
    return bot.sendMessage(chatId, `Your Telegram User ID: ${userId}`);
  }

  if (!isAllowed(userId)) {
    return bot.sendMessage(chatId, "Access denied.");
  }

  if (text === "/clear") {
    const ok = await clearRemote(userId);
    return bot.sendMessage(
      chatId,
      ok ? "Cleared OTP history." : "Clear failed. Is the OTP server running?"
    );
  }

  if (text === "/help" || text === "/start") {
    return bot.sendMessage(
      chatId,
      "Commands:\n" +
        "/myid - show your Telegram user id\n" +
        "/clear - clear OTP history\n" +
        "Send an OTP like 123456 to store it"
    );
  }

  const code = extractOtp(text);
  if (!code) {
    return bot.sendMessage(chatId, "Send an OTP like 123456 or use /clear.");
  }

  try {
    await postOtp({
      userId,
      code,
      source: "telegram",
      deviceId: `telegram-chat:${chatId}`,
    });

    return bot.sendMessage(chatId, `OTP saved: ${code}`);
  } catch (error) {
    return bot.sendMessage(chatId, `OTP save failed: ${error.message}`);
  }
});

async function handleChannelPost(msg) {
  const channelId = String(msg?.chat?.id || "");
  const channelName = msg?.chat?.title || msg?.chat?.username || channelId;
  const text = getMessageText(msg);
  const code = extractOtp(text);

  console.log("[telegram-otp] Channel post received", {
    channelId,
    channelName,
  });

  if (!code) return;

  if (!isAllowedChannel(channelId)) {
    console.log("[telegram-otp] Ignoring OTP from unconfigured channel", {
      channelId,
      channelName,
    });
    return;
  }

  if (!CHANNEL_TARGET_USER_ID) {
    console.warn(
      "[telegram-otp] TELEGRAM_CHANNEL_TARGET_USER_ID or TELEGRAM_USER_ID is required for channel OTP forwarding"
    );
    return;
  }

  try {
    await postOtp({
      userId: CHANNEL_TARGET_USER_ID,
      code,
      source: "telegram-channel",
      deviceId: `telegram-channel:${channelId}`,
      note: channelName,
    });

    console.log("[telegram-otp] Channel OTP forwarded", {
      channelId,
      channelName,
      targetUserId: CHANNEL_TARGET_USER_ID,
    });
  } catch (error) {
    console.error("[telegram-otp] Channel OTP forward failed:", error.message);
  }
}

bot.on("channel_post", handleChannelPost);
bot.on("edited_channel_post", handleChannelPost);

console.log("[telegram-otp] Bot started");
console.log("[telegram-otp] OTP server:", OTP_SERVER);
console.log(
  "[telegram-otp] Allowed user IDs:",
  ALLOWED_USER_IDS.length ? ALLOWED_USER_IDS.join(",") : "(none)"
);
console.log(
  "[telegram-otp] Allowed channel IDs:",
  OTP_CHANNEL_IDS.size ? Array.from(OTP_CHANNEL_IDS).join(",") : "(none)"
);
console.log(
  "[telegram-otp] Channel target user:",
  CHANNEL_TARGET_USER_ID || "(not set)"
);

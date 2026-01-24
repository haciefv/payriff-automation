// src/utils/telegramNotify.js

export async function telegramNotify(request, text, {
  token = process.env.TELEGRAM_BOT_TOKEN,
  chatId = process.env.TELEGRAM_USER_ID,
} = {}) {
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is missing");
  if (!chatId) throw new Error("TELEGRAM_USER_ID is missing");

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const res = await request.post(url, {
    data: {
      chat_id: chatId,
      text,
    },
    timeout: 15000,
  });

  if (!res.ok()) {
    const body = await res.text().catch(() => "");
    throw new Error(`Telegram notify failed: ${res.status()} ${body}`);
  }
}

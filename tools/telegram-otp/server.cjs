const http = require("http");
const { URL } = require("url");
const { startSession, setOtp, getOtp, hasSession } = require("./store.cjs");

const PORT = process.env.OTP_SERVER_PORT ? Number(process.env.OTP_SERVER_PORT) : 5055;

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function collectJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(new Error("Invalid JSON body"));
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    const method = req.method?.toUpperCase();

    // Health
    if (method === "GET" && path === "/health") {
      return sendJson(res, 200, { ok: true, service: "telegram-otp-server", port: PORT });
    }

    // POST /start-session { sessionId }
    if (method === "POST" && path === "/start-session") {
      const body = await collectJson(req);
      const sessionId = body.sessionId;
      const session = startSession(sessionId);
      return sendJson(res, 200, { ok: true, sessionId, createdAt: session.createdAt });
    }

    // POST /set-otp { sessionId, otp }
    if (method === "POST" && path === "/set-otp") {
      const body = await collectJson(req);
      const sessionId = body.sessionId;
      const otp = body.otp;
      const session = setOtp(sessionId, otp);
      return sendJson(res, 200, { ok: true, sessionId, hasOtp: !!session.otp });
    }

    // GET /get-otp?sessionId=...
    if (method === "GET" && path === "/get-otp") {
      const sessionId = url.searchParams.get("sessionId");
      if (!sessionId) return sendJson(res, 400, { ok: false, error: "sessionId is required" });

      if (!hasSession(sessionId)) {
        return sendJson(res, 404, { ok: false, error: "session not found" });
      }

      const otp = getOtp(sessionId);
      return sendJson(res, 200, { ok: true, sessionId, otp });
    }

    return sendJson(res, 404, { ok: false, error: "not found" });
  } catch (e) {
    return sendJson(res, 500, { ok: false, error: e.message ?? "server error" });
  }
});

server.listen(PORT, () => {
  console.log(`[telegram-otp] server started on http://localhost:${PORT}`);
  console.log(`[telegram-otp] endpoints: GET /health, POST /start-session, POST /set-otp, GET /get-otp?sessionId=...`);
});

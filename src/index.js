import { CONFIG } from "./strategy.js";

async function sendTelegram(env, message) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    throw new Error("Telegram secrets are not configured.");
  }
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method:"POST", headers:{"content-type":"application/json"},
    body:JSON.stringify({chat_id:env.TELEGRAM_CHAT_ID,text:message})
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error("Telegram API rejected the message.");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/health") {
      return Response.json({
        ok:true, app:"kichidi-xauusd", mode:"signals-only", strategy:CONFIG,
        dataProvider:"not-configured",
        note:"No live alerts or backtests until a validated XAUUSD data provider is connected."
      });
    }
    if (url.pathname === "/telegram-test" && request.method === "POST") {
      try {
        await sendTelegram(env, "KICHIDI XAUUSD: Telegram connection test successful. Signals only; no orders are placed.");
        return Response.json({ok:true,telegram:"sent"});
      } catch (e) {
        return Response.json({ok:false,error:e.message},{status:503});
      }
    }
    return Response.json({ok:false,error:"Not found"},{status:404});
  },
  async scheduled(controller) {
    // Intentionally inactive until a market-data provider is validated.
    console.log("KICHIDI scheduled check; no data provider configured.", controller.scheduledTime);
  }
};

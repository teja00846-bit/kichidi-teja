# KICHIDI XAUUSD — cloud project starter

Signals-only Cloudflare Worker starter for XAUUSD M5.

## Recorded strategy rules
- Bollinger Bands: 20-period SMA, standard deviation 1.4 (hidden)
- Sessions: 05:00–09:00 and 17:00–21:00, Asia/Kolkata
- BUY: previous candle green and entirely below lower band; current candle green and closes above previous high
- SELL: previous candle red and entirely above upper band; current candle red and closes below previous low
- Entry: previous candle high (BUY) / previous candle low (SELL)
- Stop: previous candle low (BUY) / previous candle high (SELL)
- Target: 1.7R

This implements the written rules recorded in the project, not a verified byte-for-byte conversion of the original Pine Script. Compare against the complete Pine source before calling it exact.

## Deployment and configuration
1. Create a Cloudflare Worker named `kichidi-xauusd`.
2. Deploy this project using Cloudflare's Git integration or Wrangler.
3. Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` as Worker secrets. Never commit credentials.
4. Visit `/health`.
5. POST to `/telegram-test` to test Telegram.

## Data status
No market-data provider is configured. Do not enable live signals or claim historical backtest results until a provider's XAUUSD feed, timestamps, candle boundaries, missing bars, and timezone are validated.

## Safety and limitations
- Signals only; no broker connection or order execution.
- The configured one-minute cron is not guaranteed five-second monitoring.
- If SL and TP are both touched in one historical candle, count SL first conservatively.

export const CONFIG = {
  symbol: "XAUUSD", timeframe: "5m", bbLength: 20,
  bbDeviation: 1.4, rewardRisk: 1.7, timezone: "Asia/Kolkata"
};

export function bollingerBands(closes, length = CONFIG.bbLength, deviation = CONFIG.bbDeviation) {
  if (closes.length < length) return null;
  const window = closes.slice(-length);
  const mean = window.reduce((a, b) => a + b, 0) / length;
  const variance = window.reduce((sum, value) => sum + (value - mean) ** 2, 0) / length;
  const sd = Math.sqrt(variance);
  return { middle: mean, upper: mean + deviation * sd, lower: mean - deviation * sd };
}

function minutesInIST(timestamp) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: CONFIG.timezone, hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).formatToParts(new Date(timestamp));
  return Number(parts.find(p => p.type === "hour").value) * 60 +
         Number(parts.find(p => p.type === "minute").value);
}

export function isInSession(timestamp) {
  const m = minutesInIST(timestamp);
  return (m >= 300 && m < 540) || (m >= 1020 && m < 1260);
}

// Input candles must be chronological: {time, open, high, low, close}.
export function findSignal(candles) {
  if (!Array.isArray(candles) || candles.length < CONFIG.bbLength + 1) return null;
  const prev = candles.at(-2), curr = candles.at(-1);
  if (![prev, curr].every(c => [c.open,c.high,c.low,c.close].every(Number.isFinite))) return null;
  const timestamp = typeof curr.time === "number" ? curr.time : Date.parse(curr.time);
  if (!Number.isFinite(timestamp) || !isInSession(timestamp)) return null;
  const bands = bollingerBands(candles.slice(0, -1).map(c => c.close));
  if (!bands) return null;

  if (prev.close > prev.open && prev.high < bands.lower &&
      curr.close > curr.open && curr.close > prev.high) {
    const entry = prev.high, stop = prev.low, risk = entry - stop;
    if (risk <= 0) return null;
    return { side:"BUY", time:curr.time, entry, stop, target:entry + risk * CONFIG.rewardRisk, risk };
  }
  if (prev.close < prev.open && prev.low > bands.upper &&
      curr.close < curr.open && curr.close < prev.low) {
    const entry = prev.low, stop = prev.high, risk = stop - entry;
    if (risk <= 0) return null;
    return { side:"SELL", time:curr.time, entry, stop, target:entry - risk * CONFIG.rewardRisk, risk };
  }
  return null;
}

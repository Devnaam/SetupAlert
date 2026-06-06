const https = require('https');

function detectHammer(candle) {
  const body_size = Math.abs(candle.close - candle.open);
  const full_range = candle.high - candle.low;
  const upper_wick = candle.high - Math.max(candle.open, candle.close);
  const lower_wick = Math.min(candle.open, candle.close) - candle.low;

  if (full_range <= 0) return false;

  const bRatio = body_size / full_range;
  const lwRatio = lower_wick / body_size;
  const uwRatio = upper_wick / body_size;

  const detected =
    bRatio >= 0.05 &&
    bRatio <= 0.30 &&
    lower_wick >= 2 * body_size &&
    upper_wick <= body_size;

  return { detected, bRatio, lwRatio, uwRatio, body_size, full_range, upper_wick, lower_wick };
}

https.get('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=100', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const klines = JSON.parse(data);
    klines.forEach(k => {
      const candle = {
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4])
      };
      const res = detectHammer(candle);
      console.log(`Candle: O=${candle.open} C=${candle.close} H=${candle.high} L=${candle.low} -> Hammer: ${res.detected}`);
      if (!res.detected) {
        console.log(`  bRatio: ${res.bRatio.toFixed(3)} (needs 0.05-0.30)`);
        console.log(`  lower_wick: ${res.lower_wick.toFixed(2)} (needs >= ${2 * res.body_size.toFixed(2)})`);
        console.log(`  upper_wick: ${res.upper_wick.toFixed(2)} (needs <= ${res.body_size.toFixed(2)})`);
      }
    });
  });
});

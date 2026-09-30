export function generateCandles(symbol: string, basePrice: number, count = 96) {
  let h = 2166136261;
  for (let i = 0; i < symbol.length; i++) { h ^= symbol.charCodeAt(i); h = Math.imul(h, 16777619); }
  const rng = () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const candles: { t: number; o: number; h: number; l: number; c: number; v: number }[] = [];
  let price = basePrice * 0.94;
  const now = Date.now();
  for (let i = count - 1; i >= 0; i--) {
    const o = price;
    const move = (rng() - 0.48) * basePrice * 0.012;
    const c = Math.max(0.0001, o + move);
    const hh = Math.max(o, c) * (1 + rng() * 0.004);
    const ll = Math.min(o, c) * (1 - rng() * 0.004);
    const v = 200000 + rng() * 900000;
    candles.push({ t: now - i * 15 * 60 * 1000, o, h: hh, l: ll, c, v });
    price = c;
  }
  candles[candles.length - 1].c = basePrice;
  return candles;
}
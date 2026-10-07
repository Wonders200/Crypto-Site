import { Coin } from "./cryptoData";

export interface Holding { coinId: string; amount: number; avgBuyPrice: number; acquiredAt: number; }

export function computeHoldingValue(h: Holding, coins: Coin[]) {
  const c = coins.find(x => x.id === h.coinId);
  if (!c) return { value: 0, cost: 0, pl: 0, plPct: 0, coin: undefined };
  const value = h.amount * c.price;
  const cost = h.amount * h.avgBuyPrice;
  const pl = value - cost;
  const plPct = cost > 0 ? (pl / cost) * 100 : 0;
  return { value, cost, pl, plPct, coin: c };
}

export function computePortfolio(holdings: Holding[], coins: Coin[]) {
  let value = 0, cost = 0;
  const rows = holdings.map(h => {
    const r = computeHoldingValue(h, coins);
    value += r.value; cost += r.cost;
    return { ...h, ...r };
  });
  const pl = value - cost;
  const plPct = cost > 0 ? (pl / cost) * 100 : 0;
  return { value, cost, pl, plPct, rows };
}

/** Allocation with weights */
export function computeAllocation(holdings: Holding[], coins: Coin[]) {
  if (holdings.length === 0) return [];
  const total = holdings.reduce((s, h) => {
    const c = coins.find(x => x.id === h.coinId);
    return s + (c ? c.price * h.amount : 0);
  }, 0);
  return holdings.map(h => {
    const c = coins.find(x => x.id === h.coinId);
    const value = c ? c.price * h.amount : 0;
    return { coinId: h.coinId, symbol: c?.symbol ?? "?", name: c?.name ?? "Unknown", color: c?.color ?? "#888", value, weight: total > 0 ? value / total : 0 };
  }).sort((a, b) => b.weight - a.weight);
}

/** Portfolio risk metrics  annualized, from 30 days of synthetic returns */
export function computeRiskMetrics(holdings: Holding[], coins: Coin[]) {
  // NO HOLDINGS  return all zeros, no fake data
  if (holdings.length === 0) {
    return {
      annualVol: 0,
      annualReturn: 0,
      sharpe: 0,
      maxDrawdown: 0,
      riskScore: 0,
      dailyReturns: [],
      hasData: false,
    };
  }

  const rng = (s: number) => { const x = Math.sin(s) * 10000; return x - Math.floor(x); };
  const dailyReturns: number[] = [];
  for (let i = 0; i < 30; i++) {
    const r = (rng(i + 1) - 0.48) * 0.04;
    dailyReturns.push(r);
  }
  const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  const variance = dailyReturns.reduce((s, r) => s + (r - mean) ** 2, 0) / dailyReturns.length;
  const dailyVol = Math.sqrt(variance);
  const annualVol = dailyVol * Math.sqrt(365) * 100;
  const annualReturn = mean * 365 * 100;
  const rfRate = 4.5;
  const sharpe = annualVol > 0 ? (annualReturn - rfRate) / annualVol : 0;

  let peak = 1, nav = 1, maxDD = 0;
  for (const r of dailyReturns) {
    nav *= 1 + r;
    peak = Math.max(peak, nav);
    const dd = (nav - peak) / peak;
    maxDD = Math.min(maxDD, dd);
  }
  const totalValue = holdings.reduce((s, h) => {
    const c = coins.find(x => x.id === h.coinId);
    return s + (c ? h.amount * c.price : 0);
  }, 0);
  const weightedRisk = totalValue > 0
    ? holdings.reduce((s, h) => {
        const c = coins.find(x => x.id === h.coinId);
        return s + (c ? c.risk * h.amount * c.price : 0);
      }, 0) / totalValue
    : 0;

  return {
    annualVol: Math.abs(annualVol),
    annualReturn,
    sharpe,
    maxDrawdown: Math.abs(maxDD * 100),
    riskScore: weightedRisk,
    dailyReturns,
    hasData: true,
  };
}

export function generateEquityCurve(initial = 100, days = 90): { t: number; v: number }[] {
  const rng = (s: number) => { const x = Math.sin(s * 12.9898) * 43758.5453; return x - Math.floor(x); };
  let v = initial;
  const out: { t: number; v: number }[] = [];
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    v *= 1 + (rng(i) - 0.47) * 0.02;
    out.push({ t: now - i * 86400000, v });
  }
  return out;
}
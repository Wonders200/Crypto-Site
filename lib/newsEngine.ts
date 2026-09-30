import { AdminCoin, AdminNews, uid } from "./adminStore";

const SOURCES    = ["CoinDesk", "The Block", "Decrypt", "Reuters", "Bloomberg", "CoinTelegraph", "Blockworks", "CryptoSlate", "DL News"];
const EXCHANGES  = ["Binance", "Coinbase", "Kraken", "OKX", "Bybit", "Bitstamp", "Gemini"];
const COUNTRIES  = ["the US", "the EU", "the UK", "Singapore", "Japan", "Switzerland", "the UAE", "Hong Kong", "Brazil", "India"];
const FUNDS      = ["BlackRock", "Fidelity", "Ark Invest", "VanEck", "Grayscale", "21Shares", "Bitwise"];
const CORPS      = ["MicroStrategy", "Tesla", "PayPal", "Visa", "Mastercard", "Block", "Square", "Metaplanet", "Semler Scientific"];
const L2S        = ["Arbitrum", "Optimism", "Base", "zkSync", "Starknet", "Polygon zkEVM", "Scroll", "Linea", "Mantle"];

/** Day-based seed  everyone sees the same articles on a given day */
function daySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 0x100000000; };
}
const pick  = <T,>(a: T[], r: () => number): T => a[Math.floor(r() * a.length)];
const range = (min: number, max: number, r: () => number) => min + r() * (max - min);
const fmtB  = (n: number) => `$${n.toFixed(1)}B`;
const fmtM  = (n: number) => `$${n.toFixed(0)}M`;
const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

type Ctx = { coin: AdminCoin; coin2: AdminCoin; r: () => number };

type Tpl = { build: (c: Ctx) => { title: string; summary: string }; source?: string };

const TEMPLATES: Tpl[] = [
  { build: c => {
      const amt = range(0.4, 3.8, c.r);
      return {
        title: `${c.coin.name} Spot ETF Sees ${fmtB(amt)} in Fresh Daily Inflows`,
        summary: `${pick(FUNDS, c.r)} led buying as institutional demand for ${c.coin.symbol} continues to accelerate this week.`,
      };
    } },
  { build: c => {
      const amt = range(80, 620, c.r);
      return {
        title: `Whale Moves ${fmtM(amt)} in ${c.coin.symbol} to Cold Storage`,
        summary: `On-chain trackers flag a large holder moving ${c.coin.symbol} off exchanges, tightening available float.`,
      };
    } },
  { build: c => {
      const pct = range(4, 28, c.r);
      return {
        title: `${c.coin.name} Jumps ${fmtPct(pct)} After ${pick(EXCHANGES, c.r)} Listing`,
        summary: `${pick(EXCHANGES, c.r)} added new spot and perpetual markets for ${c.coin.symbol}, sparking a sharp rally.`,
      };
    } },
  { build: c => {
      return {
        title: `${c.coin.name} Network Activity Hits All-Time High`,
        summary: `Daily active addresses and transaction volume for ${c.coin.symbol} both reached records as usage accelerates.`,
      };
    } },
  { build: c => {
      const ver = `${Math.floor(range(2, 5, c.r))}.${Math.floor(range(0, 9, c.r))}`;
      return {
        title: `${c.coin.name} Announces v${ver} Upgrade  What to Expect`,
        summary: `Core developers outlined the roadmap for ${c.coin.symbol}'s v${ver} release, targeting lower fees and better throughput.`,
      };
    } },
  { build: c => {
      const country = pick(COUNTRIES, c.r);
      return {
        title: `Regulators in ${country} Signal Clearer Path for ${c.coin.category} Assets`,
        summary: `New guidance from ${country} aims to balance innovation with consumer protection for tokens like ${c.coin.symbol}.`,
      };
    } },
  { build: c => {
      const corp = pick(CORPS, c.r);
      const units = Math.floor(range(500, 12000, c.r));
      return {
        title: `${corp} Adds ${units.toLocaleString()} ${c.coin.symbol} to Treasury Reserves`,
        summary: `${corp} disclosed a new position in ${c.coin.name}, joining a growing list of public companies allocating to digital assets.`,
      };
    } },
  { build: c => {
      const pct = range(3, 18, c.r);
      return {
        title: `${c.coin.name} Slips ${fmtPct(-pct)} as Profit-Taking Weighs on Market`,
        summary: `Short-term holders rotated out of ${c.coin.symbol} after recent gains, pressuring price action in early trading.`,
      };
    } },
  { build: c => {
      const l2 = pick(L2S, c.r);
      const pct = range(15, 65, c.r);
      return {
        title: `${l2} Now Settles ${pct.toFixed(0)}% of ${c.coin.name} Transactions`,
        summary: `Rollup adoption on ${c.coin.symbol} accelerated this quarter, with ${l2} leading on cost and throughput.`,
      };
    } },
  { build: c => {
      return {
        title: `${c.coin.name} Developer Activity Rises ${fmtPct(range(8, 42, c.r))} YoY`,
        summary: `GitHub commits and active contributors for ${c.coin.symbol} climbed sharply, per a new Messari report.`,
      };
    } },
  { build: c => {
      const amt = range(200, 2400, c.r);
      return {
        title: `${c.coin.name} Futures Open Interest Reaches ${fmtM(amt)}`,
        summary: `Derivatives markets for ${c.coin.symbol} hit new highs as traders position for the next leg.`,
      };
    } },
  { build: c => {
      return {
        title: `Analysts Split on ${c.coin.name}'s Next Move as Volatility Returns`,
        summary: `Desk strategists see ${c.coin.symbol} testing key levels, with bulls and bears divided on the macro backdrop.`,
      };
    } },
  { build: c => {
      const pct = range(2, 12, c.r);
      return {
        title: `${c.coin.name} Correlation to Equities Falls to ${pct.toFixed(2)}`,
        summary: `${c.coin.symbol} is decoupling from risk assets  a sign of maturing market structure, analysts say.`,
      };
    } },
  { build: c => {
      const amt = range(10, 240, c.r);
      return {
        title: `${pick(EXCHANGES, c.r)} Allocates ${fmtM(amt)} to ${c.coin.name} Ecosystem Fund`,
        summary: `The exchange will back builders and infrastructure projects on ${c.coin.symbol} over the next three years.`,
      };
    } },
  { build: c => {
      const pct = range(5, 35, c.r);
      return {
        title: `Institutional Allocations to ${c.coin.name} Up ${pct.toFixed(0)}% This Quarter`,
        summary: `Family offices and hedge funds increased exposure to ${c.coin.symbol}, per a new CoinShares survey.`,
      };
    } },
  { build: c => {
      const pct = range(3, 20, c.r);
      return {
        title: `${c.coin.name} Volatility Drops to Multi-Month Lows`,
        summary: `Realized volatility for ${c.coin.symbol} fell ${pct.toFixed(1)}% as price consolidated in a tight range.`,
      };
    } },
  { build: c => {
      return {
        title: `New Report: ${c.coin.name} Leads ${c.coin.category} Sector in Network Revenue`,
        summary: `${c.coin.symbol} outpaced peers in fee generation this month, strengthening its fundamental case.`,
      };
    } },
  { build: c => {
      const amt = range(1.2, 8.4, c.r);
      return {
        title: `${c.coin.name} Staking Deposits Pass ${fmtB(amt)}`,
        summary: `Locked supply for ${c.coin.symbol} rose to new highs as yield-seeking investors rotate in.`,
      };
    } },
  { build: c => {
      const amt = range(15, 180, c.r);
      return {
        title: `${pick(FUNDS, c.r)} Files for New ${c.coin.name} Product in ${pick(COUNTRIES, c.r)}`,
        summary: `The filing signals continued institutional appetite for ${c.coin.symbol} exposure via regulated vehicles.`,
      };
    } },
  { build: c => {
      return {
        title: `On-Chain Data: ${c.coin.name} Long-Term Holders Accumulate`,
        summary: `Wallets dormant for 12+ months increased their ${c.coin.symbol} balances this week  a bullish structural signal.`,
      };
    } },
  { build: c => {
      const pct = range(2, 15, c.r);
      return {
        title: `${c.coin.name} Market Dominance Rises to ${(40 + pct).toFixed(1)}%`,
        summary: `${c.coin.symbol}'s share of total crypto market cap hit fresh highs as capital rotated to quality.`,
      };
    } },
  { build: c => {
      return {
        title: `Cross-Chain Bridge Volume for ${c.coin.name} Sets New Record`,
        summary: `Interoperability demand for ${c.coin.symbol} surged as users moved assets across L2 networks.`,
      };
    } },
];

function buildArticle(coin: AdminCoin, coin2: AdminCoin, r: () => number): AdminNews {
  const tpl = pick(TEMPLATES, r);
  const { title, summary } = tpl.build({ coin, coin2, r });
  // Weight toward recent (squared so more articles land in the last few hours)
  const ageMs = Math.pow(r(), 2) * 23 * 3600000;
  return {
    id: uid("n"),
    title,
    source: tpl.source ?? pick(SOURCES, r),
    summary,
    publishedAt: Date.now() - ageMs,
    featured: r() < 0.15,
    enabled: true,
    pinned: false,
    origin: "auto",
    symbol: coin.symbol,
  };
}

/**
 * Generate a fresh batch of realistic articles for today.
 * Deterministic per calendar day  everyone sees the same content.
 * @param coins  active coins (used as templates' subject)
 * @param count  how many articles to produce
 */
export function generateDailyNews(coins: AdminCoin[], count = 8): AdminNews[] {
  if (coins.length < 2) return [];
  const r = makeRng(daySeed());
  const out: AdminNews[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (out.length < count && guard < count * 20) {
    guard++;
    const coin = pick(coins, r);
    const coin2 = pick(coins.filter(c => c.id !== coin.id), r) ?? coin;
    const a = buildArticle(coin, coin2, r);
    if (seen.has(a.title)) continue;
    seen.add(a.title);
    out.push(a);
  }
  return out.sort((x, y) => y.publishedAt - x.publishedAt);
}
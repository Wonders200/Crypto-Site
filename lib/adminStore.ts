import { EXTRA_COIN_DATA } from "./extraCoins";

export type Risk = 1 | 2 | 3 | 4 | 5;
export type Category = "Layer 1" | "Layer 2" | "DeFi" | "Stablecoin" | "Meme" | "Infra" | "Exchange";
export type KycStatus = "unverified" | "pending" | "verified" | "rejected";

export interface AdminCoin {
  id: string; symbol: string; name: string;
  price: number; change24h: number; change7d: number;
  marketCap: number; volume24h: number; circulating: number;
  category: Category; risk: Risk; color: string;
  featured: boolean; enabled: boolean;
}

export interface AdminUser {
  id: string; name: string; email: string;
  tier: "Standard" | "Pro" | "Institutional";
  status: "active" | "suspended" | "pending";
  kycVerified: boolean;
  kycStatus: KycStatus;
  createdAt: number;
  password?: string;
  twoFA?: { enabled: boolean; secret?: string };
}

export interface AdminHolding { id: string; userId: string; coinId: string; amount: number; avgBuyPrice: number; acquiredAt: number; }
export interface AdminOrder {
  id: string; userId: string; coinId: string;
  side: "buy" | "sell"; type: "market" | "limit" | "stop";
  amount: number; price: number;
  status: "pending" | "filled" | "cancelled"; createdAt: number;
}
export interface AdminNews {
  id: string; title: string; source: string; summary: string;
  publishedAt: number; featured: boolean; enabled: boolean;
  pinned: boolean;
  origin: "auto" | "manual";
  symbol?: string;
}
export interface NewsMeta {
  lastRefresh: number;
  autoRefresh: boolean;
  refreshIntervalHours: number;
  maxArticles: number;
  source: "auto" | "api";
}
export interface AdminLearnTopic { id: string; icon: string; title: string; desc: string; order: number; enabled: boolean; }
export interface AdminEarnProduct { id: string; asset: string; apy: number; tier: string; lockup: string; min: string; risk: "Low" | "Med" | "High"; color: string; enabled: boolean; }
export interface AdminPricingTier { id: string; name: string; volume: string; maker: string; taker: string; features: string[]; cta: string; highlight: boolean; enabled: boolean; }
export interface AuditEntry { id: string; at: number; actor: string; action: string; target: string; details?: string; }
export interface SiteSettings {
  siteName: string; tagline: string;
  announcement: string; showAnnouncement: boolean;
  maintenanceMode: boolean;
  heroTitle: string; heroSubtitle: string;
  heroCtaText: string; heroCtaLink: string;
  trustBar: { icon: string; label: string; sub: string }[];
  depositRequirements: { requireTxHash: boolean; requireProof: boolean; };
}
export interface AdminBalance { userId: string; usd: number; locked: number; updatedAt: number; }
export interface AdminTransaction {
  id: string; userId: string;
  type: "deposit" | "withdrawal" | "trade" | "fee" | "reward";
  amount: number; currency: string;
  status: "pending" | "completed" | "failed";
  description: string; createdAt: number;
  txHash?: string;
  proofUrl?: string;
  proofName?: string;
  reference?: string;
  network?: string;
  asset?: string;
}
export interface AdminSession {
  id: string; userId: string; email: string; name: string;
  startedAt: number; lastSeenAt: number; endedAt?: number;
  active: boolean; userAgent: string;
}
export interface AdminDepositAddress {
  id: string; label: string; asset: string; network: string;
  address: string; memo?: string; notes?: string;
  category: "crypto" | "fiat"; enabled: boolean; order: number;
}
export interface AdminTestimonial {
  id: string; name: string; role: string; company: string; quote: string;
  rating: number; avatarColor: string; featured: boolean; enabled: boolean; order: number;
}
export interface AdminCredentials { email: string; password: string; }
export interface DemoUser { email: string; password: string; name: string; tier: "Standard" | "Pro" | "Institutional"; }
export interface AdminKycSubmission {
  id: string; userId: string;
  fullName: string; dateOfBirth: string; country: string;
  address: string; city: string; postalCode: string; phone: string;
  idType: "passport" | "drivers_license" | "national_id";
  idNumber: string;
  idFrontUrl?: string; idBackUrl?: string; selfieUrl?: string;
  status: KycStatus; submittedAt: number;
  reviewedAt?: number; reviewedBy?: string; rejectionReason?: string;
}
export interface AdminEarnPosition {
  id: string; userId: string; productId: string; asset: string;
  amountUsd: number; apy: number;
  startedAt: number; maturesAt?: number;
  status: "pending" | "active" | "withdrawn" | "matured";
  accrued: number; lastAccrualAt: number;
}

export interface Store {
  coins: AdminCoin[];
  users: AdminUser[];
  holdings: AdminHolding[];
  orders: AdminOrder[];
  news: AdminNews[];
  newsMeta: NewsMeta;
  learnTopics: AdminLearnTopic[];
  earnProducts: AdminEarnProduct[];
  pricingTiers: AdminPricingTier[];
  audit: AuditEntry[];
  settings: SiteSettings;
  balances: AdminBalance[];
  transactions: AdminTransaction[];
  sessions: AdminSession[];
  depositAddresses: AdminDepositAddress[];
  testimonials: AdminTestimonial[];
  credentials: AdminCredentials;
  demoUser: DemoUser;
  kycSubmissions: AdminKycSubmission[];
  earnPositions: AdminEarnPosition[];
}

export const DEFAULT_CREDENTIALS: AdminCredentials = {
  email: "admin@cryptosite.io",
  password: "admin123",
};

export const DEFAULT_DEMO_USER: DemoUser = {
  email: "demo@cryptosite.io",
  password: "demo123",
  name: "Demo User",
  tier: "Pro",
};

const now = Date.now();
const day = 86400000;

function seeded(s: string, min: number, max: number): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  const v = ((h >>> 0) % 100000) / 100000;
  return min + v * (max - min);
}

const EXTRA_COINS: AdminCoin[] = EXTRA_COIN_DATA.map(
  ([id, symbol, name, price, marketCap, volume24h, circulating, category, risk, color]) => ({
    id, symbol, name, price, marketCap, volume24h, circulating,
    category: category as Category,
    risk: risk as Risk,
    color,
    change24h: seeded(symbol + "24h", -12, 15),
    change7d: seeded(symbol + "7d", -20, 25),
    featured: false,
    enabled: true,
  })
);

/* =====================================================================
   CLEAN SLATE  all transactional data starts EMPTY.
   Only real customer + admin actions populate the store from here.
   ===================================================================== */
export const DEFAULT_STORE: Store = {
  /* Market data  pre-populated because it's reference data, not user data */
  coins: [
    { id: "bitcoin",   symbol: "BTC",  name: "Bitcoin",   price: 67432.18, change24h:  2.34, change7d:  5.12, marketCap: 1.33e12, volume24h: 4.20e10, circulating: 19.7e6,  category: "Layer 1",   risk: 2, color: "#f7931a", featured: true,  enabled: true },
    { id: "ethereum",  symbol: "ETH",  name: "Ethereum",  price: 3521.76,  change24h: -1.12, change7d:  2.41, marketCap: 4.23e11, volume24h: 1.80e10, circulating: 120.2e6, category: "Layer 1",   risk: 2, color: "#627eea", featured: true,  enabled: true },
    { id: "tether",    symbol: "USDT", name: "Tether",    price: 1.0002,   change24h:  0.01, change7d:  0.00, marketCap: 1.12e11, volume24h: 5.10e10, circulating: 112e9,   category: "Stablecoin",risk: 1, color: "#26a17b", featured: false, enabled: true },
    { id: "solana",    symbol: "SOL",  name: "Solana",    price: 168.42,   change24h: 12.31, change7d: 18.72, marketCap: 7.72e10, volume24h: 4.10e9,  circulating: 458e6,   category: "Layer 1",   risk: 4, color: "#14f195", featured: true,  enabled: true },
    { id: "binancecoin",symbol:"BNB",  name: "BNB",       price: 592.14,   change24h:  0.87, change7d: -1.24, marketCap: 8.83e10, volume24h: 1.70e9,  circulating: 149e6,   category: "Exchange",  risk: 3, color: "#f3ba2f", featured: false, enabled: true },
    { id: "ripple",    symbol: "XRP",  name: "XRP",       price: 0.6214,   change24h: -0.45, change7d:  1.87, marketCap: 3.44e10, volume24h: 1.20e9,  circulating: 55.4e9,  category: "Layer 1",   risk: 3, color: "#23292f", featured: false, enabled: true },
    { id: "usd-coin",  symbol: "USDC", name: "USD Coin",  price: 1.0001,   change24h:  0.00, change7d:  0.01, marketCap: 3.32e10, volume24h: 6.20e9,  circulating: 33.2e9,  category: "Stablecoin",risk: 1, color: "#2775ca", featured: false, enabled: true },
    { id: "cardano",   symbol: "ADA",  name: "Cardano",   price: 0.4512,   change24h:  1.98, change7d:  3.42, marketCap: 1.61e10, volume24h: 4.30e8,  circulating: 35.7e9,  category: "Layer 1",   risk: 4, color: "#0033ad", featured: false, enabled: true },
    { id: "dogecoin",  symbol: "DOGE", name: "Dogecoin",  price: 0.1421,   change24h: -2.14, change7d: -5.31, marketCap: 2.05e10, volume24h: 9.80e8,  circulating: 144e9,   category: "Meme",      risk: 5, color: "#c2a633", featured: false, enabled: true },
    { id: "avalanche-2",symbol:"AVAX", name: "Avalanche", price: 34.87,    change24h:  3.42, change7d:  6.18, marketCap: 1.38e10, volume24h: 5.50e8,  circulating: 395e6,   category: "Layer 1",   risk: 4, color: "#e84142", featured: false, enabled: true },
    { id: "polkadot",  symbol: "DOT",  name: "Polkadot",  price: 6.24,     change24h: -1.87, change7d:  0.42, marketCap: 9.10e9,  volume24h: 2.10e8,  circulating: 1.46e9,  category: "Layer 1",   risk: 4, color: "#e6007a", featured: false, enabled: true },
    { id: "chainlink", symbol: "LINK", name: "Chainlink", price: 14.62,    change24h:  4.11, change7d:  7.83, marketCap: 8.70e9,  volume24h: 3.90e8,  circulating: 595e6,   category: "Infra",     risk: 3, color: "#2a5ada", featured: false, enabled: true },
    { id: "polygon",   symbol: "MATIC",name: "Polygon",   price: 0.7214,   change24h: -3.02, change7d: -6.14, marketCap: 7.10e9,  volume24h: 2.80e8,  circulating: 9.88e9,  category: "Layer 2",   risk: 3, color: "#8247e5", featured: false, enabled: true },
    { id: "uniswap",   symbol: "UNI",  name: "Uniswap",   price: 10.42,    change24h:  1.24, change7d:  4.12, marketCap: 6.25e9,  volume24h: 1.90e8,  circulating: 600e6,   category: "DeFi",      risk: 4, color: "#ff007a", featured: false, enabled: true },
    { id: "litecoin",  symbol: "LTC",  name: "Litecoin",  price: 84.12,    change24h: -0.62, change7d:  1.14, marketCap: 6.30e9,  volume24h: 3.20e8,  circulating: 74.8e6,  category: "Layer 1",   risk: 3, color: "#a6a9aa", featured: false, enabled: true },
    { id: "near",      symbol: "NEAR", name: "NEAR",      price: 5.14,     change24h:  6.72, change7d: 11.24, marketCap: 5.60e9,  volume24h: 2.60e8,  circulating: 1.09e9,  category: "Layer 1",   risk: 4, color: "#00c1de", featured: false, enabled: true },
    { id: "aptos",     symbol: "APT",  name: "Aptos",     price: 8.92,     change24h:  2.14, change7d:  4.31, marketCap: 4.20e9,  volume24h: 1.40e8,  circulating: 471e6,   category: "Layer 1",   risk: 4, color: "#4a4a4a", featured: false, enabled: true },
    { id: "arbitrum",  symbol: "ARB",  name: "Arbitrum",  price: 1.12,     change24h:  3.81, change7d:  5.42, marketCap: 3.90e9,  volume24h: 2.10e8,  circulating: 3.48e9,  category: "Layer 2",   risk: 4, color: "#12aaff", featured: false, enabled: true },
    { id: "optimism",  symbol: "OP",   name: "Optimism",  price: 2.31,     change24h: -1.42, change7d:  1.87, marketCap: 2.50e9,  volume24h: 1.30e8,  circulating: 1.08e9,  category: "Layer 2",   risk: 4, color: "#ff0420", featured: false, enabled: true },
    { id: "aave",      symbol: "AAVE", name: "Aave",      price: 132.44,   change24h:  2.87, change7d:  8.12, marketCap: 1.98e9,  volume24h: 9.20e7,  circulating: 14.9e6,  category: "DeFi",      risk: 4, color: "#b6509e", featured: false, enabled: true },
    ...EXTRA_COINS,
  ],

  /* Customers  starts EMPTY. Only real signups populate this. */
  users: [],

  /* All customer activity  starts EMPTY. */
  holdings: [],
  orders: [],
  balances: [],
  transactions: [],
  sessions: [],
  kycSubmissions: [],
  earnPositions: [],

  /* Audit trail  starts EMPTY. Only real actions get logged. */
  audit: [],

  /* News  starts EMPTY (auto-generates on first visit) */
  news: [],
  newsMeta: {
    lastRefresh: 0,
    autoRefresh: true,
    refreshIntervalHours: 24,
    maxArticles: 60,
    source: "auto",
  },

  /* Reference / config data  kept (not transactional) */
  learnTopics: [
    { id: "l_001", icon: "", title: "Blockchain Basics", desc: "How distributed ledgers work, what a block is, and why decentralization matters.", order: 1, enabled: true },
    { id: "l_002", icon: "", title: "Wallets & Keys",    desc: "Hot vs. cold storage, seed phrases, and best practices for securing your crypto.",  order: 2, enabled: true },
    { id: "l_003", icon: "", title: "Reading Charts",    desc: "Candlesticks, volume, support/resistance  the foundation of technical analysis.",  order: 3, enabled: true },
    { id: "l_004", icon: "", title: "Tokens vs Coins",   desc: "Understand the difference between native assets and smart-contract tokens.",        order: 4, enabled: true },
    { id: "l_005", icon: "", title: "Layer 2 Scaling",   desc: "Rollups, sidechains, and how modern networks handle high throughput.",              order: 5, enabled: true },
    { id: "l_006", icon: "", title: "Avoiding Scams",   desc: "Common rug pulls and phishing tactics  plus how to spot them early.",              order: 6, enabled: true },
  ],
      earnProducts: [
    { id: "e_001", asset: "USDC",  apy: 2500, tier: "Flexible", lockup: "None",    min: "$2,500", risk: "Low",  color: "#2775ca", enabled: true },
    { id: "e_002", asset: "USDT",  apy: 2200, tier: "Flexible", lockup: "None",    min: "$2,500", risk: "Low",  color: "#26a17b", enabled: true },
    { id: "e_003", asset: "ETH",   apy: 2000, tier: "Staking",  lockup: "None",    min: "$2,500", risk: "Med",  color: "#627eea", enabled: true },
    { id: "e_004", asset: "SOL",   apy: 3500, tier: "Staking",  lockup: "2 days",  min: "$2,500", risk: "Med",  color: "#14f195", enabled: true },
    { id: "e_005", asset: "MATIC", apy: 2400, tier: "Staking",  lockup: "3 days",  min: "$2,500", risk: "Med",  color: "#8247e5", enabled: true },
    { id: "e_006", asset: "DOT",   apy: 5000, tier: "Staking",  lockup: "28 days", min: "$2,500", risk: "High", color: "#e6007a", enabled: true },
  ],
  pricingTiers: [
    { id: "p_001", name: "Standard",      volume: "$0  $10k / mo",  maker: "0.15%", taker: "0.25%", features: ["Spot trading", "Portfolio tracking", "Market data"], cta: "Start free", highlight: false, enabled: true },
    { id: "p_002", name: "Pro",           volume: "$10k  $1M / mo", maker: "0.08%", taker: "0.15%", features: ["Everything in Standard", "Advanced charts", "Priority support", "API access"], cta: "Upgrade", highlight: true, enabled: true },
    { id: "p_003", name: "Institutional", volume: "$1M+ / mo",       maker: "0.02%", taker: "0.06%", features: ["Everything in Pro", "Dedicated account manager", "OTC desk", "Custom custody"], cta: "Contact sales", highlight: false, enabled: true },
  ],
  depositAddresses: [
    { id: "da_btc",        label: "Bitcoin",     asset: "BTC",   network: "Bitcoin", address: "3FMxfQvgKcGdA9j4hbQNz6t54BwSGWjdX8", notes: "Send only BTC to this address. Minimum 0.0005 BTC. 1 confirmation required.", category: "crypto", enabled: true, order: 1 },
    { id: "da_usdt_trc20", label: "Tether USD",  asset: "USDT",  network: "TRC20",   address: "TLZCfjNHtqk2srGFAxkn2mB3oBxEjkakT3", notes: "Tron network only. Sending from another chain may result in permanent loss.", category: "crypto", enabled: true, order: 2 },
    { id: "da_usdc_erc20", label: "USD Coin",    asset: "USDC",  network: "ERC20",   address: "0x60713bac68c77833d8d3dcceb225559b35b2f3d0", notes: "Ethereum mainnet only. Gas fees apply.", category: "crypto", enabled: true, order: 3 },
    { id: "da_paypal",     label: "PayPal USD",  asset: "PYUSD", network: "ERC20",   address: "0x60713bac68c77833d8d3dcceb225559b35b2f3d0", notes: "PYUSD is an ERC20 stablecoin on Ethereum mainnet.", category: "crypto", enabled: true, order: 4 },
  ],
  testimonials: [
    { id: "tm_001", name: "Sarah Chen",       role: "Chief Investment Officer", company: "Meridian Capital",          quote: "CryptoSite's execution quality and risk analytics are the closest thing to an institutional prime broker I've found in digital assets.", rating: 5, avatarColor: "#5b7cfa", featured: true,  enabled: true, order: 1 },
    { id: "tm_002", name: "Marcus Reinhardt", role: "Portfolio Manager",        company: "Aldgate Family Office",     quote: "We moved seven figures from a legacy custodian and the transition took under a week.", rating: 5, avatarColor: "#00d18c", featured: true,  enabled: true, order: 2 },
    { id: "tm_003", name: "Priya Raman",      role: "Head of Digital Assets",   company: "Northshore Advisors",       quote: "The API is clean, rate limits are generous, and support responds within minutes.", rating: 5, avatarColor: "#f5a623", featured: false, enabled: true, order: 3 },
    { id: "tm_004", name: "David Okonkwo",    role: "Founder",                  company: "Vantage Crypto Fund",       quote: "We run a $40M book through CryptoSite. Order fills are fast and the depth is real.", rating: 5, avatarColor: "#b6509e", featured: false, enabled: true, order: 4 },
    { id: "tm_005", name: "Elena Vasquez",    role: "Private Investor",         company: "",                           quote: "I've tried six platforms. This is the only one where I never had to read a help article.", rating: 5, avatarColor: "#14f195", featured: false, enabled: true, order: 5 },
    { id: "tm_006", name: "James Whitfield",  role: "Director of Trading",      company: "Kingsway Securities",       quote: "Latency is competitive with top-tier venues. The risk engine lets us stress-test before we execute.", rating: 5, avatarColor: "#e84142", featured: false, enabled: true, order: 6 },
    { id: "tm_007", name: "Rachel Kim",       role: "Chief Compliance Officer", company: "Ironbridge Asset Management", quote: "Our auditors signed off in a single session.", rating: 5, avatarColor: "#2775ca", featured: false, enabled: true, order: 7 },
    { id: "tm_008", name: "Tomás Ferreira",   role: "Head of Treasury",         company: "Lumen Payments Group",      quote: "We run corporate treasury across four currencies here.", rating: 5, avatarColor: "#ff7a00", featured: false, enabled: true, order: 8 },
    { id: "tm_009", name: "Anika Patel",      role: "Managing Partner",         company: "Polaris Digital Ventures",  quote: "The mobile experience is genuinely excellent.", rating: 5, avatarColor: "#e84142", featured: false, enabled: true, order: 9 },
    { id: "tm_010", name: "Henrik Lindqvist", role: "Senior Trader",            company: "Kestrel Capital Markets",   quote: "Order book depth is honest and the OTC desk prices tighter than two of our traditional prime brokers.", rating: 5, avatarColor: "#00d18c", featured: false, enabled: true, order: 10 },
  ],
  settings: {
    siteName: "CryptoSite",
    tagline: "Institutional Crypto Investing",
    announcement: " New: USDC Flexible Earn is now live at 5.2% APY.",
    showAnnouncement: true,
    maintenanceMode: false,
    heroTitle: "Institutional crypto,",
    heroSubtitle: "Trade 200+ digital assets with deep liquidity, real-time risk analytics, and yield products  inside a platform designed for serious capital.",
    heroCtaText: "Open an Account",
    heroCtaLink: "/signup",
    trustBar: [
      { icon: "Shield",    label: "SOC 2 Type II",   sub: "Audited annually" },
      { icon: "Lock",      label: "95% Cold Storage", sub: "Institutional custody" },
      { icon: "Award",     label: "Licensed MSB",    sub: "FinCEN registered" },
      { icon: "Building2", label: "$2.1B AUM",       sub: "Across 42 countries" },
    ],
    depositRequirements: {
      requireTxHash: true,
      requireProof: true,
    },
  },
  credentials: DEFAULT_CREDENTIALS,
  demoUser: DEFAULT_DEMO_USER,
};

export function uid(prefix = "id") {
  return prefix + "_" + Math.random().toString(36).slice(2, 10);
}
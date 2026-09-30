const COINGECKO_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY ?? "";
const NEWS_KEY = process.env.NEWS_API_KEY ?? "";
const WALLET_KEY = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export const hasLiveMarketData = Boolean(COINGECKO_KEY);
export const hasLiveNews = Boolean(NEWS_KEY);
export const hasWalletConnect = Boolean(WALLET_KEY);

// Placeholders for real integrations. Swap in real fetches when keys exist.
export async function fetchLiveMarket(): Promise<null> {
  if (!hasLiveMarketData) return null;
  return null;
}

export async function fetchLiveNews(): Promise<null> {
  if (!hasLiveNews) return null;
  return null;
}

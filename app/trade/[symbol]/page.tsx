"use client";
import CoinIcon from "@/components/CoinIcon";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLivePrices } from "@/hooks/useLivePrices";
import CandlestickChart from "@/components/CandlestickChart";
import OrderBook from "@/components/OrderBook";
import TradeForm from "@/components/TradeForm";
import Sparkline from "@/components/Sparkline";
import BackButton from "@/components/BackButton";
import KycBanner from "@/components/KycBanner";
import LiveDate from "@/components/LiveDate";
import TradeHistory from "@/components/TradeHistory";
import { formatCurrency, formatPercent, formatCompact } from "@/lib/format";
import { useWatchlist, usePortfolio } from "@/app/providers";
import { Star } from "lucide-react";

export default function TradePage() {
  const params = useParams<{ symbol: string }>();
  const coins = useLivePrices();
  const { has, toggle } = useWatchlist();
  const symbol = (params.symbol ?? "btc").toLowerCase();
  const coin = coins.find(c => c.symbol.toLowerCase() === symbol || c.id === symbol) ?? coins[0];

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
      {/* Back button */}
      <div className="mb-3 -ml-2">
        <BackButton fallback="/markets" label="Back to markets" />
      </div>

      {/* KYC banner */}
      <div className="mb-4">
        <KycBanner compact />
      </div>

      {/* Header */}
      <div className="panel p-5 mb-5 flex flex-wrap items-center gap-5">
        <CoinIcon symbol={coin.symbol} color={coin.color} size={32} />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{coin.name}</h1>
            <span className="pill pill-gray">{coin.symbol}/USDT</span>
            <button onClick={() => toggle(coin.id)} aria-label="Watch" className="hover:scale-110 transition">
              <Star size={16} fill={has(coin.id) ? "var(--amber)" : "none"} stroke={has(coin.id) ? "var(--amber)" : "var(--muted)"} />
            </button>
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{coin.category}  Risk {coin.risk}/5</div>
        </div>

        <div className="flex-1" />

        <Metric label="Price"     value={formatCurrency(coin.price)} accent />
        <Metric label="24h"       value={formatPercent(coin.change24h)} positive={coin.change24h >= 0} />
        <Metric label="7d"        value={formatPercent(coin.change7d)} positive={coin.change7d >= 0} />
        <Metric label="Market Cap" value={formatCompact(coin.marketCap)} />
        <Metric label="Volume 24h" value={formatCompact(coin.volume24h)} />
        <div className="hidden md:block">
          <div className="text-xs mb-1" style={{ color: "var(--muted)" }}>7d</div>
          <Sparkline data={coin.sparkline} positive={coin.change7d >= 0} width={90} height={28} />
        </div>
      </div>

      {/* Grid */}
      <div className="grid lg:grid-cols-[1fr_340px_320px] gap-5">
        <div className="lg:col-span-1 min-w-0">
          <CandlestickChart symbol={coin.symbol} price={coin.price} />
          <RecentTrades coin={coin} />
        </div>
        <OrderBook price={coin.price} symbol={coin.symbol} />
        <TradeForm coin={coin} />
      </div>

      <div className="mt-5">
        <TradeHistory symbol={coin.symbol} limit={20} />
      </div>

      <PositionSummary coinId={coin.id} />
    </div>
  );
}

function Metric({ label, value, positive, accent }: { label: string; value: string; positive?: boolean; accent?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>{label}</div>
      <div className="mono font-semibold mt-1"
        style={{ color: accent ? "var(--text)" : positive === undefined ? "var(--text)" : positive ? "var(--green)" : "var(--red)" }}>
        {value}
      </div>
    </div>
  );
}

interface Trade { side: "buy" | "sell"; price: number; size: number; time: number; }

function RecentTrades({ coin }: { coin: { price: number; symbol: string } }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const gen = (): Trade[] => {
      return Array.from({ length: 20 }).map((_, i) => {
        const x = Math.sin(i * 999) * 10000;
        const r = x - Math.floor(x);
        const side: "buy" | "sell" = r > 0.5 ? "buy" : "sell";
        const price = coin.price * (1 + (r - 0.5) * 0.0008);
        const size = 0.01 + r * 2.5;
        return { side, price, size, time: Date.now() - i * 42000 };
      });
    };
    setTrades(gen());
    const timer = setInterval(() => setTrades(gen()), 3000);
    return () => clearInterval(timer);
  }, [coin.price]);

  const fmtTime = (ts: number) => {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

  return (
    <div className="panel mt-5">
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <h3 className="font-semibold text-sm">Recent Trades</h3>
        <span className="text-xs" style={{ color: "var(--muted)" }}>{coin.symbol}/USDT</span>
      </div>
      <div className="px-4 py-2 grid grid-cols-3 text-xs font-medium" style={{ color: "var(--muted)" }}>
        <span>Price</span><span className="text-right">Size</span><span className="text-right">Time</span>
      </div>
      <div className="max-h-64 overflow-y-auto scrollbar-thin">
        {!mounted || trades.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs" style={{ color: "var(--muted-2)" }}>
            Loading recent trades
          </div>
        ) : (
          trades.map((t, i) => (
            <div key={i} className="grid grid-cols-3 px-4 py-1.5 text-xs mono hover:bg-white/[0.02]">
              <span style={{ color: t.side === "buy" ? "var(--green)" : "var(--red)" }}>{t.price.toFixed(4)}</span>
              <span className="text-right">{t.size.toFixed(4)}</span>
              <span className="text-right" style={{ color: "var(--muted)" }}>{fmtTime(t.time)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function PositionSummary({ coinId }: { coinId: string }) {
  const { holdings } = usePortfolio();
  const h = holdings.find(x => x.coinId === coinId);
  if (!h) return null;
  return (
    <div className="panel mt-5 p-5">
      <h3 className="font-semibold text-sm mb-4">Your Position</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        <div><div className="text-xs uppercase" style={{ color: "var(--muted)" }}>Quantity</div><div className="mono font-semibold mt-1">{h.amount}</div></div>
        <div><div className="text-xs uppercase" style={{ color: "var(--muted)" }}>Avg cost</div><div className="mono font-semibold mt-1">{formatCurrency(h.avgBuyPrice)}</div></div>
        <div><div className="text-xs uppercase" style={{ color: "var(--muted)" }}>Acquired</div><div className="mono font-semibold mt-1"><LiveDate ts={h.acquiredAt} mode="date" /></div></div>
      </div>
    </div>
  );
}
"use client";
import { useLivePrices } from "@/hooks/useLivePrices";
import { usePortfolio } from "@/app/providers";
import { computePortfolio, computeAllocation, computeRiskMetrics } from "@/lib/analytics";
import AllocationDonut from "@/components/AllocationDonut";
import PerformanceChart from "@/components/PerformanceChart";
import PortfolioTable from "@/components/PortfolioTable";
import TradeHistory from "@/components/TradeHistory";
import KycBanner from "@/components/KycBanner";
import BackButton from "@/components/BackButton";
import { formatCurrency, formatPercent } from "@/lib/format";
import Link from "next/link";
import { TrendingUp, TrendingDown, Wallet, Activity, Plus, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const coins = useLivePrices();
  const { holdings } = usePortfolio();
  const portfolio = computePortfolio(holdings, coins);
  const allocation = computeAllocation(holdings, coins);
  const risk = computeRiskMetrics(holdings, coins);

  const plPositive = portfolio.pl >= 0;
  const returnPositive = portfolio.plPct >= 0;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-6">
      {/* Header */}
      <div className="-ml-2 -mb-2">
        <BackButton fallback="/" label="Back to home" />
      </div>

      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            Live valuation, risk analytics, and everything you've traded.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/earn" className="btn btn-ghost text-sm">
            <Sparkles size={14} /> Earn yield
          </Link>
          <Link href="/markets" className="btn btn-primary text-sm">
            <Plus size={14} /> Add position
          </Link>
        </div>
      </div>

      {/* KYC banner */}
      <KycBanner />

      {/* Summary cards  4 equal columns */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total value"
          value={formatCurrency(portfolio.value)}
          sub={`${holdings.length} position${holdings.length === 1 ? "" : "s"}`}
          icon={<Wallet size={14} />}
        />
        <SummaryCard
          label="Total cost"
          value={formatCurrency(portfolio.cost)}
          sub="What you paid"
          icon={<Activity size={14} />}
        />
        <SummaryCard
          label="Unrealized P/L"
          value={`${plPositive ? "+" : ""}${formatCurrency(portfolio.pl)}`}
          sub={plPositive ? "You're up " : "Down from entry"}
          tone={plPositive ? "green" : "red"}
          icon={plPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        />
        <SummaryCard
          label="Total return"
          value={formatPercent(portfolio.plPct)}
          sub="Since purchase"
          tone={returnPositive ? "green" : "red"}
          icon={returnPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        />
      </div>

      {/* Risk metrics */}
      <div className="panel p-6">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-lg font-semibold">Risk analytics</h2>
          <span className="pill pill-blue">30d  annualized</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <RiskStat label="Volatility"      value={`${risk.annualVol.toFixed(2)}%`} />
          <RiskStat label="Sharpe ratio"    value={risk.sharpe.toFixed(2)} good={risk.sharpe > 1} />
          <RiskStat label="Max drawdown"    value={`-${risk.maxDrawdown.toFixed(2)}%`} />
          <RiskStat label="Weighted risk"   value={`${risk.riskScore.toFixed(2)} / 5`} good={risk.riskScore < 3} />
          <RiskStat label="Expected return" value={`${risk.annualReturn >= 0 ? "+" : ""}${risk.annualReturn.toFixed(2)}%`} good={risk.annualReturn > 0} />
        </div>
      </div>

      {/* Allocation + Performance */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="panel p-6">
          <h2 className="text-lg font-semibold mb-5">Allocation</h2>
          <AllocationDonut data={allocation} total={portfolio.value} />
        </div>
        <div className="panel p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">Performance</h2>
            <span className="pill pill-green">+{(risk.annualReturn / 4).toFixed(2)}% QTD</span>
          </div>
          <PerformanceChart />
        </div>
      </div>

      {/* Holdings */}
      <div>
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-lg font-semibold">Your holdings</h2>
          <Link href="/markets" className="text-xs font-semibold" style={{ color: "var(--green)" }}>
            Add more 
          </Link>
        </div>
        {holdings.length === 0 ? (
          <div className="panel p-12 text-center">
            <p style={{ color: "var(--muted)" }}>No holdings yet. Place a trade to get started.</p>
            <Link href="/markets" className="btn btn-primary inline-flex mt-5 text-sm">
              Browse markets
            </Link>
          </div>
        ) : (
          <PortfolioTable portfolio={holdings} coins={coins} />
        )}
      </div>

      {/* Trade history */}
      <div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Recent trades</h2>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              Every buy and sell you've placed, newest first.
            </p>
          </div>
        </div>
        <TradeHistory limit={20} />
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  tone = "default",
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "default" | "green" | "red";
  icon?: React.ReactNode;
}) {
  const color = tone === "green" ? "var(--green)" : tone === "red" ? "var(--red)" : "var(--text)";
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>
        {icon} {label}
      </div>
      <div className="text-2xl font-bold mono mt-2" style={{ color }}>{value}</div>
      <div className="text-xs mt-1" style={{ color: "var(--muted-2)" }}>{sub}</div>
    </div>
  );
}

function RiskStat({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>{label}</div>
      <div className="text-xl font-semibold mono mt-2"
        style={{ color: good === undefined ? "var(--text)" : good ? "var(--green)" : "var(--amber)" }}>
        {value}
      </div>
    </div>
  );
}
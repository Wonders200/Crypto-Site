"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLivePrices } from "@/hooks/useLivePrices";
import { usePortfolio, useAuth } from "@/app/providers";
import { useI18n } from "@/lib/i18n";
import { computePortfolio, computeAllocation, computeRiskMetrics } from "@/lib/analytics";
import AllocationDonut from "@/components/AllocationDonut";
import PerformanceChart from "@/components/PerformanceChart";
import PortfolioTable from "@/components/PortfolioTable";
import TradeHistory from "@/components/TradeHistory";
import KycBanner from "@/components/KycBanner";
import BackButton from "@/components/BackButton";
import { formatCurrency, formatPercent } from "@/lib/format";
import Link from "next/link";
import { TrendingUp, TrendingDown, Wallet, Activity, Plus, Sparkles, BarChart3 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useI18n();
  const coins = useLivePrices();
  const { holdings } = usePortfolio();
  const portfolio = computePortfolio(holdings, coins);
  const allocation = computeAllocation(holdings, coins);
  const risk = computeRiskMetrics(holdings, coins);

  const plPositive = portfolio.pl >= 0;
  const returnPositive = portfolio.plPct >= 0;
  const hasHoldings = holdings.length > 0;

  // Require sign-in
  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <div className="panel p-10">
          <Wallet size={32} style={{ color: "var(--muted)", margin: "0 auto" }} />
          <h1 className="text-xl font-bold mt-4">{t("dashboard.signInTitle")}</h1>
          <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>{t("dashboard.signInSubtitle")}</p>
          <Link href="/login" className="btn btn-primary inline-block mt-6">{t("dashboard.signIn")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6">
      <div className="-ml-2 -mb-2">
        <BackButton fallback="/" label={t("dashboard.backHome")} />
      </div>

      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t("dashboard.title")}</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            {t("dashboard.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/earn" className="btn btn-ghost text-sm">
            <Sparkles size={14} /> {t("dashboard.earnYield")}
          </Link>
          <Link href="/markets" className="btn btn-primary text-sm">
            <Plus size={14} /> {t("dashboard.addPosition")}
          </Link>
        </div>
      </div>

      <KycBanner />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label={t("dashboard.totalValue")}
          value={formatCurrency(portfolio.value)}
          sub={`${holdings.length} ${holdings.length === 1 ? t("dashboard.position") : t("dashboard.positions")}`}
          icon={<Wallet size={14} />}
        />
        <SummaryCard
          label={t("dashboard.totalCost")}
          value={formatCurrency(portfolio.cost)}
          sub={t("dashboard.whatYouPaid")}
          icon={<Activity size={14} />}
        />
        <SummaryCard
          label={t("dashboard.unrealizedPL")}
          value={`${plPositive ? "+" : ""}${formatCurrency(portfolio.pl)}`}
          sub={!hasHoldings ? t("dashboard.noPositionsYet") : plPositive ? t("dashboard.youreUp") : t("dashboard.downFromEntry")}
          tone={!hasHoldings ? "default" : plPositive ? "green" : "red"}
          icon={plPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        />
        <SummaryCard
          label={t("dashboard.totalReturn")}
          value={formatPercent(portfolio.plPct)}
          sub={!hasHoldings ? t("dashboard.addPositionToTrack") : t("dashboard.sincePurchase")}
          tone={!hasHoldings ? "default" : returnPositive ? "green" : "red"}
          icon={returnPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        />
      </div>

      {/* Risk analytics  only show real data, no fake numbers */}
      <div className="panel p-6">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-lg font-semibold">{t("dashboard.riskAnalytics")}</h2>
          <span className="pill pill-blue">{t("dashboard.thirtyDayAnnualized")}</span>
        </div>
        {!hasHoldings ? (
          <div className="text-center py-10">
            <BarChart3 size={32} style={{ color: "var(--muted)", margin: "0 auto" }} />
            <p className="mt-4 text-sm font-semibold">{t("dashboard.noAnalytics")}</p>
            <p className="text-xs mt-1 max-w-md mx-auto" style={{ color: "var(--muted)" }}>
              {t("dashboard.analyticsDescription")}
            </p>
            <Link href="/markets" className="btn btn-primary inline-flex mt-5 text-sm">
              <Plus size={14} /> {t("dashboard.addFirstPosition")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <RiskStat label={t("dashboard.volatility")}      value={`${risk.annualVol.toFixed(2)}%`} />
            <RiskStat label={t("dashboard.sharpe")}    value={risk.sharpe.toFixed(2)} good={risk.sharpe > 1} />
            <RiskStat label={t("dashboard.maxDrawdown")}    value={`-${risk.maxDrawdown.toFixed(2)}%`} />
            <RiskStat label={t("dashboard.weightedRisk")}   value={`${risk.riskScore.toFixed(2)} / 5`} good={risk.riskScore < 3} />
            <RiskStat label={t("dashboard.expectedReturn")} value={`${risk.annualReturn >= 0 ? "+" : ""}${risk.annualReturn.toFixed(2)}%`} good={risk.annualReturn > 0} />
          </div>
        )}
      </div>

      {/* Allocation + Performance */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="panel p-6">
          <h2 className="text-lg font-semibold mb-5">{t("dashboard.allocation")}</h2>
          <AllocationDonut data={allocation} total={portfolio.value} />
        </div>
        <div className="panel p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">{t("dashboard.performance")}</h2>
            {hasHoldings && <span className="pill pill-green">+{(risk.annualReturn / 4).toFixed(2)}% QTD</span>}
          </div>
          <PerformanceChart />
        </div>
      </div>

      {/* Holdings */}
      <div>
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-lg font-semibold">{t("dashboard.yourHoldings")}</h2>
          <Link href="/markets" className="text-xs font-semibold" style={{ color: "var(--green)" }}>
            {t("dashboard.addMore")}
          </Link>
        </div>
        {holdings.length === 0 ? (
          <div className="panel p-12 text-center">
            <p style={{ color: "var(--muted)" }}>{t("dashboard.noHoldings")}</p>
            <Link href="/markets" className="btn btn-primary inline-flex mt-5 text-sm">
              {t("dashboard.browseMarkets")}
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
            <h2 className="text-lg font-semibold">{t("dashboard.recentTrades")}</h2>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              {t("dashboard.recentTradesDesc")}
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
      <div className="text-xl md:text-2xl font-bold mono mt-2" style={{ color }}>{value}</div>
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
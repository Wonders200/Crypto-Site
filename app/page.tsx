"use client";
import Link from "next/link";
import { ArrowRight, ShieldCheck, BarChart3, Zap, PieChart, Globe, Lock, Sparkles, UserPlus, Wallet, TrendingUp } from "lucide-react";
import { useLivePrices } from "@/hooks/useLivePrices";
import { useAdminStore } from "./providers";
import TrustBar from "@/components/TrustBar";
import MarketTable from "@/components/MarketTable";
import Testimonials from "@/components/Testimonials";
import WelcomeBanner from "@/components/WelcomeBanner";

export default function HomePage() {
  const coins = useLivePrices();
  const { store } = useAdminStore();
  const top = coins.slice(0, 10);
  const s = store.settings;

  const features = [
    { icon: Zap,         t: "Trade in Seconds",       d: "Simple, powerful tools. Place your first order in under a minute  no manual needed." },
    { icon: PieChart,    t: "See Your Whole Picture", d: "Live portfolio value, gains, and risk  always in plain language, always up to date." },
    { icon: BarChart3,   t: "Built-in Guardrails",    d: "Real-time risk scores and alerts help you make confident decisions, not rushed ones." },
    { icon: ShieldCheck, t: "Your Money, Kept Safe",  d: "95% cold storage, SOC 2 audited controls, and multi-signature protection by default." },
    { icon: Globe,       t: "Invest From Anywhere",   d: "200+ assets, 42 countries, and funding in 12 currencies  all from one account." },
    { icon: Lock,        t: "Security You Don't Notice", d: "2FA, hardware keys, and withdrawal whitelists quietly working in the background." },
  ];

  const steps = [
    { icon: UserPlus,  n: "1", t: "Create your free account", d: "Takes about 30 seconds. No minimum deposit, no credit check." },
    { icon: Wallet,    n: "2", t: "Add funds your way",       d: "Bank transfer, debit card, or crypto  whatever's easiest for you." },
    { icon: TrendingUp,n: "3", t: "Start investing",          d: "Buy your first asset with as little as $1. Learn as you go." },
  ];

  return (
    <div>
      {/* Announcement */}
      {s.showAnnouncement && (
        <div className="text-center py-2 text-sm"
          style={{ background: "var(--green-soft)", color: "var(--green)", borderBottom: "1px solid var(--border)" }}>
          {s.announcement}
        </div>
      )}

      {/* Welcome banner (first-time visitors only) */}
      <WelcomeBanner />

      {/* Hero */}
      <section className="relative overflow-hidden grid-bg">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 30% 20%, rgba(63,185,80,0.10), transparent 50%), radial-gradient(circle at 80% 60%, rgba(124,143,245,0.10), transparent 50%)" }} />
        <div className="relative max-w-[1400px] mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="pill pill-green inline-flex mb-5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--green)" }} />
              $2.1B invested by 42,000+ customers
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight">
              {s.heroTitle}<br />
              <span className="gradient-text">made simple.</span>
            </h1>
            <p className="mt-6 text-lg max-w-xl leading-relaxed" style={{ color: "var(--muted)" }}>
              Buy, sell, and grow your crypto with a platform that feels easy from the very first click  and powerful enough to keep you for years.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={s.heroCtaLink} className="btn btn-primary text-[15px] px-7 py-3.5">
                {s.heroCtaText} <ArrowRight size={16} />
              </Link>
              <Link href="/markets" className="btn btn-ghost text-[15px] px-7 py-3.5">
                Browse live prices
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-xs" style={{ color: "var(--muted)" }}>
              <div className="flex items-center gap-2"><ShieldCheck size={14} style={{ color: "var(--green)" }} /> Bank-grade security</div>
              <div className="flex items-center gap-2"><Lock size={14} style={{ color: "var(--green)" }} /> 95% cold storage</div>
              <div className="flex items-center gap-2"><Globe size={14} style={{ color: "var(--green)" }} /> Available in 42 countries</div>
            </div>
          </div>

          {/* Portfolio preview card */}
          <div className="panel p-6 relative card-interactive">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--green)" }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Your portfolio  live</span>
              </div>
              <span className="pill pill-blue">BTC / USDT</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { l: "Portfolio value", v: "$45,231.18", s: " +5.4% today", p: true },
                { l: "Today's profit",  v: "+$2,312.44", s: "Nice day ",   p: true },
                { l: "Risk score",      v: "2.14",       s: "Comfortable",   p: true },
                { l: "Downside risk",   v: "-7.2%",      s: "Last 90 days" },
              ].map(x => (
                <div key={x.l} className="rounded-xl p-4" style={{ background: "var(--panel-2)", border: "1px solid var(--border)" }}>
                  <div className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>{x.l}</div>
                  <div className="text-xl font-bold mono mt-1.5">{x.v}</div>
                  <div className="text-xs mt-1" style={{ color: x.p ? "var(--green)" : "var(--muted)" }}>{x.s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <TrustBar />

      {/* How it works  NEW friendly section */}
      <section className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="pill pill-green inline-flex mb-4">
            <Sparkles size={11} /> Takes about a minute
          </span>
          <h2 className="text-4xl font-bold">Getting started is easy</h2>
          <p className="mt-4 text-lg" style={{ color: "var(--muted)" }}>
            Three simple steps. No paperwork. No waiting on hold.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {steps.map(({ icon: Icon, n, t, d }, i) => (
            <div key={t} className="relative">
              <div className="panel p-7 h-full card-interactive">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "var(--green-dim)", color: "var(--green)" }}>
                    <Icon size={20} />
                  </div>
                  <div className="text-3xl font-bold gradient-text">{n}</div>
                </div>
                <h3 className="font-semibold text-lg">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{d}</p>
              </div>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 z-10">
                  <ArrowRight size={16} style={{ color: "var(--muted-2)" }} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/signup" className="btn btn-primary text-[15px] px-8 py-3.5">
            Create your free account <ArrowRight size={16} />
          </Link>
          <p className="text-xs mt-3" style={{ color: "var(--muted-2)" }}>
            No credit card needed. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-[1400px] mx-auto px-6 pb-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-bold">Everything you need, nothing you don't</h2>
          <p className="mt-4 text-lg" style={{ color: "var(--muted)" }}>
            Powerful tools with a friendly face  designed for real people, not trading floors.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, t, d }) => (
            <div key={t} className="panel p-6 card-interactive">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-lg">{t}</h3>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--muted)" }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Market preview */}
      <section className="max-w-[1400px] mx-auto px-6 pb-24">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold">Live prices, right now</h2>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
              Real-time quotes across the assets people actually trade.
            </p>
          </div>
          <Link href="/markets" className="text-sm font-semibold flex items-center gap-1" style={{ color: "var(--green)" }}>
            See all 200+ assets <ArrowRight size={14} />
          </Link>
        </div>
        <MarketTable coins={top} />
      </section>

      {/* Final CTA */}
      <section className="max-w-[1400px] mx-auto px-6 pb-24">
        <div className="relative overflow-hidden panel p-12 md:p-16 text-center">
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="relative">
            <div className="text-4xl mb-3"></div>
            <h2 className="text-4xl md:text-5xl font-bold">Ready when you are.</h2>
            <p className="mt-5 text-lg max-w-xl mx-auto" style={{ color: "var(--muted)" }}>
              Join thousands of everyday investors building long-term wealth. No minimums, no surprises.
            </p>
            <div className="mt-9 flex flex-wrap gap-3 justify-center">
              <Link href="/signup" className="btn btn-primary text-[15px] px-8 py-3.5">
                Start investing today <ArrowRight size={16} />
              </Link>
              <Link href="/pricing" className="btn btn-ghost text-[15px] px-8 py-3.5">
                See our fees
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
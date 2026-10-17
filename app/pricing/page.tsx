"use client";
import Link from "next/link";
import { useAdminStore } from "@/app/providers";
import { useI18n } from "@/lib/i18n";

export default function PricingPage() {
  const { store } = useAdminStore();
  const { t } = useI18n();
  const tiers = store.pricingTiers.filter(t => t.enabled);
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h1 className="text-4xl font-bold">{t("pricing.title")}</h1>
        <p className="mt-4 text-lg" style={{ color: "var(--muted)" }}>{t("pricing.subtitle")}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map(t => (
          <div key={t.id} className="panel p-7 relative" style={t.highlight ? { border: "1px solid var(--green)" } : {}}>
            {t.highlight && <span className="pill pill-green absolute -top-3 left-7" style={{ background: "var(--green)", color: "#0a0b0f" }}>{t("pricing.popular")}</span>}
            <h2 className="text-xl font-bold">{t.name}</h2>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{t.volume}</p>
            <div className="mt-7 grid grid-cols-2 gap-4">
              <div><div className="text-xs uppercase" style={{ color: "var(--muted)" }}>{t("pricing.maker")}</div><div className="text-2xl font-bold mono mt-1" style={{ color: "var(--green)" }}>{t.maker}</div></div>
              <div><div className="text-xs uppercase" style={{ color: "var(--muted)" }}>{t("pricing.taker")}</div><div className="text-2xl font-bold mono mt-1">{t.taker}</div></div>
            </div>
            <ul className="mt-7 space-y-2.5 text-sm">
              {t.features.map(f => (<li key={f} className="flex items-start gap-2"><span style={{ color: "var(--green)" }}></span><span>{f}</span></li>))}
            </ul>
            <Link href="/signup" className="block text-center w-full mt-8 py-3 rounded-lg font-semibold text-sm"
              style={t.highlight ? { background: "var(--green)", color: "#0a0b0f" } : { background: "var(--panel-2)", border: "1px solid var(--border-2)" }}>
              {t.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
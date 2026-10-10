"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();

  const cols = [
    { titleKey: "footer.col.product", links: [
      ["nav.markets", "/markets"], ["nav.trade", "/trade/btc"], ["nav.dashboard", "/dashboard"],
      ["nav.balance", "/balance"], ["nav.earn", "/earn"], ["nav.pricing", "/pricing"],
    ]},
    { titleKey: "footer.col.company", links: [
      ["footer.link.about", "/about"], ["nav.news", "/news"],
      ["footer.link.careers", "/careers"], ["footer.link.contact", "/contact"],
    ]},
    { titleKey: "footer.col.resources", links: [
      ["nav.learn", "/learn"], ["footer.link.apiDocs", "/api-docs"],
      ["footer.link.status", "/status"], ["footer.link.blog", "/blog"],
    ]},
    { titleKey: "footer.col.legal", links: [
      ["footer.link.terms", "/terms"], ["footer.link.privacy", "/privacy"],
      ["footer.link.risk", "/risk-disclosures"],
    ]},
  ];

  return (
    <footer className="border-t mt-16 md:mt-24" style={{ borderColor: "var(--border)", background: "var(--panel)" }}>
      <div className="max-w-[1400px] mx-auto px-5 md:px-6 py-10 md:py-14 grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-10">
        <div className="col-span-2 md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-black"
              style={{ background: "linear-gradient(135deg, var(--green), var(--accent))" }}>
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="ApexVault">
                <path d="M16 6.5 L23.5 25 L19.8 25 L16 15.2 L12.2 25 L8.5 25 Z" fill="#0a0b0f" />
                <path d="M11.6 20 L20.4 20" stroke="#0a0b0f" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-bold text-lg">ApexVault</span>
          </div>
          <p className="text-sm mt-4 leading-relaxed" style={{ color: "var(--muted)" }}>
            {t("footer.description")}
          </p>
          <div className="flex gap-2 mt-5 flex-wrap">
            <span className="pill pill-green">SOC 2 Type II</span>
            <span className="pill pill-blue">ISO 27001</span>
          </div>
        </div>

        {cols.map(col => (
          <div key={col.titleKey}>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3 md:mb-4" style={{ color: "var(--muted)" }}>
              {t(col.titleKey)}
            </h4>
            <ul className="space-y-2 md:space-y-2.5">
              {col.links.map(([key, href]) => (
                <li key={key}>
                  <Link href={href} className="text-sm transition hover:opacity-80 block py-0.5">{t(key)}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-[1400px] mx-auto px-5 md:px-6 py-5 md:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs" style={{ color: "var(--muted)" }}>
          <p>&copy; {new Date().getFullYear()} ApexVault Inc. {t("footer.rights")}</p>
          <p className="max-w-3xl leading-relaxed">{t("footer.disclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}

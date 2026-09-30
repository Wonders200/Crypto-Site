import Link from "next/link";

export default function Footer() {
  const cols = [
    { title: "Product", links: [["Markets", "/markets"], ["Trade", "/trade/btc"], ["Dashboard", "/dashboard"], ["Balance", "/balance"], ["Earn", "/earn"], ["Pricing", "/pricing"]] },
    { title: "Company", links: [["About", "/about"], ["News", "/news"], ["Careers", "/about"], ["Contact", "/contact"]] },
    { title: "Resources", links: [["Learn", "/learn"], ["API Docs", "/learn"], ["Status", "/about"], ["Blog", "/news"]] },
    { title: "Legal", links: [["Terms", "/legal/terms"], ["Privacy", "/legal/privacy"], ["Risk Disclosures", "/legal/disclosures"]] },
  ];
  return (
    <footer className="border-t mt-24" style={{ borderColor: "var(--border)", background: "var(--panel)" }}>
      <div className="max-w-[1400px] mx-auto px-6 py-14 grid md:grid-cols-6 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-black"
              style={{ background: "linear-gradient(135deg, var(--green), var(--accent))" }}>C</div>
            <span className="font-bold text-lg">CryptoSite</span>
          </div>
          <p className="text-sm mt-4 leading-relaxed" style={{ color: "var(--muted)" }}>
            Institutional-grade crypto investing. Trade 200+ assets, earn yield, and monitor risk  all with a single account.
          </p>
          <div className="flex gap-2 mt-5">
            <span className="pill pill-green">SOC 2 Type II</span>
            <span className="pill pill-blue">ISO 27001</span>
          </div>
        </div>
        {cols.map(col => (
          <div key={col.title}>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--muted)" }}>{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map(([label, href]) => (
                <li key={label}><Link href={href} className="text-sm transition hover:opacity-80">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-[1400px] mx-auto px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs" style={{ color: "var(--muted)" }}>
          <p> {new Date().getFullYear()} CryptoSite Inc. All rights reserved.</p>
          <p className="max-w-3xl">Not a registered broker-dealer or investment advisor. Cryptocurrency investments carry risk of loss.</p>
        </div>
      </div>
    </footer>
  );
}
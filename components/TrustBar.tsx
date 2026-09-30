import { Shield } from "lucide-react";

export default function TrustBar() {
  const items = [
    { icon: Shield,    label: "SOC 2 Type II", sub: "Audited annually" },
    { icon: Lock,      label: "95% Cold Storage", sub: "Institutional custody" },
    { icon: Award,     label: "Licensed MSB", sub: "FinCEN registered" },
    { icon: Building2, label: "$2.1B AUM", sub: "Across 42 countries" },
  ];
  return (
    <section className="border-y" style={{ borderColor: "var(--border)", background: "var(--panel)" }}>
      <div className="max-w-[1400px] mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
              <Icon size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold">{label}</div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
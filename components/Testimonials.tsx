"use client";
import { useMemo } from "react";
import { useAdminStore } from "@/app/providers";
import { Star, Quote } from "lucide-react";

export default function Testimonials() {
  const { store } = useAdminStore();
  const items = useMemo(() => {
    const list = store?.testimonials ?? [];
    return [...list].filter(t => t.enabled).sort((a, b) => a.order - b.order);
  }, [store?.testimonials]);

  if (items.length === 0) return null;

  const featured = items.filter(t => t.featured);
  const grid = featured.length > 0 ? featured : items;

  const cols = grid.length === 1 ? "max-w-md mx-auto" : grid.length === 2 ? "md:grid-cols-2 max-w-4xl mx-auto" : "md:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="max-w-[1400px] mx-auto px-6 py-24">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="pill pill-blue inline-flex mb-4">Trusted by institutions</span>
        <h2 className="text-4xl font-bold">What serious investors say</h2>
        <p className="mt-4 text-lg" style={{ color: "var(--muted)" }}>
          Funds, family offices, and private investors managing real capital on ApexVault.
        </p>
      </div>

      <div className={`grid gap-6 ${cols}`}>
        {grid.map(t => (
          <figure
            key={t.id}
            className="panel p-7 relative flex flex-col hover:border-[color:var(--border-2)] transition"
          >
            <Quote size={28} className="absolute top-6 right-6 opacity-10" style={{ color: "var(--accent)" }} />

            <div className="flex gap-0.5 mb-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  fill={i < t.rating ? "var(--amber)" : "none"}
                  stroke={i < t.rating ? "var(--amber)" : "var(--muted-2)"}
                />
              ))}
            </div>

            <blockquote className="flex-1 text-[15px] leading-relaxed" style={{ color: "var(--text)" }}>
              &ldquo;{t.quote}&rdquo;
            </blockquote>

            <figcaption className="mt-6 pt-6 flex items-center gap-3" style={{ borderTop: "1px solid var(--border)" }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
                style={{ background: t.avatarColor, color: "#0a0b0f" }}
              >
                {t.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">{t.name}</div>
                <div className="text-xs truncate" style={{ color: "var(--muted)" }}>
                  {t.role}{t.company ? `, ${t.company}` : ""}
                </div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
"use client";
import { useState, useRef, useEffect } from "react";
import { useI18n, LOCALES, LOCALE_NAMES } from "@/lib/i18n";
import { Globe, Check } from "lucide-react";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label="Change language"
        className={`flex items-center gap-1.5 rounded-lg transition hover:opacity-90 ${compact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"}`}
        style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }}
      >
        <Globe size={compact ? 12 : 14} />
        <span className="font-medium">{LOCALE_NAMES[locale]}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 rounded-xl shadow-2xl z-[200] overflow-hidden"
          style={{ background: "var(--panel)", border: "1px solid var(--border-2)", minWidth: 200 }}
        >
          {LOCALES.map(l => (
            <button
              key={l}
              type="button"
              onClick={() => { setLocale(l); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition hover:bg-white/[0.04]"
              style={{ color: l === locale ? "var(--accent)" : "var(--text)" }}
            >
              <span className="flex-1">{LOCALE_NAMES[l]}</span>
              {l === locale && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
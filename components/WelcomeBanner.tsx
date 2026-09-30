"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/app/providers";
import { Sparkles, X, ArrowRight } from "lucide-react";

export default function WelcomeBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem("cs.welcomeDismissed") === "1");
    } catch { setDismissed(false); }
  }, []);

  const close = () => {
    setDismissed(true);
    try { localStorage.setItem("cs.welcomeDismissed", "1"); } catch {}
  };

  if (dismissed || user) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-6 float-in">
      <div
        className="rounded-2xl p-5 flex flex-wrap items-center gap-4"
        style={{
          background: "linear-gradient(92deg, rgba(63,185,80,0.12), rgba(124,143,245,0.10))",
          border: "1px solid var(--border-2)",
        }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "var(--green-dim)", color: "var(--green)" }}>
          <Sparkles size={18} />
        </div>
        <div className="flex-1 min-w-[220px]">
          <div className="font-semibold text-sm">Welcome </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            New here? Browse live markets, or create a free account to start building a portfolio in under a minute.
          </div>
        </div>
        <Link href="/markets" className="btn btn-ghost text-xs">
          Explore markets
        </Link>
        <Link href="/signup" className="btn btn-primary text-xs">
          Create free account <ArrowRight size={13} />
        </Link>
        <button onClick={close} className="p-1.5 rounded-lg hover:bg-white/5" aria-label="Dismiss">
          <X size={14} style={{ color: "var(--muted)" }} />
        </button>
      </div>
    </div>
  );
}
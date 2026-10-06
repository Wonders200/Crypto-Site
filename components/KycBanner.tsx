"use client";
import Link from "next/link";
import { useAuth, useAdminStore } from "@/app/providers";
import { kycStatusFromStore, kycLabel, kycDescription } from "@/lib/kyc";
import { ShieldCheck, Clock, XCircle, ShieldAlert, ArrowRight } from "lucide-react";

export default function KycBanner({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth();
  const { store } = useAdminStore();

  if (!user) return null;

  const demoEmail = store.demoUser?.email ?? "demo@apexvault.io";
  const matchedUser = store.users.find(u => u.email.toLowerCase() === user.email.toLowerCase())
    ?? store.users.find(u => u.email.toLowerCase() === demoEmail.toLowerCase());

  const submission = (store.kycSubmissions ?? []).find(s => s.userId === matchedUser?.id);
  const status = kycStatusFromStore(store, matchedUser);
  if (status === "verified") return null;

  const config = {
    unverified: {
      icon: ShieldAlert,
      accent: "#7c8ff5",
      bg: "rgba(124,143,245,0.10)",
      border: "rgba(124,143,245,0.35)",
      cta: "Verify identity",
      ctaHref: "/kyc",
    },
    pending: {
      icon: Clock,
      accent: "#e3b341",
      bg: "rgba(227,179,65,0.10)",
      border: "rgba(227,179,65,0.35)",
      cta: "View status",
      ctaHref: "/kyc",
    },
    rejected: {
      icon: XCircle,
      accent: "#f85149",
      bg: "rgba(248,81,73,0.10)",
      border: "rgba(248,81,73,0.35)",
      cta: "Resubmit",
      ctaHref: "/kyc",
    },
  }[status];

  if (!config) return null;

  const Icon = config.icon;

  return (
    <div
      className={`rounded-2xl ${compact ? "p-3.5" : "p-5"} flex items-center gap-4 flex-wrap`}
      style={{ background: config.bg, border: `1px solid ${config.border}` }}
    >
      <div
        className={`${compact ? "w-8 h-8" : "w-11 h-11"} rounded-xl flex items-center justify-center shrink-0`}
        style={{ background: config.accent, color: "#0a0b0f" }}
      >
        <Icon size={compact ? 14 : 18} />
      </div>
      <div className="flex-1 min-w-[220px]">
        <div className={`font-semibold ${compact ? "text-xs" : "text-sm"}`}>{kycLabel(status)}</div>
        {!compact && (
          <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            {kycDescription(status)}
          </div>
        )}
      </div>
      <Link
        href={config.ctaHref}
        className={`${compact ? "text-[11px] px-3 py-1.5" : "text-xs px-4 py-2"} rounded-lg font-semibold flex items-center gap-1.5 shrink-0 transition hover:opacity-90`}
        style={{ background: config.accent, color: "#0a0b0f" }}
      >
        {config.cta} <ArrowRight size={11} />
      </Link>
    </div>
  );
}

export function KycGateInline({ action }: { action: string }) {
  const { user } = useAuth();
  const { store } = useAdminStore();
  if (!user) return null;

  const demoEmail = store.demoUser?.email ?? "demo@apexvault.io";
  const matchedUser = store.users.find(u => u.email.toLowerCase() === user.email.toLowerCase())
    ?? store.users.find(u => u.email.toLowerCase() === demoEmail.toLowerCase());

  const submission = (store.kycSubmissions ?? []).find(s => s.userId === matchedUser?.id);
  const status = kycStatusFromStore(store, matchedUser);
  if (status === "verified") return null;

  const pending = status === "pending";
  const rejected = status === "rejected";

  const bg = pending ? "rgba(227,179,65,0.10)" : rejected ? "rgba(248,81,73,0.10)" : "rgba(124,143,245,0.10)";
  const border = pending ? "rgba(227,179,65,0.4)" : rejected ? "rgba(248,81,73,0.4)" : "rgba(124,143,245,0.4)";
  const accent = pending ? "#e3b341" : rejected ? "#f85149" : "#7c8ff5";

  const Icon = pending ? Clock : rejected ? XCircle : ShieldAlert;

  return (
    <div
      className="rounded-xl p-4 flex items-center gap-3 flex-wrap"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: accent, color: "#0a0b0f" }}
      >
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-[180px]">
        <div className="text-sm font-semibold">
          {pending ? "Verification in review" : rejected ? "Verification rejected" : "Verify your identity to " + action}
        </div>
        <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
          {pending
            ? "We're reviewing your documents. You'll be able to " + action + " once approved."
            : rejected
            ? "Please review the reason and resubmit your documents."
            : "This is required by regulation before you can " + action + "."}
        </div>
      </div>
      <Link
        href="/kyc"
        className="text-xs font-semibold px-4 py-2 rounded-lg shrink-0 transition hover:opacity-90"
        style={{ background: accent, color: "#0a0b0f" }}
      >
        {pending ? "View status" : rejected ? "Resubmit" : "Verify now"}
      </Link>
    </div>
  );
}
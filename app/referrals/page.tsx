'use client';
import { useI18n } from "@/lib/i18n";
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, useAdminStore, useToast } from '@/app/providers';
import { formatCurrency } from '@/lib/format';
import BackButton from '@/components/BackButton';
import { Gift, Copy, Check, Users, DollarSign, Share2, UserPlus } from 'lucide-react';

export default function ReferralsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { store } = useAdminStore();
  const { push } = useToast();
  const { t } = useI18n();
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { if (!user) router.replace("/login"); }, [user, router]);

  const me: any = user ? (store.users ?? []).find((u: any) => u.email?.toLowerCase() === user.email.toLowerCase()) : null;
  const myCode = me?.referralCode ?? "";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://apexvault.icu";
  const link = myCode ? baseUrl + "/signup?ref=" + myCode : "";

  const referrals = useMemo(() => {
    if (!me) return [];
    return (store.users ?? []).filter((u: any) => u.referredBy === me.id).sort((a: any, b: any) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [store.users, me]);

  const totalEarned = referrals.reduce((s: number, r: any) => s + (r.referralBonusUsd ?? 0), 0);

  if (!user || !me) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <div className="panel p-10">
          <Gift size={32} style={{ color: "var(--muted)", margin: "0 auto" }} />
          <h1 className="text-xl font-bold mt-4">{t("referrals.signIn")}</h1>
          <Link href="/login" className="btn btn-primary inline-block mt-6">{t("referrals.signInBtn")}</Link>
        </div>
      </div>
    );
  }

  if (!myCode) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">
        <BackButton fallback="/dashboard" label={t("referrals.backToDashboard")} />
        <div className="panel p-8 mt-6 text-center">
          <Gift size={32} style={{ color: "var(--accent)", margin: "0 auto" }} />
          <h1 className="text-xl font-bold mt-4">{t("referrals.activating")}</h1>
          <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>{t("referrals.activatingMsg")}</p>
        </div>
      </div>
    );
  }

  const copy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
      push({ kind: "success", title: t("referrals.copiedToast") });
    } catch {}
  };

  const share = async () => {
    const shareData = { title: t("referrals.shareTitle"), text: t("referrals.shareText"), url: link };
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share(shareData);
      } else {
        await navigator.clipboard.writeText(link);
        push({ kind: "success", title: t("referrals.linkCopied") });
      }
    } catch {}
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6">
      <div className="-ml-2 -mb-2"><BackButton fallback="/dashboard" label={t("referrals.backToDashboard")} /></div>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Gift size={26} style={{ color: "var(--green)" }} /> {t("referrals.title")}
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          {t("referrals.subtitle")}
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}><Users size={13} /> {t("referrals.stats.friends")}</div>
          <div className="text-2xl font-bold mono mt-2">{referrals.length}</div>
        </div>
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}><DollarSign size={13} /> {t("referrals.stats.earned")}</div>
          <div className="text-2xl font-bold mono mt-2" style={{ color: "var(--green)" }}>{formatCurrency(totalEarned)}</div>
        </div>
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}><Share2 size={13} /> {t("referrals.stats.code")}</div>
          <div className="text-2xl font-bold mono mt-2">{myCode}</div>
        </div>
      </div>

      <div className="panel p-6">
        <h2 className="text-lg font-semibold mb-3">{t("referrals.linkTitle")}</h2>
        <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
          {t("referrals.linkDesc")}
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input readOnly value={link}
            className="flex-1 px-3 py-2.5 rounded-lg text-sm mono outline-none"
            style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
          <div className="flex gap-2">
            <button onClick={() => copy(link, "link")} className="btn btn-ghost text-sm">
              {copied === "link" ? <><Check size={12} /> {t("referrals.copied")}</> : <><Copy size={12} /> {t("referrals.copy")}</>}
            </button>
            <button onClick={share} className="btn btn-primary text-sm">
              <Share2 size={12} /> {t("referrals.share")}
            </button>
          </div>
        </div>
      </div>

      <div className="panel p-6">
        <h2 className="text-lg font-semibold mb-4">{t("referrals.listTitle")}</h2>
        {referrals.length === 0 ? (
          <div className="text-center py-10">
            <UserPlus size={32} style={{ color: "var(--muted)", margin: "0 auto" }} />
            <p className="mt-4 text-sm font-semibold">{t("referrals.noReferrals")}</p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{t("referrals.noReferralsDesc")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th className="text-left py-2 px-2 text-xs uppercase" style={{ color: "var(--muted)" }}>{t("referrals.colName")}</th>
                <th className="text-left py-2 px-2 text-xs uppercase" style={{ color: "var(--muted)" }}>{t("referrals.colEmail")}</th>
                <th className="text-left py-2 px-2 text-xs uppercase" style={{ color: "var(--muted)" }}>{t("referrals.colJoined")}</th>
                <th className="text-right py-2 px-2 text-xs uppercase" style={{ color: "var(--muted)" }}>{t("referrals.colBonus")}</th>
              </tr></thead>
              <tbody>{referrals.map((r: any) => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="py-2 px-2">{r.name}</td>
                  <td className="py-2 px-2" style={{ color: "var(--muted)" }}>{r.email}</td>
                  <td className="py-2 px-2" style={{ color: "var(--muted)" }}>{new Date(r.createdAt ?? 0).toLocaleDateString()}</td>
                  <td className="py-2 px-2 text-right mono" style={{ color: "var(--green)" }}>{formatCurrency(r.referralBonusUsd ?? 0)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

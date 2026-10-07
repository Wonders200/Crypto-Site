'use client';
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
          <h1 className="text-xl font-bold mt-4">Sign in to view referrals</h1>
          <Link href="/login" className="btn btn-primary inline-block mt-6">Sign in</Link>
        </div>
      </div>
    );
  }

  if (!myCode) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">
        <BackButton fallback="/dashboard" label="Back to dashboard" />
        <div className="panel p-8 mt-6 text-center">
          <Gift size={32} style={{ color: "var(--accent)", margin: "0 auto" }} />
          <h1 className="text-xl font-bold mt-4">Activating your referral code</h1>
          <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>If this persists, contact support.</p>
        </div>
      </div>
    );
  }

  const copy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
      push({ kind: "success", title: "Copied" });
    } catch {}
  };

  const share = async () => {
    const shareData = { title: "Join ApexVault", text: "Use my link to sign up for ApexVault", url: link };
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share(shareData);
      } else {
        await navigator.clipboard.writeText(link);
        push({ kind: "success", title: "Link copied" });
      }
    } catch {}
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-10 space-y-6">
      <div className="-ml-2 -mb-2"><BackButton fallback="/dashboard" label="Back to dashboard" /></div>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Gift size={26} style={{ color: "var(--green)" }} /> Referrals
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          Invite friends and earn rewards when they join and trade.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}><Users size={13} /> Referred friends</div>
          <div className="text-2xl font-bold mono mt-2">{referrals.length}</div>
        </div>
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}><DollarSign size={13} /> Total earned</div>
          <div className="text-2xl font-bold mono mt-2" style={{ color: "var(--green)" }}>{formatCurrency(totalEarned)}</div>
        </div>
        <div className="panel p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}><Share2 size={13} /> Your code</div>
          <div className="text-2xl font-bold mono mt-2">{myCode}</div>
        </div>
      </div>

      <div className="panel p-6">
        <h2 className="text-lg font-semibold mb-3">Your referral link</h2>
        <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
          Share this link. When someone signs up using it, they'll be linked to your account.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input readOnly value={link}
            className="flex-1 px-3 py-2.5 rounded-lg text-sm mono outline-none"
            style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
          <div className="flex gap-2">
            <button onClick={() => copy(link, "link")} className="btn btn-ghost text-sm">
              {copied === "link" ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
            </button>
            <button onClick={share} className="btn btn-primary text-sm">
              <Share2 size={12} /> Share
            </button>
          </div>
        </div>
      </div>

      <div className="panel p-6">
        <h2 className="text-lg font-semibold mb-4">Your referrals</h2>
        {referrals.length === 0 ? (
          <div className="text-center py-10">
            <UserPlus size={32} style={{ color: "var(--muted)", margin: "0 auto" }} />
            <p className="mt-4 text-sm font-semibold">No referrals yet</p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>Share your link to start earning.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th className="text-left py-2 px-2 text-xs uppercase" style={{ color: "var(--muted)" }}>Name</th>
                <th className="text-left py-2 px-2 text-xs uppercase" style={{ color: "var(--muted)" }}>Email</th>
                <th className="text-left py-2 px-2 text-xs uppercase" style={{ color: "var(--muted)" }}>Joined</th>
                <th className="text-right py-2 px-2 text-xs uppercase" style={{ color: "var(--muted)" }}>Bonus</th>
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

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, useToast } from "@/app/providers";
import { apiFetch } from "@/lib/apiClient";
import BackButton from "@/components/BackButton";
import { Shield, ShieldCheck, Mail, User as UserIcon, KeyRound } from "lucide-react";
import AvatarUploader from "@/components/AvatarUploader";

export default function SettingsPage() {
  const { user } = useAuth();
  const { push } = useToast();
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const res = await apiFetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setEnabled(Boolean(data?.user?.twoFA?.enabled));
      }
    })();
  }, [user]);

  const start2FA = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      const data = await res.json();
      if (res.ok) {
        setQr(data.qr);
        setSecret(data.secret);
      } else {
        push({ kind: "error", title: "Error", message: data?.error });
      }
    } finally { setLoading(false); }
  };

  const confirm2FA = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm", token: code }),
      });
      const data = await res.json();
      if (res.ok) {
        setEnabled(true);
        setQr(null);
        setSecret(null);
        setCode("");
        push({ kind: "success", title: "2FA enabled" });
      } else {
        push({ kind: "error", title: "Invalid code", message: data?.error });
      }
    } finally { setLoading(false); }
  };

  const disable2FA = async () => {
    if (!confirm("Disable 2FA? Your account will be less secure.")) return;
    setLoading(true);
    try {
      const res = await apiFetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disable" }),
      });
      if (res.ok) {
        setEnabled(false);
        push({ kind: "success", title: "2FA disabled" });
      }
    } finally { setLoading(false); }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <div className="panel p-10">
          <UserIcon size={32} style={{ color: "var(--muted)", margin: "0 auto" }} />
          <h1 className="text-xl font-bold mt-4">Sign in to view settings</h1>
          <Link href="/login" className="btn btn-primary inline-block mt-6">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
      <div className="-ml-2 -mb-3"><BackButton fallback="/dashboard" label="Back to dashboard" /></div>

      <h1 className="text-3xl font-bold">Account settings</h1>

      <AvatarUploader />

      <div className="panel p-6">
        <h2 className="font-semibold flex items-center gap-2"><Mail size={16} /> Profile</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Name</div>
            <div className="mt-1">{user.name}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Email</div>
            <div className="mt-1 mono">{user.email}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Tier</div>
            <div className="mt-1">{user.tier}</div>
          </div>
        </div>
      </div>

      <div className="panel p-6">
        <div className="flex items-center gap-2 mb-4">
          {enabled ? <ShieldCheck size={16} style={{ color: "var(--green)" }} /> : <Shield size={16} style={{ color: "var(--muted)" }} />}
          <h2 className="font-semibold">Two-factor authentication</h2>
          {enabled && <span className="pill pill-green ml-auto">ENABLED</span>}
        </div>

        {enabled === null ? (
          <div className="text-sm" style={{ color: "var(--muted)" }}>Checking status</div>
        ) : enabled ? (
          <>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Your account is protected with an authenticator app. You'll be asked for a 6-digit code when signing in.
            </p>
            <button onClick={disable2FA} disabled={loading} className="btn btn-ghost mt-4">Disable 2FA</button>
          </>
        ) : qr ? (
          <>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
            </p>
            <div className="mt-4 flex flex-col items-center gap-4">
              <img src={qr} alt="2FA QR code" className="rounded-xl bg-white p-3" style={{ width: 220 }} />
              {secret && (
                <div className="text-center">
                  <div className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Or enter manually</div>
                  <div className="mono text-sm mt-1 select-all">{secret}</div>
                </div>
              )}
              <div className="w-full max-w-xs">
                <div className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>Enter the 6-digit code from your app</div>
                <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric" maxLength={6} placeholder="123456"
                  className="w-full px-3 py-2.5 rounded-lg text-center text-lg tracking-widest outline-none mono"
                  style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
                <button onClick={confirm2FA} disabled={code.length !== 6 || loading}
                  className="w-full mt-3 btn btn-primary disabled:opacity-40">
                  {loading ? "Verifying" : "Confirm and enable"}
                </button>
                <button onClick={() => { setQr(null); setSecret(null); setCode(""); }}
                  className="w-full mt-2 btn btn-ghost text-xs">Cancel</button>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Add an extra layer of security to your account. You'll need an authenticator app.
            </p>
            <button onClick={start2FA} disabled={loading} className="btn btn-primary mt-4 flex items-center gap-2">
              <KeyRound size={14} /> {loading ? "Preparing" : "Enable 2FA"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
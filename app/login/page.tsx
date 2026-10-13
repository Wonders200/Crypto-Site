"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, useToast } from "@/app/providers";
import { useI18n } from "@/lib/i18n";
import { setTokens } from "@/lib/apiClient";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const { push } = useToast();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [need2FA, setNeed2FA] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) router.replace("/dashboard"); }, [user, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, totp: totp || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.needs2FA) {
          setNeed2FA(true);
          push({ kind: "info", title: t("login.twoFARequired"), message: t("login.twoFAMessage") });
        } else {
          push({ kind: "error", title: t("login.failed"), message: data?.error ?? t("login.unknownError") });
        }
        setLoading(false);
        return;
      }
      setTokens(data.accessToken, data.refreshToken);
      login({ email: data.user.email, name: data.user.name, tier: data.user.tier });
      push({ kind: "success", title: t("login.welcomeToast") });
      router.push("/dashboard");
    } catch (e) {
      push({ kind: "error", title: t("login.networkError"), message: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="panel p-8">
        <h1 className="text-2xl font-bold">{t("login.title")}</h1>
        <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>{t("login.subtitle")}</p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block">
            <div className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>{t("login.email")}</div>
            <input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t("login.emailPlaceholder")} required
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none mono"
              style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
          </label>
          <label className="block">
            <div className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>{t("login.password")}</div>
            <input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t("login.passwordPlaceholder")} required
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none mono"
              style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
          </label>
          {need2FA && (
            <label className="block">
              <div className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>{t("login.twoFA")}</div>
              <input type="text" inputMode="numeric" maxLength={6} value={totp}
                onChange={e => setTotp(e.target.value.replace(/\D/g, ""))} placeholder="123456"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none mono text-center text-lg tracking-widest"
                style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
            </label>
          )}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-sm text-black disabled:opacity-60 transition"
            style={{ background: "var(--green)" }}>
            {loading ? t("login.signingIn") : t("login.submit")}
          </button>
        </form>

        <p className="text-sm mt-6 text-center" style={{ color: "var(--muted)" }}>
          {t("login.noAccount")} <Link href="/signup" className="font-semibold" style={{ color: "var(--green)" }}>{t("login.createOne")}</Link>
        </p>
      </div>
    </div>
  );
}
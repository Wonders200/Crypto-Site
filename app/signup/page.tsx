"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, useToast } from "@/app/providers";
import { useI18n } from "@/lib/i18n";
import { setTokens } from "@/lib/apiClient";

export default function SignupPage() {
  const [refCode, setRefCode] = useState("");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const r = params.get("ref");
    if (r) setRefCode(r);
  }, []);
  const router = useRouter();
  const { login, user } = useAuth();
  const { push } = useToast();
  const { t } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) router.replace("/dashboard"); }, [user, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      push({ kind: "error", title: t("signup.passwordTooShort"), message: t("signup.passwordMin") });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        referralCode: refCode })
      });
      const data = await res.json();
      if (!res.ok) {
        push({ kind: "error", title: t("signup.failed"), message: data?.error ?? t("signup.unknownError") });
        setLoading(false);
        return;
      }
      setTokens(data.accessToken, data.refreshToken);
      login({ email: data.user.email, name: data.user.name, tier: data.user.tier });
      push({ kind: "success", title: t("signup.success"), message: t("signup.welcomeMessage") });
      router.push("/dashboard");
    } catch (e) {
      push({ kind: "error", title: t("signup.networkError"), message: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="panel p-8">
        <h1 className="text-2xl font-bold">{t("signup.title")}</h1>
        <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>{t("signup.subtitle")}</p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block">
            <div className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>{t("signup.name")}</div>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t("signup.namePlaceholder")} required
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
          </label>
          <label className="block">
            <div className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>{t("signup.email")}</div>
            <input type="email" autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder={t("signup.emailPlaceholder")} required
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none mono"
              style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
          </label>
          <label className="block">
            <div className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>{t("signup.password")}</div>
            <input type="password" autoComplete="new-password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={t("signup.passwordPlaceholder")} required
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none mono"
              style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
          </label>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-sm text-black disabled:opacity-60 transition"
            style={{ background: "var(--green)" }}>
            {loading ? t("signup.creating") : t("signup.submit")}
          </button>
        </form>

        <p className="text-sm mt-6 text-center" style={{ color: "var(--muted)" }}>
          {t("signup.alreadyHave")} <Link href="/login" className="font-semibold" style={{ color: "var(--green)" }}>{t("signup.signIn")}</Link>
        </p>
      </div>
    </div>
  );
}
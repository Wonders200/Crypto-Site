"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, useToast } from "@/app/providers";
import { setTokens } from "@/lib/apiClient";

export default function SignupPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const { push } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) router.replace("/dashboard"); }, [user, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      push({ kind: "error", title: "Password too short", message: "At least 6 characters." });
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
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        push({ kind: "error", title: "Signup failed", message: data?.error ?? "Unknown error" });
        setLoading(false);
        return;
      }
      setTokens(data.accessToken, data.refreshToken);
      login({ email: data.user.email, name: data.user.name, tier: data.user.tier });
      push({ kind: "success", title: "Account created", message: "Welcome to ApexVault." });
      router.push("/dashboard");
    } catch (e) {
      push({ kind: "error", title: "Network error", message: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="panel p-8">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>Free to open. No minimum deposit.</p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block">
            <div className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>Name</div>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" required
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
          </label>
          <label className="block">
            <div className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>Email</div>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" required
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none mono"
              style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
          </label>
          <label className="block">
            <div className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>Password</div>
            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" required
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none mono"
              style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
          </label>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-sm text-black disabled:opacity-60 transition"
            style={{ background: "var(--green)" }}>
            {loading ? "Creating account" : "Create account"}
          </button>
        </form>

        <p className="text-sm mt-6 text-center" style={{ color: "var(--muted)" }}>
          Already have one? <Link href="/login" className="font-semibold" style={{ color: "var(--green)" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
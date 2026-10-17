"use client";
import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/app/providers";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { push } = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      push({ kind: "error", title: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="panel p-8 text-center">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="text-sm mt-2" style={{ color: "var(--muted)" }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {sent ? (
          <div className="mt-6 p-4 rounded-lg text-sm" style={{ background: "var(--green-dim)", color: "var(--green)" }}>
            If an account exists for {email}, you will receive a password reset email shortly.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block text-left">
              <div className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>Email</div>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none mono"
                style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
            </label>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-lg font-semibold text-sm text-black disabled:opacity-60 transition" style={{ background: "var(--green)" }}>
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="text-sm mt-6 text-center" style={{ color: "var(--muted)" }}>
          Remembered it? <Link href="/login" className="font-semibold" style={{ color: "var(--green)" }}>Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
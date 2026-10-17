"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/app/providers";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const { push } = useToast();

  if (!token) {
    return (
      <div className="panel p-8 text-center">
        <h1 className="text-2xl font-bold">Invalid link</h1>
        <p className="text-sm mt-2 text-muted">This reset link is missing or invalid.</p>
        <Link href="/forgot-password" className="btn btn-primary inline-block mt-6">Request a new link</Link>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return push({ kind: "error", title: "Passwords do not match" });
    if (password.length < 6) return push({ kind: "error", title: "Password too short" });
    
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      push({ kind: "success", title: "Password updated", message: "You can now log in." });
      router.push("/login");
    } catch (err: any) {
      push({ kind: "error", title: "Reset failed", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel p-8">
      <h1 className="text-2xl font-bold text-center">Choose a new password</h1>
      <form onSubmit={submit} className="mt-7 space-y-4">
        <label className="block">
          <div className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>New password</div>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none mono"
            style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
        </label>
        <label className="block">
          <div className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>Confirm new password</div>
          <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none mono"
            style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
        </label>
        <button type="submit" disabled={loading} className="w-full py-3 rounded-lg font-semibold text-sm text-black disabled:opacity-60 transition" style={{ background: "var(--green)" }}>
          {loading ? "Saving..." : "Update password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <Suspense fallback={<div className="panel p-8 text-center">Loading...</div>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
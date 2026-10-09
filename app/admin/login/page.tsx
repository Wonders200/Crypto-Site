"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/app/providers";

export default function AdminLoginPage() {
  const router = useRouter();
  const { admin, loginAdmin } = useAdminAuth();
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    (typeof window !== "undefined" && (
      window.location.port === "3002" ||
      window.location.hostname === "kellerwilliamsreallty.com" ||
      window.location.hostname === "www.kellerwilliamsreallty.com"
    ));
  const [email, setEmail] = useState(isDemo ? "demo-admin@apexvault.io" : "admin@apexvault.io");
  const [password, setPassword] = useState(isDemo ? "DemoAdmin2026!" : "");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (admin) router.replace("/admin"); }, [admin, router]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    setTimeout(() => {
      const r = loginAdmin(email, password);
      setLoading(false);
      if (!r.ok) { setErr(r.error ?? "Login failed."); return; }
      router.push("/admin");
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--bg)" }}>
      <div className="panel p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-black"
            style={{ background: "linear-gradient(135deg, var(--green), var(--accent))" }}>A</div>
          <div>
            <h1 className="text-lg font-bold">Admin Console</h1>
            <p className="text-xs" style={{ color: "var(--muted)" }}>Restricted access</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {err && <div className="p-3 rounded-lg text-xs" style={{ background: "var(--red-dim)", color: "var(--red)", border: "1px solid var(--red)" }}>{err}</div>}
          <label className="block">
            <div className="text-xs uppercase tracking-wider mb-1.5" style={{ color: "var(--muted)" }}>Email</div>
            <input type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none mono"
              style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
          </label>
          <label className="block">
            <div className="text-xs uppercase tracking-wider mb-1.5" style={{ color: "var(--muted)" }}>Password</div>
            <input type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none mono"
              style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
          </label>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-sm text-black disabled:opacity-60"
            style={{ background: "var(--green)" }}>
            {loading ? "Signing in" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 p-3 rounded-lg text-xs" style={{ background: "var(--panel-2)", border: "1px solid var(--border)" }}>
          <div style={{ color: "var(--muted)" }}>{isDemo ? "Demo credentials" : "Admin credentials"}</div>
            <div className="mono mt-1">{isDemo ? "demo-admin@apexvault.io / DemoAdmin2026!" : "Use your configured admin password"}</div>
            <div className="text-[10px] mt-1" style={{ color: "var(--muted-2)" }}>{isDemo ? "Read-only demo  data resets on exit" : "Change in Settings after first login."}</div>
        </div>
      </div>
    </div>
  );
}
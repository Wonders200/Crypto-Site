"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, useToast, useAdminStore, useAdminAuth } from "@/app/providers";
import { ArrowRight, Shield, UserCircle2, Check, Sparkles, ExternalLink, Trash2 } from "lucide-react";

/**
 * Owner-only launcher. Not linked from the public site.
 * URL: /launch
 */
export default function LaunchPage() {
  const router = useRouter();
  const { user, login, logout } = useAuth();
  const { admin, loginAdmin, logoutAdmin } = useAdminAuth();
  const { push } = useToast();
  const { store } = useAdminStore();
  const demo = store.demoUser;
  const [loading, setLoading] = useState<"demo" | "admin" | null>(null);

  /* ---------- Start demo customer ---------- */
  const startDemo = () => {
    if (!demo) return;
    if (user && user.email.toLowerCase() === demo.email.toLowerCase()) {
      push({ kind: "info", title: "Already signed in as demo" });
      router.push("/dashboard");
      return;
    }
    setLoading("demo");
    login({ email: demo.email, name: demo.name, tier: demo.tier });
    push({ kind: "success", title: "Signed in as Demo Customer " });
    setTimeout(() => { setLoading(null); router.push("/dashboard"); }, 250);
  };

  /* ---------- Start admin ---------- */
  const startAdmin = () => {
    if (admin) {
      push({ kind: "info", title: "Already signed in as admin" });
      router.push("/admin");
      return;
    }
    setLoading("admin");
    const creds = store.credentials;
    const r = loginAdmin(creds.email, creds.password);
    if (!r.ok) {
      push({ kind: "error", title: "Admin login failed", message: r.error });
      setLoading(null);
      return;
    }
    push({ kind: "success", title: "Signed in as Admin " });
    setTimeout(() => { setLoading(null); router.push("/admin"); }, 250);
  };

  /* ---------- Start both at once (new tab for admin) ---------- */
  const startBoth = () => {
    if (demo && !user) login({ email: demo.email, name: demo.name, tier: demo.tier });
    const creds = store.credentials;
    if (!admin) {
      const r = loginAdmin(creds.email, creds.password);
      if (!r.ok) { push({ kind: "error", title: "Admin login failed", message: r.error }); return; }
    }
    push({ kind: "success", title: "Both sessions started", message: "Opening dashboard and admin in new tabs" });
    // Open customer dashboard in this tab, admin in a new tab
    if (typeof window !== "undefined") {
      window.open("/admin", "_blank", "noopener");
    }
    setTimeout(() => router.push("/dashboard"), 300);
  };

  const resetAll = () => {
    logout();
    logoutAdmin();
    push({ kind: "info", title: "All sessions cleared" });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
          style={{ background: "var(--accent-dim)", border: "1px solid var(--accent)" }}>
          <Sparkles size={12} style={{ color: "var(--accent)" }} />
          <span className="text-xs uppercase tracking-wider font-bold" style={{ color: "var(--accent)" }}>
            Owner launcher
          </span>
        </div>
        <h1 className="text-3xl font-bold">Quick launch</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          Start a session in one click. Both run in the same browser simultaneously.
        </p>
        <p className="mt-1 text-[11px]" style={{ color: "var(--muted-2)" }}>
          This page is not linked from the public site. Bookmark it for fast access.
        </p>
      </div>

      {/* Two big launch cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {/* Demo customer */}
        <div className="panel p-6"
          style={user ? { borderColor: "var(--green)" } : {}}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: user ? "var(--green)" : "var(--green-dim)",
                color: user ? "#0a0b0f" : "var(--green)",
              }}>
              {user ? <Check size={22} /> : <UserCircle2 size={22} />}
            </div>
            <div>
              <div className="font-bold">Demo Customer</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                {user ? `Signed in as ${user.name}` : "Not signed in"}
              </div>
            </div>
          </div>
          <div className="text-xs mono mb-3 p-2.5 rounded-lg"
            style={{ background: "var(--panel-2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
            <div>{demo?.email ?? ""}</div>
            <div style={{ color: "var(--muted-2)" }}>{demo?.password ?? ""}</div>
          </div>
          <button onClick={startDemo} disabled={loading === "demo"}
            className="btn btn-primary w-full justify-center disabled:opacity-60">
            {loading === "demo" ? "Signing in" : user ? "Go to dashboard" : "Start demo customer"}
            {user ? <ArrowRight size={14} /> : null}
          </button>
          {user && (
            <button onClick={() => { logout(); push({ kind: "info", title: "Signed out of customer" }); }}
              className="mt-2 w-full py-2 rounded-lg text-xs font-semibold"
              style={{ background: "var(--red-dim)", color: "var(--red)" }}>
              Sign out of customer
            </button>
          )}
        </div>

        {/* Admin */}
        <div className="panel p-6"
          style={admin ? { borderColor: "var(--accent)" } : {}}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: admin ? "var(--accent)" : "var(--accent-dim)",
                color: admin ? "#0a0b0f" : "var(--accent)",
              }}>
              {admin ? <Check size={22} /> : <Shield size={22} />}
            </div>
            <div>
              <div className="font-bold">Admin Console</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                {admin ? `Signed in as ${admin.email}` : "Not signed in"}
              </div>
            </div>
          </div>
          <div className="text-xs mono mb-3 p-2.5 rounded-lg"
            style={{ background: "var(--panel-2)", color: "var(--muted)", border: "1px solid var(--border)" }}>
            <div>{store.credentials.email}</div>
            <div style={{ color: "var(--muted-2)" }}>{store.credentials.password}</div>
          </div>
          <button onClick={startAdmin} disabled={loading === "admin"}
            className="w-full justify-center py-3 rounded-xl font-semibold text-sm transition disabled:opacity-60"
            style={{ background: "var(--accent)", color: "#0a0b0f" }}>
            {loading === "admin" ? "Signing in" : admin ? "Open admin console" : "Start admin console"}
            {admin ? <ArrowRight size={14} className="inline ml-1" /> : null}
          </button>
          {admin && (
            <button onClick={() => { logoutAdmin(); push({ kind: "info", title: "Signed out of admin" }); }}
              className="mt-2 w-full py-2 rounded-lg text-xs font-semibold"
              style={{ background: "var(--red-dim)", color: "var(--red)" }}>
              Sign out of admin
            </button>
          )}
        </div>
      </div>

      {/* Combined action */}
      <div className="panel p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="font-semibold">Start both at once</div>
            <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              Signs you in as both. Opens admin in a new tab, customer in this one.
            </div>
          </div>
          <button onClick={startBoth}
            className="btn btn-primary text-sm">
            <Sparkles size={14} /> Launch both
          </button>
        </div>
      </div>

      {/* Session status */}
      {(user || admin) && (
        <div className="panel p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: "var(--muted)" }}>
              Active sessions
            </div>
            <button onClick={resetAll}
              className="text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5"
              style={{ background: "var(--red-dim)", color: "var(--red)" }}>
              <Trash2 size={11} /> Reset both
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="w-2 h-2 rounded-full" style={{ background: user ? "var(--green)" : "var(--muted-2)" }} />
              <span className="flex-1">
                <strong>Customer:</strong>{" "}
                {user ? `${user.name} (${user.email})` : <span style={{ color: "var(--muted)" }}>Not signed in</span>}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="w-2 h-2 rounded-full" style={{ background: admin ? "var(--accent)" : "var(--muted-2)" }} />
              <span className="flex-1">
                <strong>Admin:</strong>{" "}
                {admin ? admin.email : <span style={{ color: "var(--muted)" }}>Not signed in</span>}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Shortcuts */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Link href="/" className="panel p-4 hover:border-[color:var(--border-2)] transition text-center">
          <ExternalLink size={16} style={{ color: "var(--muted)", margin: "0 auto 6px" }} />
          <div className="text-xs font-semibold">Public site</div>
          <div className="text-[10px] mt-1" style={{ color: "var(--muted)" }}>Homepage</div>
        </Link>
        <Link href="/admin" className="panel p-4 hover:border-[color:var(--border-2)] transition text-center">
          <Shield size={16} style={{ color: "var(--accent)", margin: "0 auto 6px" }} />
          <div className="text-xs font-semibold">Admin console</div>
          <div className="text-[10px] mt-1" style={{ color: "var(--muted)" }}>/admin</div>
        </Link>
        <Link href="/dashboard" className="panel p-4 hover:border-[color:var(--border-2)] transition text-center">
          <UserCircle2 size={16} style={{ color: "var(--green)", margin: "0 auto 6px" }} />
          <div className="text-xs font-semibold">Customer dashboard</div>
          <div className="text-[10px] mt-1" style={{ color: "var(--muted)" }}>/dashboard</div>
        </Link>
      </div>
    </div>
  );
}
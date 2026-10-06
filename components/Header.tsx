"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, Search, ChevronDown, LogOut, User as UserIcon, Wallet, Shield, LayoutDashboard, Activity, Settings as SettingsIcon } from "lucide-react";
import { useAuth, useAdminAuth, useAdminStore } from "@/app/providers";

const NAV = [
  { href: "/markets",   label: "Markets" },
  { href: "/trade/btc", label: "Trade" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/balance",   label: "Balance" },
  { href: "/earn",      label: "Earn" },
  { href: "/pricing",   label: "Pricing" },
  { href: "/learn",     label: "Learn" },
  { href: "/news",      label: "News" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { admin, logoutAdmin } = useAdminAuth();
  const { store } = useAdminStore();

  const [open, setOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [adminMenu, setAdminMenu] = useState(false);
  const [q, setQ] = useState("");

  // Hide the public header entirely on /admin/* routes
  if (pathname?.startsWith("/admin")) return null;

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/markets?q=${encodeURIComponent(q.trim())}`);
  };

  const handleAdminSignOut = () => {
    logoutAdmin();
    setAdminMenu(false);
    router.push("/admin/login");
  };

  return (
    <>
      {store.settings.maintenanceMode && (
        <div className="text-center text-xs py-1.5" style={{ background: "var(--amber)", color: "#0a0b0f", fontWeight: 700 }}>
           Maintenance mode is ON  public site data may be stale.
        </div>
      )}
      <header className="sticky top-0 z-50 backdrop-blur border-b"
        style={{ background: "rgba(10,11,15,0.85)", borderColor: "var(--border)" }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center gap-6 h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="ApexVault">
              <defs>
                <linearGradient id="apexGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="8" fill="url(#apexGrad)" />
              <path d="M16 6.5 L23.5 25 L19.8 25 L16 15.2 L12.2 25 L8.5 25 Z" fill="#0a0b0f" />
              <path d="M11.6 20 L20.4 20" stroke="#0a0b0f" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <span className="font-bold text-lg hidden sm:block">{store.settings.siteName}</span>
            <span className="pill pill-blue hidden md:inline-flex">Pro</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map(n => {
              const active = pathname === n.href || pathname.startsWith(n.href + "/");
              return (
                <Link key={n.href} href={n.href}
                  className="px-3 py-2 rounded-lg text-sm transition"
                  style={{
                    color: active ? "var(--text)" : "var(--muted)",
                    background: active ? "var(--panel-2)" : "transparent",
                  }}>
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <form onSubmit={onSubmitSearch} className="hidden md:flex flex-1 max-w-xs relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search coins, tokens"
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
          </form>

          <div className="flex items-center gap-2 ml-auto">
            {/* -------- Right side: account area -------- */}
            {admin ? (
              /* Admin is signed in  show admin account dropdown */
              <div className="relative">
                <button onClick={() => { setAdminMenu(!adminMenu); setUserMenu(false); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent)" }}>
                  <Shield size={14} />
                  <span className="hidden sm:block">{admin.email.split("@")[0]}</span>
                  <ChevronDown size={14} />
                </button>
                {adminMenu && (
                  <div className="absolute right-0 mt-2 w-60 panel-2 p-2 shadow-2xl z-50">
                    <div className="px-3 py-2 text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                      Admin Console
                    </div>
                    <div className="px-3 pb-2 text-xs mono" style={{ color: "var(--muted-2)" }}>
                      {admin.email}
                    </div>
                    <Link href="/admin" onClick={() => setAdminMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[color:var(--panel)] text-sm">
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                    <Link href="/admin/sessions" onClick={() => setAdminMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[color:var(--panel)] text-sm">
                      <Activity size={14} /> Live sessions
                    </Link>
                    <Link href="/admin/settings" onClick={() => setAdminMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[color:var(--panel)] text-sm">
                      <SettingsIcon size={14} /> Site settings
                    </Link>
                    <div className="my-1 border-t" style={{ borderColor: "var(--border)" }} />
                    <button onClick={handleAdminSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[color:var(--panel)] text-sm"
                      style={{ color: "var(--red)" }}>
                      <LogOut size={14} /> Sign out of admin
                    </button>
                  </div>
                )}
              </div>
            ) : user ? (
              /* Customer signed in  show customer dropdown */
              <div className="relative">
                <button onClick={() => { setUserMenu(!userMenu); setAdminMenu(false); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                  style={{ background: "var(--panel-2)", border: "1px solid var(--border)" }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block">{user.name}</span>
                  <ChevronDown size={14} />
                </button>
                {userMenu && (
                  <div className="absolute right-0 mt-2 w-56 panel-2 p-2 shadow-2xl z-50">
                    <div className="px-3 py-2 text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                      Account
                    </div>
                    <Link href="/dashboard" onClick={() => setUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[color:var(--panel)] text-sm">
                      <Wallet size={14} /> Dashboard
                    </Link>
                    <Link href="/balance" onClick={() => setUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[color:var(--panel)] text-sm">
                      <Wallet size={14} /> Balance
                    </Link>
                    <Link href="/settings" onClick={() => setUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[color:var(--panel)] text-sm">
                      <UserIcon size={14} /> Settings
                    </Link>
                    <div className="my-1 border-t" style={{ borderColor: "var(--border)" }} />
                    <button onClick={() => { logout(); setUserMenu(false); router.push("/"); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[color:var(--panel)] text-sm"
                      style={{ color: "var(--red)" }}>
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Nobody signed in  show Sign in / Get Started Free */
              <>
                <Link href="/login" className="hidden sm:block px-3 py-2 text-sm" style={{ color: "var(--muted)" }}>
                  Sign in
                </Link>
                <Link href="/signup"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-black transition hover:opacity-90"
                  style={{ background: "var(--green)" }}>
                  Get Started Free
                </Link>
              </>
            )}

            <button onClick={() => setOpen(!open)} className="lg:hidden p-2" aria-label="Menu">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t" style={{ borderColor: "var(--border)" }}>
            <div className="px-4 py-3 space-y-1">
              {NAV.map(n => (
                <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm">
                  {n.label}
                </Link>
              ))}
              {admin && (
                <Link href="/admin" onClick={() => setOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-semibold"
                  style={{ color: "var(--accent)" }}>
                  Admin Console
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
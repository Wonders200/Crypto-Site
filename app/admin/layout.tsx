"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { useAdminAuth, useAdminStore } from "@/app/providers";
import { usePendingCounts } from "@/hooks/usePendingCounts";
import AdminRealtimeBell from "@/components/AdminRealtimeBell";
import { LayoutDashboard, Coins, Users, ShieldCheck, Activity, Wallet, DollarSign, CreditCard, ArrowLeftRight, ListOrdered, Newspaper, MessageSquare, GraduationCap, Percent, TrendingUp, Tag, Settings, ScrollText, LogOut, ExternalLink, Bell, Wrench } from "lucide-react";
import DemoSidebarNotice from "@/components/DemoSidebarNotice";

const NAV = [
  { href: "/admin",                 label: "Dashboard",       icon: LayoutDashboard, key: null },
  { href: "/admin/assets",          label: "Assets",          icon: Coins,           key: null },
  { href: "/admin/users",           label: "Users",           icon: Users,           key: null },
  { href: "/admin/kyc",             label: "KYC Reviews",     icon: ShieldCheck,     key: "kyc" },
  { href: "/admin/sessions",        label: "Sessions",        icon: Activity,        key: null },
  { href: "/admin/holdings",        label: "Holdings",        icon: Wallet,          key: null },
  { href: "/admin/balance",         label: "Customer Balances", icon: DollarSign,    key: null },
  { href: "/admin/deposit-addresses", label: "Deposit Addresses", icon: CreditCard,  key: null },
  { href: "/admin/transactions",    label: "Transactions",    icon: ArrowLeftRight,  key: "transactions" },
  { href: "/admin/orders",          label: "Orders",          icon: ListOrdered,     key: "orders" },
  { href: "/admin/news",            label: "News",            icon: Newspaper,       key: null },
  { href: "/admin/testimonials",    label: "Testimonials",    icon: MessageSquare,   key: null },
  { href: "/admin/learn",           label: "Learn Topics",    icon: GraduationCap,   key: null },
  { href: "/admin/earn",            label: "Earn Products",   icon: Percent,         key: null },
  { href: "/admin/earn-positions",  label: "Earn Positions",  icon: TrendingUp,      key: "earnPositions" },
  { href: "/admin/pricing",         label: "Pricing Tiers",   icon: Tag,             key: null },
  { href: "/admin/settings",        label: "Site Settings",   icon: Settings,        key: null },
  { href: "/admin/activity",        label: "Live Activity",   icon: Activity,        key: null },
  { href: "/admin/audit",           label: "Audit Log",       icon: ScrollText,      key: null },
  { href: "/admin/debug",           label: "Debug / Inspector", icon: Wrench,        key: null },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logoutAdmin } = useAdminAuth();
  const { store } = useAdminStore();
  const pending = usePendingCounts();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (!isLogin && !admin) router.replace("/admin/login");
  }, [isLogin, admin, router]);

  if (isLogin) return <>{children}</>;
  if (!admin) return null;

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r hidden md:flex flex-col" style={{ borderColor: "var(--border)", background: "var(--panel)" }}>
        <div className="px-5 py-5 border-b" style={{ borderColor: "var(--border)" }}>
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-black"
              style={{ background: "linear-gradient(135deg, var(--green), var(--accent))" }}>A</div>
            <div className="flex-1">
              <div className="text-sm font-bold">ApexVault</div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>Admin Console</div>
            </div>
            {pending.total > 0 && (
              <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-bold"
                style={{ background: "var(--red)", color: "#fff" }}>
                {pending.total}
              </span>
            )}
          </Link>
        </div>


        <DemoSidebarNotice />

        <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
          {NAV.map(({ href, label, icon: Icon, key }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            const count = key ? (pending as any)[key] : 0;
            return (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-5 py-2.5 text-sm transition relative"
                style={{
                  color: active ? "var(--text)" : "var(--muted)",
                  background: active ? "var(--panel-2)" : "transparent",
                  borderLeft: active ? "3px solid var(--green)" : "3px solid transparent",
                  paddingLeft: active ? 17 : 20,
                }}>
                <Icon size={16} />
                <span className="flex-1">{label}</span>
                {count > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[10px] font-bold"
                    style={{ background: "var(--red)", color: "#fff" }}>
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t text-xs space-y-2" style={{ borderColor: "var(--border)" }}>
          <div style={{ color: "var(--muted)" }}>Signed in as</div>
          <div className="font-semibold truncate">{admin.email}</div>
          <div className="flex gap-2 pt-1">
            <Link href="/" target="_blank"
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs"
              style={{ background: "var(--panel-2)", border: "1px solid var(--border)" }}>
              <ExternalLink size={11} /> Site
            </Link>
            <button onClick={() => { logoutAdmin(); router.push("/admin/login"); }}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs"
              style={{ background: "var(--red-dim)", color: "var(--red)", border: "1px solid var(--red)" }}>
              <LogOut size={11} /> Sign out
            </button>
          </div>
          {store.settings.maintenanceMode && <div className="pill pill-amber w-full justify-center"> Maintenance ON</div>}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="border-b px-4 md:px-6 py-3 flex items-center justify-between"
          style={{ borderColor: "var(--border)", background: "var(--panel)" }}>
          <div className="md:hidden font-bold">Admin Console</div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            {pending.total > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ background: "var(--amber)", color: "#0a0b0f" }}>
                <Bell size={14} />
                <span className="text-xs font-semibold">
                  {pending.total} pending approval{pending.total === 1 ? "" : "s"}
                </span>
              </div>
            )}
            <SyncIndicator />
            <AdminRealtimeBell />
            <button onClick={() => { logoutAdmin(); router.push("/admin/login"); }}
              className="md:hidden text-xs" style={{ color: "var(--red)" }}>Sign out</button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
function SyncIndicator() {
  const { syncing, online, lastSyncAt } = useAdminStore();

  if (!online) {
    return (
      <span className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md"
        style={{ background: "var(--red-dim)", color: "var(--red)" }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--red)" }} />
        Offline
      </span>
    );
  }

  if (syncing) {
    return (
      <span className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md"
        style={{ background: "var(--amber)", color: "#0a0b0f" }}>
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#0a0b0f" }} />
        Syncing
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md"
      style={{ background: "var(--green-dim)", color: "var(--green)" }}
      title={lastSyncAt ? `Last sync ${new Date(lastSyncAt).toLocaleTimeString()}` : "Synced"}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--green)" }} />
      Live
    </span>
  );
}
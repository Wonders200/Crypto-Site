"use client";
import Link from "next/link";
import { useAdminStore } from "@/app/providers";
import { Kpi, Panel, Btn } from "@/components/admin/ui";
import { formatCompact, formatCurrency } from "@/lib/format";

export default function AdminDashboard() {
  const { store } = useAdminStore();

  const totalHoldingsValue = store.holdings.reduce((s, h) => {
    const c = store.coins.find(x => x.id === h.coinId);
    return s + (c ? c.price * h.amount : 0);
  }, 0);

  const activeUsers = store.users.filter(u => u.status === "active").length;
  const pendingOrders = store.orders.filter(o => o.status === "pending").length;
  const totalMcap = store.coins.reduce((s, c) => s + c.marketCap, 0);

  const onlineSessions = (store.sessions ?? []).filter(
    s => s.active && Date.now() - s.lastSeenAt < 2 * 60 * 1000
  ).length;
  const totalSessions = (store.sessions ?? []).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Everything on the site is controlled from here.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Kpi
          label="Total AUM (user holdings)"
          value={formatCurrency(totalHoldingsValue)}
          tone="green"
          sub={`${store.holdings.length} positions across ${activeUsers} users`}
        />
        <Kpi
          label="Active Users"
          value={`${activeUsers} / ${store.users.length}`}
          sub={`${store.users.filter(u => !u.kycVerified).length} unverified KYC`}
        />
        <Kpi
          label="Pending Orders"
          value={String(pendingOrders)}
          tone={pendingOrders > 0 ? "amber" : "default"}
          sub={`${store.orders.length} total orders`}
        />
        <Kpi
          label="Listed Market Cap"
          value={formatCompact(totalMcap)}
          sub={`${store.coins.filter(c => c.enabled).length} active assets`}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Panel title="Recent Audit Activity" padded={false}>
          <div className="max-h-80 overflow-y-auto scrollbar-thin">
            {store.audit.length === 0 ? (
              <div className="p-8 text-center text-sm" style={{ color: "var(--muted)" }}>
                No activity yet. Make a change to see it here.
              </div>
            ) : (
              store.audit.slice(0, 12).map(a => (
                <div
                  key={a.id}
                  className="px-5 py-3 border-b text-xs flex items-start gap-3"
                  style={{ borderColor: "var(--border)" }}
                >
                  <span className="pill pill-blue shrink-0">{a.action}</span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{a.target}</div>
                    {a.details && (
                      <div className="truncate" style={{ color: "var(--muted)" }}>
                        {a.details}
                      </div>
                    )}
                  </div>
                  <div style={{ color: "var(--muted-2)" }}>
                    {new Date(a.at).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel title="Quick Actions">
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/assets"><Btn kind="ghost">Manage Assets</Btn></Link>
            <Link href="/admin/users"><Btn kind="ghost">Manage Users</Btn></Link>
            <Link href="/admin/sessions"><Btn kind="ghost">Live Sessions</Btn></Link>
            <Link href="/admin/balance"><Btn kind="ghost">Balances</Btn></Link>
            <Link href="/admin/deposit-addresses"><Btn kind="ghost">Deposit Addresses</Btn></Link>
            <Link href="/choose-network" target="_blank"><Btn kind="ghost">Preview Deposit UI </Btn></Link>
            <Link href="/admin/transactions"><Btn kind="ghost">Transactions</Btn></Link>
            <Link href="/admin/orders"><Btn kind="ghost">Orders</Btn></Link>
            <Link href="/admin/holdings"><Btn kind="ghost">Holdings</Btn></Link>
            <Link href="/admin/news"><Btn kind="ghost">Manage News</Btn></Link>
            <Link href="/admin/testimonials"><Btn kind="ghost">Testimonials</Btn></Link>
            <Link href="/admin/pricing"><Btn kind="ghost">Pricing Tiers</Btn></Link>
            <Link href="/admin/earn"><Btn kind="ghost">Earn Products</Btn></Link>
            <Link href="/admin/settings"><Btn kind="ghost">Site Settings</Btn></Link>
            <Link href="/admin/audit"><Btn kind="ghost">Audit Log</Btn></Link>
            <Link href="/" target="_blank"><Btn kind="ghost">View Public Site </Btn></Link>
          </div>
        </Panel>
      </div>

      <Panel title="Store Snapshot" padded={false}>
        <div className="grid sm:grid-cols-3 lg:grid-cols-5 divide-x" style={{ borderColor: "var(--border)" }}>
          {[
            { l: "Assets",   v: store.coins.length,                          href: "/admin/assets" },
            { l: "Users",    v: store.users.length,                          href: "/admin/users" },
            { l: "Online",   v: onlineSessions,                              href: "/admin/sessions" },
            { l: "Sessions", v: totalSessions,                               href: "/admin/sessions" },
            { l: "Balances", v: (store.balances ?? []).length,               href: "/admin/balance" },
            { l: "Deposits", v: (store.depositAddresses ?? []).length,        href: "/admin/deposit-addresses" },
            { l: "Txns",     v: (store.transactions ?? []).length,           href: "/admin/transactions" },
            { l: "Orders",   v: store.orders.length,                         href: "/admin/orders" },
            { l: "Holdings", v: store.holdings.length,                       href: "/admin/holdings" },
            { l: "News",     v: store.news.length,                           href: "/admin/news" },
            { l: "Reviews",  v: (store.testimonials ?? []).length,           href: "/admin/testimonials" },
            { l: "Audit",    v: store.audit.length,                          href: "/admin/audit" },
          ].map(s => (
            <Link
              key={s.l}
              href={s.href}
              className="p-5 hover:bg-white/[0.02] transition"
            >
              <div className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                {s.l}
              </div>
              <div className="text-2xl font-bold mono mt-1">{s.v}</div>
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  );
}
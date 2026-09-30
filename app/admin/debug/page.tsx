"use client";
import { useState } from "react";
import { useAdminStore } from "@/app/providers";
import { PageHeader, Btn, Panel, Kpi, Badge } from "@/components/admin/ui";
import { RefreshCw, Copy, Check, Trash2 } from "lucide-react";

export default function AdminDebugPage() {
  const { store, replace } = useAdminStore();
  const [copied, setCopied] = useState(false);

  const reload = () => {
    try {
      const raw = localStorage.getItem("cs.store.clean");
      if (raw) {
        replace(JSON.parse(raw));
        setTimeout(() => location.reload(), 200);
      } else {
        alert("No store found in localStorage at key 'cs.store.clean'");
      }
    } catch (e) {
      alert("Error reading store: " + (e as Error).message);
    }
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(store, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const purge = () => {
    if (!confirm("Delete the store from localStorage and reload? This wipes ALL data.")) return;
    localStorage.removeItem("cs.store.clean");
    location.reload();
  };

  const kycSubmissions = store.kycSubmissions ?? [];
  const users = store.users ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Debug / Inspector"
        subtitle="Raw state inspection  helpful when data doesn't seem to sync"
        actions={
          <div className="flex gap-2">
            <Btn kind="ghost" onClick={reload}><RefreshCw size={12} /> Reload from storage</Btn>
            <Btn kind="ghost" onClick={copyAll}>
              {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy JSON</>}
            </Btn>
            <Btn kind="danger" onClick={purge}><Trash2 size={12} /> Purge store</Btn>
          </div>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Users" value={String(users.length)} />
        <Kpi label="KYC submissions" value={String(kycSubmissions.length)} tone={kycSubmissions.length > 0 ? "green" : "default"} />
        <Kpi label="Transactions" value={String((store.transactions ?? []).length)} />
        <Kpi label="Store keys" value={String(Object.keys(store).length)} />
      </div>

      <Panel title="Users in store">
        {users.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: "var(--muted)" }}>
            No users in store. If you expected users here, they're in a different browser or localStorage key.
          </div>
        ) : (
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg"
                style={{ background: "var(--panel-2)", border: "1px solid var(--border)" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                  style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                  {u.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{u.name}</div>
                  <div className="text-xs mono" style={{ color: "var(--muted)" }}>{u.email}</div>
                </div>
                <div className="text-xs mono" style={{ color: "var(--muted-2)" }}>{u.id}</div>
                <Badge kind={u.kycStatus === "verified" ? "green" : u.kycStatus === "pending" ? "amber" : u.kycStatus === "rejected" ? "red" : "gray"}>
                  {u.kycStatus ?? "unverified"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="KYC submissions in store">
        {kycSubmissions.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: "var(--muted)" }}>
            <strong style={{ color: "var(--red)" }}>No KYC submissions found.</strong>
            <div className="mt-2 text-xs">This means no customer has completed the KYC form yet, OR they submitted in a different browser/incognito window (localStorage doesn't cross browsers).</div>
          </div>
        ) : (
          <div className="space-y-2">
            {kycSubmissions.map(s => {
              const user = users.find(u => u.id === s.userId);
              return (
                <div key={s.id} className="p-3 rounded-lg"
                  style={{ background: "var(--panel-2)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{s.fullName}</div>
                      <div className="text-xs mono" style={{ color: "var(--muted)" }}>{user?.email ?? s.userId}</div>
                    </div>
                    <Badge kind={s.status === "verified" ? "green" : s.status === "pending" ? "amber" : s.status === "rejected" ? "red" : "gray"}>
                      {s.status}
                    </Badge>
                    <span className="text-xs" style={{ color: "var(--muted-2)" }}>{s.id}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] mono" style={{ color: "var(--muted)" }}>
                    <div>DOB: {s.dateOfBirth || ""}</div>
                    <div>Country: {s.country || ""}</div>
                    <div>Doc: {s.idType} {s.idNumber}</div>
                    <div>ID front: {s.idFrontUrl ? "" : ""}</div>
                    <div>ID back: {s.idBackUrl ? "" : ""}</div>
                    <div>Selfie: {s.selfieUrl ? "" : ""}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      <Panel title="Raw store (read-only)">
        <pre className="text-[10px] mono p-3 rounded-lg overflow-auto max-h-[500px] scrollbar-thin"
          style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--muted)" }}>
          {JSON.stringify({
            users: store.users,
            kycSubmissions: store.kycSubmissions,
            transactions: store.transactions,
            balances: store.balances,
          }, null, 2)}
        </pre>
      </Panel>
    </div>
  );
}
"use client";
import { useState, useMemo } from "react";
import { useAdminStore, useToast } from "@/app/providers";
import { AdminUser, uid } from "@/lib/adminStore";
import { PageHeader, Btn, Panel, Modal, Field, Input, Select, Badge } from "@/components/admin/ui";
import { formatCurrency } from "@/lib/format";
import { Search, UserPlus, Edit3, Trash2, Shield, Ban, CheckCircle, KeyRound } from "lucide-react";

const emptyUser = (): AdminUser => ({
  id: "", name: "", email: "", tier: "Standard", status: "active",
  createdAt: Date.now(), kycVerified: false, kycStatus: "unverified",
});
const toDate = (ts: number) => { const d = new Date(ts || Date.now()); const p = (n: number) => String(n).padStart(2,"0"); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`; };
const fromDate = (s: string) => s ? new Date(s + "T12:00:00").getTime() : Date.now();

export default function AdminUsersPage() {
  const { store, update, log } = useAdminStore();
  const { push } = useToast();
  const [editing, setEditing] = useState<any>(null);
  const [isNew, setIsNew] = useState(false);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return store.users.filter(u => {
      if (term && !u.name.toLowerCase().includes(term) && !u.email.toLowerCase().includes(term)) return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (tierFilter !== "all" && u.tier !== tierFilter) return false;
      return true;
    }).sort((a,b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [store.users, q, statusFilter, tierFilter]);

  const startNew = () => { setEditing({ ...emptyUser(), _pw: "" }); setIsNew(true); };
  const startEdit = (u: AdminUser) => { setEditing({ ...u, _pw: "" }); setIsNew(false); };
  const close = () => { setEditing(null); setIsNew(false); };
  const setField = (k: string, v: any) => setEditing((p: any) => p ? { ...p, [k]: v } : p);

  const save = () => {
    if (!editing) return;
    if (!editing.name?.trim() || !editing.email?.trim()) { push({ kind: "error", title: "Name and email required" }); return; }
    const { _pw, ...rest } = editing;
    const finalUser: AdminUser = { ...rest };
    if (isNew) {
      const u = { ...finalUser, id: finalUser.id || uid("u") };
      update("users", [u, ...store.users]);
      if (!(store.balances ?? []).some(b => b.userId === u.id)) {
        update("balances", [{ userId: u.id, usd: 0, locked: 0, updatedAt: Date.now() }, ...(store.balances ?? [])]);
      }
      log("CREATE", "User: " + u.email, "Tier: " + u.tier);
      push({ kind: "success", title: "User created" });
    } else {
      update("users", store.users.map(u => u.id === finalUser.id ? finalUser : u));
      log("UPDATE", "User: " + finalUser.id, finalUser.email);
      push({ kind: "success", title: "User updated" });
    }
    close();
  };

  const remove = (u: AdminUser) => {
    if (!confirm("Delete " + u.name + " (" + u.email + ")? Cannot be undone.")) return;
    update("users", store.users.filter(x => x.id !== u.id));
    update("balances", (store.balances ?? []).filter(b => b.userId !== u.id));
    log("DELETE", "User: " + u.email);
    push({ kind: "success", title: "User deleted" });
  };

  const toggleSuspend = (u: AdminUser) => {
    const next = u.status === "active" ? "suspended" : "active";
    if (!confirm((next === "suspended" ? "Suspend " : "Activate ") + u.name + "?")) return;
    update("users", store.users.map(x => x.id === u.id ? { ...x, status: next as any } : x));
    log(next === "suspended" ? "SUSPEND" : "ACTIVATE", "User: " + u.email);
    push({ kind: "success", title: "User " + next });
  };

  const forceKYC = (u: AdminUser) => {
    if (!confirm("Force " + u.name + " to re-submit KYC?")) return;
    update("users", store.users.map(x => x.id === u.id ? { ...x, kycStatus: "pending" as any, kycVerified: false } : x));
    update("kycSubmissions", (store.kycSubmissions ?? []).filter((k: any) => k.userId !== u.id));
    log("FORCE_KYC", "User: " + u.email);
    push({ kind: "success", title: "KYC re-requested" });
  };

  const reset2FA = (u: any) => {
    if (!confirm("Reset 2FA for " + u.name + "? They'll be able to sign in with just their password until they re-enable it.")) return;
    update("users", store.users.map(x => x.id === u.id ? { ...x, twoFA: undefined } : x));
    log("RESET_2FA", "2FA reset for " + u.email);
    push({ kind: "success", title: "2FA reset" });
  };

  const balance = (id: string) => (store.balances ?? []).find((b: any) => b.userId === id)?.usd ?? 0;

  return (
    <div>
      <PageHeader title="Users" subtitle={store.users.length + " registered  " + store.users.filter(u => u.status === "active").length + " active"}
        actions={<Btn onClick={startNew}><UserPlus size={13} /> Add User</Btn>} />

      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[240px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name or email"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
        </div>
        <div className="w-40"><Select value={statusFilter} onChange={setStatusFilter as any} options={[
          { value: "all", label: "All statuses" }, { value: "active", label: "Active" },
          { value: "suspended", label: "Suspended" }, { value: "frozen", label: "Frozen" }]} /></div>
        <div className="w-40"><Select value={tierFilter} onChange={setTierFilter as any} options={[
          { value: "all", label: "All tiers" }, { value: "Standard", label: "Standard" },
          { value: "Pro", label: "Pro" }, { value: "Institutional", label: "Institutional" }]} /></div>
      </div>

      <Panel>
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-sm" style={{ color: "var(--muted)" }}>No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th className="text-left py-3 px-3 text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Name</th>
                <th className="text-left py-3 px-3 text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>ID</th>
                <th className="text-left py-3 px-3 text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Tier</th>
                <th className="text-left py-3 px-3 text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Status</th>
                <th className="text-left py-3 px-3 text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Balance</th>
                <th className="text-left py-3 px-3 text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>KYC</th>
                <th className="text-left py-3 px-3 text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Joined</th>
                <th className="text-right py-3 px-3 text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>Actions</th>
              </tr></thead>
              <tbody>{filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="py-3 px-3"><div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                      style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>{u.name.charAt(0).toUpperCase()}</div>
                    <div><div className="font-semibold">{u.name}</div>
                      <div className="text-xs" style={{ color: "var(--muted)" }}>{u.email}</div></div>
                  </div></td>
                  <td className="py-3 px-3 text-xs mono" style={{ color: "var(--muted)" }}>{u.id}</td>
                  <td className="py-3 px-3"><Badge kind={u.tier === "Institutional" ? "amber" : u.tier === "Pro" ? "blue" : "gray"}>{u.tier}</Badge></td>
                  <td className="py-3 px-3"><Badge kind={u.status === "active" ? "green" : u.status === "suspended" ? "red" : "amber"}>{u.status}</Badge></td>
                  <td className="py-3 px-3 mono font-semibold">{formatCurrency(balance(u.id))}</td>
                  <td className="py-3 px-3"><Badge kind={u.kycStatus === "verified" ? "green" : u.kycStatus === "pending" ? "amber" : u.kycStatus === "rejected" ? "red" : "gray"}>{(u.kycStatus ?? "unverified").toUpperCase()}</Badge></td>
                  <td className="py-3 px-3 text-xs" style={{ color: "var(--muted)" }}>{new Date(u.createdAt ?? 0).toLocaleDateString()}</td>
                  <td className="py-3 px-3"><div className="flex justify-end gap-1.5 flex-wrap">
                    <Btn kind="ghost" size="sm" onClick={() => startEdit(u)}><Edit3 size={11} /> Edit</Btn>
                    <button onClick={() => forceKYC(u)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                      style={{ background: "rgba(250,204,21,0.10)", color: "#facc15", border: "1px solid rgba(250,204,21,0.3)" }}>
                      <Shield size={11} /> Force KYC</button>
                    {u.twoFA?.enabled && (
                      <button onClick={() => reset2FA(u)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                        style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)" }}>
                        Reset 2FA
                      </button>
                    )}
                    <button onClick={() => toggleSuspend(u)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                      style={{ background: u.status === "active" ? "var(--amber-dim)" : "var(--green-dim)",
                        color: u.status === "active" ? "var(--amber)" : "var(--green)",
                        border: "1px solid " + (u.status === "active" ? "var(--amber)" : "var(--green)") }}>
                      {u.status === "active" ? <><Ban size={11} /> Suspend</> : <><CheckCircle size={11} /> Activate</>}</button>
                    <button onClick={() => remove(u)} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                      style={{ background: "var(--red-dim)", color: "var(--red)", border: "1px solid var(--red)" }}>
                      <Trash2 size={11} /></button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Panel>

      <Modal open={!!editing} onClose={close} title={isNew ? "Add User" : "Edit User"}
        footer={<><Btn kind="ghost" onClick={close}>Cancel</Btn><Btn onClick={save}>Save</Btn></>}>
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full name"><Input value={editing.name} onChange={(v: string) => setField("name", v)} /></Field>
            <Field label="Email"><Input value={editing.email} onChange={(v: string) => setField("email", v)} /></Field>
            <Field label="Tier"><Select value={editing.tier} onChange={(v: string) => setField("tier", v)} options={[
              { value: "Standard", label: "Standard" }, { value: "Pro", label: "Pro" }, { value: "Institutional", label: "Institutional" }]} /></Field>
            <Field label="Status"><Select value={editing.status} onChange={(v: string) => setField("status", v)} options={[
              { value: "active", label: "Active" }, { value: "suspended", label: "Suspended" }, { value: "frozen", label: "Frozen" }]} /></Field>
            <Field label="KYC status"><Select value={editing.kycStatus ?? "unverified"} onChange={(v: string) => setField("kycStatus", v)} options={[
              { value: "unverified", label: "Unverified" }, { value: "pending", label: "Pending" },
              { value: "verified", label: "Verified" }, { value: "rejected", label: "Rejected" }]} /></Field>
            <Field label="Registration date (backdate)"><input type="date" value={toDate(editing.createdAt)} onChange={e => setField("createdAt", fromDate(e.target.value))}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} /></Field>
            <div className="col-span-2"><Field label={isNew ? "Password (optional)" : "Reset password (leave blank to keep)"}>
              <Input value={editing._pw ?? ""} onChange={(v: string) => setField("_pw", v)} /></Field></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
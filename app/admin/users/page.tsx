"use client";
import { useState, useMemo } from "react";
import { useAdminStore, useToast } from "@/app/providers";
import { AdminUser, uid, KycStatus } from "@/lib/adminStore";
import { PageHeader, Btn, Panel, DataTable, Modal, Field, Input, Select, Toggle, Badge } from "@/components/admin/ui";
import LiveTimeAgo from "@/components/LiveTimeAgo";
import { Trash2, Search, Key, Eye, EyeOff, Copy, Check } from "lucide-react";

interface DraftUser extends AdminUser {
  _plainPassword: string;   // the plain password being set (only in modal state)
  _showPassword: boolean;
}

const empty = (): DraftUser => ({
  id: "",
  name: "",
  email: "",
  tier: "Standard",
  status: "pending",
  kycVerified: false,
  kycStatus: "unverified",
  createdAt: Date.now(),
  password: undefined,
  _plainPassword: "",
  _showPassword: false,
});

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function AdminUsersPage() {
  const { store, update, log } = useAdminStore();
  const { push } = useToast();
  const [editing, setEditing] = useState<DraftUser | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [q, setQ] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const users = store?.users ?? [];

  const startNew = () => {
    const u = empty();
    u._plainPassword = generatePassword();
    setEditing(u);
    setIsNew(true);
  };

  const startEdit = (u: AdminUser) => {
    setEditing({
      ...u,
      _plainPassword: "",
      _showPassword: false,
    });
    setIsNew(false);
  };

  const close = () => { setEditing(null); setIsNew(false); };

  const save = () => {
    if (!editing) return;

    if (!editing.name.trim() || !editing.email.includes("@")) {
      push({ kind: "error", title: "Invalid input", message: "Name and a valid email are required." });
      return;
    }

    // Email uniqueness check (only when creating, or when editing and email changed)
    const cleanEmail = editing.email.trim().toLowerCase();
    const duplicate = users.find(u => u.email.toLowerCase() === cleanEmail && u.id !== editing.id);
    if (duplicate) {
      push({ kind: "error", title: "Email already in use", message: "Another user already has that email." });
      return;
    }

    // Password rules:
    //   - On create: password is required (>= 6 chars)
    //   - On edit: if password field is not blank, it replaces the existing
    const newPassword = editing._plainPassword.trim();
    if (isNew && newPassword.length < 6) {
      push({ kind: "error", title: "Password too short", message: "Password must be at least 6 characters." });
      return;
    }
    if (!isNew && newPassword.length > 0 && newPassword.length < 6) {
      push({ kind: "error", title: "Password too short", message: "Password must be at least 6 characters." });
      return;
    }

    // Build the final user record (strip draft fields)
    const base: AdminUser = {
      id: editing.id,
      name: editing.name.trim(),
      email: cleanEmail,
      tier: editing.tier,
      status: editing.status,
      kycVerified: editing.kycVerified,
      kycStatus: editing.kycStatus,
      createdAt: editing.createdAt,
      password: newPassword.length > 0 ? newPassword : editing.password,
    };

    if (isNew) {
      const u = { ...base, id: editing.id || uid("u") };
      update("users", [u, ...users]);
      // Ensure balance record exists
      if (!store.balances.some(b => b.userId === u.id)) {
        update("balances", [{ userId: u.id, usd: 0, locked: 0, updatedAt: Date.now() }, ...store.balances]);
      }
      log("CREATE", `User: ${u.email}`, u.name);
      push({ kind: "success", title: "User created", message: `${u.name} can now sign in with the password you set.` });
    } else {
      update("users", users.map(u => (u.id === editing.id ? base : u)));
      log("UPDATE", `User: ${base.email}`, newPassword ? "Password reset" : "Details updated");
      push({ kind: "success", title: "User updated" });
    }
    close();
  };

  const remove = (u: AdminUser) => {
    if (!confirm(`Delete ${u.email}? This cannot be undone.`)) return;
    update("users", users.filter(x => x.id !== u.id));
    update("balances", store.balances.filter(b => b.userId !== u.id));
    log("DELETE", `User: ${u.email}`, u.name);
    push({ kind: "success", title: "User deleted" });
  };

  const copyPassword = async (pw: string, id: string) => {
    try {
      await navigator.clipboard.writeText(pw);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {}
  };

  const setField = (k: string, v: any) => {
    setEditing(prev => (prev ? { ...prev, [k]: v } : prev));
  };

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return users.filter(u =>
      !term || u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    );
  }, [users, q]);

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle={`${users.length} registered  ${users.filter(u => u.status === "active").length} active`}
        actions={<Btn onClick={startNew}>+ Add User</Btn>}
      />

      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[240px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name or email"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
        </div>
      </div>

      <Panel padded={false}>
        <DataTable<AdminUser>
          keyFn={u => u.id}
          rows={filtered}
          empty={users.length === 0 ? "No users yet. Click + Add User to create the first one." : "No users match."}
          columns={[
            { key: "name", label: "Name", render: u => (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-bold text-sm"
                  style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{u.name}</div>
                  <div className="text-xs truncate" style={{ color: "var(--muted)" }}>{u.email}</div>
                </div>
              </div>
            )},
            { key: "id", label: "ID", render: u => <span className="mono text-xs" style={{ color: "var(--muted)" }}>{u.id}</span> },
            { key: "tier", label: "Tier", render: u => (
              <Badge kind={u.tier === "Institutional" ? "amber" : u.tier === "Pro" ? "blue" : "gray"}>{u.tier}</Badge>
            )},
            { key: "status", label: "Status", render: u => (
              <Badge kind={u.status === "active" ? "green" : u.status === "suspended" ? "red" : "amber"}>{u.status}</Badge>
            )},
            { key: "pwd", label: "Password", align: "center", render: u => (
              u.password ? (
                <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: "var(--green)" }}>
                  <Key size={10} /> Set
                </span>
              ) : (
                <span className="text-[11px]" style={{ color: "var(--muted-2)" }}></span>
              )
            )},
            { key: "kyc", label: "KYC", align: "center", render: u => {
              const s = u.kycStatus ?? (u.kycVerified ? "verified" : "unverified");
              return <Badge kind={s === "verified" ? "green" : s === "pending" ? "amber" : s === "rejected" ? "red" : "gray"}>{s}</Badge>;
            }},
            { key: "created", label: "Joined", align: "right", render: u => (
              <span className="text-xs" style={{ color: "var(--muted)" }}><LiveTimeAgo ts={u.createdAt} /></span>
            )},
            { key: "act", label: "", align: "right", render: u => (
              <div className="flex justify-end gap-1.5">
                <Btn kind="ghost" size="sm" onClick={() => startEdit(u)}>Edit</Btn>
                <Btn kind="danger" size="sm" onClick={() => remove(u)}><Trash2 size={11} /> Delete</Btn>
              </div>
            )},
          ]}
        />
      </Panel>

      {/* Edit / Create modal */}
      <Modal open={!!editing} onClose={close}
        title={isNew ? "Add user" : `Edit ${editing?.email ?? ""}`}
        footer={<><Btn kind="ghost" onClick={close}>Cancel</Btn><Btn onClick={save}>{isNew ? "Create user" : "Save changes"}</Btn></>}>
        {editing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name">
                <Input value={editing.name} onChange={v => setField("name", v)} placeholder="Jane Doe" />
              </Field>
              <Field label="Email">
                <Input value={editing.email} onChange={v => setField("email", v)} placeholder="jane@example.com" />
              </Field>
            </div>

            {/* Password field */}
            <div>
              <div className="text-xs mb-1.5 uppercase tracking-wider font-semibold flex items-center justify-between" style={{ color: "var(--muted)" }}>
                <span>
                  Password{" "}
                  {isNew ? <span style={{ color: "#f85149" }}>*</span> : <span style={{ color: "var(--muted-2)" }}>(leave blank to keep current)</span>}
                </span>
                <button type="button"
                  onClick={() => setField("_plainPassword", generatePassword())}
                  className="text-[10px] font-semibold px-2 py-1 rounded-md"
                  style={{ background: "var(--accent-dim)", color: "var(--accent)" }}>
                  Generate
                </button>
              </div>
              <div className="flex items-stretch gap-2">
                <div className="flex-1 relative">
                  <input
                    type={editing._showPassword ? "text" : "password"}
                    value={editing._plainPassword}
                    onChange={e => setField("_plainPassword", e.target.value)}
                    placeholder={isNew ? "At least 6 characters" : "New password (optional)"}
                    className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm outline-none mono"
                    style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                  />
                  <button type="button"
                    onClick={() => setField("_showPassword", !editing._showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:opacity-70">
                    {editing._showPassword
                      ? <EyeOff size={14} style={{ color: "var(--muted)" }} />
                      : <Eye size={14} style={{ color: "var(--muted)" }} />}
                  </button>
                </div>
                {editing._plainPassword && (
                  <button
                    type="button"
                    onClick={() => copyPassword(editing._plainPassword, "modal")}
                    className="px-3 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5"
                    style={{
                      background: copiedId === "modal" ? "var(--green-dim)" : "var(--panel-2)",
                      color: copiedId === "modal" ? "var(--green)" : "var(--muted)",
                      border: `1px solid ${copiedId === "modal" ? "var(--green)" : "var(--border)"}`,
                    }}>
                    {copiedId === "modal" ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                  </button>
                )}
              </div>
              <div className="text-[11px] mt-1.5" style={{ color: "var(--muted-2)" }}>
                {isNew
                  ? "The user will sign in with this password. Save it before closing  it won't be shown again."
                  : editing.password
                    ? "This user already has a password. Enter a new one to reset it, or leave blank to keep the existing one."
                    : "This user has no password yet. Set one to enable password-protected sign-in."}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Tier">
                <Select value={editing.tier} onChange={v => setField("tier", v as AdminUser["tier"])} options={[
                  { value: "Standard", label: "Standard" },
                  { value: "Pro", label: "Pro" },
                  { value: "Institutional", label: "Institutional" },
                ]} />
              </Field>
              <Field label="Status">
                <Select value={editing.status} onChange={v => setField("status", v as AdminUser["status"])} options={[
                  { value: "active", label: "Active" },
                  { value: "suspended", label: "Suspended" },
                  { value: "pending", label: "Pending" },
                ]} />
              </Field>
            </div>

            <Field label="KYC status">
              <Select
                value={editing.kycStatus ?? "unverified"}
                onChange={v => {
                  setField("kycStatus", v as KycStatus);
                  setField("kycVerified", v === "verified");
                }}
                options={[
                  { value: "unverified", label: "Unverified" },
                  { value: "pending", label: "Pending" },
                  { value: "verified", label: "Verified" },
                  { value: "rejected", label: "Rejected" },
                ]}
              />
            </Field>

            <div className="flex items-center gap-2 pt-1">
              <Toggle checked={editing.kycVerified} onChange={v => setField("kycVerified", v)} label="KYC verified" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

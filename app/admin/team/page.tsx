"use client";
import { useState } from "react";
import { useAdminStore, useToast } from "@/app/providers";
import { PageHeader, Btn, Panel, Field, Input, Select, Modal, Toggle } from "@/components/admin/ui";
import { AdminAccount } from "@/lib/adminStore";
import { Trash2, Shield, ShieldAlert, Settings2 } from "lucide-react";

export default function AdminTeamPage() {
  const { admin } = useAdminAuth();
  if (admin?.role !== "superadmin") {
    return <div className="p-8 text-center" style={{ color: "var(--red)" }}>Access Denied. Super Admin only.</div>;
  }

  const { store, log } = useAdminStore();
  const { push } = useToast();
  
  const [form, setForm] = useState({ email: "", password: "", role: "support" as "support" | "superadmin" });
  const [busy, setBusy] = useState(false);
  
  // Modal state
  const [editingAdmin, setEditingAdmin] = useState<AdminAccount | null>(null);
  const [perms, setPerms] = useState<string[]>([]);
  const [savingPerms, setSavingPerms] = useState(false);

  const admins = store.admins || [];

  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || form.password.length < 8) {
      push({ kind: "error", title: "Email and min 8 char password required." });
      return;
    }
    
    setBusy(true);
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      
      log("ADMIN_CREATE", form.email, form.role);
      push({ kind: "success", title: "Team member added" });
      setForm({ email: "", password: "", role: "support" });
    } catch (err: any) {
      push({ kind: "error", title: "Error", message: err.message });
    } finally {
      setBusy(false);
    }
  };

  const removeAdmin = async (id: string, email: string) => {
    if (!confirm(`Remove admin ${email}?`)) return;
    try {
      const res = await fetch("/api/admin/team", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to remove");
      
      log("ADMIN_DELETE", email);
      push({ kind: "success", title: "Team member removed" });
    } catch (err: any) {
      push({ kind: "error", title: "Error", message: err.message });
    }
  };

  const openPermissions = (a: AdminAccount) => {
    setEditingAdmin(a);
    setPerms(a.permissions || []);
  };

  const savePermissions = async () => {
    if (!editingAdmin) return;
    setSavingPerms(true);
    try {
      const res = await fetch("/api/admin/team", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingAdmin.id, permissions: perms }),
      });
      if (!res.ok) throw new Error("Failed to save permissions");
      
      log("ADMIN_PERMS", editingAdmin.email, perms.join(", "));
      push({ kind: "success", title: "Permissions updated" });
      setEditingAdmin(null);
    } catch (err: any) {
      push({ kind: "error", title: "Error", message: err.message });
    } finally {
      setSavingPerms(false);
    }
  };

  const togglePerm = (key: string) => {
    setPerms(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="Team" subtitle="Manage admin accounts and access levels" />

      <Panel title="Add Team Member">
        <form onSubmit={addAdmin} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <Field label="Email"><Input type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} required /></Field>
          <Field label="Password"><Input type="password" value={form.password} onChange={v => setForm({ ...form, password: v })} required /></Field>
          <Field label="Role">
            <Select value={form.role} onChange={v => setForm({ ...form, role: v as any })} options={[
              { value: "support", label: "Support (Restricted)" },
              { value: "superadmin", label: "Super Admin (Full)" }
            ]} />
          </Field>
          <Btn type="submit" disabled={busy}>{busy ? "Adding..." : "Add Member"}</Btn>
        </form>
      </Panel>

      <Panel title="Current Admins" padded={false}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--muted)" }}>Email</th>
              <th className="text-left py-3 px-4 font-semibold" style={{ color: "var(--muted)" }}>Role</th>
              <th className="text-right py-3 px-4 font-semibold" style={{ color: "var(--muted)" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(a => (
              <tr key={a.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td className="py-3 px-4 font-medium flex items-center gap-2 cursor-pointer hover:opacity-80" onClick={() => a.role === "support" && openPermissions(a)}>
                  {a.role === "superadmin" ? <Shield size={14} style={{ color: "var(--accent)" }} /> : <ShieldAlert size={14} style={{ color: "var(--muted)" }} />}
                  {a.email}
                </td>
                <td className="py-3 px-4">
                  <span className="pill" style={{ background: a.role === "superadmin" ? "var(--accent-dim)" : "var(--panel-2)", color: a.role === "superadmin" ? "var(--accent)" : "var(--muted)" }}>
                    {a.role === "superadmin" ? "Super Admin" : "Support"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {a.role === "support" && (
                      <Btn kind="ghost" size="sm" onClick={() => openPermissions(a)}>
                        <Settings2 size={12} /> Permissions
                      </Btn>
                    )}
                    {a.email !== "davidfreeman081@gmail.com" ? (
                      <Btn kind="danger" size="sm" onClick={() => removeAdmin(a.id, a.email)}>
                        <Trash2 size={11} />
                      </Btn>
                    ) : (
                      <span className="text-xs" style={{ color: "var(--muted-2)" }}>Cannot remove</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Modal open={!!editingAdmin} onClose={() => setEditingAdmin(null)} title="Manage Permissions"
        footer={<><Btn kind="ghost" onClick={() => setEditingAdmin(null)}>Cancel</Btn><Btn onClick={savePermissions} disabled={savingPerms}>{savingPerms ? "Saving..." : "Save Permissions"}</Btn></>}>
        {editingAdmin && (
          <div className="space-y-6">
            <p className="text-sm" style={{ color: "var(--muted)" }}>Customize what <strong>{editingAdmin.email}</strong> is allowed to do.</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: "var(--border)" }}>
                <div>
                  <div className="font-semibold text-sm">Message Customers</div>
                  <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>Can send emails, update KYC status, and approve deposits.</div>
                </div>
                <Toggle checked={perms.includes("can_message")} onChange={() => togglePerm("can_message")} label="" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: "var(--border)" }}>
                <div>
                  <div className="font-semibold text-sm">Live Chat Access</div>
                  <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>Can see and use the Chatway widget on the public site.</div>
                </div>
                <Toggle checked={perms.includes("can_chat")} onChange={() => togglePerm("can_chat")} label="" />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
"use client";
import { useState } from "react";
import { useAdminStore, useToast } from "@/app/providers";
import { PageHeader, Btn, Panel, Field, Input, Select } from "@/components/admin/ui";
import { AdminAccount } from "@/lib/adminStore";
import { Trash2, Shield, ShieldAlert } from "lucide-react";

export default function AdminTeamPage() {
  const { store, log } = useAdminStore();
  const { push } = useToast();
  
  const [form, setForm] = useState({ email: "", password: "", role: "support" as "support" | "superadmin" });
  const [busy, setBusy] = useState(false);

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
      
      if (!res.ok) throw new Error(data.error || "Failed to add admin");
      
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
      if (!res.ok) throw new Error("Failed to remove admin");
      
      log("ADMIN_DELETE", email);
      push({ kind: "success", title: "Team member removed" });
    } catch (err: any) {
      push({ kind: "error", title: "Error", message: err.message });
    }
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
                <td className="py-3 px-4 font-medium flex items-center gap-2">
                  {a.role === "superadmin" ? <Shield size={14} style={{ color: "var(--accent)" }} /> : <ShieldAlert size={14} style={{ color: "var(--muted)" }} />}
                  {a.email}
                </td>
                <td className="py-3 px-4">
                  <span className="pill" style={{ background: a.role === "superadmin" ? "var(--accent-dim)" : "var(--panel-2)", color: a.role === "superadmin" ? "var(--accent)" : "var(--muted)" }}>
                    {a.role === "superadmin" ? "Super Admin" : "Support"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {a.email !== "davidfreeman081@gmail.com" ? (
                    <Btn kind="danger" size="sm" onClick={() => removeAdmin(a.id, a.email)}>
                      <Trash2 size={11} /> Remove
                    </Btn>
                  ) : (
                    <span className="text-xs" style={{ color: "var(--muted-2)" }}>Cannot remove self</span>
                  )}
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr><td colSpan={3} className="py-6 text-center" style={{ color: "var(--muted)" }}>No team members yet.</td></tr>
            )}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
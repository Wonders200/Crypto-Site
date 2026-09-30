"use client";
import { ReactNode } from "react";
import { X } from "lucide-react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Btn({ children, onClick, kind = "primary", size = "md", type = "button", disabled }: {
  children: ReactNode; onClick?: () => void;
  kind?: "primary" | "ghost" | "danger" | "success";
  size?: "sm" | "md"; type?: "button" | "submit"; disabled?: boolean;
}) {
  const bg = kind === "primary" ? "var(--accent)" : kind === "danger" ? "var(--red)" : kind === "success" ? "var(--green)" : "var(--panel-2)";
  const col = kind === "ghost" ? "var(--text)" : "#0a0b0f";
  const pad = size === "sm" ? "6px 12px" : "9px 16px";
  const isDangerSm = kind === "danger" && size === "sm";
  const fs = size === "sm" ? 12 : 13;
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className="rounded-lg font-semibold transition hover:opacity-90 disabled:opacity-50"
      style={{ background: bg, color: col, padding: pad, fontSize: fs, border: kind === "ghost" ? "1px solid var(--border-2)" : "none", minWidth: isDangerSm ? 72 : undefined }}>
      {children}
    </button>
  );
}

export function Panel({ title, actions, children, padded = true }: { title?: string; actions?: ReactNode; children: ReactNode; padded?: boolean }) {
  return (
    <div className="panel">
      {(title || actions) && (
        <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          {title && <h2 className="font-semibold text-sm">{title}</h2>}
          {actions}
        </div>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </div>
  );
}

export function Input({ value, onChange, placeholder, type = "text" }: { value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg text-sm outline-none mono"
      style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }} />
  );
}

export function Textarea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows}
      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
      style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)", resize: "vertical" }} />
  );
}

export function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg text-sm outline-none"
      style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs mb-1.5 uppercase tracking-wider" style={{ color: "var(--muted)" }}>{label}</div>
      {children}
    </label>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-2.5">
      <span className="relative inline-flex w-9 h-5 rounded-full transition" style={{ background: checked ? "var(--green)" : "var(--border-2)" }}>
        <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition" style={{ left: checked ? 18 : 2 }} />
      </span>
      {label && <span className="text-sm">{label}</span>}
    </button>
  );
}

export function Badge({ kind, children }: { kind: "green" | "red" | "amber" | "blue" | "gray"; children: ReactNode }) {
  return <span className={`pill pill-${kind}`}>{children}</span>;
}

export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div className="panel w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="hover:opacity-70"><X size={18} /></button>
        </div>
        <div className="p-5 overflow-y-auto scrollbar-thin flex-1">{children}</div>
        {footer && <div className="px-5 py-4 border-t flex justify-end gap-2" style={{ borderColor: "var(--border)" }}>{footer}</div>}
      </div>
    </div>
  );
}

export function DataTable<T,>({ columns, rows, keyFn, empty = "No records." }: {
  columns: { key: string; label: string; align?: "left" | "right" | "center"; render: (row: T) => ReactNode }[];
  rows: T[]; keyFn: (row: T) => string; empty?: string;
}) {
  if (rows.length === 0) return <div className="p-10 text-center text-sm" style={{ color: "var(--muted)" }}>{empty}</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[720px]">
        <thead>
          <tr style={{ color: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
            {columns.map(c => (
              <th key={c.key} className={`px-4 py-3 font-medium text-${c.align ?? "left"}`}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={keyFn(row)} className="border-b hover:bg-white/[0.02] transition" style={{ borderColor: "var(--border)" }}>
              {columns.map(c => (
                <td key={c.key} className={`px-4 py-3 text-${c.align ?? "left"}`}>{c.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Kpi({ label, value, sub, tone = "default" }: { label: string; value: string; sub?: string; tone?: "default" | "green" | "red" | "amber" }) {
  const color = tone === "green" ? "var(--green)" : tone === "red" ? "var(--red)" : tone === "amber" ? "var(--amber)" : "var(--text)";
  return (
    <div className="panel p-5">
      <div className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)" }}>{label}</div>
      <div className="text-2xl font-bold mono mt-2" style={{ color }}>{value}</div>
      {sub && <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{sub}</div>}
    </div>
  );
}
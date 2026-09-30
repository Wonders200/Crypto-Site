"use client";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { Download, FileText, FileSpreadsheet, FileJson, FileDown, ChevronDown, Loader2, HTMLButtonElement, HTMLDivElement } from "lucide-react";
import { downloadCSV, downloadJSON, downloadXLSX, downloadPDF, StatementRow } from "@/lib/statements";

export default function StatementDownload({
  title,
  rows,
  filename,
  ownerName,
  ownerEmail,
  disabled,
}: {
  title: string;
  rows: StatementRow[];
  filename: string;
  ownerName?: string;
  ownerEmail?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number; right: number; width: number }>({ top: 0, right: 0, width: 240 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      if (btnRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  // Recompute position when opened or window resizes
  const recompute = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const MENU_WIDTH = 240;
    const MENU_HEIGHT = 236; // approx
    const vh = window.innerHeight;
    // Prefer below; flip above if not enough room
    let top = r.bottom + 8;
    if (top + MENU_HEIGHT > vh - 12) top = Math.max(12, r.top - MENU_HEIGHT - 8);
    // Right-align to button's right edge; clamp so it stays in viewport
    let right = window.innerWidth - r.right;
    if (right < 12) right = 12;
    if (window.innerWidth - right - MENU_WIDTH < 12) right = window.innerWidth - MENU_WIDTH - 12;
    setCoords({ top, right, width: MENU_WIDTH });
  };

  useLayoutEffect(() => {
    if (!open) return;
    recompute();
    const onResize = () => recompute();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open]);

  const handle = async (fmt: "pdf" | "xlsx" | "csv" | "json") => {
    setOpen(false);
    setBusy(fmt);
    try {
      const stamp = new Date().toISOString().slice(0, 10);
      const base = `${filename}-${stamp}`;
      const meta = {
        title,
        ownerName,
        ownerEmail,
        generatedAt: new Date().toISOString(),
        count: rows.length,
      };
      if (fmt === "pdf") {
        await downloadPDF(`${base}.pdf`, rows, {
          title,
          subtitle: `${rows.length} record${rows.length === 1 ? "" : "s"}`,
          ownerName,
          ownerEmail,
        });
      } else if (fmt === "xlsx") {
        await downloadXLSX(`${base}.xlsx`, rows, title.slice(0, 31));
      } else if (fmt === "csv") {
        downloadCSV(`${base}.csv`, rows);
      } else {
        downloadJSON(`${base}.json`, rows, meta);
      }
    } finally {
      setBusy(null);
    }
  };

  const Icon = busy ? Loader2 : Download;
  const isDisabled = disabled || rows.length === 0;

  const menu =
    open && mounted
      ? createPortal(
          <div
            ref={menuRef}
            className="fixed panel-2 p-2 pop-in"
            style={{
              top: coords.top,
              right: coords.right,
              width: coords.width,
              zIndex: 9999,
              boxShadow: "0 20px 60px rgba(0,0,0,0.55), 0 0 0 1px var(--border-2)",
            }}
            role="menu"
          >
            <div className="px-3 py-2 text-[10px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Choose format
            </div>

            <button type="button" role="menuitem" onClick={() => handle("pdf")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.06] text-sm text-left transition">
              <span className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                style={{ background: "rgba(248,81,73,0.14)", color: "#f85149" }}>
                <FileText size={15} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-medium">PDF document</span>
                <span className="block text-[10px]" style={{ color: "var(--muted)" }}>Best for printing & sharing</span>
              </span>
            </button>

            <button type="button" role="menuitem" onClick={() => handle("xlsx")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.06] text-sm text-left transition">
              <span className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                style={{ background: "rgba(63,185,80,0.14)", color: "#3fb950" }}>
                <FileSpreadsheet size={15} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-medium">Excel spreadsheet</span>
                <span className="block text-[10px]" style={{ color: "var(--muted)" }}>.xlsx  Excel, Sheets, Numbers</span>
              </span>
            </button>

            <button type="button" role="menuitem" onClick={() => handle("csv")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.06] text-sm text-left transition">
              <span className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                style={{ background: "rgba(124,143,245,0.14)", color: "#7c8ff5" }}>
                <FileDown size={15} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-medium">CSV file</span>
                <span className="block text-[10px]" style={{ color: "var(--muted)" }}>Comma-separated data</span>
              </span>
            </button>

            <button type="button" role="menuitem" onClick={() => handle("json")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.06] text-sm text-left transition">
              <span className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                style={{ background: "rgba(227,179,65,0.14)", color: "#e3b341" }}>
                <FileJson size={15} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-medium">JSON data</span>
                <span className="block text-[10px]" style={{ color: "var(--muted)" }}>For developers & integrations</span>
              </span>
            </button>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => !isDisabled && setOpen(v => !v)}
        disabled={isDisabled}
        aria-haspopup="menu"
        aria-expanded={open}
        className="btn btn-ghost text-xs disabled:opacity-40"
      >
        <Icon size={13} className={busy ? "animate-spin" : ""} />
        {busy ? `Preparing ${busy.toUpperCase()}` : "Download statement"}
        {!busy && <ChevronDown size={11} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />}
      </button>
      {menu}
    </>
  );
}
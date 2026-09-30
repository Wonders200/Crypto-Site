export type StatementRow = Record<string, string | number | undefined | null>;

/* ---------- CSV ---------- */
function csvEscape(v: unknown): string {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
export function downloadCSV(filename: string, rows: StatementRow[]) {
  if (rows.length === 0) {
    downloadBlob(filename, "No records.", "text/csv");
    return;
  }
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.map(csvEscape).join(","),
    ...rows.map(r => headers.map(h => csvEscape(r[h])).join(",")),
  ];
  downloadBlob(filename, lines.join("\n"), "text/csv;charset=utf-8");
}

/* ---------- JSON ---------- */
export function downloadJSON(filename: string, rows: StatementRow[], meta?: Record<string, unknown>) {
  const payload = meta ? { meta, rows } : rows;
  downloadBlob(filename, JSON.stringify(payload, null, 2), "application/json");
}

/* ---------- XLSX (SheetJS, dynamic import) ---------- */
export async function downloadXLSX(filename: string, rows: StatementRow[], sheetName = "Statement") {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, filename);
}

/* ---------- PDF (jsPDF + autoTable, dynamic import) ---------- */
export interface PDFMeta {
  title: string;
  subtitle?: string;
  ownerName?: string;
  ownerEmail?: string;
  brand?: string;
  accent?: [number, number, number];
}
export async function downloadPDF(filename: string, rows: StatementRow[], meta: PDFMeta) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const accent = meta.accent ?? [36, 73, 168];

  /* Header band */
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 82, "F");

  /* Brand mark */
  doc.setFillColor(accent[0], accent[1], accent[2]);
  doc.roundedRect(40, 26, 32, 32, 6, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("C", 52, 48);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(meta.brand ?? "CryptoSite", 86, 42);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 210, 225);
  doc.text("Account Statement", 86, 58);

  /* Right side: title + subtitle */
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(meta.title, W - 40, 42, { align: "right" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 210, 225);
  if (meta.subtitle) doc.text(meta.subtitle, W - 40, 58, { align: "right" });

  /* Meta block */
  let y = 110;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);

  if (meta.ownerName) {
    doc.setFont("helvetica", "bold");
    doc.text("Account holder", 40, y);
    doc.setFont("helvetica", "normal");
    doc.text(meta.ownerName, 140, y);
    y += 16;
  }
  if (meta.ownerEmail) {
    doc.setFont("helvetica", "bold");
    doc.text("Email", 40, y);
    doc.setFont("helvetica", "normal");
    doc.text(meta.ownerEmail, 140, y);
    y += 16;
  }
  doc.setFont("helvetica", "bold");
  doc.text("Generated", 40, y);
  doc.setFont("helvetica", "normal");
  doc.text(new Date().toLocaleString(), 140, y);
  y += 16;
  doc.setFont("helvetica", "bold");
  doc.text("Records", 40, y);
  doc.setFont("helvetica", "normal");
  doc.text(String(rows.length), 140, y);
  y += 22;

  /* Divider */
  doc.setDrawColor(220, 226, 235);
  doc.setLineWidth(0.5);
  doc.line(40, y, W - 40, y);
  y += 12;

  /* Table */
  if (rows.length === 0) {
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text("No records for this statement.", 40, y + 20);
  } else {
    const headers = Object.keys(rows[0]);
    autoTable(doc, {
      startY: y,
      head: [headers],
      body: rows.map(r => headers.map(h => String(r[h] ?? ""))),
      styles: { fontSize: 8.5, cellPadding: 6, textColor: [30, 41, 59], lineColor: [230, 235, 242], lineWidth: 0.3 },
      headStyles: { fillColor: accent, textColor: 255, fontStyle: "bold", fontSize: 8.5 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 40, right: 40, bottom: 50 },
      didDrawPage: () => {},
    });
  }

  /* Footer */
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 130, 145);
    doc.text(
      `${meta.brand ?? "CryptoSite"}  This statement is provided for informational purposes only and does not constitute tax or legal advice.`,
      40, H - 22
    );
    doc.text(`Page ${i} of ${totalPages}`, W - 40, H - 22, { align: "right" });
  }

  doc.save(filename);
}

/* ---------- helper ---------- */
function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
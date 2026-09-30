export function formatCurrency(v: number, max = 2): string {
  return "$" + v.toLocaleString(undefined, { maximumFractionDigits: max });
}
export function formatCompact(v: number): string {
  if (v >= 1e12) return "$" + (v / 1e12).toFixed(2) + "T";
  if (v >= 1e9)  return "$" + (v / 1e9).toFixed(2)  + "B";
  if (v >= 1e6)  return "$" + (v / 1e6).toFixed(2)  + "M";
  if (v >= 1e3)  return "$" + (v / 1e3).toFixed(2)  + "K";
  return "$" + v.toFixed(2);
}
export function formatPercent(v: number): string {
  return (v >= 0 ? "+" : "") + v.toFixed(2) + "%";
}
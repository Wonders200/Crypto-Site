"use client";
import { useState, useMemo } from "react";
import { useLivePrices } from "@/hooks/useLivePrices";
import SearchBar from "@/components/SearchBar";
import EmptyState from "@/components/EmptyState";
import { formatCurrency, formatPercent, formatCompact } from "@/lib/format";

type SortKey = "marketCap" | "price" | "change24h" | "volume24h";

export default function MarketPage() {
  const coins = useLivePrices();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("marketCap");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return coins
      .filter(c => !q || c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q))
      .sort((a, b) => b[sortKey] - a[sortKey]);
  }, [coins, query, sortKey]);

  return (
    <main className="px-6 py-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Markets</h1>
        <p className="text-gray-400 mt-2">Real-time snapshot of top assets.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchBar value={query} onChange={setQuery} placeholder="Search coins" />
        <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}
          className="px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm focus:border-green-500 outline-none">
          <option value="marketCap">Sort: Market Cap</option>
          <option value="price">Sort: Price</option>
          <option value="change24h">Sort: 24h Change</option>
          <option value="volume24h">Sort: Volume</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No coins found" message="Try a different search term." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-800">
          <table className="w-full text-left min-w-[640px]">
            <thead className="bg-gray-900 text-gray-400 text-xs uppercase">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">Name</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4 text-right">24h</th>
                <th className="p-4 text-right">Market Cap</th>
                <th className="p-4 text-right">Volume</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} className="border-t border-gray-800 hover:bg-gray-900/50">
                  <td className="p-4 text-gray-500">{i + 1}</td>
                  <td className="p-4">
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.symbol}</div>
                  </td>
                  <td className="p-4 text-right font-mono">{formatCurrency(c.price)}</td>
                  <td className={`p-4 text-right font-mono ${c.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {formatPercent(c.change24h)}
                  </td>
                  <td className="p-4 text-right font-mono text-gray-400">{formatCompact(c.marketCap)}</td>
                  <td className="p-4 text-right font-mono text-gray-400">{formatCompact(c.volume24h)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

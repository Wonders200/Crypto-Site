"use client";
import { CheckLogo, Check } from "lucide-react";
import { AdminDepositAddress } from "@/lib/adminStore";
import { BitcoinLogo, TetherLogo, UsdcLogo, PaypalLogo } from "./BrandLogos";

/* ---------- Brand mapping ---------- */
function brandFor(asset: string, network: string) {
  const a = asset.toUpperCase();
  const n = network.toLowerCase();
  if (a === "BTC" || n === "bitcoin") return { name: "Bitcoin", ticker: "", Logo: BitcoinLogo };
  if (a === "USDT" || n.includes("tether")) return { name: "USDT", ticker: "", Logo: TetherLogo };
  if (a === "USDC" || n.includes("usd coin")) return { name: "USDC", ticker: "", Logo: UsdcLogo };
  if (a === "PYUSD" || n.includes("paypal")) return { name: "PayPal USD", ticker: "PYUSD", Logo: PaypalLogo };
  if (a === "USD" && n.toLowerCase().includes("paypal")) return { name: "PayPal USD", ticker: "PYUSD", Logo: PaypalLogo };
  return { name: asset, ticker: network, Logo: null };
}

/* ---------- Design tokens (from brief) ---------- */
const T = {
  pageBg: "#F5F7FA",
  cardBg: "#FFFFFF",
  surface: "#F8FAFC",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  border: "#D9E0EA",
  borderSelected: "#2449A8",
  bgSelected: "#F2F6FF",
  shadowIdle: "0 1px 2px rgba(15, 23, 42, 0.04)",
  shadowSelected: "0 1px 3px rgba(36, 73, 168, 0.10)",
};

export default function NetworkPicker({
  networks,
  selectedId,
  onSelect,
}: {
  networks: AdminDepositAddress[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <h2
        className="text-[22px] leading-tight font-semibold tracking-[-0.01em]"
        style={{ color: T.textPrimary, fontFamily: "'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif" }}
      >
        Choose network
      </h2>
      <p className="text-[13.5px] mt-1.5 mb-6" style={{ color: T.textSecondary }}>
        Select a network to see its deposit address
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {networks.map((net) => {
          const selected = selectedId === net.id;
          const brand = brandFor(net.asset, net.network);
          const Logo = brand.Logo;
          return (
            <button
              key={net.id}
              type="button"
              onClick={() => onSelect(net.id)}
              aria-pressed={selected}
              className="relative text-left rounded-2xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{
                background: selected ? T.bgSelected : T.cardBg,
                border: `1px solid ${selected ? T.borderSelected : T.border}`,
                boxShadow: selected ? T.shadowSelected : T.shadowIdle,
                padding: "20px 18px 18px",
                // @ts-ignore
                "--tw-ring-color": T.borderSelected,
              }}
            >
              {selected && (
                <span
                  className="absolute top-3 right-3 flex items-center justify-center rounded-full"
                  style={{ width: 20, height: 20, background: T.borderSelected }}
                  aria-hidden
                >
                  <Check size={11} strokeWidth={3.2} color="#FFFFFF" />
                </span>
              )}

              <div className="mb-4 flex items-center" style={{ height: 44 }}>
                {Logo ? (
                  <Logo size={44} />
                ) : (
                  <div
                    className="flex items-center justify-center rounded-full text-[15px] font-semibold"
                    style={{ width: 44, height: 44, background: T.surface, color: T.textPrimary, border: `1px solid ${T.border}` }}
                  >
                    {net.asset.slice(0, 2)}
                  </div>
                )}
              </div>

              <div
                className="font-semibold text-[15px] leading-tight tracking-[-0.005em]"
                style={{ color: T.textPrimary }}
              >
                {brand.name}
              </div>
              {brand.ticker && (
                <div className="text-[13px] mt-0.5" style={{ color: T.textSecondary }}>
                  ({brand.ticker})
                </div>
              )}
            </button>
          );
        })}
      </div>

      {networks.length === 0 && (
        <div className="rounded-2xl py-10 text-center text-sm" style={{ background: T.surface, border: `1px dashed ${T.border}`, color: T.textSecondary }}>
          No networks configured. Ask an administrator to add a deposit address.
        </div>
      )}
    </div>
  );
}

/* ---------- Exported light container style ---------- */
export const lightTheme = T;
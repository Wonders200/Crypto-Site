"use client";
import { useMemo, useState } from "react";
import { useAdminStore } from "@/app/providers";
import NetworkPicker, { lightTheme as T } from "@/components/NetworkPicker";
import AddressQR from "@/components/AddressQR";
import BackButton from "@/components/BackButton";
import { Copy, Check } from "lucide-react";

export default function ChooseNetworkPreview() {
  const { store } = useAdminStore();
  const methods = useMemo(
    () => [...(store.depositAddresses ?? [])].filter(a => a.enabled).sort((a, b) => a.order - b.order),
    [store.depositAddresses]
  );
  const [selectedId, setSelectedId] = useState<string>(methods[0]?.id ?? "");
  const [copied, setCopied] = useState(false);

  const selected = methods.find(m => m.id === selectedId) ?? methods[0];

  const copy = async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(selected.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="max-w-[980px] mx-auto px-6 py-14">
      <div className="mb-4 -ml-2">
        <BackButton fallback="/balance" label="Back to balance" />
      </div>
      {/* The light payment widget, self-contained on the dark page */}
      <div
        className="rounded-3xl"
        style={{
          background: T.pageBg,
          border: `1px solid ${T.border}`,
          padding: "32px 32px 28px",
          boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12)",
        }}
      >
        <NetworkPicker
          networks={methods}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        {selected && (
          <div className="mt-6">
            <div
              className="text-[13px] mb-2"
              style={{ color: T.textSecondary }}
            >
              Send{" "}
              <strong style={{ color: T.textPrimary }}>
                {selected.asset}
              </strong>{" "}
              to this address
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <AddressQR value={selected.address} size={140} label="Scan to pay" />
              <div className="flex items-stretch gap-2 flex-1 w-full">
              <code
                className="mono flex-1 rounded-xl px-4 py-3 text-[13px] break-all"
                style={{
                  background: T.cardBg,
                  border: `1px solid ${T.border}`,
                  color: T.textPrimary,
                }}
              >
                {selected.address}
              </code>
              <button
                type="button"
                onClick={copy}
                className="rounded-xl px-4 text-[13px] font-semibold flex items-center gap-1.5 shrink-0 transition-all"
                style={{
                  background: copied ? "#E8F5EE" : "#2449A8",
                  color: copied ? "#1B7A4D" : "#FFFFFF",
                  border: `1px solid ${copied ? "#1B7A4D" : "#2449A8"}`,
                }}
              >
                {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
              </button>
              </div>
            </div>

            {selected.memo && (
              <div className="mt-3 text-[13px]" style={{ color: T.textSecondary }}>
                Memo / Tag:{" "}
                <span className="mono font-semibold" style={{ color: T.textPrimary }}>
                  {selected.memo}
                </span>
              </div>
            )}

            {selected.notes && (
              <div
                className="mt-3 rounded-xl p-3 text-[12.5px] leading-relaxed"
                style={{
                  background: "#FFF7ED",
                  border: "1px solid #FED7AA",
                  color: "#9A3412",
                }}
              >
                {selected.notes}
              </div>
            )}

            <button
              type="button"
              className="w-full mt-5 rounded-xl py-3.5 text-[14px] font-semibold transition-opacity hover:opacity-95"
              style={{
                background: "#2449A8",
                color: "#FFFFFF",
              }}
            >
              I have sent {selected.asset}  submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
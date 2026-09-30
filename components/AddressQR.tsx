"use client";
import { QRCodeSVG } from "qrcode.react";

export default function AddressQR({
  value,
  size = 140,
  label,
}: {
  value: string;
  size?: number;
  label?: string;
}) {
  return (
    <div className="shrink-0 flex flex-col items-center">
      <div
        className="rounded-2xl bg-white p-3 pop-in"
        style={{ border: "1px solid #D9E0EA", boxShadow: "0 1px 3px rgba(15,23,42,0.06)" }}
      >
        <QRCodeSVG
          value={value}
          size={size}
          level="H"
          bgColor="#FFFFFF"
          fgColor="#0F172A"
          marginSize={0}
          title={label ?? "Deposit address"}
        />
      </div>
      {label && (
        <div className="text-[11px] mt-2 text-center" style={{ color: "#64748B" }}>
          {label}
        </div>
      )}
    </div>
  );
}
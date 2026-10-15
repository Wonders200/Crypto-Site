"use client";
import { QRCodeSVG } from "qrcode.react";

export default function AddressQR({
  value,
  size = 140,
  label,
  customUrl,
}: {
  value: string;
  size?: number;
  label?: string;
  customUrl?: string;
}) {
  if (customUrl) {
    return (
      <div className="shrink-0 flex flex-col items-center">
        <div
          className="rounded-2xl bg-white p-3 pop-in"
          style={{ border: "1px solid #D9E0EA", boxShadow: "0 1px 3px rgba(15,23,42,0.06)" }}
        >
          <img
            src={customUrl}
            alt={label ?? "Deposit address QR"}
            style={{ width: size, height: size, display: "block", objectFit: "contain" }}
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
import { authenticator } from "otplib";
import QRCode from "qrcode";

export function generateSecret(): string {
  return authenticator.generateSecret();
}

export function buildUri(email: string, secret: string): string {
  return authenticator.keyuri(email, "ApexVault", secret);
}

export async function buildQrDataUrl(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, { width: 220, margin: 1 });
}

export function verifyCode(code: string, secret: string): boolean {
  if (!code || !secret) return false;
  const clean = String(code).replace(/\D/g, "").slice(0, 6);
  try {
    return authenticator.check(clean, secret);
  } catch {
    return false;
  }
}

export function generateBackupCodes(count = 8): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const s = Math.random().toString(36).slice(2, 6).toUpperCase() + "-" +
              Math.random().toString(36).slice(2, 6).toUpperCase();
    out.push(s);
  }
  return out;
}
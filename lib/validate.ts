import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6).max(200),
});

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
  totp: z.string().optional(),
});

export const RefreshSchema = z.object({
  refreshToken: z.string().min(10),
});

export const TwoFASetupSchema = z.object({
  // no input needed  server generates secret
});

export const TwoFAVerifySchema = z.object({
  token: z.string().length(6),
});

export const WithdrawSchema = z.object({
  amount: z.number().positive().max(10_000_000),
  asset: z.string().min(1).max(20),
  network: z.string().min(1).max(40),
  address: z.string().min(6).max(200),
  memo: z.string().max(200).optional(),
});

export const DepositSchema = z.object({
  amount: z.number().positive().max(10_000_000),
  asset: z.string().min(1).max(20),
  network: z.string().min(1).max(40),
  txHash: z.string().min(6).max(200),
  proofUrl: z.string().min(10).optional(),
});

export const KycSubmitSchema = z.object({
  fullName: z.string().min(1).max(200),
  dateOfBirth: z.string().min(1).max(40),
  country: z.string().min(1).max(80),
  address: z.string().min(1).max(300),
  city: z.string().min(1).max(100),
  postalCode: z.string().max(30).optional().default(""),
  phone: z.string().min(1).max(40),
  idType: z.enum(["passport", "drivers_license", "national_id"]),
  idNumber: z.string().min(1).max(80),
  idFrontUrl: z.string().optional(),
  idBackUrl: z.string().optional(),
  selfieUrl: z.string().optional(),
});

export function parseBody<T>(schema: z.ZodSchema<T>, body: unknown): { ok: true; data: T } | { ok: false; error: string } {
  const r = schema.safeParse(body);
  if (!r.success) {
    const first = r.error.errors[0];
    return { ok: false, error: `${first.path.join(".")}: ${first.message}` };
  }
  return { ok: true, data: r.data };
}
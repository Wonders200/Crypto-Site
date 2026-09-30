import { AdminUser, AdminKycSubmission, KycStatus, Store } from "./adminStore";

/**
 * The ONE source of truth for a user's KYC status.
 *
 * Priority  verified > pending > rejected > unverified.
 *
 * Checks BOTH:
 *    user.kycStatus / user.kycVerified
 *    the user's most recent submission
 *
 * If EITHER says "verified", the user is verified. Period.
 * An admin Reset is the ONLY way to undo it.
 */
export function resolveKycStatus(
  user: AdminUser | undefined | null,
  submission?: AdminKycSubmission | undefined
): KycStatus {
  const statuses: KycStatus[] = [];

  if (user) {
    if (user.kycStatus) statuses.push(user.kycStatus);
    if (user.kycVerified && user.kycStatus !== "rejected") statuses.push("verified");
  }
  if (submission) {
    if (submission.status) statuses.push(submission.status);
  }

  if (statuses.includes("verified")) return "verified";
  if (statuses.includes("pending")) return "pending";
  if (statuses.includes("rejected")) return "rejected";
  return "unverified";
}

/** Find the latest submission for a user (undefined if none). */
export function latestSubmission(store: Store, userId: string | undefined): AdminKycSubmission | undefined {
  if (!userId) return undefined;
  const subs = (store.kycSubmissions ?? []).filter(s => s.userId === userId);
  if (subs.length === 0) return undefined;
  return subs.sort((a, b) => b.submittedAt - a.submittedAt)[0];
}

/** Convenience: resolve a user's KYC status straight from the store. */
export function kycStatusFromStore(store: Store, user: AdminUser | undefined | null): KycStatus {
  return resolveKycStatus(user, latestSubmission(store, user?.id));
}

/* Backward-compat: old callers use getKycStatus(user, submission). */
export function getKycStatus(
  user: AdminUser | undefined | null,
  submission?: AdminKycSubmission | undefined
): KycStatus {
  return resolveKycStatus(user, submission);
}

/** Reconcile user records from submissions. Returns list of users that changed. */
export function findKycMismatches(store: Store): { userId: string; newStatus: KycStatus }[] {
  const out: { userId: string; newStatus: KycStatus }[] = [];
  for (const user of store.users ?? []) {
    const sub = latestSubmission(store, user.id);
    if (!sub) continue;
    const resolved = resolveKycStatus(user, sub);
    const current = user.kycStatus ?? "unverified";
    // Only flag when the source of truth disagrees with the user record
    if (resolved === "verified" && current !== "verified") {
      out.push({ userId: user.id, newStatus: "verified" });
    } else if (resolved === "pending" && current !== "pending") {
      out.push({ userId: user.id, newStatus: "pending" });
    } else if (resolved === "rejected" && current !== "rejected") {
      out.push({ userId: user.id, newStatus: "rejected" });
    }
  }
  return out;
}

export function kycLabel(s: KycStatus): string {
  return {
    unverified: "Identity not verified",
    pending: "Verification in review",
    verified: "Identity verified",
    rejected: "Verification rejected",
  }[s];
}

export function kycDescription(s: KycStatus): string {
  return {
    unverified: "You'll need to verify your identity before depositing, withdrawing, trading, or earning yield.",
    pending: "Your documents are being reviewed. This usually takes 1 business day.",
    verified: "You have full access to deposits, withdrawals, trading, and earn products. Nothing more to do.",
    rejected: "We couldn't verify your identity. Please review the reason and resubmit.",
  }[s];
}

export function kycBadgeKind(s: KycStatus): "green" | "amber" | "red" | "gray" {
  return { verified: "green", pending: "amber", rejected: "red", unverified: "gray" }[s];
}
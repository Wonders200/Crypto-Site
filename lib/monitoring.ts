const DSN = process.env.SENTRY_DSN ?? "";

export function hasSentry(): boolean {
  return Boolean(DSN);
}

export async function captureError(err: unknown, context?: Record<string, any>): Promise<void> {
  const message = err instanceof Error ? err.message : String(err);
  if (!DSN) {
    console.error("[error]", message, context ?? "");
    return;
  }
  try {
    const sentryModule = "@sentry/node";
    const Sentry: any = await import(/* webpackIgnore: true */ sentryModule).catch(() => null);
    if (!Sentry) { console.error("[error]", message); return; }
    Sentry.captureException(err, { extra: context });
  } catch {
    console.error("[error]", message, context ?? "");
  }
}
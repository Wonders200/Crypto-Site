"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-lg mx-auto px-6 py-32 text-center">
      <h2 className="text-2xl font-bold" style={{ color: "var(--red)" }}>Something went wrong</h2>
      <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>{error.message}</p>
      <button onClick={reset} className="mt-6 px-6 py-2.5 rounded-lg font-semibold text-black text-sm" style={{ background: "var(--green)" }}>Try again</button>
    </div>
  );
}
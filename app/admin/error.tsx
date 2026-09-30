"use client";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log to console for debugging
    console.error("[Admin error boundary]", error);
  }, [error]);

  return (
    <div className="max-w-lg mx-auto py-20 px-6 text-center">
      <div className="panel p-8">
        <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
          style={{ background: "var(--red-dim)", color: "var(--red)" }}>
          <AlertTriangle size={24} />
        </div>
        <h2 className="text-xl font-bold mt-5">This admin page hit an error</h2>
        <p className="text-sm mt-3" style={{ color: "var(--muted)" }}>
          The rest of the admin panel is still working. You can try again or go back to the dashboard.
        </p>
        {error.message && (
          <div className="mt-4 rounded-lg p-3 text-xs mono text-left break-all"
            style={{ background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--muted)" }}>
            {error.message}
          </div>
        )}
        <div className="mt-6 flex justify-center gap-2 flex-wrap">
          <button onClick={reset} className="btn btn-primary">Try again</button>
          <a href="/admin" className="btn btn-ghost">Back to dashboard</a>
        </div>
      </div>
    </div>
  );
}
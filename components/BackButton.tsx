"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * Friendly back button.
 * Uses router.back() when there's history; falls back to `fallback` path
 * when the user landed here directly (e.g. from a bookmark or external link).
 */
export default function BackButton({
  fallback = "/markets",
  label = "Back",
  className = "",
}: {
  fallback?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  const handleClick = () => {
    // history.length > 1 means the user has navigated within the app
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition hover:bg-[color:var(--panel-2)] ${className}`}
      style={{ color: "var(--muted)" }}
    >
      <ArrowLeft size={14} />
      {label}
    </button>
  );
}
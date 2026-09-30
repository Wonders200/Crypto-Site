import Link from "next/link";
export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-6 py-32 text-center">
      <h1 className="text-7xl font-bold" style={{ color: "var(--muted-2)" }}>404</h1>
      <p className="mt-4 text-lg">Page not found</p>
      <Link href="/" className="inline-block mt-8 px-6 py-2.5 rounded-lg font-semibold text-black text-sm" style={{ background: "var(--green)" }}>Back to home</Link>
    </div>
  );
}
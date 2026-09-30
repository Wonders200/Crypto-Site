export default function Loading() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-6 animate-pulse">
      <div className="h-10 w-64 rounded-lg" style={{ background: "var(--panel)" }} />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl" style={{ background: "var(--panel)" }} />
        ))}
      </div>
      <div className="h-96 rounded-xl" style={{ background: "var(--panel)" }} />
    </div>
  );
}
export default function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: [string, string][];
}) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div assName="mb-10">
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>Last updated: {updated}</p>
      </div>
      <div className="space-y-8">
        {sections.map(([h, b]) => (
          <section key={h}>
            <h2 className="text-lg font-semibold mb-3">{h}</h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{b}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
export default function EmptyState({
  title,
  message,
  icon = "",
  action,
}: {
  title: string;
  message: string;
  icon?: string;
  action?: { label: string; href?: string; onClick?: () => void };
}) {
  return (
    <div className="panel text-center py-16 px-6 float-in">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm max-w-md mx-auto" style={{ color: "var(--muted)" }}>
        {message}
      </p>
      {action && (
        action.href ? (
          <a
            href={action.href}
            className="btn btn-primary inline-flex mt-6"
          >
            {action.label}
          </a>
        ) : (
          <button onClick={action.onClick} className="btn btn-primary inline-flex mt-6">
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
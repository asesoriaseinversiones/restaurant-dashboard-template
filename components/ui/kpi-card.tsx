interface KpiCardProps {
  title: string;
  value: string;
  hint?: string;
}

export function KpiCard({ title, value, hint }: KpiCardProps) {
  return (
    <article className="panel p-4">
      <p className="text-xs uppercase tracking-wide text-muted">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </article>
  );
}

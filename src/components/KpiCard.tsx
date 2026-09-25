export default function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="card card-hover relative overflow-hidden">
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-brand/70 to-brand/0" />
      <p className="text-xs uppercase tracking-wider text-muted mt-1">
        {label}
      </p>
      <p className={`text-2xl font-bold mt-2 ${accent ?? "text-text"}`}>
        {value}
      </p>
    </div>
  );
}
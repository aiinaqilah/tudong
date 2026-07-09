export default function KpiCard({
  label,
  value,
  deltaPct,
}: {
  label: string;
  value: string;
  /** Week-over-week change; null hides the badge (not enough history). */
  deltaPct?: number | null;
}) {
  const up = deltaPct != null && deltaPct >= 0;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
      {deltaPct != null && (
        <p
          className={`mt-1 inline-flex items-center gap-1 text-xs font-medium ${
            up ? "text-green-600" : "text-red-600"
          }`}
        >
          <span aria-hidden>{up ? "▲" : "▼"}</span>
          {Math.abs(deltaPct).toFixed(0)}%
          <span className="font-normal text-gray-400">vs prev. 7 days</span>
        </p>
      )}
    </div>
  );
}

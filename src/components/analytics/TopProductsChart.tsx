import { formatPrice } from "@/lib/utils";
import type { ProductStat } from "@/actions/analytics-actions";

export default function TopProductsChart({ data }: { data: ProductStat[] }) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">No sales yet.</p>;
  }

  const max = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <ul className="space-y-3.5">
      {data.map((d, i) => (
        <li
          key={i}
          title={`${d.title} — ${formatPrice(d.revenue)} · ${d.units} sold`}
        >
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-gray-700">
              <span className="mr-1.5 text-gray-400">{i + 1}.</span>
              {d.title}
            </span>
            <span className="shrink-0 font-medium tabular-nums text-gray-900">
              {formatPrice(d.revenue)}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-indigo-500"
              style={{ width: `${Math.max(4, (d.revenue / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

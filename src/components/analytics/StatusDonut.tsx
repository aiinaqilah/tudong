import type { StatusStat } from "@/actions/analytics-actions";

// Reserved status colours — kept consistent with the order StatusBadge used
// across the dashboard. Status colour is never reused for a generic series.
const STATUS_META: Record<string, { label: string; color: string }> = {
  PROCESSING: { label: "Processing", color: "#f59e0b" },
  SHIPPED: { label: "Shipped", color: "#8b5cf6" },
  DELIVERED: { label: "Delivered", color: "#22c55e" },
  CANCELLED: { label: "Cancelled", color: "#ef4444" },
};

const R = 60;
const STROKE = 22;
const C = 2 * Math.PI * R;
const GAP = 3; // path-unit gap between segments

export default function StatusDonut({ data }: { data: StatusStat[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const present = data.filter((d) => d.count > 0);

  // Build cumulative arc offsets (only for non-empty segments). Computed
  // functionally — no in-render mutation — to satisfy the React Compiler.
  const lens = present.map((d) => (d.count / total) * C);
  const arcs = present.map((d, i) => ({
    ...d,
    len: lens[i],
    start: lens.slice(0, i).reduce((s, l) => s + l, 0),
  }));

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
      <svg
        viewBox="0 0 160 160"
        className="h-40 w-40 shrink-0"
        role="img"
        aria-label="Orders by status"
      >
        <g transform="rotate(-90 80 80)">
          <circle cx={80} cy={80} r={R} fill="none" stroke="#f1f1f4" strokeWidth={STROKE} />
          {arcs.map((a) => {
            const dash = Math.max(0, a.len - (total > 1 ? GAP : 0));
            return (
              <circle
                key={a.status}
                cx={80}
                cy={80}
                r={R}
                fill="none"
                stroke={STATUS_META[a.status]?.color ?? "#9ca3af"}
                strokeWidth={STROKE}
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={-a.start}
              />
            );
          })}
        </g>
        <text
          x={80}
          y={74}
          textAnchor="middle"
          className="fill-gray-900"
          fontSize="26"
          fontWeight="700"
        >
          {total}
        </text>
        <text x={80} y={92} textAnchor="middle" className="fill-gray-400" fontSize="11">
          {total === 1 ? "order" : "orders"}
        </text>
      </svg>

      <ul className="w-full space-y-2 text-sm">
        {data.map((d) => {
          const meta = STATUS_META[d.status];
          return (
            <li key={d.status} className="flex items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: meta?.color ?? "#9ca3af" }}
                aria-hidden
              />
              <span className="text-gray-700">{meta?.label ?? d.status}</span>
              <span className="ml-auto tabular-nums text-gray-900">{d.count}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

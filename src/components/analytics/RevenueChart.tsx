"use client";

import { useRef, useState } from "react";
import type { DayPoint } from "@/actions/analytics-actions";

const W = 720;
const H = 260;
const PL = 52; // left pad for y labels
const PR = 16;
const PT = 16;
const PB = 30; // bottom pad for x labels
const PLOT_W = W - PL - PR;
const PLOT_H = H - PT - PB;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function dateParts(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}
function shortDate(iso: string) {
  const { m, d } = dateParts(iso);
  return `${d} ${MONTHS[m - 1]}`;
}
function longDate(iso: string) {
  const { y, m, d } = dateParts(iso);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
function niceCeil(v: number) {
  if (v <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return nice * pow;
}
function axisLabel(v: number) {
  if (v >= 1000) return `RM ${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return `RM ${Math.round(v)}`;
}
function fullRM(v: number) {
  return new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR" }).format(v);
}

export default function RevenueChart({ data }: { data: DayPoint[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const n = data.length;
  const maxY = niceCeil(Math.max(1, ...data.map((d) => d.revenue)));
  const hasData = data.some((d) => d.revenue > 0);

  const x = (i: number) => (n <= 1 ? PL + PLOT_W / 2 : PL + (i / (n - 1)) * PLOT_W);
  const y = (v: number) => PT + (1 - v / maxY) * PLOT_H;
  const baseline = PT + PLOT_H;

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.revenue).toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${x(n - 1).toFixed(1)},${baseline} L${x(0).toFixed(1)},${baseline} Z`;

  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const xTickIdx = [...new Set([0, Math.floor((n - 1) / 2), n - 1])];

  function onMove(e: React.PointerEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const rel = (px - PL) / PLOT_W;
    const idx = Math.max(0, Math.min(n - 1, Math.round(rel * (n - 1))));
    setHover(idx);
  }

  const hp = hover != null ? data[hover] : null;

  return (
    <div
      ref={ref}
      className="relative w-full touch-none"
      onPointerMove={onMove}
      onPointerLeave={() => setHover(null)}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Revenue over time">
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((f, i) => {
          const gy = PT + f * PLOT_H;
          return (
            <g key={i}>
              <line x1={PL} y1={gy} x2={W - PR} y2={gy} stroke="#f1f1f4" strokeWidth={1} />
              <text x={PL - 8} y={gy + 3} textAnchor="end" fontSize={10} fill="#9ca3af">
                {axisLabel(maxY * (1 - f))}
              </text>
            </g>
          );
        })}

        {hasData && <path d={areaPath} fill="url(#revFill)" />}
        <path
          d={linePath}
          fill="none"
          stroke="#ef4444"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {xTickIdx.map((i) => (
          <text key={i} x={x(i)} y={H - 10} textAnchor="middle" fontSize={10} fill="#9ca3af">
            {shortDate(data[i].date)}
          </text>
        ))}

        {hp && (
          <g>
            <line
              x1={x(hover as number)}
              y1={PT}
              x2={x(hover as number)}
              y2={baseline}
              stroke="#ef4444"
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.5}
            />
            <circle
              cx={x(hover as number)}
              cy={y(hp.revenue)}
              r={4}
              fill="#ef4444"
              stroke="#fff"
              strokeWidth={2}
            />
          </g>
        )}
      </svg>

      {hp && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs text-white shadow-lg"
          style={{ left: `${(x(hover as number) / W) * 100}%`, top: `${(y(hp.revenue) / H) * 100}%` }}
        >
          <p className="font-semibold tabular-nums">{fullRM(hp.revenue)}</p>
          <p className="text-gray-300">
            {longDate(hp.date)} · {hp.orders} order{hp.orders === 1 ? "" : "s"}
          </p>
        </div>
      )}
    </div>
  );
}

import React from "react";

/**
 * Recharts tooltip that stays readable in BOTH light & dark mode.
 * Uses CSS variables defined in src/index.css.
 */
export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        background: "var(--chart-tooltip-bg)",
        border: "1px solid var(--chart-tooltip-border)",
        color: "var(--chart-fg-strong)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)"
      }}
      className="rounded-2xl px-3 py-2 shadow-sm"
    >
      <div className="text-[11px] font-bold" style={{ color: "var(--chart-fg)" }}>
        {label}
      </div>
      <div className="mt-1 grid gap-1">
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4 text-xs font-semibold">
            <span className="truncate" style={{ color: "var(--chart-fg)" }}>
              {p.name}
            </span>
            <span style={{ color: "var(--chart-fg-strong)" }}>{p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

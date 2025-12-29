import React from "react";

export default function StatPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white/60 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
      <div className="text-xs font-semibold text-zinc-600 dark:text-white/60">{label}</div>
      <div className="mt-1 text-lg font-extrabold tracking-tight">{value}</div>
    </div>
  );
}

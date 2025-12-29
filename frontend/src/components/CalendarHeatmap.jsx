import React from "react";
import { motion } from "framer-motion";

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

/**
 * data: [{ day: "YYYY-MM-DD", solved: number }]
 * Responsive heatmap for ~13 weeks (91 days).
 */
export default function CalendarHeatmap({ data = [] }) {
  const days = [...data]
    .filter((d) => d && d.day)
    .sort((a, b) => String(a.day).localeCompare(String(b.day)));

  if (days.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200/70 bg-white/60 p-4 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
        No activity yet — solve your first problem and your streak will appear here.
      </div>
    );
  }

  const max = Math.max(1, ...days.map((d) => Number(d.solved || 0)));

  const cells = days.map((d) => {
    const v = Number(d.solved || 0);
    const intensity = clamp(Math.round((v / max) * 4), 0, 4);
    return { ...d, solved: v, intensity };
  });

  // Pad to full weeks
  while (cells.length % 7 !== 0) {
    cells.push({ day: `pad-${cells.length}`, solved: 0, intensity: 0, __pad: true });
  }

  // Refined Color Palette: Seamless gradient from subtle to vibrant
  const bg = (i) => {
    if (i === 0) return "bg-zinc-100/80 dark:bg-white/5"; // Empty: barely visible
    if (i === 1) return "bg-emerald-300 dark:bg-emerald-900/60";
    if (i === 2) return "bg-emerald-400 dark:bg-emerald-600";
    if (i === 3) return "bg-cyan-400 dark:bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.4)]"; // Glow
    return "bg-fuchsia-500 dark:bg-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.7)]"; // Super Glow
  };

  return (
    <div>
      <div className="w-full overflow-x-auto pb-4 pt-2 scrollbar-hide px-1">
        <div className="flex gap-[4px]">
          {/* We render vertically by column manually to allow complex flex gaps if needed, 
              but grid is easiest. Let's stick to Grid but with Motion layout. */}
          <div
            className="grid grid-rows-7 grid-flow-col gap-[5px]"
          >
            {cells.map((c, idx) => (
              <motion.div
                key={c.day || idx}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: idx * 0.005,
                  type: "spring",
                  stiffness: 300,
                  damping: 18
                }}
                whileHover={!c.__pad ? {
                  scale: 1.25,
                  zIndex: 10,
                  transition: { duration: 0.2 }
                } : {}}
                className={[
                  "h-[18px] w-[18px] rounded-[5px] transition-colors relative",
                  // Use a pseudo-element for tooltip or stick to native title for simplicity
                  c.__pad ? "opacity-0 pointer-events-none" : `${bg(c.intensity)} cursor-pointer`,
                ].join(" ")}
                title={c.__pad ? "" : `${c.day}\n${c.solved} solved`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-500 dark:text-white/40">
        <div className="inline-flex items-center gap-3 bg-zinc-100/50 dark:bg-white/5 px-3 py-1.5 rounded-full border border-zinc-200/50 dark:border-white/5">
          <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">Less</span>
          <div className="flex items-center gap-[4px]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={[
                  "h-[10px] w-[10px] rounded-[2px]",
                  bg(i),
                ].join(" ")}
              />
            ))}
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">More</span>
        </div>

        <div className="font-medium">
          Consistency is key.
        </div>
      </div>
    </div>
  );
}

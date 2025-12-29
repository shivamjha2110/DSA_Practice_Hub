import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, CheckCircle2, RotateCcw } from "lucide-react";

function pct(solved, total) {
  if (!total) return 0;
  return Math.round((solved / total) * 100);
}

export default function SheetCard({ list }) {
  const progress = pct(list.solved, list.total);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Link
        to={`/lists/${list.slug}`}
        className="group card block overflow-hidden rounded-3xl border border-white/20 bg-white/60 p-6 shadow-2xl shadow-emerald-500/5 backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-emerald-500/10 dark:border-white/5 dark:bg-zinc-900/50"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/40 px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {list.group}
            </div>
            <h3 className="mt-3 text-lg font-extrabold leading-tight tracking-tight text-zinc-900 dark:text-white">
              {list.name}
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {list.total} questions • {progress}% complete
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900/5 text-zinc-700 transition group-hover:bg-emerald-500/15 group-hover:text-emerald-700 dark:bg-white/5 dark:text-zinc-200 dark:group-hover:bg-emerald-500/15 dark:group-hover:text-emerald-300">
            <ChevronRight className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-900/10 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-semibold">Solved</span>
              <span className="tabular-nums">{list.solved}</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/10 px-3 py-1 text-cyan-800 dark:text-cyan-200">
              <RotateCcw className="h-4 w-4" />
              <span className="font-semibold">Revisit</span>
              <span className="tabular-nums">{list.revisit}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

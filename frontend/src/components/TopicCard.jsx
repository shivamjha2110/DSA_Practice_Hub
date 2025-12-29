import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { pct } from "../lib/utils";

export default function TopicCard({ topic }) {
  const p = pct(topic.solved, topic.total);

  return (
    <Link
      to={`/topics/${topic.id}`}
      className="group relative block overflow-hidden rounded-3xl border border-zinc-200/50 bg-white/60 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:bg-white/80 hover:shadow-xl hover:shadow-emerald-500/10 dark:border-white/5 dark:bg-zinc-900/40 dark:hover:border-emerald-500/20 dark:hover:bg-zinc-900/60"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-fuchsia-500/5 opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{topic.name}</div>
            <div className="mt-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {topic.solved}/{topic.total} solved
              {typeof topic.revisit === "number" && topic.revisit > 0 ? (
                <span className="ml-2 inline-flex items-center rounded-full border border-fuchsia-500/30 bg-fuchsia-100/50 px-2 py-0.5 text-[10px] font-bold text-fuchsia-700 dark:border-fuchsia-500/30 dark:bg-fuchsia-500/10 dark:text-fuchsia-300">
                  <span className="mr-1 h-1.5 w-1.5 rounded-full bg-fuchsia-500 animate-pulse" />
                  Review {topic.revisit}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 transition-colors group-hover:bg-emerald-500 group-hover:text-white dark:bg-white/5 dark:text-zinc-500">
            <ArrowRight size={16} />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-end justify-between text-xs font-semibold mb-2">
            <span className="text-zinc-500 dark:text-zinc-400">Progress</span>
            <span className="text-emerald-600 dark:text-emerald-400">{p}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-fuchsia-500 transition-all duration-1000 ease-out group-hover:brightness-110"
              style={{ width: `${p}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

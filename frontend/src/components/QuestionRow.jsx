import React from "react";
import { CheckCircle2, Circle, ExternalLink, RotateCcw } from "lucide-react";
import { api } from "../lib/api";

function badgeClass(difficulty) {
  if (difficulty === "Easy")
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 dark:bg-emerald-500/15";
  if (difficulty === "Medium")
    return "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-200 dark:bg-amber-500/15";
  if (difficulty === "Hard")
    return "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-200 dark:bg-rose-500/15";
  return "border-zinc-200/70 bg-white/60 text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-white/70";
}

export default function QuestionRow({ q, onUpdate }) {
  const toggleSolved = async () => {
    const { data } = await api.patch(`/questions/${q.id}/toggle`);
    onUpdate(q.id, data);
  };

  const toggleRevisit = async () => {
    const { data } = await api.patch(`/questions/${q.id}/revisit`);
    onUpdate(q.id, data);
  };

  return (
    <div className="group relative flex items-start gap-3 rounded-2xl border border-zinc-200/70 bg-white/70 p-3 shadow-sm backdrop-blur transition-all sm:items-center sm:p-4 dark:border-white/10 dark:bg-white/5 dark:shadow-none">
      <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
        <button
          onClick={toggleSolved}
          className="rounded-2xl p-2 hover:bg-zinc-900/5 dark:hover:bg-white/10"
          aria-label="Toggle solved"
          title={q.isSolved ? "Unmark solved" : "Mark solved"}
        >
          {q.isSolved ? (
            <CheckCircle2 size={22} className="text-emerald-500" />
          ) : (
            <Circle size={22} className="text-zinc-400 dark:text-white/40" />
          )}
        </button>

        <button
          onClick={toggleRevisit}
          className={[
            "rounded-2xl p-2 hover:bg-zinc-900/5 dark:hover:bg-white/10 hidden sm:block",
            q.isRevisit ? "text-fuchsia-600 dark:text-fuchsia-300" : "text-zinc-500 dark:text-white/50"
          ].join(" ")}
          aria-label="Toggle revisit"
          title={q.isRevisit ? "Remove from Revisit" : "Add to Revisit"}
        >
          <RotateCcw size={18} />
        </button>
      </div>

      <div className="min-w-0 flex-1 py-1.5 sm:py-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <a
            href={q.link}
            target="_blank"
            rel="noreferrer"
            className="mr-1 line-clamp-2 text-sm font-semibold leading-tight hover:underline sm:text-base sm:line-clamp-1"
            title={q.title}
          >
            {q.title}
          </a>
          <span className={"shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold sm:text-[11px] " + badgeClass(q.difficulty)}>
            {q.difficulty}
          </span>
          {q.isRevisit ? (
            <span className="shrink-0 rounded-full border border-fuchsia-500/25 bg-fuchsia-500/10 px-2 py-0.5 text-[10px] font-bold text-fuchsia-700 dark:text-fuchsia-200 dark:bg-fuchsia-500/15 sm:text-[11px]">
              Revisit
            </span>
          ) : null}
        </div>

        {q.tags ? (
          <div className="mt-1.5 flex flex-wrap gap-2 text-xs font-medium text-zinc-500 dark:text-white/50">
            {q.tags.split(",").map((tag) => (
              <span key={tag} className="">#{tag.trim()}</span>
            ))}
          </div>
        ) : null}

        {/* Mobile only revisit button */}
        <div className="mt-2 flex sm:hidden">
          <button
            onClick={toggleRevisit}
            className={[
              "flex items-center gap-1.5 text-xs font-semibold",
              q.isRevisit ? "text-fuchsia-600 dark:text-fuchsia-300" : "text-zinc-500 dark:text-zinc-500"
            ].join(" ")}
          >
            <RotateCcw size={14} />
            {q.isRevisit ? "Revisiting" : "Revisit"}
          </button>
        </div>
      </div>

      <a
        href={q.link}
        target="_blank"
        rel="noreferrer"
        className="shrink-0 rounded-2xl p-2 text-zinc-600 hover:bg-zinc-900/5 dark:text-white/60 dark:hover:bg-white/10"
        aria-label="Open problem"
        title="Open in LeetCode"
      >
        <ExternalLink size={18} />
      </a>
    </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, SlidersHorizontal } from "lucide-react";
import { api } from "../lib/api";
import QuestionRow from "../components/QuestionRow";

const DIFFS = ["", "Easy", "Medium", "Hard"];

function diffRank(difficulty) {
  if (difficulty === "Easy") return 1;
  if (difficulty === "Medium") return 2;
  if (difficulty === "Hard") return 3;
  return 99;
}

function sortQuestions(list, sortKey) {
  const arr = [...list];
  switch (sortKey) {
    case "title":
      arr.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "difficulty":
      arr.sort((a, b) => {
        const d = diffRank(a.difficulty) - diffRank(b.difficulty);
        return d !== 0 ? d : a.title.localeCompare(b.title);
      });
      break;
    case "solvedFirst":
      arr.sort((a, b) => {
        const d = (b.isSolved ? 1 : 0) - (a.isSolved ? 1 : 0);
        return d !== 0 ? d : a.title.localeCompare(b.title);
      });
      break;
    default:
      // keep original server order (most recent revisit first)
      arr.sort((a, b) => (a._idx ?? 0) - (b._idx ?? 0));
  }
  return arr;
}

export default function Revisit() {
  const [questions, setQuestions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [q, setQ] = React.useState("");
  const [difficulty, setDifficulty] = React.useState("");
  const [sortKey, setSortKey] = React.useState("");
  const [onlyUnsolved, setOnlyUnsolved] = React.useState(false);
  const [error, setError] = React.useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/questions/revisit", { params: { q, difficulty } });
      const list = (data.questions || []).map((item, i) => ({ ...item, _idx: i }));
      setQuestions(list);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load revisit list");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onUpdate = (id, patch) => {
    setQuestions((prev) => {
      const next = prev
        .map((x) =>
          String(x.id) === String(id)
            ? {
                ...x,
                isSolved: typeof patch?.isSolved === "boolean" ? patch.isSolved : x.isSolved,
                isRevisit: typeof patch?.isRevisit === "boolean" ? patch.isRevisit : x.isRevisit
              }
            : x
        )
        .filter((x) => x.isRevisit); // if user unmarks revisit, remove from list
      return next;
    });
  };

  const derived = React.useMemo(() => {
    const filtered = onlyUnsolved ? questions.filter((x) => !x.isSolved) : questions;
    return sortQuestions(filtered, sortKey);
  }, [questions, onlyUnsolved, sortKey]);

  const solvedCount = questions.filter((x) => x.isSolved).length;

  return (
    <div className="container-app py-8">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/app"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:underline dark:text-white/80"
        >
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-white/60">
          <span className="rounded-full border border-fuchsia-500/25 bg-fuchsia-500/10 px-3 py-1 text-fuchsia-700 dark:text-fuchsia-200 dark:bg-fuchsia-500/15">
            Revisit: {questions.length}
          </span>
          <span className="rounded-full border border-zinc-200/70 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/5">
            Solved here: {solvedCount}
          </span>
        </div>
      </div>

      <div className="mt-6 card p-6 sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm font-extrabold tracking-tight">Revisit queue</div>
            <div className="mt-1 muted">Your "do again later" list across all topics.</div>
          </div>

          <button onClick={load} className="btn" disabled={loading} title="Refresh revisit list">
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-white/40"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="input pl-11"
              placeholder="Search by title or tags (press Apply)"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="input"
              aria-label="Difficulty"
            >
              {DIFFS.map((d) => (
                <option key={d} value={d}>
                  {d || "All"}
                </option>
              ))}
            </select>

            <button
              className="btn inline-flex items-center gap-2"
              onClick={load}
              disabled={loading}
              title="Apply filters"
            >
              <SlidersHorizontal size={16} /> Apply
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-white/80">
              <input
                type="checkbox"
                checked={onlyUnsolved}
                onChange={(e) => setOnlyUnsolved(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 dark:border-white/20"
              />
              Only unsolved
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-600 dark:text-white/60">Sort</span>
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} className="input" aria-label="Sort">
              <option value="">Recent</option>
              <option value="title">Title A–Z</option>
              <option value="difficulty">Difficulty</option>
              <option value="solvedFirst">Solved first</option>
            </select>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-3">
          {derived.length ? (
            derived.map((qq) => <QuestionRow key={qq.id} q={qq} onUpdate={onUpdate} />)
          ) : (
            <div className="rounded-2xl border border-zinc-200/70 bg-white/60 px-4 py-8 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
              No questions in your revisit queue yet. Add some from any topic.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

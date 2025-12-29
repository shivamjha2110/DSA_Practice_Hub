import React from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import QuestionRow from "../components/QuestionRow";
import { ArrowLeft, Search, SlidersHorizontal } from "lucide-react";

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
    case "revisitFirst":
      arr.sort((a, b) => {
        const d = (b.isRevisit ? 1 : 0) - (a.isRevisit ? 1 : 0);
        return d !== 0 ? d : a.title.localeCompare(b.title);
      });
      break;
    default:
      // already sorted from server
      break;
  }
  return arr;
}

export default function TopicDetail() {
  const { topicId } = useParams();
  const [topic, setTopic] = React.useState(null);
  const [questions, setQuestions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const [search, setSearch] = React.useState("");
  const [difficulty, setDifficulty] = React.useState("");
  const [sortKey, setSortKey] = React.useState("");
  const [onlyUnsolved, setOnlyUnsolved] = React.useState(false);
  const [onlyRevisit, setOnlyRevisit] = React.useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/topics/${topicId}/questions`);
      setTopic(data.topic);
      setQuestions(data.questions || []);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  const onUpdate = (id, patch) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
            ...q,
            isSolved: typeof patch?.isSolved === "boolean" ? patch.isSolved : q.isSolved,
            isRevisit: typeof patch?.isRevisit === "boolean" ? patch.isRevisit : q.isRevisit
          }
          : q
      )
    );
  };

  const solvedCount = questions.filter((q) => q.isSolved).length;
  const revisitCount = questions.filter((q) => q.isRevisit).length;

  const derived = React.useMemo(() => {
    let list = [...questions];
    if (difficulty) list = list.filter((x) => x.difficulty === difficulty);
    if (onlyUnsolved) list = list.filter((x) => !x.isSolved);
    if (onlyRevisit) list = list.filter((x) => x.isRevisit);

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (x) => x.title.toLowerCase().includes(q) || String(x.tags || "").toLowerCase().includes(q)
      );
    }
    return sortQuestions(list, sortKey);
  }, [questions, difficulty, onlyUnsolved, onlyRevisit, search, sortKey]);

  if (loading) {
    return (
      <div className="container-app py-8">
        {/* Skeleton Header */}
        <div className="flex items-center justify-between gap-4 animate-pulse">
          <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="flex gap-2">
            <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
            <div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
          </div>
        </div>

        {/* Skeleton Card */}
        <div className="mt-6 card p-6 sm:p-7 animate-pulse">
          <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 rounded mb-2"></div>
          <div className="h-4 w-64 bg-zinc-200 dark:bg-zinc-800 rounded mb-6"></div>

          <div className="grid gap-3 md:grid-cols-3 mb-6">
            <div className="md:col-span-2 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
              <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg"></div>
            </div>
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 w-full bg-zinc-100 dark:bg-white/5 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <div className="flex items-center justify-between gap-4">
        <Link to="/app" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:underline dark:text-white/80">
          <ArrowLeft size={16} /> Back
        </Link>

        <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-white/60">
          <span className="rounded-full border border-zinc-200/70 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/5">
            Solved: {solvedCount}/{questions.length}
          </span>
          <span className="rounded-full border border-fuchsia-500/25 bg-fuchsia-500/10 px-3 py-1 text-fuchsia-700 dark:text-fuchsia-200 dark:bg-fuchsia-500/15">
            Revisit: {revisitCount}
          </span>
        </div>
      </div>

      <div className="mt-6 card p-6 sm:p-7">
        <div className="text-sm font-extrabold tracking-tight">{topic?.name || "Topic"}</div>
        <div className="mt-1 muted">
          Mark problems as solved, or add to <span className="font-semibold text-fuchsia-700 dark:text-fuchsia-200">Revisit</span> for later.
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-11"
              placeholder="Search by title or tags"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input" aria-label="Difficulty">
              {DIFFS.map((d) => (
                <option key={d} value={d}>
                  {d || "All"}
                </option>
              ))}
            </select>
            <div className="relative">
              <SlidersHorizontal size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-white/40" />
              <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} className="input pl-11" aria-label="Sort">
                <option value="">Default</option>
                <option value="title">Title A–Z</option>
                <option value="difficulty">Difficulty</option>
                <option value="solvedFirst">Solved first</option>
                <option value="revisitFirst">Revisit first</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-white/80">
            <input
              type="checkbox"
              checked={onlyUnsolved}
              onChange={(e) => setOnlyUnsolved(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 dark:border-white/20"
            />
            Only unsolved
          </label>
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-white/80">
            <input
              type="checkbox"
              checked={onlyRevisit}
              onChange={(e) => setOnlyRevisit(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 dark:border-white/20"
            />
            Only revisit
          </label>
          <div className="text-xs font-semibold text-zinc-600 dark:text-white/60">
            Showing <span className="font-extrabold">{derived.length}</span> / {questions.length}
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {derived.map((q) => (
            <QuestionRow key={q.id} q={q} onUpdate={onUpdate} />
          ))}
        </div>
      </div>
    </div>
  );
}

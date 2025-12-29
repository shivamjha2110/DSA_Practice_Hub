import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import QuestionRow from "../components/QuestionRow";
import { motion } from "framer-motion";
import { BarChart3, Filter, Search, Layers, ListChecks, ArrowLeft } from "lucide-react";

const DIFFS = ["Easy", "Medium", "Hard"];

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/50 px-3 py-1 text-xs font-semibold text-zinc-700 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
      {children}
    </span>
  );
}

export default function ListDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [meta, setMeta] = React.useState(null);
  const [summary, setSummary] = React.useState(null);
  const [questions, setQuestions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [filters, setFilters] = React.useState({ search: "", difficulty: "", status: "all", sort: "order" });

  async function loadAll() {
    setLoading(true);
    const [qRes, sRes] = await Promise.all([
      api.get(`/lists/${slug}/questions`, { params: filters }),
      api.get(`/lists/${slug}/summary`)
    ]);
    setMeta(qRes.data.list);
    setQuestions(qRes.data.questions || []);
    setSummary(sRes.data);
    setLoading(false);
  }

  React.useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      loadAll();
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.difficulty, filters.status, filters.sort]);

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

  if (loading) {
    return (
      <div className="container-app py-10">
        <div className="h-32 rounded-3xl bg-zinc-100 dark:bg-white/5 animate-pulse" />
        <div className="mt-8 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-zinc-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:underline dark:text-white/80 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/60 p-8 shadow-2xl shadow-emerald-500/5 backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/50">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-fuchsia-500/5" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{meta?.group}</Badge>
            <Badge><ListChecks className="mr-2 h-3.5 w-3.5" />{meta?.total} Questions</Badge>
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            {meta?.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Tick them off, one by one. You got this.
          </p>
        </div>
      </div>



      {/* Filters */}
      <div className="mt-8 card rounded-3xl p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              placeholder="Search question title / tags"
              className="w-full rounded-2xl border border-zinc-200/80 bg-zinc-50/50 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none ring-0 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters((f) => ({ ...f, difficulty: e.target.value }))}
              className="w-full appearance-none rounded-2xl border border-zinc-200/80 bg-zinc-50/50 py-2.5 pl-10 pr-8 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value="">All difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>

            </select>
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="w-full appearance-none rounded-2xl border border-zinc-200/80 bg-zinc-50/50 py-2.5 px-3 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="all">All</option>
            <option value="solved">Solved</option>
            <option value="unsolved">Unsolved</option>
            <option value="revisit">Revisit</option>
          </select>

          <select
            value={filters.sort}
            onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
            className="w-full appearance-none rounded-2xl border border-zinc-200/80 bg-zinc-50/50 py-2.5 px-3 text-sm text-zinc-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="order">Sheet order</option>
            <option value="difficulty">Difficulty</option>
            <option value="title">Title (A–Z)</option>
          </select>
        </div>
      </div>

      {/* Questions */}
      <div className="mt-6 space-y-3">
        {questions.length ? (
          questions.map((q) => (
            <motion.div key={q.id} layout>
              <QuestionRow q={q} onUpdate={onUpdate} />
            </motion.div>
          ))
        ) : (
          <div className="card rounded-3xl p-12 text-center">
            <div className="text-lg font-black text-zinc-900 dark:text-white">Nothing found here</div>
            <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Maybe try a different filter?
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

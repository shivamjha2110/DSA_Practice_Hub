import React from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";
import QuestionRow from "../components/QuestionRow";
import { Search as SearchIcon, X } from "lucide-react";

function useDebouncedValue(value, delay = 250) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Search() {
  const [q, setQ] = React.useState("");
  const dq = useDebouncedValue(q, 250);

  const [topics, setTopics] = React.useState([]);
  const [questions, setQuestions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");

  const inputRef = React.useRef(null);

  React.useEffect(() => {
    // auto-focus on mount
    inputRef.current?.focus();
  }, []);

  React.useEffect(() => {
    const run = async () => {
      const query = dq.trim();
      setErr("");
      if (!query) {
        setTopics([]);
        setQuestions([]);
        return;
      }
      setLoading(true);
      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(query)}&limit=80`);
        setTopics(data.topics || []);
        setQuestions(data.questions || []);
      } catch (e) {
        setErr(e?.response?.data?.message || "Search failed");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [dq]);

  const onUpdate = (id, patch) => {
    setQuestions((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  return (
    <div className="container-app py-8">
      <div className="card p-6 sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm font-extrabold tracking-tight">Global search</div>
            <div className="mt-1 muted">Find any question instantly. Toggle solved / revisit right here.</div>
          </div>
          <div className="text-xs text-zinc-500 dark:text-white/40">Shortcut: press <span className="kbd">/</span></div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-zinc-200/70 bg-white/70 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
          <SearchIcon size={18} className="text-zinc-500 dark:text-white/50" />
          <input
            ref={inputRef}
            id="global-search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: “two sum”, “binary search”, “sliding window”…"
            className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-zinc-400 dark:placeholder:text-white/30"
          />
          {q ? (
            <button
              className="rounded-xl p-1 text-zinc-500 hover:bg-zinc-900/5 dark:text-white/50 dark:hover:bg-white/10"
              onClick={() => setQ("")}
              aria-label="Clear"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>

        {err ? <div className="mt-3 text-sm font-semibold text-rose-600 dark:text-rose-300">{err}</div> : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1 rounded-2xl border border-zinc-200/70 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="text-xs font-semibold text-zinc-600 dark:text-white/60">Matching topics</div>
            <div className="mt-3 space-y-2">
              {!dq.trim() ? (
                <div className="text-sm text-zinc-600 dark:text-white/60">Type to search…</div>
              ) : loading ? (
                <div className="text-sm text-zinc-600 dark:text-white/60">Searching…</div>
              ) : topics.length ? (
                topics.map((t) => (
                  <Link
                    key={t.id}
                    to={`/topics/${t.id}`}
                    className="block rounded-2xl border border-zinc-200/70 bg-white/70 px-4 py-3 text-sm font-semibold shadow-sm hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{t.name}</span>
                      <span className="rounded-full border border-zinc-200/70 bg-white/60 px-2 py-0.5 text-[11px] font-bold text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
                        {t.category}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-zinc-500 dark:text-white/40">Open →</div>
                  </Link>
                ))
              ) : (
                <div className="text-sm text-zinc-600 dark:text-white/60">No matching topics.</div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-zinc-200/70 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold text-zinc-600 dark:text-white/60">Matching questions</div>
              <div className="text-xs text-zinc-500 dark:text-white/40">{questions.length ? `${questions.length} result(s)` : ""}</div>
            </div>

            <div className="mt-3 space-y-3">
              {!dq.trim() ? (
                <div className="text-sm text-zinc-600 dark:text-white/60">Start typing to search across all questions.</div>
              ) : loading ? (
                <div className="text-sm text-zinc-600 dark:text-white/60">Searching…</div>
              ) : questions.length ? (
                questions.map((item) => <QuestionRow key={item.id} q={item} onUpdate={onUpdate} />)
              ) : (
                <div className="text-sm text-zinc-600 dark:text-white/60">No matching questions.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

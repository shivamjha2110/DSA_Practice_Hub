import React from "react";
import { api } from "../lib/api";
import TopicCard from "../components/TopicCard";
import SheetCard from "../components/SheetCard";
import { Sparkles, Layers, ListFilter, Sheet, Search } from "lucide-react";

export default function Practice() {
  const [tab, setTab] = React.useState("Sheets");
  const [topics, setTopics] = React.useState([]);
  const [lists, setLists] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [q, setQ] = React.useState("");

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const [tRes, lRes] = await Promise.all([
        api.get("/topics"),
        api.get("/lists")
      ]);
      setTopics(tRes.data.topics || []);
      setLists(lRes.data.lists || []);
      setLoading(false);
    })();
  }, []);

  const curatedSheets = lists.filter((l) => l.group === "Curated");
  const difficultySheets = lists.filter((l) => l.group === "Difficulty");
  const topicSheets = lists.filter((l) => l.group === "Topic");
  const otherSheets = lists.filter((l) => l.group === "Other");

  const filteredSheets = (arr) => {
    const s = q.trim().toLowerCase();
    if (!s) return arr;
    return arr.filter((x) => (x.name || "").toLowerCase().includes(s));
  };

  const topicwise = topics.filter((t) => t.category === "Topic");

  if (loading) {
    // Modern Skeleton
    return (
      <div className="container-app py-10">
        <div className="mb-8 h-32 w-full rounded-3xl bg-zinc-100 dark:bg-white/5 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-40 rounded-3xl bg-zinc-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8 relative">
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute -top-20 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />

      {/* Hero Header */}
      <div className="mb-12 relative overflow-hidden rounded-3xl border border-white/20 bg-white/50 p-8 text-center shadow-2xl shadow-emerald-500/5 backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/50">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-fuchsia-500/5" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/50 bg-emerald-50/50 px-3 py-1 text-xs font-bold text-emerald-700 backdrop-blur-md dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
            <Sparkles size={14} /> <span>Practice Mode</span>
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl text-zinc-900 dark:text-white">
            Level Up Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">Logic</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
            Curated paths to streamline your prep. No distractions, just code.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex w-full sm:w-auto rounded-2xl border border-white/20 bg-white/60 p-1 backdrop-blur dark:border-white/10 dark:bg-white/5">
          {["Sheets", "Topics"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-2xl px-4 py-2 text-sm font-semibold transition sm:flex-none ${tab === t
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-700 hover:bg-zinc-900/5 dark:text-zinc-200 dark:hover:bg-white/10"
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Sheets" && (
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search sheets (e.g., Must Do, Array, Graph)"
              className="w-full rounded-2xl border border-white/20 bg-white/60 py-2.5 pl-10 pr-3 text-sm text-zinc-900 placeholder:text-zinc-500 outline-none ring-0 focus:border-emerald-400/60 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
        )}
      </div>

      {tab === "Sheets" ? (
        <>
          {/* Curated sheets */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white shadow-lg shadow-fuchsia-500/20">
                <Sheet size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Curated Sheets</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">The best lists, ordered for impact.</p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSheets(curatedSheets).map((l) => <SheetCard key={l.id} list={l} />)}
            </div>
          </div>

          {/* Difficulty */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20">
                <ListFilter size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">By Difficulty</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Warmups & Challenges.</p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSheets(difficultySheets).map((l) => <SheetCard key={l.id} list={l} />)}
            </div>
          </div>

          {/* Topic sheets */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20">
                <Layers size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Topic Sheets</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Target specific patterns.</p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSheets(topicSheets).map((l) => <SheetCard key={l.id} list={l} />)}
            </div>
          </div>

          {otherSheets.length ? (
            <div>
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 text-white shadow-lg shadow-zinc-500/20">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Other</h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Extras from the workbook</p>
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSheets(otherSheets).map((l) => <SheetCard key={l.id} list={l} />)}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <>
          {/* Topic-wise */}
          <div>
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20">
                <Layers size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Topic Mastery</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Your progress grouped by DSA topic</p>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {topicwise.map((t) => <TopicCard key={t.id} topic={t} />)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

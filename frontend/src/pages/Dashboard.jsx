import React from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import TopicCard from "../components/TopicCard";
import { Link } from "react-router-dom";
import {
  ArrowRight, RefreshCw, Sparkles, Flame, Target, RotateCcw,
  CheckCircle2, Search, BarChart3, User2, Zap, Trophy,
  TrendingUp, Calendar, Crown, Layers, AlertTriangle, Lightbulb
} from "lucide-react";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid
} from "recharts";

const COLORS = ["#10b981", "#06b6d4", "#d946ef"]; // Emerald, Cyan, Fuchsia

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } })
};

// Simple client-side cache to make navigation instant
let dashboardCache = {
  data: null,
  timestamp: 0
};

function StatCard({ icon: Icon, label, value, sub, fromColor, toColor, delay }) {
  return (
    <motion.div
      variants={fadeInUp}
      custom={delay}
      className="card p-5 relative overflow-hidden group border-0 ring-1 ring-zinc-200/50 dark:ring-white/10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500"
    >
      {/* Soft gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${fromColor} ${toColor} opacity-[0.03] group-hover:opacity-[0.07] transition-opacity`} />

      <div className={`absolute -right-6 -top-6 p-4 opacity-[0.15] group-hover:opacity-25 transition-opacity bg-gradient-to-br ${fromColor} ${toColor} bg-clip-text text-transparent`}>
        <Icon size={96} />
      </div>

      <div className="relative">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${fromColor} ${toColor} text-white shadow-lg shadow-emerald-500/20`}>
            <Icon size={20} />
          </div>
          <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400">{label}</span>
        </div>
        <div className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">{value}</div>
        <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">{sub}</div>
      </div>
    </motion.div>

  );
}

export default function Dashboard() {
  const { user, refreshMe, activeUsers } = useAuth();

  // Initialize from cache if available
  const [topics, setTopics] = React.useState(dashboardCache.data?.topics || []);
  const [stats, setStats] = React.useState(dashboardCache.data || null);
  const [lc, setLc] = React.useState(null);

  // If we have cached data, we are not loading visually
  const [loading, setLoading] = React.useState(!dashboardCache.data);
  const [saving, setSaving] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);
  const [msg, setMsg] = React.useState("");

  // Default start date: 14 days ago for a nice initial view
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 14);
  const [startDate, setStartDate] = React.useState(defaultStart.toISOString().split('T')[0]);

  const [prefs, setPrefs] = React.useState({ dailyGoal: user?.dailyGoal ?? 3, autoSyncLeetCode: user?.autoSyncLeetCode ?? true });

  // Delete Account State
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletePhrase, setDeletePhrase] = React.useState("");
  const [deletePassword, setDeletePassword] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    setPrefs({ dailyGoal: user?.dailyGoal ?? 3, autoSyncLeetCode: user?.autoSyncLeetCode ?? true });
  }, [user?.dailyGoal, user?.autoSyncLeetCode]);

  const onDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.delete("/user/me", { data: { password: deletePassword } });
      setDeleteOpen(false); // Collapse immediately on success
      setDeletePhrase("");
      setDeletePassword("");
      await refreshMe();
      window.location.href = "/";
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to delete account");
      setDeleting(false);
    }
  };

  const load = async (silent = false) => {
    // Only show loading if we don't have cache overlap AND it's not a silent reload
    if (!silent && !dashboardCache.data) setLoading(true);
    setMsg("");
    try {
      const [topicsRes, statsRes] = await Promise.all([api.get("/topics"), api.get("/dashboard")]);
      const newTopics = topicsRes.data.topics || [];
      const newStats = statsRes.data;

      setTopics(newTopics);
      setStats(newStats);

      // Update cache
      dashboardCache.data = { ...newStats, topics: newTopics };

      if (user?.leetcodeUsername) {
        try {
          const lcRes = await api.get(`/leetcode/${encodeURIComponent(user.leetcodeUsername)}`);
          setLc(lcRes.data);
        } catch {
          setLc(null);
        }
      } else {
        setLc(null);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  React.useEffect(() => {
    load(); // Initial load
    const interval = setInterval(() => load(true), 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.leetcodeUsername]);

  // ... (handlers remain the same)
  const onSaveLeetCode = async (e) => {
    e.preventDefault();
    const username = e.target.leetcodeUsername.value.trim();
    setSaving(true);
    setMsg("");
    try {
      await api.put("/user/profile", { leetcodeUsername: username });
      await refreshMe();
      setMsg("Saved ✅");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const onSavePrefs = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      await api.patch("/user/preferences", {
        dailyGoal: Number(prefs.dailyGoal),
        autoSyncLeetCode: !!prefs.autoSyncLeetCode
      });
      await refreshMe();
      setMsg("Preferences saved ✅");
      await load();
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const onSync = async () => {
    setSyncing(true);
    setMsg("");
    try {
      const { data } = await api.post("/leetcode/sync");
      setMsg(`Synced ✅ Matched ${data.matched} question(s), updated ${data.markedSolved}.`);
      await load();
    } catch (err) {
      setMsg(err?.response?.data?.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };


  const curated = topics.filter((t) => t.category === "Curated");


  // CTCI Chapter Mapping
  const topicMapping = {
    "Array": "Arrays and Strings",
    "Linked List": "Linked Lists",
    "Stack": "Stacks and Queues",
    "Tree": "Trees and Graphs",
    "Graph": "Trees and Graphs",
    "Bit Manipulation": "Bit Manipulation",
    "Math": "Math and Logic Puzzles",
    "Recursion": "Recursion",
    "Dynamic Programming": "Dynamic Programming",
    "Sorting": "Sorting and Searching",
    "Binary Search": "Sorting and Searching",
    "Design": "System Design",
    "Object-Oriented Programming": "Object-Oriented Design"
  };

  const getDisplayName = (name) => topicMapping[name] || name;

  // Prepared data for charts
  const difficultyData = [
    { name: "Easy", value: stats?.byDifficulty?.Easy?.solved || 0 },
    { name: "Medium", value: stats?.byDifficulty?.Medium?.solved || 0 },
    { name: "Hard", value: stats?.byDifficulty?.Hard?.solved || 0 }
  ];

  const isDifficultyEmpty = difficultyData.every(d => d.value === 0);
  const displayDifficultyData = isDifficultyEmpty ? [{ name: "None", value: 1 }] : difficultyData;

  // Generate chart data from startDate to Today using allTimeDaily
  const generateTrendData = () => {
    const data = [];
    // Parse YYYY-MM-DD
    const [y, m, d] = startDate.split('-').map(Number);
    const start = new Date(y, m - 1, d); // Local time construction
    const end = new Date();
    end.setHours(0, 0, 0, 0);

    // Iterate dates
    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
      const yy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      const key = `${yy}-${mm}-${dd}`;

      const label = `${mm}/${dd}`;
      const count = stats?.allTimeDaily?.[key] || 0;

      data.push({ name: label, solved: count, date: key });
    }
    return data;
  };

  const displayTrend = React.useMemo(() => generateTrendData(), [stats, startDate]);

  if (loading) {
    return (
      <div className="container-app py-8 relative">
        <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px]" />

        {/* Header Skeleton */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-pulse">
          <div>
            <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-2"></div>
            <div className="h-10 w-64 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="mt-2 h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
            <div className="h-10 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-5 h-28 bg-zinc-100 dark:bg-white/5 animate-pulse"></div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          <div className="lg:col-span-4 card p-6 h-[350px] bg-zinc-100 dark:bg-white/5 animate-pulse"></div>
          <div className="lg:col-span-8 card p-6 h-[350px] bg-zinc-100 dark:bg-white/5 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-8 relative">
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute top-20 right-0 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-[100px]" />

      <motion.div initial="hidden" animate="show" variants={{}}>

        {/* Header */}
        <motion.div variants={fadeInUp} custom={0} className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/50 bg-white/50 px-3 py-1 text-[11px] font-bold text-zinc-600 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                <Sparkles size={14} className="text-amber-500" />
                <span>Smart Progress Insights</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/50 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600 shadow-sm backdrop-blur-sm dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <span>{activeUsers} Online</span>
              </div>
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl text-zinc-900 dark:text-white">
              Ready to code, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">{user?.username || "Dev"}</span>?
            </h1>
            <p className="mt-1 text-zinc-500 dark:text-zinc-400">Your streak is waiting. Let's solve some problems.</p>
          </div>

          <div className="flex gap-2">
            <Link to="/practice" className="btn-primary">
              <Zap size={16} /> Practice
            </Link>
            <Link to="/analytics" className="btn-ghost">
              <BarChart3 size={16} /> Deep Dive
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={CheckCircle2}
            label="Total Solved"
            value={stats?.solvedCount || 0}
            sub={`${stats?.totalQuestions || 0} available`}
            fromColor="from-emerald-500"
            toColor="to-teal-500"
            delay={0.1}
          />
          <StatCard
            icon={Flame}
            label="Current Streak"
            value={stats?.streakCurrent || 0}
            sub="Keep it going!"
            fromColor="from-amber-500"
            toColor="to-orange-500"
            delay={0.2}
          />
          <StatCard
            icon={Target}
            label="Daily Goal"
            value={`${stats?.solvedToday || 0} / ${stats?.dailyGoal || 3}`}
            sub={stats?.goalRemaining ? `${stats.goalRemaining} left` : "Goal met!"}
            fromColor="from-cyan-500"
            toColor="to-blue-500"
            delay={0.3}
          />
        </div>

        {/* Charts & Advanced Stats */}
        <div className="grid lg:grid-cols-12 gap-6 mb-8">

          {/* Difficulty Chart */}
          <motion.div variants={fadeInUp} custom={0.4} className="lg:col-span-4 card p-6 flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-fuchsia-500/10 text-fuchsia-500"><Layers size={18} /></span>
                Skill Arsenal
              </h3>
            </div>

            <div className="flex-1 min-h-[250px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayDifficultyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {displayDifficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={isDifficultyEmpty ? "#94a3b8" : COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center text overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-2xl font-black text-zinc-900 dark:text-white">
                    {(stats?.byDifficulty?.Easy?.solved || 0) + (stats?.byDifficulty?.Medium?.solved || 0) + (stats?.byDifficulty?.Hard?.solved || 0)}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Solved</div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow shadow-emerald-500/50"></div>
                <div className="font-medium text-emerald-700 dark:text-emerald-300">
                  Easy <span className="text-zinc-500 dark:text-zinc-500 ml-1 font-normal">{(stats?.byDifficulty?.Easy?.solved || 0)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500 shadow shadow-cyan-500/50"></div>
                <div className="font-medium text-cyan-700 dark:text-cyan-300">
                  Med <span className="text-zinc-500 dark:text-zinc-500 ml-1 font-normal">{(stats?.byDifficulty?.Medium?.solved || 0)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-fuchsia-500 shadow shadow-fuchsia-500/50"></div>
                <div className="font-medium text-fuchsia-700 dark:text-fuchsia-300">
                  Hard <span className="text-zinc-500 dark:text-zinc-500 ml-1 font-normal">{(stats?.byDifficulty?.Hard?.solved || 0)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Activity Chart */}
          {/* Activity Chart */}
          <motion.div variants={fadeInUp} custom={0.5} className="lg:col-span-8 card p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500"><TrendingUp size={18} /></span>
                Daily Progress
              </h3>
              <div className="relative flex items-center gap-2">
                <label className="text-xs font-semibold text-zinc-500 uppercase">From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="appearance-none rounded-xl bg-zinc-100 py-1.5 px-3 text-xs font-semibold text-zinc-700 outline-none transition hover:bg-zinc-200 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10 border border-transparent focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'gray', fontSize: 11 }}
                    dy={10}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'gray', fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '3 3' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="solved"
                    stroke="#10b981"
                    strokeWidth={4}
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7, strokeWidth: 0, fill: '#10b981' }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Main Content Split: Lists vs Sidebar */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">

          {/* Section: Learning Paths */}
          <div className="lg:col-span-8 space-y-6">
            <motion.div variants={fadeInUp} custom={0.6} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500"><Crown size={18} /></span>
                  Sheet Progress
                </h3>
                <Link to="/practice" className="text-sm font-semibold text-emerald-500 hover:underline">View All</Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {curated.slice(0, 4).map(t => (
                  <TopicCard key={t.id} topic={{ ...t, name: getDisplayName(t.name) }} />
                ))}
              </div>
            </motion.div>

            {/* Moved Goals and Revisit here for better balance */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Preferences */}
              <motion.div variants={fadeInUp} custom={0.7} className="card p-6 h-full">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500"><Trophy size={18} /></span>
                  Goals
                </h3>
                <form onSubmit={onSavePrefs} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold muted uppercase tracking-wider block mb-1">Daily Target</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range" min="1" max="20"
                        value={prefs.dailyGoal}
                        onChange={e => setPrefs(p => ({ ...p, dailyGoal: e.target.value }))}
                        className="flex-1 accent-emerald-500 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700"
                      />
                      <span className="w-8 text-center font-bold text-emerald-500">{prefs.dailyGoal}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-zinc-100 dark:border-white/5">
                    <span className="text-sm font-medium">Auto-Sync</span>
                    <button
                      type="button"
                      onClick={() => setPrefs(p => ({ ...p, autoSyncLeetCode: !p.autoSyncLeetCode }))}
                      className={`w-10 h-6 rounded-full relative transition-colors ${prefs.autoSyncLeetCode ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform ${prefs.autoSyncLeetCode ? "translate-x-4" : "translate-x-0"}`} />
                    </button>
                  </div>

                  <button disabled={saving} className="btn-secondary w-full">Save Changes</button>
                </form>
              </motion.div>

              {/* Quick Action */}
              <motion.div variants={fadeInUp} custom={0.8} className="card p-6 border-fuchsia-500/20 bg-fuchsia-500/5 relative overflow-hidden h-full flex flex-col justify-between">
                <div className="absolute -right-6 -top-6 text-fuchsia-500 opacity-10">
                  <RotateCcw size={100} />
                </div>
                <div className="flex items-center gap-3 mb-3 relative z-10">
                  <div className="p-2.5 bg-fuchsia-500 rounded-xl text-white shadow-lg shadow-fuchsia-500/30">
                    <RotateCcw size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-fuchsia-700 dark:text-fuchsia-300 text-lg">{stats?.revisitCount || 0} Questions</div>
                    <div className="text-xs muted font-medium">marked for review</div>
                  </div>
                </div>
                <Link to="/revisit" className="btn w-full bg-white dark:bg-white/10 hover:bg-fuchsia-50 dark:hover:bg-white/20 border-fuchsia-200 dark:border-white/10 text-fuchsia-700 dark:text-white font-semibold relative z-10">
                  Start Review Session
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Sidebar */}
          <motion.aside variants={fadeInUp} custom={0.8} className="lg:col-span-4 space-y-6">

            {/* LeetCode Sync */}
            <div className="card p-6 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black text-white dark:from-white/10 dark:via-white/5 dark:to-transparent border-none shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl bg-emerald-500 -translate-y-1/2 translate-x-1/2 rounded-full w-40 h-40 pointer-events-none"></div>

              <div className="flex items-start justify-between relative z-10">
                <div>
                  <div className="font-bold text-lg flex items-center gap-2">
                    <img src="https://assets.leetcode.com/static_assets/public/icons/favicon-192x192.png" className="w-5 h-5 object-contain" alt="LC" />
                    LeetCode
                  </div>
                  <p className="text-xs text-white/50 mt-1">Sync your progress</p>
                </div>
                <button
                  onClick={onSync}
                  disabled={syncing || !user?.leetcodeUsername}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition disabled:opacity-50"
                >
                  <RefreshCw size={18} className={syncing ? "animate-spin" : ""} />
                </button>
              </div>

              {lc ? (
                <div className="mt-6 relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFA116] to-orange-600 p-[2px]">
                      {lc.avatar ? (
                        <img src={lc.avatar} alt={lc.username} className="w-full h-full rounded-full object-cover bg-zinc-900" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-zinc-900 grid place-items-center font-bold text-white">
                          {lc.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-lg">{lc.username}</div>
                      <div className="text-xs text-white/50 font-medium">Rank {lc.ranking}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-lg bg-white/5 backdrop-blur-sm border border-white/5">
                      <div className="font-bold text-emerald-400 text-lg">{lc.easySolved}</div>
                      <div className="text-white/40 font-medium">Easy</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 backdrop-blur-sm border border-white/5">
                      <div className="font-bold text-cyan-400 text-lg">{lc.mediumSolved}</div>
                      <div className="text-white/40 font-medium">Med</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/5 backdrop-blur-sm border border-white/5">
                      <div className="font-bold text-fuchsia-400 text-lg">{lc.hardSolved}</div>
                      <div className="text-white/40 font-medium">Hard</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 text-sm text-white/60 text-center py-4 border border-dashed border-white/20 rounded-xl">
                  No account linked
                </div>
              )}

              <form onSubmit={onSaveLeetCode} className="mt-6 relative z-10">
                <input
                  name="leetcodeUsername"
                  defaultValue={user?.leetcodeUsername || ""}
                  placeholder="Username"
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button disabled={saving} className="w-full mt-2 btn bg-white text-black hover:bg-white/90 border-none font-bold">
                  {saving ? "Saving..." : "Update Username"}
                </button>
                {msg && <div className="mt-2 text-xs text-center text-emerald-400 font-semibold">{msg}</div>}
              </form>
            </div>

            {/* Preferences */}


            {/* Compact Danger Zone in Sidebar */}
            <div className={`card p-4 transition-all duration-300 border-red-500/20 bg-red-500/5 ${deleteOpen ? 'ring-2 ring-red-500 ring-offset-2 dark:ring-offset-black' : 'hover:bg-red-500/10'}`}>
              {!deleteOpen ? (
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="w-full flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                      <AlertTriangle size={18} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm text-red-600 dark:text-red-400">Delete Account</div>
                      <div className="text-[10px] opacity-60 font-medium">Danger Zone</div>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-red-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </button>
              ) : (
                <div className="animate-in fade-in slide-in-from-top-1 space-y-3 pt-1">
                  <div className="text-xs font-semibold text-red-600 dark:text-red-400">
                    Permanently delete your account?
                  </div>
                  <input
                    className="w-full bg-white dark:bg-black/20 border border-red-200 dark:border-red-500/30 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-red-500 outline-none"
                    placeholder='Type "delete account permanently"'
                    value={deletePhrase}
                    onChange={(e) => setDeletePhrase(e.target.value)}
                  />
                  <input
                    type="password"
                    className="w-full bg-white dark:bg-black/20 border border-red-200 dark:border-red-500/30 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-red-500 outline-none"
                    placeholder='Password'
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => { setDeleteOpen(false); setDeletePhrase(""); setDeletePassword(""); }}
                      className="flex-1 py-1.5 rounded-lg text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={onDeleteAccount}
                      disabled={deleting || deletePhrase.trim().toLowerCase() !== "delete account permanently" || !deletePassword}
                      className="flex-1 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 disabled:opacity-50"
                    >
                      {deleting ? "..." : "Confirm"}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </motion.aside>
        </div>

      </motion.div>
    </div>



  );
}




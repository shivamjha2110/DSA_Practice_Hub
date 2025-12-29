import React from "react";
import { api } from "../lib/api";
import StatPill from "../components/StatPill";
import CalendarHeatmap from "../components/CalendarHeatmap";
import ChartTooltip from "../components/ChartTooltip";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend } from "recharts";
import { BarChart3, CalendarDays } from "lucide-react";

function formatDayLabel(day) {
  // YYYY-MM-DD -> MM/DD
  const parts = String(day).split("-");
  if (parts.length !== 3) return day;
  return `${parts[1]}/${parts[2]}`;
}

export default function Analytics() {
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/dashboard");
      setStats(data);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="container-app py-10">
        <div className="card p-7">
          <div className="text-lg font-extrabold tracking-tight">Loading analytics…</div>
          <div className="mt-2 muted">Crunching your progress data.</div>
        </div>
      </div>
    );
  }

  const last30 = (stats?.last30Days || []).map((d) => ({ ...d, label: formatDayLabel(d.day) }));
  const byDiff = ["Easy", "Medium", "Hard"].map((k) => ({
    difficulty: k,
    solved: stats?.byDifficulty?.[k]?.solved || 0,
    total: stats?.byDifficulty?.[k]?.total || 0
  }));

  const axisCommon = {
    stroke: "var(--chart-grid)",
    tickLine: false,
    axisLine: { stroke: "var(--chart-grid)" }
  };

  const tickCommon = { fill: "var(--chart-fg)", fontSize: 11, fontWeight: 600 };

  return (
    <div className="container-app py-8">
      <div className="card p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-sm font-extrabold tracking-tight">
              <BarChart3 size={16} className="text-cyan-500" /> Your Coding Stats
            </div>
            <div className="mt-1 muted">
              Track your progress over time. Timezone: <span className="font-semibold">{stats?.timezone || "UTC"}</span>
            </div>
          </div>
          <button className="btn-ghost" onClick={load}>Refresh</button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatPill label="Total questions" value={stats?.totalQuestions ?? 0} />
          <StatPill label="Solved" value={stats?.solvedCount ?? 0} />
          <StatPill label="Remaining" value={stats?.remainingCount ?? 0} />
          <StatPill label="Revisit" value={stats?.revisitCount ?? 0} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200/70 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="text-xs font-semibold text-zinc-600 dark:text-white/60">Activity (Last 30 Days)</div>
            <div className="mt-3 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={last30}>
                  <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" opacity={1} />
                  <XAxis dataKey="label" interval={4} tick={{ ...tickCommon, fontSize: 10 }} {...axisCommon} />
                  <YAxis allowDecimals={false} tick={tickCommon} {...axisCommon} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--chart-grid)" }} />
                  <Line type="monotone" dataKey="solved" stroke="var(--chart-fg-strong)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-[11px] text-zinc-500 dark:text-white/40">
              Counts are computed using your local day boundary (timezone-aware).
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200/70 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="text-xs font-semibold text-zinc-600 dark:text-white/60">Difficulty Breakdown</div>
            <div className="mt-3 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byDiff}>
                  <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" opacity={1} />
                  <XAxis dataKey="difficulty" tick={tickCommon} {...axisCommon} />
                  <YAxis allowDecimals={false} tick={tickCommon} {...axisCommon} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "transparent" }} />
                  <Legend
                    wrapperStyle={{ color: "var(--chart-fg)" }}
                    formatter={(value) => <span style={{ color: "var(--chart-fg)", fontWeight: 700, fontSize: 12 }}>{value}</span>}
                  />
                  <Bar dataKey="solved" fill="rgba(16, 185, 129, 0.8)" radius={[10, 10, 0, 0]} />
                  <Bar dataKey="total" fill="rgba(6, 182, 212, 0.7)" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-200/70 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-white/60">
              <CalendarDays size={16} className="text-emerald-500" /> Consistency (last ~90 days)
            </div>
            <div className="text-[11px] text-zinc-500 dark:text-white/40">
              Higher intensity = more solved that day
            </div>
          </div>
          <div className="mt-4">
            <CalendarHeatmap data={stats?.heatmap90Days || []} />
          </div>
          <div className="mt-3 text-[11px] text-zinc-500 dark:text-white/40">
            Streak: <span className="font-semibold">{stats?.streakCurrent ?? 0}</span> days (best{" "}
            <span className="font-semibold">{stats?.streakBest ?? 0}</span>)
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, CheckCircle2, Sparkles, ShieldCheck, Layers3, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (d = 0) => ({ opacity: 1, y: 0, transition: { delay: d, duration: 0.55 } }),
};

function Feature({ icon: Icon, title, desc }) {
  return (
    <div className="card p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-3 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
          <Icon size={18} />
        </div>
        <div>
          <div className="text-sm font-bold">{title}</div>
          <div className="mt-1 text-sm text-zinc-600 dark:text-white/60">{desc}</div>
        </div>
      </div>
    </div>
  );
}

function MiniPreview() {
  return (
    <div className="relative group">
      {/* Ambient Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition duration-1000"></div>

      <div className="card p-6 relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-white/20 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-base font-bold text-zinc-800 dark:text-zinc-100">Interview Readiness</div>
            <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Live Tracker</div>
          </div>
          <span className="badge py-1.5 px-3 border-emerald-200/50 bg-emerald-50/50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 font-medium shadow-sm">
            <CheckCircle2 size={14} /> 12 solved today
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Solved", "128", "text-emerald-600 dark:text-emerald-400"],
            ["Tracked", "240", "text-cyan-600 dark:text-cyan-400"],
            ["Completion", "53%", "text-fuchsia-600 dark:text-fuchsia-400"],
          ].map(([k, v, color]) => (
            <div key={k} className="rounded-2xl border border-zinc-100 bg-zinc-50/50 px-4 py-3 dark:border-white/5 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition">
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-wider">{k}</div>
              <div className={`mt-1 text-2xl font-black tracking-tight ${color}`}>{v}</div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
            <span>Chapter Progress</span>
            <span>72%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-zinc-100 dark:bg-white/5 overflow-hidden">
            <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-fuchsia-500 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
          </div>
        </div>

        <div className="mt-6 space-y-2.5">
          {["Arrays & Strings — 8/15", "Linked Lists — 5/12", "Trees & Graphs — 2/10"].map((t) => (
            <div key={t} className="flex items-center justify-between rounded-xl border border-dashed border-zinc-200 bg-white/40 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5">
              <span className="font-semibold text-zinc-700 dark:text-zinc-200">{t.split("—")[0].trim()}</span>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-500">{t.split("—")[1].trim()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="container-app py-10 sm:py-14">
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <motion.div initial="hidden" animate="show" variants={{}}>
          <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/70 px-3 py-1 text-xs font-semibold text-zinc-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:shadow-none">
            <Sparkles size={14} />
            Your Ultimate Interview Prep Tracker
          </motion.div>

          <motion.h1 variants={fadeUp} custom={0.05} className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-fuchsia-500 bg-clip-text text-transparent leading-tight">
              Crack The Coding Interview
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} custom={0.12} className="mt-4 text-base text-zinc-600 dark:text-white/60">
            Master the top selected questions. Track your progress, maintain consistency, and land your dream job.
          </motion.p>

          <motion.div variants={fadeUp} custom={0.2} className="mt-6 flex flex-col gap-3 sm:flex-row">
            {user ? (
              <>
                <Link to="/app" className="btn-primary">
                  Go to dashboard <ArrowRight size={18} />
                </Link>
                <Link to="/practice" className="btn-ghost">
                  Practice now
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn-primary">
                  Create account <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn-ghost">
                  I already have an account
                </Link>
              </>
            )}
          </motion.div>

          <motion.div variants={fadeUp} custom={0.28} className="mt-7 grid gap-3 sm:grid-cols-3">
            {[
              ["Curated Question Bank", "Top-tier problems selected to maximize your learning impact."],
              ["Smart Progress Tracking", "Visualize your consistency with heatmaps and detailed analytics."],
              ["Distraction-Free Zone", "A clean, modern interface designed purely for coding focus."],
            ].map(([k, v]) => (
              <div key={k} className="card-soft p-4">
                <div className="text-sm font-bold">{k}</div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-white/60">{v}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}>
          <MiniPreview />
        </motion.div>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Feature icon={Layers3} title="Structured Learning Paths"
          desc="Follow step-by-step guides for every data structure and algorithm."
        />
        <Feature icon={BarChart3} title="Professional Insights"
          desc="Track consistency, solved trend, and difficulty split without overthinking."
        />
        <Feature icon={ShieldCheck} title="Your data stays yours"
          desc="Per-user progress stored in your database. Only you see your solved history."
        />
      </div>

      <div className="mt-12 card p-7 sm:p-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8" />
              <div className="text-lg font-extrabold tracking-tight">AlgoBloom</div>
            </div>
            <div className="mt-2 text-sm text-zinc-600 dark:text-white/60">
              Built to help students practice consistently.
            </div>
          </div>
          <div className="flex gap-3">
            <Link to={user ? "/practice" : "/register"} className="btn-primary">
              {user ? "Open practice" : "Get started"} <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-ghost">Sign in</Link>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-zinc-500 dark:text-white/40">
        © {new Date().getFullYear()} AlgoBloom • Made for focused prep
      </div>
    </div>
  );
}

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function strengthLabel(pw) {
  if (!pw) return { label: "—", score: 0 };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Weak", "Okay", "Good", "Strong", "Very strong"];
  return { label: labels[Math.min(score, 4)], score };
}

export default function Auth({ mode }) {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const isRegister = mode === "register";
  const [form, setForm] = React.useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPw, setShowPw] = React.useState(false);
  const [showCpw, setShowCpw] = React.useState(false);
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isRegister) {
      if (!form.username.trim()) return setError("Please enter a username.");
      if (!form.email.trim()) return setError("Please enter your email.");
      if (form.password.length < 6) return setError("Password must be at least 6 characters.");
      if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    }

    setBusy(true);
    try {
      if (isRegister) {
        await register({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
        });
      } else {
        await login({ email: form.email.trim(), password: form.password });
      }
      navigate("/app");
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const { label, score } = strengthLabel(form.password);

  return (
    <div className="container-app py-10 sm:py-14">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
        {/* left */}
        <div className="card p-7 sm:p-10">
          <div className="text-xs font-semibold text-zinc-600 dark:text-white/60">
            {isRegister ? "Create your account" : "Welcome back"}
          </div>
          <div className="mt-2 text-2xl font-extrabold tracking-tight">
            {isRegister ? "Practice Questions & Crack the Interview" : "Sign in to continue"}
          </div>
          <div className="mt-3 text-sm text-zinc-600 dark:text-white/60">
            {isRegister
              ? "Unlock your full potential with a specialized DSA tracker designed to streamline your interview preparation."
              : "Your progress and solved history are waiting for you."}
          </div>

          <div className="mt-6 space-y-3">
            {[
              "Scientifically curated problem lists",
              "Adaptive Dark & Light Mode UI",
              "Real-time LeetCode Analytics Sync",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm">
                <span className="badge border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 dark:bg-emerald-500/15">
                  <CheckCircle2 size={14} />
                </span>
                <span className="font-semibold">{t}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-3xl border border-zinc-200/70 bg-white/60 p-5 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60">
            <strong>Pro Tip:</strong> Join the elite community of problem solvers. Your journey to mastery starts here.
          </div>
        </div>

        {/* form */}
        <div className="card p-7 sm:p-10">
          <form onSubmit={onSubmit} className="space-y-4">
            {isRegister ? (
              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-white/60">Username</label>
                <input name="username" className="input mt-2" placeholder="e.g. Shivam" value={form.username} onChange={onChange} />
              </div>
            ) : null}

            <div>
              <label className="text-xs font-semibold text-zinc-600 dark:text-white/60">Email</label>
              <input name="email" type="email" className="input mt-2" placeholder="you@example.com" value={form.email} onChange={onChange} />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-600 dark:text-white/60">Password</label>
              <div className="relative mt-2">
                <input
                  name="password"
                  type={showPw ? "text" : "password"}
                  className="input pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={onChange}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 hover:bg-zinc-900/5 dark:hover:bg-white/10"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label="Toggle password"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {isRegister ? (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-white/60">
                    <span>Password strength</span>
                    <span className="font-semibold">{label}</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-zinc-200/70 dark:bg-white/10">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-fuchsia-500"
                      style={{ width: `${Math.max(10, (score / 4) * 100)}%` }}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {isRegister ? (
              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-white/60">Confirm password</label>
                <div className="relative mt-2">
                  <input
                    name="confirmPassword"
                    type={showCpw ? "text" : "password"}
                    className="input pr-12"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={onChange}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 hover:bg-zinc-900/5 dark:hover:bg-white/10"
                    onClick={() => setShowCpw((v) => !v)}
                    aria-label="Toggle confirm password"
                  >
                    {showCpw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                {error}
              </div>
            ) : null}

            <button className="btn-primary w-full" disabled={busy} type="submit">
              {busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"} <ArrowRight size={18} />
            </button>

            <div className="text-center text-sm text-zinc-600 dark:text-white/60">
              {isRegister ? (
                <>Already have an account? <Link to="/login" className="font-semibold hover:underline">Sign in</Link></>
              ) : (
                <>No account? <Link to="/register" className="font-semibold hover:underline">Register</Link></>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

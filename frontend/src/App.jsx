import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";

const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Practice = React.lazy(() => import("./pages/Practice"));
const ListDetail = React.lazy(() => import("./pages/ListDetail"));
const TopicDetail = React.lazy(() => import("./pages/TopicDetail"));
const Revisit = React.lazy(() => import("./pages/Revisit"));
const Search = React.lazy(() => import("./pages/Search"));
const Analytics = React.lazy(() => import("./pages/Analytics"));

function LazyLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const onKey = (e) => {
      // Global search shortcut: press "/" when not typing in an input.
      const tag = (e.target?.tagName || "").toLowerCase();
      const isTyping = tag === "input" || tag === "textarea" || e.target?.isContentEditable;
      if (isTyping) return;
      if (e.key === "/") {
        e.preventDefault();
        navigate("/search");
        // focus after navigation
        setTimeout(() => {
          const el = document.getElementById("global-search-input");
          if (el) el.focus();
        }, 50);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return (
    <div className="relative min-h-screen">
      {/* background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-[0.55]" />
        <div className="absolute -top-24 left-1/2 h-64 w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-300/50 via-cyan-300/40 to-fuchsia-400/45 blur-3xl" />
        <div className="absolute -bottom-24 right-[-120px] h-64 w-64 rounded-full bg-gradient-to-tr from-cyan-300/40 to-fuchsia-400/40 blur-3xl" />
        <div className="absolute -bottom-24 left-[-120px] h-64 w-64 rounded-full bg-gradient-to-tr from-emerald-300/35 to-cyan-300/35 blur-3xl" />
        <div className="absolute inset-0 bg-white/40 dark:bg-zinc-950/60" />
      </div>

      <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <Navbar />
        <React.Suspense fallback={<LazyLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/register" element={<Auth mode="register" />} />

            <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
            <Route path="/lists/:slug" element={<ProtectedRoute><ListDetail /></ProtectedRoute>} />
            <Route path="/revisit" element={<ProtectedRoute><Revisit /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/topics/:topicId" element={<ProtectedRoute><TopicDetail /></ProtectedRoute>} />

            <Route
              path="*"
              element={
                <div className="container-app py-14">
                  <div className="card p-8 text-sm">
                    <div className="text-lg font-semibold">Page not found</div>
                    <div className="mt-1 muted">The link may be broken, or the page may have moved.</div>
                  </div>
                </div>
              }
            />
          </Routes>
        </React.Suspense>
      </div>
    </div>
  );
}

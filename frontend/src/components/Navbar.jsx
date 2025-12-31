import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Moon, Sun, LogOut, Menu, X, ChevronRight } from "lucide-react";
import Logo from "./Logo";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";

function NavItem({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "group relative flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 sm:rounded-2xl sm:py-2 sm:font-semibold",
          "hover:bg-zinc-100 hover:pl-5 dark:hover:bg-white/10",
          isActive
            ? "bg-zinc-100 font-bold text-zinc-900 dark:bg-white/10 dark:text-white"
            : "text-zinc-600 dark:text-zinc-400"
        ].join(" ")
      }
    >
      {/* Active Indicator Dot (Desktop) */}
      <span className="hidden sm:block">
        {children}
      </span>

      {/* Mobile Layout */}
      <span className="flex items-center gap-3 sm:hidden">
        {children}
      </span>
      <ChevronRight size={16} className="text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 sm:hidden" />
    </NavLink>
  );
}

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => setOpen(false), [location.pathname]);

  // Lock body scroll when menu is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [open]);

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl transition-colors dark:bg-zinc-950/80">
      <div className="border-b border-zinc-200/50 dark:border-white/5">
        <div className="container-app flex items-center justify-between py-2 sm:py-3">
          <Link to="/" className="group flex items-center gap-2 sm:gap-3">
            <div className="transition-transform duration-500 group-hover:rotate-180">
              <Logo className="h-8 w-8 sm:h-9 sm:w-9" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight sm:text-base">AlgoBloom</div>
              <div className="hidden text-[11px] font-medium text-zinc-500 dark:text-zinc-500 sm:block">DSA practice tracker</div>
            </div>
          </Link>

          {/* desktop */}
          <div className="hidden items-center gap-1 sm:flex">
            {user ? (
              <>
                <NavItem to="/app">Dashboard</NavItem>
                <NavItem to="/practice">Practice</NavItem>
                <NavItem to="/revisit">Revisit</NavItem>
                <NavItem to="/search">Search</NavItem>
                <NavItem to="/analytics">Analytics</NavItem>
              </>
            ) : (
              <>
                <NavItem to="/login">Sign in</NavItem>
                <NavItem to="/register">Create account</NavItem>
              </>
            )}
            <div className="mx-2 h-4 w-px bg-zinc-200 dark:bg-zinc-800"></div>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
              onClick={toggle}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user ? (
              <button
                className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                onClick={logout}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            ) : (
              <Link to="/register" className="btn-primary ml-1 shadow-lg shadow-emerald-500/20">Get started</Link>
            )}
          </div>

          {/* mobile toggle */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors active:bg-zinc-100 dark:active:bg-zinc-800"
              onClick={toggle}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-800 transition-colors active:bg-zinc-100 dark:text-zinc-200 dark:active:bg-zinc-800"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={20} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* mobile menu overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden border-b border-zinc-200/50 bg-white/95 backdrop-blur-2xl dark:border-white/5 dark:bg-zinc-950/95 sm:hidden"
          >
            <div className="container-app flex flex-col gap-1 py-4 pb-6">
              {user ? (
                <>
                  <NavItem to="/app" onClick={() => setOpen(false)}>Dashboard</NavItem>
                  <NavItem to="/practice" onClick={() => setOpen(false)}>Practice</NavItem>
                  <NavItem to="/revisit" onClick={() => setOpen(false)}>Revisit</NavItem>
                  <NavItem to="/search" onClick={() => setOpen(false)}>Search</NavItem>
                  <NavItem to="/analytics" onClick={() => setOpen(false)}>Analytics</NavItem>

                  <div className="my-2 border-t border-zinc-100 dark:border-white/5"></div>

                  <button
                    className="group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                    onClick={logout}
                  >
                    <span className="flex items-center gap-2"><LogOut size={18} /> Logout</span>
                  </button>
                </>
              ) : (
                <div className="grid gap-2 p-2">
                  <NavItem to="/login" onClick={() => setOpen(false)}>Sign in</NavItem>
                  <Link
                    to="/register"
                    className="btn-primary mt-2 w-full justify-center py-3 text-base shadow-lg shadow-emerald-500/20"
                    onClick={() => setOpen(false)}
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

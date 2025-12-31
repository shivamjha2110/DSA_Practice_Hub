import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Moon, Sun, LogOut, Menu, X } from "lucide-react";
import Logo from "./Logo";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function NavItem({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "rounded-2xl px-3 py-2 text-sm font-semibold transition",
          "hover:bg-zinc-900/5 dark:hover:bg-white/10",
          isActive ? "bg-zinc-900/5 dark:bg-white/10" : ""
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => setOpen(false), [location.pathname]);

  return (
    <div className="sticky top-0 z-40">
      <div className="border-b border-zinc-200/70 bg-white/60 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/60">
        <div className="container-app flex items-center justify-between py-2 sm:py-3">
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <Logo className="h-8 w-8 sm:h-9 sm:w-9" />
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight sm:text-base">AlgoBloom</div>
              <div className="hidden text-[11px] text-zinc-600 dark:text-white/60 sm:block">DSA practice tracker</div>
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
            <button className="btn-ghost ml-1" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              <span className="hidden md:inline">{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
            {user ? (
              <button className="btn-ghost" onClick={logout}>
                <LogOut size={18} />
                <span className="hidden md:inline">Logout</span>
              </button>
            ) : (
              <Link to="/register" className="btn-primary ml-1">Get started</Link>
            )}
          </div>

          {/* mobile */}
          <div className="flex items-center gap-2 sm:hidden">
            <button className="btn-ghost !px-2" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="btn-ghost !px-2" onClick={() => setOpen((v) => !v)} aria-label="Menu">
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* mobile menu panel */}
      {open ? (
        <div className="border-b border-zinc-200/70 bg-white/95 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/95 sm:hidden">
          <div className="container-app space-y-1 py-4">
            <div className="grid gap-1">
              {user ? (
                <>
                  <NavItem to="/app" onClick={() => setOpen(false)}>Dashboard</NavItem>
                  <NavItem to="/practice" onClick={() => setOpen(false)}>Practice</NavItem>
                  <NavItem to="/revisit" onClick={() => setOpen(false)}>Revisit</NavItem>
                  <NavItem to="/search" onClick={() => setOpen(false)}>Search</NavItem>
                  <NavItem to="/analytics" onClick={() => setOpen(false)}>Analytics</NavItem>
                  <div className="my-2 border-t border-zinc-200/50 dark:border-white/10"></div>
                  <button className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10" onClick={logout}>
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <NavItem to="/login" onClick={() => setOpen(false)}>Sign in</NavItem>
                  <NavItem to="/register" onClick={() => setOpen(false)}>Create account</NavItem>
                  <Link to="/register" className="btn-primary mt-2 w-full" onClick={() => setOpen(false)}>
                    Get started
                  </Link>
                </>
              )}
            </div>

            <div className="mt-3 text-xs text-zinc-500 dark:text-white/40">
              Tip: press <span className="kbd">/</span> to open Search
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

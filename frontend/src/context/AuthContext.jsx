import React from "react";
import { io } from "socket.io-client";
import { api, setAuthToken } from "../lib/api";

const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = React.useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [activeUsers, setActiveUsers] = React.useState(0);

  // Socket Connection
  React.useEffect(() => {
    // Socket.IO is not supported on Vercel Serverless.
    // We only attempt connection if explicitly enabled or on localhost for dev.
    const isDev = window.location.hostname === "localhost";
    const shouldConnect = isDev;

    if (!shouldConnect) return;

    let socket;
    try {
      socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

      socket.on("activeUsers", (count) => {
        setActiveUsers(count);
      });

      socket.on("connect_error", () => {
        // Silently fail if connection refused
        socket.disconnect();
      });
    } catch (e) {
      console.warn("Socket connection failed", e);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const maybeAutoSyncLeetCode = React.useCallback(async (u) => {
    try {
      if (!u) return;
      if (!u.autoSyncLeetCode) return;
      if (!u.leetcodeUsername) return;
      // throttle: only sync if last sync older than 6 hours
      const last = u.leetcodeLastSyncAt ? new Date(u.leetcodeLastSyncAt).getTime() : 0;
      const now = Date.now();
      if (last && now - last < 6 * 60 * 60 * 1000) return;
      await api.post("/leetcode/sync");
      // refresh user for lastSyncAt
      const { data } = await api.get("/user/me");
      setUser(data.user);
    } catch {
      // best-effort; ignore
    }
  }, []);

  const maybeSyncTimezone = React.useCallback(async (u) => {
    try {
      if (!u) return;
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      if (!tz) return;
      if (u.timezone && String(u.timezone).trim() === tz) return;
      // best-effort: patch once per session
      await api.patch("/user/preferences", { timezone: tz });
      const { data } = await api.get("/user/me");
      setUser(data.user);
    } catch {
      // ignore
    }
  }, []);


  React.useEffect(() => {
    if (token) setAuthToken(token);
    else setAuthToken(null);

    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/user/me");
        setUser(data.user);
        // best-effort: sync timezone + auto-sync
        maybeSyncTimezone(data.user);
        maybeAutoSyncLeetCode(data.user);
      } catch {
        // token invalid
        setToken("");
        setUser(null);
        localStorage.removeItem("token");
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [token, maybeAutoSyncLeetCode, maybeSyncTimezone]);

  // supports: login({email, password}) OR login(email, password)
  const login = async (a, b) => {
    const payload = typeof a === "object" ? a : { email: a, password: b };
    const { data } = await api.post("/auth/login", payload);
    setToken(data.token);
    localStorage.setItem("token", data.token);
    setAuthToken(data.token);
    setUser(data.user);
    // best-effort: timezone + auto-sync
    Promise.resolve().then(() => maybeSyncTimezone(data.user));
    Promise.resolve().then(() => maybeAutoSyncLeetCode(data.user));
  };

  // supports: register({username, email, password}) OR register(username, email, password)
  const register = async (a, b, c) => {
    const payload = typeof a === "object" ? a : { username: a, email: b, password: c };
    const { data } = await api.post("/auth/register", payload);
    setToken(data.token);
    localStorage.setItem("token", data.token);
    setAuthToken(data.token);
    setUser(data.user);
    // best-effort: timezone
    Promise.resolve().then(() => maybeSyncTimezone(data.user));
    // best-effort auto-sync (if user set username later)
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    setAuthToken(null);
    // Note: we don't clear activeUsers here as the user is still on the site
  };

  const refreshMe = async () => {
    const { data } = await api.get("/user/me");
    setUser(data.user);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout, refreshMe, activeUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

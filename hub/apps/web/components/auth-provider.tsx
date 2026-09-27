"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { PublicUser } from "@gamer/shared";
import { api, API_CONFIGURED } from "@/lib/api";

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: PublicUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Token refresh interval: 10 minutes (refresh token before 15-minute access token expires)
const TOKEN_REFRESH_INTERVAL = 10 * 60 * 1000;
const MAX_REFRESH_FAILURES = 3; // After 3 failures, stop retrying until next login

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const failedRefreshCountRef = useRef(0);

  const refreshTokens = useCallback(async () => {
    try {
      console.log("[Auth] Attempting token refresh...");

      // Debug: check if refresh_token cookie exists
      const cookies = document.cookie;
      const hasRefreshToken = cookies.includes("refresh_token");
      console.log("[Auth] Has refresh_token cookie:", hasRefreshToken);
      if (!hasRefreshToken) {
        console.warn("[Auth] refresh_token cookie not found - cannot refresh");
        failedRefreshCountRef.current = MAX_REFRESH_FAILURES;
        setUser(null);
        return false;
      }

      const { user } = await api.refresh();
      if (!user) {
        console.error("[Auth] Refresh returned no user");
        setUser(null);
        failedRefreshCountRef.current = MAX_REFRESH_FAILURES;
        return false;
      }
      console.log("[Auth] Token refresh successful");
      setUser(user);
      failedRefreshCountRef.current = 0; // Reset on success
      return true;
    } catch (err) {
      failedRefreshCountRef.current++;
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(
        `[Auth] Token refresh failed (${failedRefreshCountRef.current}/${MAX_REFRESH_FAILURES}): ${errMsg}`
      );
      if (failedRefreshCountRef.current >= MAX_REFRESH_FAILURES) {
        console.log("[Auth] Max refresh failures reached, user must login");
        setUser(null);
      }
      return false;
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    if (!API_CONFIGURED) {
      setLoading(false);
      return;
    }
    try {
      // Try to refresh the access token using the refresh token
      const success = await refreshTokens();
      if (!success) {
        console.log("[Auth] Refresh failed on init, user must login");
      }
    } catch (err) {
      console.error("[Auth] Init error:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [refreshTokens]);

  const logout = useCallback(async () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    await api.logout().catch(() => {});
    setUser(null);
  }, []);

  useEffect(() => {
    if (!API_CONFIGURED) {
      setLoading(false);
      return;
    }
    void initializeAuth();
  }, [initializeAuth]);

  // Set up periodic token refresh
  useEffect(() => {
    if (!API_CONFIGURED || !user) return;

    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    refreshIntervalRef.current = setInterval(() => {
      // Only refresh if we haven't hit max failures
      if (failedRefreshCountRef.current < MAX_REFRESH_FAILURES) {
        void refreshTokens().catch(() => {});
      }
    }, TOKEN_REFRESH_INTERVAL);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [user, refreshTokens]);

  const refresh = useCallback(async () => {
    try {
      const { user } = await api.me();
      setUser(user);
    } catch {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Return a safe default during build time / when context is unavailable
    if (typeof window === "undefined") {
      return {
        user: null,
        loading: true,
        refresh: async () => {},
        logout: async () => {},
        setUser: () => {},
      };
    }
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

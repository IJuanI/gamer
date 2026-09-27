"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { PublicUser } from "@gamer/shared";
import { api, API_CONFIGURED } from "@/lib/api";
import { reportError } from "@/lib/telemetry";

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
      await reportError({
        message: "Token refresh attempt",
        context: "tokenRefresh",
        metadata: {
          event: "refresh_attempt",
          timestamp: new Date().toISOString(),
        },
      }).catch(() => {});

      const { user } = await api.refresh();
      if (!user) {
        await reportError({
          message: "Token refresh failed: no user in response",
          context: "tokenRefresh",
          metadata: {
            event: "refresh_failed",
            reason: "no_user_in_response",
            failureCount: failedRefreshCountRef.current + 1,
          },
        }).catch(() => {});
        setUser(null);
        failedRefreshCountRef.current = MAX_REFRESH_FAILURES;
        return false;
      }

      await reportError({
        message: "Token refresh successful",
        context: "tokenRefresh",
        metadata: {
          event: "refresh_success",
          userId: user.id,
          timestamp: new Date().toISOString(),
        },
      }).catch(() => {});

      setUser(user);
      failedRefreshCountRef.current = 0;
      return true;
    } catch (err) {
      failedRefreshCountRef.current++;
      const errMsg = err instanceof Error ? err.message : String(err);

      await reportError({
        message: `Token refresh failed: ${errMsg}`,
        context: "tokenRefresh",
        metadata: {
          event: "refresh_failed",
          reason: "exception",
          error: errMsg,
          failureCount: failedRefreshCountRef.current,
          maxFailures: MAX_REFRESH_FAILURES,
        },
      }).catch(() => {});

      if (failedRefreshCountRef.current >= MAX_REFRESH_FAILURES) {
        await reportError({
          message: "Max token refresh failures reached, logging out user",
          context: "tokenRefresh",
          metadata: {
            event: "max_failures_reached",
            failureCount: failedRefreshCountRef.current,
          },
        }).catch(() => {});
        setUser(null);
      }
      return false;
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    if (!API_CONFIGURED) {
      await reportError({
        message: "Auth initialization skipped: API not configured",
        context: "authInit",
        metadata: {
          event: "api_not_configured",
          apiUrl: typeof window !== "undefined" ? new URL(window.location.href).origin : "unknown",
        },
      }).catch(() => {});
      setLoading(false);
      return;
    }
    try {
      await refreshTokens();
    } catch (err) {
      await reportError({
        message: `Auth initialization error: ${err instanceof Error ? err.message : String(err)}`,
        context: "authInit",
        metadata: {
          event: "init_error",
        },
      }).catch(() => {});
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

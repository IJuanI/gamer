"use client";

import { useEffect } from "react";
import { setupGlobalErrorHandler } from "@/lib/telemetry";
import { useAuth } from "./auth-provider";

export function GlobalErrorSetup() {
  const { user } = useAuth();

  useEffect(() => {
    setupGlobalErrorHandler(user?.id);
  }, [user?.id]);

  return null;
}

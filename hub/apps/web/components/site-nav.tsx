"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { useAuth } from "./auth-provider";
import { ThemeToggle } from "./theme-toggle";
import { RenderTelemetry } from "./render-telemetry";
import { useEffect } from "react";
import { captureEvent } from "@/lib/telemetry";

export function SiteNav() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const isGameDevsRoute = pathname.startsWith("/devs");

  useEffect(() => {
    captureEvent("event", "SiteNav mounted", "info", { pathname, isGameDevsRoute });
  }, [pathname, isGameDevsRoute]);

  return (
    <>
      <RenderTelemetry component="SiteNav" />
      <header className="sticky top-0 z-50 border-b transition-colors" style={{ borderColor: "var(--border-default)", backgroundColor: "var(--background-elevated)" }}>
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo brand={isGameDevsRoute ? "gamedevs" : "gamer"} />
        <div className="flex items-center gap-3 text-sm">
          <ThemeToggle />
          <Link href="/jam" className="transition-colors hidden sm:block" style={{ color: "var(--text-secondary)" }}>
            Game Jam
          </Link>
          <Link href="/#comunidad" className="transition-colors hidden sm:block" style={{ color: "var(--text-secondary)" }}>
            Comunidad
          </Link>
          <Link href="/#features" className="transition-colors hidden sm:block" style={{ color: "var(--text-secondary)" }}>
            Qué hacemos
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-md px-4 py-2 font-medium transition-transform hover:scale-105"
              style={isGameDevsRoute ? {
                color: "#fff",
                borderColor: "#72b341",
                borderWidth: "2px"
              } : {
                color: "var(--foreground)",
                borderColor: "var(--gamer-purple)",
                borderWidth: "2px"
              }}
            >
              Mi panel
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-3 py-2 transition-colors" style={{ color: "var(--text-secondary)" }}>
                Ingresar
              </Link>
              <Link
                href="/register"
                className="rounded-md px-4 py-2 font-medium transition-transform hover:scale-105"
                style={isGameDevsRoute ? {
                  backgroundColor: "#72b341",
                  color: "#fff",
                  boxShadow: "0 0 20px rgba(114, 179, 65, 0.4)"
                } : {
                  backgroundColor: "var(--gamer-purple)",
                  color: "#fff",
                  boxShadow: "var(--box-glow-purple)"
                }}
              >
                Unirme
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
    </>
  );
}

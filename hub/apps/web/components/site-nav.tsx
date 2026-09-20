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
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#12121E]/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo brand={isGameDevsRoute ? "gamedevs" : "gamer"} />
        <div className="flex items-center gap-3 text-sm">
          <ThemeToggle />
          <Link href="/#comunidad" className="text-[var(--text-secondary)] hover:text-white transition-colors hidden sm:block">
            Comunidad
          </Link>
          <Link href="/#features" className="text-[var(--text-secondary)] hover:text-white transition-colors hidden sm:block">
            Qué hacemos
          </Link>
          {loading ? null : user ? (
            <Link
              href="/dashboard"
              className="rounded-md px-4 py-2 font-medium text-white transition-transform hover:scale-105"
              style={isGameDevsRoute ? {
                borderColor: "#72b341",
                borderWidth: "2px"
              } : {
                borderColor: "var(--gamer-purple)",
                borderWidth: "2px"
              }}
            >
              Mi panel
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-3 py-2 text-[var(--text-secondary)] hover:text-white transition-colors">
                Ingresar
              </Link>
              <Link
                href="/register"
                className="rounded-md px-4 py-2 font-medium text-white transition-transform hover:scale-105"
                style={isGameDevsRoute ? {
                  backgroundColor: "#72b341",
                  boxShadow: "0 0 20px rgba(114, 179, 65, 0.4)"
                } : {
                  backgroundColor: "var(--gamer-purple)",
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

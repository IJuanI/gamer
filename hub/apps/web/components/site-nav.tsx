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
  const isJamRoute = pathname.startsWith("/jam");

  useEffect(() => {
    captureEvent("event", "SiteNav mounted", "info", { pathname, isGameDevsRoute });
  }, [pathname, isGameDevsRoute]);

  const brand = isJamRoute ? "jam" : isGameDevsRoute ? "gamedevs" : "gamer";
  const navStyle = isJamRoute
    ? { borderColor: "rgba(60, 255, 158, 0.15)", backgroundColor: "#0b1020" }
    : { borderColor: "var(--border-default)", backgroundColor: "var(--background-elevated)" };
  const linkColor = isJamRoute ? "#b6c2ff" : "var(--text-secondary)";

  return (
    <>
      <RenderTelemetry component="SiteNav" />
      <header className="sticky top-0 z-50 border-b transition-colors" style={navStyle}>
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo brand={brand} />
          <div className="flex items-center gap-3 text-sm">
            {!isJamRoute && <ThemeToggle />}
            {!isJamRoute && (
              <Link href="/jam" className="transition-colors hidden sm:block" style={{ color: linkColor }}>
                Game Jam
              </Link>
            )}
            {isJamRoute && (
              <Link href="/jam#cronograma" className="transition-colors hidden sm:block" style={{ color: linkColor }}>
                Cronograma
              </Link>
            )}
            {isJamRoute && (
              <Link href="/jam/convivencia" className="transition-colors hidden sm:block" style={{ color: linkColor }}>
                Normas de convivencia
              </Link>
            )}
            {!isJamRoute && (
              <>
                <Link href="/#comunidad" className="transition-colors hidden sm:block" style={{ color: linkColor }}>
                  Comunidad
                </Link>
                <Link href="/#features" className="transition-colors hidden sm:block" style={{ color: linkColor }}>
                  Qué hacemos
                </Link>
              </>
            )}
            <div style={{ width: isJamRoute ? "40px" : "0px" }} />
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-md px-4 py-2 font-medium transition-transform hover:scale-105"
                style={isJamRoute ? {
                  color: "#3cff9e",
                  borderColor: "#3cff9e",
                  borderWidth: "2px"
                } : isGameDevsRoute ? {
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
                {!isJamRoute && (
                  <Link href="/login" className="px-3 py-2 transition-colors" style={{ color: linkColor }}>
                    Ingresar
                  </Link>
                )}
                {isJamRoute ? (
                  <a
                    href="https://herohub.gamejamplus.com/#/jam"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md px-4 py-2 font-medium transition-transform hover:scale-105"
                    style={{
                      backgroundColor: "transparent",
                      color: "#3cff9e",
                      border: "2px solid #3cff9e",
                    }}
                  >
                    Registrarse
                  </a>
                ) : (
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
                )}
              </>
            )}
          </div>
        </nav>
      </header>
    </>
  );
}

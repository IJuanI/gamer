"use client";

import Link from "next/link";
import { Logo } from "./logo";
import { useAuth } from "./auth-provider";

export function SiteNav() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#12121E]/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />
        <div className="flex items-center gap-3 text-sm">
          <Link href="/#comunidad" className="text-[var(--text-secondary)] hover:text-white transition-colors hidden sm:block">
            Comunidad
          </Link>
          <Link href="/#features" className="text-[var(--text-secondary)] hover:text-white transition-colors hidden sm:block">
            Qué hacemos
          </Link>
          {loading ? null : user ? (
            <Link
              href="/dashboard"
              className="rounded-md neon-border-purple px-4 py-2 font-medium text-white transition-transform hover:scale-105"
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
                className="rounded-md bg-[var(--gamer-purple)] px-4 py-2 font-medium text-white box-glow-purple transition-transform hover:scale-105"
              >
                Unirme
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

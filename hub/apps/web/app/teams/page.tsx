"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Plus } from "lucide-react";
import type { PublicGame, PublicTeam } from "@gamer/shared";
import { Logo } from "@/components/logo";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";

export default function TeamsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [games, setGames] = useState<PublicGame[]>([]);
  const [teams, setTeams] = useState<PublicTeam[]>([]);
  const [gameId, setGameId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useLayoutEffect(() => {
    let isMounted = true;
    fetch('/api/games', { credentials: 'include' })
      .then(res => res.json())
      .then((data) => {
        if (!isMounted) return;
        const gamesArray = Array.isArray(data) ? data : data?.games || [];
        setGames(gamesArray);
      })
      .catch(() => {
        if (!isMounted) return;
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    fetch(`/api/teams${gameId ? `?gameId=${gameId}` : ''}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) {
          console.error(`Teams API error: ${res.status}`);
          return [];
        }
        return res.json();
      })
      .then((data) => {
        const teamsArray = Array.isArray(data) ? data : data?.teams || [];
        setTeams(teamsArray);
      })
      .catch((e) => {
        console.error('Failed to fetch teams:', e);
        setError(e instanceof Error ? e.message : "Error");
      });
  }, [gameId]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center text-[var(--muted)]">
        Cargando…
      </main>
    );
  }

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-grid-neon-fade" />

      <header className="relative border-b border-white/5 bg-[#12121E]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Logo />
          <Link
            href="/dashboard"
            className="rounded-md border border-white/10 px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-white"
          >
            Mi panel
          </Link>
        </div>
      </header>

      <div className="relative mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-azonix text-2xl text-white">Equipos</h1>
          <div className="flex items-center gap-3">
            <select
              key={`select-${games.length}`}
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="rounded-md border border-white/10 bg-[var(--background)] px-3 py-2 text-sm text-white"
            >
              <option value="">Todos los juegos</option>
              {games.length > 0 && games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <Link
              href="/teams/new"
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105"
              style={{ backgroundColor: "var(--gamer-purple)", boxShadow: "var(--box-glow-purple)" }}
            >
              <Plus className="h-4 w-4" /> Crear equipo
            </Link>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-[var(--gamer-purple-text)]">{error}</p>}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="relative panel-clip border border-white/8 bg-[var(--background-elevated)] p-6 transition-colors hover:border-white/20"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg neon-border-purple">
                  <Users className="h-5 w-5" style={{ color: "var(--gamer-purple-text)" }} />
                </div>
                <div>
                  <h3 className="font-azonix text-base text-white">
                    {team.name} {team.tag && <span className="text-[var(--muted)]">[{team.tag}]</span>}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">{team.game.name}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-[var(--muted)]">
                {team.members.length} {team.members.length === 1 ? "integrante" : "integrantes"}
              </p>
            </Link>
          ))}
        </div>

        {teams.length === 0 && (
          <p className="mt-8 text-sm text-[var(--muted)]">No hay equipos registrados todavía.</p>
        )}
      </div>
    </main>
  );
}

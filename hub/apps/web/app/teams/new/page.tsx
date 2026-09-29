"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { PublicGame } from "@gamer/shared";
import { Logo } from "@/components/logo";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";

export default function NewTeamPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [games, setGames] = useState<PublicGame[]>([]);
  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [gameId, setGameId] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useLayoutEffect(() => {
    let isMounted = true;
    fetch('/api/games', { credentials: 'include' })
      .then(res => res.json())
      .then((data) => {
        if (!isMounted) return;
        console.log('Games loaded:', data?.length || 0, 'games');
        const gamesArray = Array.isArray(data) ? data : data?.games || [];
        setGames(gamesArray);
        if (gamesArray.length > 0) {
          setGameId(gamesArray[0].id);
        }
      })
      .catch((e) => {
        if (!isMounted) return;
        console.error('Failed to load games:', e);
      });
    return () => {
      isMounted = false;
    };
  }, []);

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
            href="/teams"
            className="rounded-md border border-white/10 px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-white"
          >
            Volver
          </Link>
        </div>
      </header>

      <div className="relative mx-auto max-w-xl px-6 py-12">
        <h1 className="font-azonix text-2xl text-white">Crear equipo</h1>

        <form
          className="relative panel-clip mt-6 border border-white/8 bg-[var(--background-elevated)] p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setSubmitting(true);
            try {
              const team = await api.createTeam({
                name,
                gameId,
                tag: tag || undefined,
                bio: bio || undefined,
              });
              router.push(`/teams/${team.id}`);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Error");
              setSubmitting(false);
            }
          }}
        >
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm text-[var(--text-secondary)]">
              Nombre
              <input
                required
                placeholder="Nombre del equipo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-md border border-white/10 bg-[var(--background)] px-3 py-2 text-white"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-[var(--text-secondary)]">
              Tag (opcional)
              <input
                placeholder="Ej: STM"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                maxLength={6}
                className="rounded-md border border-white/10 bg-[var(--background)] px-3 py-2 text-white"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-[var(--text-secondary)]">
              Juego
              <select
                key={`select-${games.length}`}
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                className="rounded-md border border-white/10 bg-[var(--background)] px-3 py-2 text-white"
              >
                <option value="">Seleccionar juego</option>
                {games.length > 0 && games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-[var(--text-secondary)]">
              Descripción (opcional)
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="rounded-md border border-white/10 bg-[var(--background)] px-3 py-2 text-white"
              />
            </label>
            <button
              type="submit"
              disabled={submitting || !gameId}
              className="rounded-md px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105 disabled:opacity-50"
              style={{ backgroundColor: "var(--gamer-purple)", boxShadow: "var(--box-glow-purple)" }}
            >
              Crear equipo
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-[var(--gamer-purple-text)]">{error}</p>}
        </form>
      </div>
    </main>
  );
}

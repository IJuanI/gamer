"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { PublicGame, PublicTeam, RecruitmentPostType } from "@gamer/shared";
import { Logo } from "@/components/logo";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";

export default function NewRecruitmentPostPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [games, setGames] = useState<PublicGame[]>([]);
  const [myTeams, setMyTeams] = useState<PublicTeam[]>([]);
  const [type, setType] = useState<RecruitmentPostType>("LOOKING_FOR_TEAM");
  const [gameId, setGameId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    api.listGames().then((r) => {
      setGames(r.games);
      setGameId((prev) => prev || r.games[0]?.id || "");
    });
  }, []);

  useEffect(() => {
    if (!user || type !== "LOOKING_FOR_PLAYERS") return;
    api.listTeams().then((r) => setMyTeams(r.teams.filter((t) => t.members.some((m) => m.userId === user.id && m.role === "CAPTAIN"))));
  }, [user, type]);

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
            href="/recruitment"
            className="rounded-md border border-white/10 px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-white"
          >
            Volver
          </Link>
        </div>
      </header>

      <div className="relative mx-auto max-w-xl px-6 py-12">
        <h1 className="font-azonix text-2xl text-white">Publicar aviso</h1>

        <form
          className="relative panel-clip mt-6 border border-white/8 bg-[var(--background-elevated)] p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setSubmitting(true);
            try {
              const post = await api.createRecruitmentPost({
                type,
                gameId,
                teamId: type === "LOOKING_FOR_PLAYERS" && teamId ? teamId : undefined,
                title,
                body,
              });
              router.push("/recruitment");
              void post;
            } catch (err) {
              setError(err instanceof Error ? err.message : "Error");
              setSubmitting(false);
            }
          }}
        >
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm text-[var(--text-secondary)]">
              Tipo
              <select
                value={type}
                onChange={(e) => setType(e.target.value as RecruitmentPostType)}
                className="rounded-md border border-white/10 bg-[var(--background)] px-3 py-2 text-white"
              >
                <option value="LOOKING_FOR_TEAM">Busco equipo</option>
                <option value="LOOKING_FOR_PLAYERS">Busco jugadores</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-[var(--text-secondary)]">
              Juego
              <select
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                className="rounded-md border border-white/10 bg-[var(--background)] px-3 py-2 text-white"
              >
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </label>
            {type === "LOOKING_FOR_PLAYERS" && myTeams.length > 0 && (
              <label className="flex flex-col gap-1 text-sm text-[var(--text-secondary)]">
                Equipo (opcional)
                <select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="rounded-md border border-white/10 bg-[var(--background)] px-3 py-2 text-white"
                >
                  <option value="">Sin equipo asociado</option>
                  {myTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="flex flex-col gap-1 text-sm text-[var(--text-secondary)]">
              Título
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-md border border-white/10 bg-[var(--background)] px-3 py-2 text-white"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-[var(--text-secondary)]">
              Descripción
              <textarea
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="rounded-md border border-white/10 bg-[var(--background)] px-3 py-2 text-white"
              />
            </label>
            <button
              type="submit"
              disabled={submitting || !gameId}
              className="rounded-md px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105 disabled:opacity-50"
              style={{ backgroundColor: "var(--gamer-purple)", boxShadow: "var(--box-glow-purple)" }}
            >
              Publicar
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-[var(--gamer-purple-text)]">{error}</p>}
        </form>
      </div>
    </main>
  );
}

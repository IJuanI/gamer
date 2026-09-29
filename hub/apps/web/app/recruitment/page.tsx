"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Megaphone, Plus } from "lucide-react";
import type { PublicGame, PublicRecruitmentPost } from "@gamer/shared";
import { Logo } from "@/components/logo";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import { formatRelative } from "@/lib/format";

const TYPE_LABEL: Record<string, string> = {
  LOOKING_FOR_TEAM: "Busca equipo",
  LOOKING_FOR_PLAYERS: "Busca jugadores",
};

export default function RecruitmentPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [games, setGames] = useState<PublicGame[]>([]);
  const [posts, setPosts] = useState<PublicRecruitmentPost[]>([]);
  const [gameId, setGameId] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    api.listGames().then((r) => setGames(r.games || [])).catch(() => {});
  }, []);

  useEffect(() => {
    api
      .listRecruitmentPosts({ gameId: gameId || undefined, type: type || undefined, isOpen: true })
      .then((r) => setPosts(r.recruitmentPosts || []))
      .catch((e) => setError(e instanceof Error ? e.message : "Error"));
  }, [gameId, type]);

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
          <h1 className="font-azonix text-2xl text-white">Reclutamiento</h1>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="rounded-md border border-white/10 bg-[var(--background)] px-3 py-2 text-sm text-white"
            >
              <option value="">Todos los juegos</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-md border border-white/10 bg-[var(--background)] px-3 py-2 text-sm text-white"
            >
              <option value="">Todos los tipos</option>
              <option value="LOOKING_FOR_TEAM">Busca equipo</option>
              <option value="LOOKING_FOR_PLAYERS">Busca jugadores</option>
            </select>
            <Link
              href="/recruitment/new"
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105"
              style={{ backgroundColor: "var(--gamer-purple)", boxShadow: "var(--box-glow-purple)" }}
            >
              <Plus className="h-4 w-4" /> Publicar
            </Link>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-[var(--gamer-purple-text)]">{error}</p>}

        <div className="mt-8 flex flex-col gap-4">
          {posts.map((post) => (
            <div key={post.id} className="relative panel-clip border border-white/8 bg-[var(--background-elevated)] p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg neon-border-purple">
                  <Megaphone className="h-5 w-5" style={{ color: "var(--gamer-purple-text)" }} />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-azonix text-base text-white">{post.title}</h3>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: "rgba(179,57,196,0.15)", color: "var(--gamer-purple-text)" }}
                    >
                      {TYPE_LABEL[post.type]}
                    </span>
                    <span className="text-xs text-[var(--muted)]">{post.game.name}</span>
                    {post.team && <span className="text-xs text-[var(--muted)]">· {post.team.name}</span>}
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{post.body}</p>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {post.author.displayName} · {formatRelative(post.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <p className="mt-8 text-sm text-[var(--muted)]">No hay publicaciones abiertas por ahora.</p>
        )}
      </div>
    </main>
  );
}

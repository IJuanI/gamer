"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldQuestion, Gamepad2, Plus, X, RefreshCw, Link2 } from "lucide-react";
import type { PublicGame, PublicGameProfile } from "@gamer/shared";
import { Logo } from "@/components/logo";
import { useAuth } from "@/components/auth-provider";
import { api, platformOauthUrl } from "@/lib/api";
import { formatRelative } from "@/lib/format";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [games, setGames] = useState<PublicGame[]>([]);
  const [profiles, setProfiles] = useState<PublicGameProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;
    Promise.all([api.listGames(), api.myGameProfiles()])
      .then(([g, p]) => {
        if (!isMounted) return;
        setGames(g.games || []);
        setProfiles(p.gameProfiles || []);
      })
      .catch((e) => {
        if (!isMounted) return;
        setError(e instanceof Error ? e.message : "Error");
        setGames([]);
        setProfiles([]);
      });
    return () => {
      isMounted = false;
    };
  }, [user]);

  const refresh = () => api.myGameProfiles().then((p) => setProfiles(p.gameProfiles));

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center text-[var(--muted)]">
        Cargando…
      </main>
    );
  }

  const availableGames = games.filter((g) => !profiles.some((p) => p.game.id === g.id));

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
        <div className="flex items-center justify-between">
          <h1 className="font-azonix text-2xl text-white">Perfil de gamer</h1>
          {availableGames.length > 0 && (
            <button
              onClick={() => setShowAdd((v) => !v)}
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105"
              style={{ backgroundColor: "var(--gamer-purple)", boxShadow: "var(--box-glow-purple)" }}
            >
              <Plus className="h-4 w-4" /> Agregar juego
            </button>
          )}
        </div>

        {error && <p className="mt-4 text-sm text-[var(--gamer-purple-text)]">{error}</p>}

        {showAdd && (
          <AddGameForm
            games={availableGames}
            onCreated={(profile) => {
              setProfiles((prev) => [...prev, profile]);
              setShowAdd(false);
            }}
          />
        )}

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {profiles.map((profile) => (
            <GameProfileCard
              key={profile.id}
              profile={profile}
              onChange={refresh}
              onRemoved={() => setProfiles((prev) => prev.filter((p) => p.id !== profile.id))}
            />
          ))}
        </div>

        {profiles.length === 0 && (
          <p className="mt-8 text-sm text-[var(--muted)]">
            Todavía no agregaste ningún juego a tu perfil.
          </p>
        )}
      </div>
    </main>
  );
}

function AddGameForm({
  games,
  onCreated,
}: {
  games: PublicGame[];
  onCreated: (profile: PublicGameProfile) => void;
}) {
  const [gameId, setGameId] = useState(games[0]?.id ?? "");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      className="relative panel-clip mt-6 border border-white/8 bg-[var(--background-elevated)] p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
          const profile = await api.createGameProfile({ gameId, inGameHandle: handle });
          onCreated(profile);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Error");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div className="flex flex-wrap items-end gap-4">
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
        <label className="flex flex-col gap-1 text-sm text-[var(--text-secondary)]">
          Nombre en el juego
          <input
            required
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="TuNick#1234"
            className="rounded-md border border-white/10 bg-[var(--background)] px-3 py-2 text-white"
          />
        </label>
        <button
          type="submit"
          disabled={submitting || !gameId}
          className="rounded-md px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105 disabled:opacity-50"
          style={{ backgroundColor: "var(--gamer-purple)" }}
        >
          Agregar
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-[var(--gamer-purple-text)]">{error}</p>}
    </form>
  );
}

const PROVIDER_LABEL: Record<string, string> = { FACEIT: "FACEIT", RIOT: "Riot" };

function GameProfileCard({
  profile,
  onChange,
  onRemoved,
}: {
  profile: PublicGameProfile;
  onChange: () => void;
  onRemoved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const link = profile.platformLink;
  const verified = Boolean(link?.hasRankData);
  const identityOnly = Boolean(link && !link.hasRankData);
  const connectSlug = profile.game.slug === "cs2" ? "faceit" : profile.game.slug === "lol" || profile.game.slug === "valorant" ? "riot" : null;

  return (
    <div className="relative panel-clip border border-white/8 bg-[var(--background-elevated)] p-6">
      <div className="hud-bracket-tl" />
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg neon-border-purple">
            <Gamepad2 className="h-5 w-5" style={{ color: "var(--gamer-purple-text)" }} />
          </div>
          <div>
            <h3 className="font-azonix text-base text-white">{profile.game.name}</h3>
            <p className="text-sm text-[var(--text-secondary)]">{profile.inGameHandle}</p>
          </div>
        </div>
        <button
          onClick={async () => {
            setBusy(true);
            try {
              await api.deleteGameProfile(profile.id);
              onRemoved();
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
          className="text-[var(--muted)] transition-colors hover:text-white"
          aria-label="Quitar juego"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4">
        {verified && link && (
          <div
            className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            style={{ borderColor: "var(--gamer-green)", backgroundColor: "rgba(132,197,82,0.08)" }}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" style={{ color: "var(--gamer-green)" }} />
              <span style={{ color: "var(--gamer-green)" }}>
                Verificado · {PROVIDER_LABEL[link.provider]}
                {link.statsFetchedAt ? ` · ${formatRelative(link.statsFetchedAt)}` : ""}
              </span>
            </div>
            <button
              onClick={async () => {
                setBusy(true);
                try {
                  await api.refreshPlatformLink(link.id);
                  onChange();
                } finally {
                  setBusy(false);
                }
              }}
              disabled={busy}
              className="text-[var(--muted)] transition-colors hover:text-white"
              aria-label="Actualizar datos"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {identityOnly && link && (
          <div
            className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            style={{ borderColor: "var(--text-secondary)", backgroundColor: "rgba(255,255,255,0.04)" }}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--text-secondary)]" />
              <span className="text-[var(--text-secondary)]">
                Cuenta verificada · {PROVIDER_LABEL[link.provider]}
              </span>
            </div>
          </div>
        )}

        {!link && (
          <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm">
            <div className="flex items-center gap-2 text-[var(--muted)]">
              <ShieldQuestion className="h-4 w-4" />
              <span>Sin verificar</span>
            </div>
            {connectSlug && (
              <a
                href={platformOauthUrl(connectSlug, profile.game.slug)}
                className="flex items-center gap-1 text-xs font-medium text-[var(--gamer-purple-text)] hover:underline"
              >
                <Link2 className="h-3.5 w-3.5" /> Conectar {PROVIDER_LABEL[connectSlug === "faceit" ? "FACEIT" : "RIOT"]}
              </a>
            )}
          </div>
        )}

        {!profile.game.rankVerifiable && (
          <p className="mt-2 text-xs text-[var(--muted)]">
            Este juego no tiene una fuente de ranking verificable disponible.
          </p>
        )}
      </div>
    </div>
  );
}

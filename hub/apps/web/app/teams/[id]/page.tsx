"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Crown, Users, X } from "lucide-react";
import type { PublicTeam } from "@gamer/shared";
import { Logo } from "@/components/logo";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";

export default function TeamDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [team, setTeam] = useState<PublicTeam | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addUserId, setAddUserId] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  const load = () => api.getTeam(params.id).then(setTeam).catch((e) => setError(e instanceof Error ? e.message : "Error"));

  useEffect(() => {
    if (!user) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, params.id]);

  if (loading || !user || !team) {
    return (
      <main className="flex min-h-screen items-center justify-center text-[var(--muted)]">
        {error ?? "Cargando…"}
      </main>
    );
  }

  const myMembership = team.members.find((m) => m.userId === user.id);
  const isCaptain = myMembership?.role === "CAPTAIN";

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

      <div className="relative mx-auto max-w-3xl px-6 py-12">
        <section className="relative panel-clip border border-white/8 bg-[var(--background-elevated)] p-8">
          <div className="hud-bracket-tl" />
          <div className="hud-bracket-br" />
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl neon-border-purple">
              <Users className="h-6 w-6" style={{ color: "var(--gamer-purple-text)" }} />
            </div>
            <div>
              <h1 className="font-azonix text-2xl text-white">
                {team.name} {team.tag && <span className="text-[var(--muted)]">[{team.tag}]</span>}
              </h1>
              <p className="text-sm text-[var(--text-secondary)]">{team.game.name}</p>
            </div>
          </div>
          {team.bio && <p className="mt-4 text-sm text-[var(--text-secondary)]">{team.bio}</p>}
          <p className="mt-2 text-xs text-[var(--muted)]">Creado el {formatDate(team.createdAt)}</p>
        </section>

        {error && <p className="mt-4 text-sm text-[var(--gamer-purple-text)]">{error}</p>}

        <h2 className="mt-10 mb-4 font-azonix text-lg text-[var(--text-secondary)]">Roster</h2>
        <div className="overflow-hidden rounded-lg border border-white/8">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3">Gamer</th>
                <th className="px-4 py-3">Rol</th>
                {isCaptain && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody>
              {team.members.map((m) => (
                <tr key={m.id} className="border-t border-white/5">
                  <td className="px-4 py-3 text-white">{m.displayName}</td>
                  <td className="px-4 py-3">
                    {m.role === "CAPTAIN" ? (
                      <span className="flex items-center gap-1" style={{ color: "var(--gamer-purple-text)" }}>
                        <Crown className="h-3.5 w-3.5" /> Capitán
                      </span>
                    ) : (
                      <span className="text-[var(--text-secondary)]">Integrante</span>
                    )}
                  </td>
                  {isCaptain && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {m.role !== "CAPTAIN" && (
                          <button
                            disabled={busy}
                            onClick={async () => {
                              setBusy(true);
                              try {
                                await api.updateTeamMemberRole(team.id, m.id, "CAPTAIN");
                                await load();
                              } finally {
                                setBusy(false);
                              }
                            }}
                            className="text-xs text-[var(--muted)] transition-colors hover:text-white"
                            aria-label="Promover a capitán"
                            title="Promover a capitán"
                          >
                            Promover
                          </button>
                        )}
                        {m.id !== myMembership?.id && (
                          <button
                            disabled={busy}
                            onClick={async () => {
                              setBusy(true);
                              try {
                                await api.removeTeamMember(team.id, m.id);
                                await load();
                              } finally {
                                setBusy(false);
                              }
                            }}
                            className="text-[var(--muted)] transition-colors hover:text-white"
                            aria-label="Quitar del equipo"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isCaptain && (
          <>
            <form
              className="mt-6 flex items-end gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                setBusy(true);
                try {
                  await api.addTeamMember(team.id, addUserId);
                  setAddUserId("");
                  await load();
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Error");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label className="flex flex-1 flex-col gap-1 text-sm text-[var(--text-secondary)]">
                ID de usuario a agregar
                <input
                  required
                  value={addUserId}
                  onChange={(e) => setAddUserId(e.target.value)}
                  className="rounded-md border border-white/10 bg-[var(--background)] px-3 py-2 text-white"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="rounded-md px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105 disabled:opacity-50"
                style={{ backgroundColor: "var(--gamer-purple)" }}
              >
                Agregar
              </button>
            </form>

            <button
              disabled={busy}
              onClick={async () => {
                if (!confirm("¿Estás seguro que quieres eliminar este equipo? Esta acción no se puede deshacer.")) return;
                setBusy(true);
                try {
                  await api.deleteTeam(team.id);
                  router.push("/teams");
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Error al eliminar equipo");
                  setBusy(false);
                }
              }}
              className="mt-4 rounded-md border border-red-500/50 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:border-red-500 hover:text-red-300 disabled:opacity-50"
            >
              Eliminar equipo
            </button>
          </>
        )}

        {!isCaptain && myMembership && (
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await api.removeTeamMember(team.id, myMembership.id);
                router.push("/teams");
              } finally {
                setBusy(false);
              }
            }}
            className="mt-6 rounded-md border border-white/10 px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-white"
          >
            Abandonar equipo
          </button>
        )}
      </div>
    </main>
  );
}

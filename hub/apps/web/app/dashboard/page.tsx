"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, ShieldCheck, Users as UsersIcon, Pencil, Gamepad2, Megaphone } from "lucide-react";
import { ROLE_LABELS, Role, type PublicUser } from "@gamer/shared";
import { Logo } from "@/components/logo";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";

const roleAccent: Record<Role, string> = {
  ADMIN: "var(--gamer-purple-text)",
  EDITOR: "var(--gamer-green-text)",
  MEMBER: "var(--text-secondary)",
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [members, setMembers] = useState<PublicUser[] | null>(null);
  const [membersError, setMembersError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  // Admin-only: load the member list (RBAC enforced server-side).
  useEffect(() => {
    if (user?.role === Role.ADMIN) {
      api
        .listUsers()
        .then((r) => setMembers(r.users))
        .catch((e) => setMembersError(e instanceof Error ? e.message : "Error"));
    }
  }, [user]);

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
          <button
            onClick={async () => {
              await logout();
              router.push("/");
            }}
            className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Salir
          </button>
        </div>
      </header>

      <div className="relative mx-auto max-w-5xl px-6 py-12">
        {/* Profile card */}
        <section className="relative panel-clip border border-white/8 bg-[var(--background-elevated)] p-8">
          <div className="hud-bracket-tl" />
          <div className="hud-bracket-br" />
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl neon-border-purple font-azonix text-2xl text-white">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-azonix text-2xl text-white">
                Hola, {user.displayName}
              </h1>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4" style={{ color: roleAccent[user.role] }} />
                <span style={{ color: roleAccent[user.role] }} className="font-medium">
                  {ROLE_LABELS[user.role]}
                </span>
                <span className="text-[var(--muted)]">· {user.email}</span>
              </div>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Miembro desde el {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        </section>

        {/* Role-aware capability tiles */}
        <h2 className="mt-12 mb-4 font-azonix text-lg text-[var(--text-secondary)]">
          Tu acceso
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/eventos">
            <Tile icon={Gamepad2} title="Eventos" body="Inscribite a torneos y eventos de la comunidad." accent="green" />
          </Link>
          <Link href="/profile">
            <Tile icon={Gamepad2} title="Perfil de gamer" body="Cargá tus juegos y conectá tus cuentas verificadas." accent="purple" />
          </Link>
          <Link href="/teams">
            <Tile icon={UsersIcon} title="Equipos" body="Creá tu equipo o sumate a uno existente." accent="purple" />
          </Link>
          <Link href="/recruitment">
            <Tile icon={Megaphone} title="Reclutamiento" body="Buscá equipo o encontrá jugadores para el tuyo." accent="green" />
          </Link>
          {(user.role === Role.EDITOR || user.role === Role.ADMIN) && (
            <Link href="/admin/flyers">
              <Tile icon={Pencil} title="Generador de flyers" body="Exportar flyers y banners para redes sociales." accent="purple" />
            </Link>
          )}
          {user.role === Role.ADMIN && (
            <Link href="/admin">
              <Tile icon={UsersIcon} title="Administración" body="Gestionar miembros y roles de la comunidad." accent="purple" />
            </Link>
          )}
        </div>

        {/* Admin-only member list */}
        {user.role === Role.ADMIN && (
          <section className="mt-12">
            <h2 className="mb-4 font-azonix text-lg text-[var(--text-secondary)]">
              Miembros de la comunidad
            </h2>
            {membersError && (
              <p className="text-sm text-[var(--gamer-purple-text)]">{membersError}</p>
            )}
            <div className="overflow-hidden rounded-lg border border-white/8">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-xs uppercase tracking-wider text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3">Gamer</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {(members ?? []).map((m) => (
                    <tr key={m.id} className="border-t border-white/5">
                      <td className="px-4 py-3 text-white">{m.displayName}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{m.email}</td>
                      <td className="px-4 py-3" style={{ color: roleAccent[m.role] }}>
                        {ROLE_LABELS[m.role]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Tile({
  icon: Icon,
  title,
  body,
  accent,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  body: string;
  accent: "purple" | "green";
}) {
  const isGreen = accent === "green";
  return (
    <div className="relative panel-clip border border-white/5 bg-[var(--background-elevated)] p-6 transition-colors hover:border-white/10">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-lg ${
          isGreen ? "neon-border-green" : "neon-border-purple"
        }`}
      >
        <Icon
          className="h-5 w-5"
          style={{ color: isGreen ? "var(--gamer-green)" : "var(--gamer-purple-text)" }}
        />
      </div>
      <h3 className="mt-4 font-azonix text-base text-white">{title}</h3>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{body}</p>
    </div>
  );
}

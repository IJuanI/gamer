"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Role, ROLE_LABELS, type PublicUser } from "@gamer/shared";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [members, setMembers] = useState<PublicUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== Role.ADMIN)) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user?.role === Role.ADMIN) {
      api.listUsers()
        .then(r => setMembers(r.users))
        .catch(e => setError(e instanceof Error ? e.message : "Error cargando miembros"));
    }
  }, [user]);

  if (loading || !user || user.role !== Role.ADMIN) {
    return <main className="flex min-h-screen items-center justify-center">Cargando…</main>;
  }

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-grid-neon-fade" />
      
      <header className="relative border-b border-white/5">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5 cursor-pointer" />
          </Link>
          <h1 className="font-azonix text-2xl text-white">Administración</h1>
        </div>
      </header>

      <div className="relative mx-auto max-w-5xl px-6 py-12">
        <section>
          <h2 className="mb-4 font-azonix text-lg text-[var(--text-secondary)]">
            Miembros de la comunidad
          </h2>
          {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
          <div className="overflow-hidden rounded-lg border border-white/8">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3">Gamer</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Miembro desde</th>
                </tr>
              </thead>
              <tbody>
                {(members ?? []).map(m => (
                  <tr key={m.id} className="border-t border-white/5">
                    <td className="px-4 py-3 text-white">{m.displayName}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{m.email}</td>
                    <td className="px-4 py-3 text-[var(--gamer-purple-text)]">{ROLE_LABELS[m.role]}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{new Date(m.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

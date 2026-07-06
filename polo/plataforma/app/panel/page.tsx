import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const myIdeas = await db.idea.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { claims: true } } },
  });

  const roles = [
    "Persona",
    ...(user.memberships.length > 0 ? ["Empresa"] : []),
    ...(user.isAdmin ? ["Admin"] : []),
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Hola, {user.name}</h1>
        <div className="mt-2 flex gap-2">
          {roles.map((r) => (
            <span
              key={r}
              className="rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-600"
            >
              {r}
            </span>
          ))}
        </div>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Mis empresas</h2>
        {user.memberships.length === 0 ? (
          <p className="text-sm text-slate-500">
            No pertenecés a ninguna empresa todavía.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {user.memberships.map((m) => (
              <li
                key={m.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <Link
                  href={`/empresas/${m.empresa.slug}`}
                  className="font-medium text-brand-700 hover:underline"
                >
                  {m.empresa.name}
                </Link>
                <p className="text-xs text-slate-400">Rol: {m.role}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Mis ideas publicadas</h2>
          <Link
            href="/ideas/nueva"
            className="text-sm text-brand-600 hover:underline"
          >
            + Nueva idea
          </Link>
        </div>
        {myIdeas.length === 0 ? (
          <p className="text-sm text-slate-500">Aún no publicaste ideas.</p>
        ) : (
          <ul className="space-y-2">
            {myIdeas.map((i) => (
              <li
                key={i.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
              >
                <Link
                  href={`/ideas/${i.id}`}
                  className="font-medium text-brand-700 hover:underline"
                >
                  {i.title}
                </Link>
                <span className="text-xs text-slate-400">
                  {i.status} · {i._count.claims} interesada(s)
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

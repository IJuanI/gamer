import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  OPEN: "Abierta",
  CLAIMED: "Tomada",
  CLOSED: "Cerrada",
};
const statusColor: Record<string, string> = {
  OPEN: "bg-green-50 text-green-700",
  CLAIMED: "bg-amber-50 text-amber-700",
  CLOSED: "bg-slate-100 text-slate-500",
};

export default async function IdeasPage() {
  const [ideas, user] = await Promise.all([
    db.idea.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: true, _count: { select: { claims: true } } },
    }),
    getCurrentUser(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ideas publicadas</h1>
          <p className="text-sm text-slate-500">
            Necesidades de la comunidad para que las empresas las tomen.
          </p>
        </div>
        {user ? (
          <Link
            href="/ideas/nueva"
            className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600"
          >
            Publicar idea
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-lg border border-brand-500 px-4 py-2 text-brand-600 hover:bg-brand-50"
          >
            Ingresá para publicar
          </Link>
        )}
      </div>

      {ideas.length === 0 ? (
        <p className="text-slate-500">Todavía no hay ideas. ¡Sé el primero!</p>
      ) : (
        <ul className="space-y-3">
          {ideas.map((idea) => (
            <li key={idea.id}>
              <Link
                href={`/ideas/${idea.id}`}
                className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-brand-400"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-semibold text-brand-700">{idea.title}</h2>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${statusColor[idea.status]}`}
                  >
                    {statusLabel[idea.status]}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                  {idea.description}
                </p>
                <p className="mt-3 text-xs text-slate-400">
                  por {idea.author.name}
                  {idea.category && ` · ${idea.category}`} ·{" "}
                  {idea._count.claims} empresa(s) interesada(s)
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

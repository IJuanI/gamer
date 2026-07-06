import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { claimIdea } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function IdeaDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [idea, user] = await Promise.all([
    db.idea.findUnique({
      where: { id },
      include: {
        author: true,
        claims: { include: { empresa: true, actor: true } },
      },
    }),
    getCurrentUser(),
  ]);
  if (!idea) notFound();

  // Empresas the current user belongs to but that haven't claimed yet.
  const claimedEmpresaIds = new Set(idea.claims.map((c) => c.empresaId));
  const availableEmpresas =
    user?.memberships
      .map((m) => m.empresa)
      .filter((e) => !claimedEmpresaIds.has(e.id)) ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link href="/ideas" className="text-sm text-brand-600 hover:underline">
        ← Volver a ideas
      </Link>

      <article className="rounded-2xl border border-slate-200 bg-white p-8">
        <h1 className="text-2xl font-bold text-brand-700">{idea.title}</h1>
        <p className="mt-1 text-xs text-slate-400">
          por {idea.author.name}
          {idea.category && ` · ${idea.category}`}
          {idea.budget && ` · Presupuesto: ${idea.budget}`}
        </p>
        <p className="mt-4 whitespace-pre-wrap text-slate-700">
          {idea.description}
        </p>
      </article>

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Empresas interesadas ({idea.claims.length})
        </h2>
        {idea.claims.length === 0 ? (
          <p className="text-sm text-slate-500">
            Ninguna empresa la tomó todavía.
          </p>
        ) : (
          <ul className="space-y-2">
            {idea.claims.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <Link
                  href={`/empresas/${c.empresa.slug}`}
                  className="font-medium text-brand-700 hover:underline"
                >
                  {c.empresa.name}
                </Link>
                {c.message && (
                  <p className="mt-1 text-sm text-slate-600">{c.message}</p>
                )}
                <p className="mt-1 text-xs text-slate-400">
                  tomada por {c.actor.name}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Claim form — only for logged-in users acting on behalf of an empresa */}
      {user && availableEmpresas.length > 0 && (
        <section className="rounded-xl border border-brand-200 bg-brand-50 p-6">
          <h3 className="font-semibold text-brand-700">Tomar esta idea</h3>
          <p className="mb-3 text-sm text-slate-600">
            Elegí con qué empresa querés tomar esta idea.
          </p>
          <form action={claimIdea} className="space-y-3">
            <input type="hidden" name="ideaId" value={idea.id} />
            <select
              name="empresaId"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            >
              {availableEmpresas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
            <textarea
              name="message"
              rows={3}
              placeholder="Mensaje para el autor (opcional)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <button className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600">
              Tomar idea
            </button>
          </form>
        </section>
      )}

      {user && user.memberships.length === 0 && (
        <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-500">
          Para tomar ideas necesitás pertenecer a una empresa.
        </p>
      )}
    </div>
  );
}

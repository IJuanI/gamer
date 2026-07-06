import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EmpresaDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const empresa = await db.empresa.findUnique({
    where: { slug },
    include: {
      memberships: { include: { user: true } },
      claims: { include: { idea: true } },
    },
  });
  if (!empresa || !empresa.published) notFound();

  return (
    <div className="space-y-8">
      <Link href="/empresas" className="text-sm text-brand-600 hover:underline">
        ← Volver al directorio
      </Link>

      <header className="rounded-2xl border border-slate-200 bg-white p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-700">{empresa.name}</h1>
            {empresa.tagline && (
              <p className="mt-1 text-slate-600">{empresa.tagline}</p>
            )}
          </div>
          {empresa.sector && (
            <span className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-600">
              {empresa.sector}
            </span>
          )}
        </div>
        {empresa.description && (
          <p className="mt-4 text-slate-700">{empresa.description}</p>
        )}
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-slate-400">Ubicación</dt>
            <dd>{empresa.location}</dd>
          </div>
          {empresa.website && (
            <div>
              <dt className="text-slate-400">Web</dt>
              <dd>
                <a
                  href={empresa.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-600 hover:underline"
                >
                  {empresa.website.replace(/^https?:\/\//, "")}
                </a>
              </dd>
            </div>
          )}
          <div>
            <dt className="text-slate-400">Integrantes</dt>
            <dd>{empresa.memberships.length}</dd>
          </div>
        </dl>
      </header>

      {empresa.claims.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Ideas que tomó</h2>
          <ul className="space-y-2">
            {empresa.claims.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border border-slate-200 bg-white p-3 text-sm"
              >
                <Link
                  href={`/ideas/${c.ideaId}`}
                  className="font-medium text-brand-700 hover:underline"
                >
                  {c.idea.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

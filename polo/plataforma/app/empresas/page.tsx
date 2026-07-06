import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EmpresasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const empresas = await db.empresa.findMany({
    where: {
      published: true,
      ...(q
        ? { OR: [{ name: { contains: q } }, { sector: { contains: q } }] }
        : {}),
    },
    orderBy: { name: "asc" },
    include: { _count: { select: { memberships: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Empresas</h1>
        <p className="text-sm text-slate-500">
          Explorá el directorio. No necesitás cuenta para mirar.
        </p>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre o sector…"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <button className="rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600">
          Buscar
        </button>
      </form>

      {empresas.length === 0 ? (
        <p className="text-slate-500">No se encontraron empresas.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {empresas.map((e) => (
            <Link
              key={e.id}
              href={`/empresas/${e.slug}`}
              className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-brand-400 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-brand-700">{e.name}</h2>
                {e.sector && (
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-600">
                    {e.sector}
                  </span>
                )}
              </div>
              {e.tagline && <p className="mt-1 text-sm text-slate-600">{e.tagline}</p>}
              <p className="mt-3 text-xs text-slate-400">
                {e._count.memberships} integrante(s) · {e.location}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

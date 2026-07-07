import Link from "next/link";
import { db } from "@/lib/db";
import { getSimulatedEmpresas } from "@/lib/simulation-data";
import { SearchForm } from "@/components/SearchForm";

export const dynamic = "force-dynamic";

const normalizeString = (str: string) => {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
};

export default async function EmpresasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  // Fetch all published empresas (filtering by search query is done client-side for accent-insensitive matching)
  const [empresas, simulated] = await Promise.all([
    db.empresa.findMany({
      where: { published: true },
      orderBy: { name: "asc" },
      include: { _count: { select: { memberships: true } } },
    }),
    getSimulatedEmpresas(),
  ]);

  // Filter empresas by normalized search query (accent-insensitive)
  const empresasFiltered = q
    ? empresas.filter(
        (e) =>
          normalizeString(e.name).includes(normalizeString(q)) ||
          (e.sector && normalizeString(e.sector).includes(normalizeString(q)))
      )
    : empresas;

  const filtered = simulated.filter(
    (e) =>
      !q ||
      normalizeString(e.name).includes(normalizeString(q)) ||
      normalizeString(e.sector).includes(normalizeString(q))
  );

  const allEmpresas = [...empresasFiltered.map((e) => ({ ...e, isSimulated: false as const })), ...filtered];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Empresas</h1>
        <p className="text-sm text-slate-500">
          Explorá el directorio. No necesitás cuenta para mirar.
        </p>
      </div>

      <SearchForm initialValue={q} />

      {allEmpresas.length === 0 ? (
        <p className="text-slate-500">No se encontraron empresas.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {allEmpresas.map((e) => (
            <Link
              key={e.id}
              href={`/empresas/${e.slug}`}
              className={`rounded-xl border p-5 transition ${
                e.isSimulated
                  ? "border-brand-200 bg-brand-50/30"
                  : "border-slate-200 bg-white hover:border-brand-400 hover:shadow-sm"
              }`}
            >
              {e.isSimulated && (
                <div className="mb-2 inline-block rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                  Demo
                </div>
              )}
              <div className="flex items-center justify-between">
                <h2 className={`font-semibold ${e.isSimulated ? "text-brand-600" : "text-brand-700"}`}>
                  {e.name}
                </h2>
                {e.sector && (
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-600">
                    {e.sector}
                  </span>
                )}
              </div>
              {e.tagline && <p className="mt-1 text-sm text-slate-600">{e.tagline}</p>}
              <p className="mt-3 text-xs text-slate-400">
                {e.isSimulated ? (
                  "Empresa de ejemplo"
                ) : (
                  <>
                    {e._count?.memberships || 0} integrante(s) · {e.location}
                  </>
                )}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { db } from "@/lib/db";

export default async function Home() {
  const [empresas, ideas] = await Promise.all([
    db.empresa.count({ where: { published: true } }),
    db.idea.count({ where: { status: "OPEN" } }),
  ]);

  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-brand-900 px-8 py-16 text-white">
        <h1 className="max-w-2xl text-4xl font-bold leading-tight">
          Descubrí el ecosistema tecnológico de Paraná
        </h1>
        <p className="mt-4 max-w-xl text-brand-100">
          Explorá empresas de la región sin necesidad de registrarte. ¿Tenés una
          idea o necesidad? Creá tu cuenta y publicala para que las empresas la
          tomen.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/empresas"
            className="rounded-lg bg-white px-5 py-2.5 font-medium text-brand-700 hover:bg-brand-50"
          >
            Ver empresas
          </Link>
          <Link
            href="/ideas"
            className="rounded-lg border border-white/30 px-5 py-2.5 font-medium hover:bg-white/10"
          >
            Ver ideas publicadas
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat n={empresas} label="Empresas publicadas" />
        <Stat n={ideas} label="Ideas abiertas" />
        <Stat n="100%" label="Acceso gratuito" />
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Feature
          title="Descubrí empresas"
          body="Explorá el ecosistema tech de Paraná sin registrarte. Conocé quiénes somos y qué hacemos."
        />
        <Feature
          title="Publicá ideas"
          body="Registrate para publicar ideas o necesidades. Las empresas interesadas te contactarán."
        />
        <Feature
          title="Conectá"
          body="Crea lazos entre personas y empresas. Encontrá colaboradores y transformá ideas en realidad."
        />
      </section>
    </div>
  );
}

function Stat({ n, label }: { n: number | string; label: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="text-3xl font-bold text-brand-600">{n}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="font-semibold text-brand-700">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{body}</p>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { toggleSimulationMode } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) redirect("/");

  const settings = await db.settings.findUnique({ where: { id: "singleton" } });
  const simulationMode = settings?.simulationMode ?? false;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <h1 className="text-3xl font-bold text-brand-700">Panel de Administración</h1>

      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Modo Simulación</h2>
        <p className="mb-4 text-sm text-slate-600">
          {simulationMode
            ? "✓ Habilitado — La plataforma muestra datos de simulación junto con datos reales."
            : "✗ Deshabilitado — Solo se muestran datos reales."}
        </p>
        <form action={toggleSimulationMode} method="POST">
          <button
            type="submit"
            className={`rounded-lg px-4 py-2 text-white ${
              simulationMode
                ? "bg-slate-500 hover:bg-slate-600"
                : "bg-brand-500 hover:bg-brand-600"
            }`}
          >
            {simulationMode ? "Desactivar" : "Activar"} simulación
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-slate-50 p-6">
        <h3 className="mb-2 text-sm font-medium text-slate-600">Admin: {user.name}</h3>
        <p className="text-xs text-slate-500">{user.email}</p>
      </section>
    </div>
  );
}

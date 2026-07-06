import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isAdmin) redirect("/panel");

  const [users, empresas, ideas] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { memberships: true, ideas: true } } },
    }),
    db.empresa.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { memberships: true } } },
    }),
    db.idea.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: true, _count: { select: { claims: true } } },
    }),
  ]);

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">Panel de administración</h1>

      <AdminTable title={`Usuarios (${users.length})`}>
        <thead>
          <tr className="text-left text-slate-400">
            <th className="py-2">Nombre</th>
            <th>Email</th>
            <th>Empresas</th>
            <th>Ideas</th>
            <th>Admin</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-slate-100">
              <td className="py-2">{u.name}</td>
              <td className="text-slate-500">{u.email}</td>
              <td>{u._count.memberships}</td>
              <td>{u._count.ideas}</td>
              <td>{u.isAdmin ? "Sí" : "—"}</td>
            </tr>
          ))}
        </tbody>
      </AdminTable>

      <AdminTable title={`Empresas (${empresas.length})`}>
        <thead>
          <tr className="text-left text-slate-400">
            <th className="py-2">Nombre</th>
            <th>Sector</th>
            <th>Integrantes</th>
            <th>Publicada</th>
          </tr>
        </thead>
        <tbody>
          {empresas.map((e) => (
            <tr key={e.id} className="border-t border-slate-100">
              <td className="py-2">{e.name}</td>
              <td className="text-slate-500">{e.sector ?? "—"}</td>
              <td>{e._count.memberships}</td>
              <td>{e.published ? "Sí" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </AdminTable>

      <AdminTable title={`Ideas (${ideas.length})`}>
        <thead>
          <tr className="text-left text-slate-400">
            <th className="py-2">Título</th>
            <th>Autor</th>
            <th>Estado</th>
            <th>Interesadas</th>
          </tr>
        </thead>
        <tbody>
          {ideas.map((i) => (
            <tr key={i.id} className="border-t border-slate-100">
              <td className="py-2">{i.title}</td>
              <td className="text-slate-500">{i.author.name}</td>
              <td>{i.status}</td>
              <td>{i._count.claims}</td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </div>
  );
}

function AdminTable({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">{children}</table>
      </div>
    </section>
  );
}

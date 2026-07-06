import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import IdeaForm from "@/components/IdeaForm";

export default async function NuevaIdeaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Publicar una idea</h1>
        <p className="text-sm text-slate-500">
          Contanos qué necesitás. Las empresas del Polo podrán tomarla.
        </p>
      </div>
      <IdeaForm />
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { createIdea } from "@/lib/actions";

export default function IdeaForm() {
  const [state, formAction, pending] = useActionState(createIdea, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Título</span>
        <input
          name="title"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Descripción</span>
        <textarea
          name="description"
          required
          rows={5}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
        />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Categoría</span>
          <input
            name="category"
            placeholder="Ej: App móvil, IoT…"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            Presupuesto (opcional)
          </span>
          <input
            name="budget"
            placeholder="Ej: A convenir"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </label>
      </div>

      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        disabled={pending}
        className="rounded-lg bg-brand-500 px-5 py-2.5 font-medium text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {pending ? "Publicando…" : "Publicar idea"}
      </button>
    </form>
  );
}

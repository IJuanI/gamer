"use client";

import { useActionState } from "react";
import Link from "next/link";

type Action = (
  state: { error?: string } | undefined,
  formData: FormData
) => Promise<{ error?: string } | undefined>;

export default function AuthForm({
  mode,
  action,
}: {
  mode: "login" | "register";
  action: Action;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const isRegister = mode === "register";

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">
        {isRegister ? "Crear cuenta" : "Ingresar"}
      </h1>
      <form action={formAction} className="mt-6 space-y-4">
        {isRegister && (
          <Field name="name" label="Nombre" type="text" />
        )}
        <Field name="email" label="Email" type="email" />
        <Field name="password" label="Contraseña" type="password" />

        {state?.error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <button
          disabled={pending}
          className="w-full rounded-lg bg-brand-500 px-4 py-2.5 font-medium text-white hover:bg-brand-600 disabled:opacity-60"
        >
          {pending ? "Procesando…" : isRegister ? "Crear cuenta" : "Ingresar"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        {isRegister ? (
          <>
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-brand-600 hover:underline">
              Ingresá
            </Link>
          </>
        ) : (
          <>
            ¿No tenés cuenta?{" "}
            <Link href="/register" className="text-brand-600 hover:underline">
              Registrate
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function Field({
  name,
  label,
  type,
}: {
  name: string;
  label: string;
  type: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        required
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
      />
    </label>
  );
}

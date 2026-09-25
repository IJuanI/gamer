"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell, Field } from "@/components/auth-shell";
import { OAuthButtons } from "@/components/oauth-buttons";
import { useAuth } from "@/components/auth-provider";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const { user } = await api.login({
        email: String(form.get("email")),
        password: String(form.get("password")),
      });
      setUser(user);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al ingresar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Ingresar" subtitle="Bienvenido de nuevo a la comunidad.">
      <form onSubmit={onSubmit} className="grid gap-4">
        <Field label="Email" name="email" type="email" required autoComplete="email" />
        <Field label="Contraseña" name="password" type="password" required autoComplete="current-password" />

        {error && <p className="text-sm text-[var(--gamer-purple-text)]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-md bg-[var(--gamer-purple)] py-2.5 font-semibold text-white box-glow-purple transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-[var(--muted)]">
        <span className="h-px flex-1 bg-white/10" /> o <span className="h-px flex-1 bg-white/10" />
      </div>
      <OAuthButtons />

      <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        ¿No tenés cuenta?{" "}
        <Link href="/registro" className="text-[var(--gamer-green-text)] hover:underline">
          Unite acá
        </Link>
      </p>
    </AuthShell>
  );
}

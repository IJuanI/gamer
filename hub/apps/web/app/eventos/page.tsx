"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EventosPage() {
  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-grid-neon-fade" />
      
      <header className="relative border-b border-white/5">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5 cursor-pointer" />
          </Link>
          <h1 className="font-azonix text-2xl text-white">Eventos</h1>
        </div>
      </header>

      <div className="relative mx-auto max-w-5xl px-6 py-12">
        <section className="text-center">
          <p className="text-[var(--text-secondary)] mb-4">
            Aquí podrás inscribite a torneos y eventos de la comunidad.
          </p>
          <p className="text-sm text-[var(--muted)]">
            Esta sección estará disponible pronto.
          </p>
        </section>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { Gamepad2, Trophy, Users, CalendarDays, Zap, ShieldCheck } from "lucide-react";
import { SiteNav } from "@/components/site-nav";

const features = [
  {
    icon: Trophy,
    title: "Torneos",
    body: "Competencias presenciales, online e híbridas. Inscribite, jugá y subí en el ranking de la comunidad.",
    accent: "purple" as const,
  },
  {
    icon: CalendarDays,
    title: "Eventos",
    body: "Cyber cafés, LAN partys y encuentros en toda la provincia de Entre Ríos. Siempre hay algo pasando.",
    accent: "green" as const,
  },
  {
    icon: Users,
    title: "Comunidad",
    body: "Conectá con gamers de la región. Equipos, scrims y gente con la misma pasión que vos.",
    accent: "purple" as const,
  },
  {
    icon: Zap,
    title: "Tu perfil gamer",
    body: "Un panel propio con tu rol en la comunidad, tus eventos y tu actividad en un solo lugar.",
    accent: "green" as const,
  },
];

const stats = [
  { value: "+50", label: "Eventos al año" },
  { value: "+12", label: "Ciudades" },
  { value: "100%", label: "Entrerriano" },
];

export default function LandingPage() {
  return (
    <>
      <SiteNav section="gamer" />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid-neon-fade" />
        <div className="pointer-events-none absolute inset-0 radial-glow-purple" />
        <div className="pointer-events-none absolute inset-0 radial-glow-green" />
        <div className="pointer-events-none absolute inset-0 pixel-scatter" />

        <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-28 text-center">
          <span className="animate-fade-up inline-block rounded-full neon-border-green px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-[var(--gamer-green-text)]">
            Entre Ríos · Argentina
          </span>

          <h1 className="animate-fade-up delay-100 mt-8 font-azonix text-5xl leading-tight sm:text-7xl">
            <span className="wordmark-gam glow-purple">GAM</span>
            <span className="wordmark-er glow-green">ER</span>
            <span className="block mt-3 text-2xl text-[var(--text-secondary)] sm:text-3xl">
              El hub de los gamers entrerrianos
            </span>
          </h1>

          <p className="animate-fade-up delay-200 mx-auto mt-7 max-w-2xl text-lg text-[var(--text-secondary)]">
            Torneos, eventos y una comunidad que crece. Sumate a{" "}
            <span className="text-[var(--gamer-purple-text)] font-semibold">Entre Ríos Gamers</span>{" "}
            y viví el gaming de la región como nunca antes.
          </p>

          <div className="animate-fade-up delay-300 mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/registro"
              className="group flex items-center gap-2 rounded-lg bg-[var(--gamer-purple)] px-7 py-3.5 font-semibold text-white box-glow-purple transition-transform hover:scale-105"
            >
              <Gamepad2 className="h-5 w-5" />
              Unirme a la comunidad
            </Link>
            <Link
              href="/#features"
              className="rounded-lg neon-border-purple px-7 py-3.5 font-semibold transition-transform hover:scale-105"
              style={{ color: "var(--foreground)" }}
            >
              Conocer más
            </Link>
          </div>

          {/* Stats */}
          <div className="animate-fade-up delay-500 mx-auto mt-20 grid max-w-2xl grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="relative panel-clip gradient-block-purple px-4 py-6">
                <div className="font-azonix text-3xl text-[var(--gamer-purple-text)] glow-purple">
                  {s.value}
                </div>
                <div className="mt-2 text-xs uppercase tracking-wider text-[var(--muted)]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <h2 className="font-azonix text-3xl sm:text-4xl">
            Qué vas a encontrar <span className="wordmark-er glow-green">acá</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[var(--text-secondary)]">
            Todo lo que la escena gamer de Entre Ríos necesita, en un solo lugar.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {features.map((f, i) => {
            const Icon = f.icon;
            const isGreen = f.accent === "green";
            return (
              <div
                key={f.title}
                className={`animate-fade-up delay-${(i + 1) * 100} group relative panel-clip border border-white/5 bg-[var(--background-elevated)] p-7 transition-colors hover:border-white/10`}
              >
                <div className="hud-bracket-tl" />
                <div className="hud-bracket-br" />
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                    isGreen ? "neon-border-green" : "neon-border-purple"
                  }`}
                >
                  <Icon
                    className="h-6 w-6"
                    style={{ color: isGreen ? "var(--gamer-green)" : "var(--gamer-purple-text)" }}
                  />
                </div>
                <h3 className="mt-5 font-azonix text-lg">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{f.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Community CTA ── */}
      <section id="comunidad" className="relative overflow-hidden border-t border-white/5">
        <div className="pointer-events-none absolute inset-0 radial-glow-purple" />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-[var(--gamer-green)] animate-float" />
          <h2 className="mt-6 font-azonix text-3xl sm:text-4xl">
            Sumate a la comunidad
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[var(--text-secondary)]">
            Creá tu cuenta gratis y formá parte de la red gamer más grande de Entre Ríos.
            Tu lugar en la escena empieza acá.
          </p>
          <div className="mt-9 h-px w-full neon-line-h" />
          <Link
            href="/registro"
            className="mt-9 inline-flex items-center gap-2 rounded-lg bg-[var(--gamer-purple)] px-8 py-4 font-semibold text-white box-glow-purple transition-transform hover:scale-105"
          >
            <Gamepad2 className="h-5 w-5" />
            Crear mi cuenta
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-[var(--muted)]">
        <span className="font-azonix">
          <span className="wordmark-gam">GAM</span>
          <span className="wordmark-er">ER</span>
        </span>{" "}
        · Entre Ríos Gamers — gamer.net.ar
      </footer>
    </>
  );
}

"use client";

import Link from "next/link";
import { Code2, Rocket, Users, Gamepad2, Zap, Star } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { GAMEDEVS_COLORS } from "@/lib/gamedevs-tokens";

/**
 * /devs route - GameDevs Developer Community Landing Page
 * Design Reference: E:/Descargas/GameDevs Branding.ai
 *
 * Color validation: All colors extracted from GameDevs branding file
 * - Primary: #72b341 (GameDevs Green)
 * - Palette verified against GAMEDEVS_COLORS constant
 */

const features = [
  {
    icon: Code2,
    title: "Desarrollo Colaborativo",
    body: "Acceso a herramientas, APIs y recursos para desarrolladores. Construí junto a la comunidad tech de Entre Ríos.",
    accent: "primary" as const,
  },
  {
    icon: Rocket,
    title: "Lanza tu Proyecto",
    body: "Showcaseá tu juego o herramienta dev. Conéctate con publishers, mentores y otros creadores.",
    accent: "primary" as const,
  },
  {
    icon: Users,
    title: "Red de Talento",
    body: "Programadores, artistas, diseñadores, productores. Formá equipos y llevá tus ideas adelante.",
    accent: "primary" as const,
  },
  {
    icon: Zap,
    title: "Workshops & Recursos",
    body: "Charlas de expertos, tutoriales, documentación y mentorías. Aprendé con la comunidad.",
    accent: "primary" as const,
  },
];

const stats = [
  { value: "+200", label: "Desarrolladores" },
  { value: "+30", label: "Proyectos Activos" },
  { value: "3", label: "Provincias" },
];

export default function GameDevsLanding() {
  return (
    <>
      <SiteNav section="gamedevs" />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#72b341]/5" />
        <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-28 text-center">
          <span className="animate-fade-up inline-block rounded-full border border-[#72b341]/30 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-[#72b341]">
            GameDevs · Developer Community
          </span>

          <h1 className="animate-fade-up delay-100 mt-8 font-azonix text-5xl leading-tight sm:text-7xl">
            <span style={{ color: GAMEDEVS_COLORS.primary }}>GameDevs</span>
            <span className="block mt-3 text-2xl sm:text-3xl font-normal" style={{ color: "var(--foreground)" }}>
              La comunidad dev de Entre Ríos
            </span>
          </h1>

          <p className="animate-fade-up delay-200 mx-auto mt-7 max-w-2xl text-lg" style={{ color: "var(--text-secondary)" }}>
            Conectá con desarrolladores, diseñadores y creativos. Compartí código, ideas y proyectos.
            Crecé como dev en la comunidad más activa de la región.
          </p>

          <div className="animate-fade-up delay-300 mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="group flex items-center gap-2 rounded-lg px-7 py-3.5 font-semibold transition-transform hover:scale-105"
              style={{
                backgroundColor: GAMEDEVS_COLORS.primary,
                color: "#fff",
                boxShadow: `0 0 20px ${GAMEDEVS_COLORS.primary}40`,
                // Force white text on colored background for readability
              }}
            >
              <Code2 className="h-5 w-5" />
              Unirme a GameDevs
            </Link>
            <Link
              href="/#features"
              className="rounded-lg px-7 py-3.5 font-semibold transition-transform hover:scale-105"
              style={{
                color: "var(--foreground)",
                border: `2px solid ${GAMEDEVS_COLORS.primary}`,
                backgroundColor: `${GAMEDEVS_COLORS.primary}10`,
              }}
            >
              Conocer más
            </Link>
          </div>

          {/* Stats */}
          <div className="animate-fade-up delay-500 mx-auto mt-20 grid max-w-2xl grid-cols-3 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="relative rounded-lg px-4 py-6 backdrop-blur-sm border"
                style={{
                  backgroundColor: `${GAMEDEVS_COLORS.primary}10`,
                  borderColor: `${GAMEDEVS_COLORS.primary}30`,
                }}
              >
                <div
                  className="font-azonix text-3xl glow"
                  style={{ color: GAMEDEVS_COLORS.primary }}
                >
                  {s.value}
                </div>
                <div className="mt-2 text-xs uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
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
            Qué encontrás en{" "}
            <span style={{ color: GAMEDEVS_COLORS.primary }}>GameDevs</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl" style={{ color: "var(--text-secondary)" }}>
            Todo lo que necesitás para desarrollar, aprender y conectar con otros creadores.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`animate-fade-up delay-${(i + 1) * 100} group relative rounded-lg border p-7 transition-all hover:shadow-lg`}
                style={{
                  borderColor: `${GAMEDEVS_COLORS.primary}30`,
                  backgroundColor: `${GAMEDEVS_COLORS.primary}05`,
                }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg border"
                  style={{
                    borderColor: GAMEDEVS_COLORS.primary,
                    backgroundColor: `${GAMEDEVS_COLORS.primary}15`,
                  }}
                >
                  <Icon
                    className="h-6 w-6"
                    style={{ color: GAMEDEVS_COLORS.primary }}
                  />
                </div>
                <h3 className="mt-5 font-azonix text-lg" style={{ color: "var(--foreground)" }}>
                  {f.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {f.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Community CTA ── */}
      <section id="comunidad" className="relative overflow-hidden border-t">
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{ backgroundColor: GAMEDEVS_COLORS.primary }}
        />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <Star className="mx-auto h-10 w-10 animate-float" style={{ color: GAMEDEVS_COLORS.primary }} />
          <h2 className="mt-6 font-azonix text-3xl sm:text-4xl" style={{ color: "var(--foreground)" }}>
            Sumate a la comunidad dev
          </h2>
          <p className="mx-auto mt-4 max-w-xl" style={{ color: "var(--text-secondary)" }}>
            Creá tu cuenta gratis y formá parte de la red de desarrolladores más grande de Entre Ríos.
            Compartí proyectos, colaborá con otros y crecé como dev.
          </p>
          <div
            className="mt-9 h-px w-full"
            style={{
              background: `linear-gradient(to right, transparent, ${GAMEDEVS_COLORS.primary}, transparent)`,
            }}
          />
          <Link
            href="/register"
            className="mt-9 inline-flex items-center gap-2 rounded-lg px-8 py-4 font-semibold text-white transition-transform hover:scale-105"
            style={{
              backgroundColor: GAMEDEVS_COLORS.primary,
              boxShadow: `0 0 20px ${GAMEDEVS_COLORS.primary}40`,
            }}
          >
            <Gamepad2 className="h-5 w-5" />
            Crear mi cuenta
          </Link>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
        <span className="font-azonix" style={{ color: GAMEDEVS_COLORS.primary }}>GameDevs</span>
        {" · Developer Community — Entre Ríos, Argentina"}
      </footer>
    </>
  );
}

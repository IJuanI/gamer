"use client";

import Link from "next/link";
import { Gamepad2, Trophy, Users, CalendarDays, Zap, Gamepad } from "lucide-react";
import { SiteNav } from "@/components/site-nav";

const features = [
  {
    icon: Trophy,
    title: "Competencia",
    body: "Compite con equipos de todo el mundo. Deja tu marca en la escena de desarrollo de videojuegos.",
    accent: "green" as const,
  },
  {
    icon: Users,
    title: "Comunidad",
    body: "Conectá con desarrolladores, artistas y diseñadores apasionados por los videojuegos.",
    accent: "purple" as const,
  },
  {
    icon: Zap,
    title: "Creatividad",
    body: "Expresa tu creatividad con el tema único que se revela el primer día del evento.",
    accent: "green" as const,
  },
  {
    icon: CalendarDays,
    title: "Experiencia",
    body: "Participa sin importar tu nivel de experiencia. Hay un lugar para todos.",
    accent: "purple" as const,
  },
];

const stats = [
  { value: "48", label: "Horas" },
  { value: "+100", label: "Creadores" },
  { value: "1", label: "Tema" },
];

export default function JamPage() {
  return (
    <>
      <SiteNav />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#0b1020", minHeight: "100vh" }}>
        {/* HUD Grid background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(60, 255, 158, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(60, 255, 158, 0.03) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Hexagon pattern */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%238b6cff' fill-opacity='0.03'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Radial glow background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 60% 45% at 50% 30%, rgba(60, 255, 158, 0.12) 0%, rgba(139, 108, 255, 0.08) 100%)",
          }}
        />

        {/* Floating decorative elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Top-left square */}
          <div
            className="absolute top-20 left-10 w-32 h-32 border-2 opacity-20"
            style={{
              borderColor: "#8b6cff",
              transform: "rotate(45deg)",
            }}
          />
          {/* Bottom-right square */}
          <div
            className="absolute bottom-20 right-10 w-48 h-48 border-2 opacity-20"
            style={{
              borderColor: "#3cff9e",
              transform: "rotate(12deg)",
            }}
          />
          {/* Floating particles */}
          <div
            className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full animate-pulse"
            style={{
              backgroundColor: "#3cff9e",
              boxShadow: "0 0 20px rgba(60, 255, 158, 0.8)",
            }}
          />
          <div
            className="absolute bottom-1/3 left-1/4 w-3 h-3 rounded-full animate-pulse"
            style={{
              backgroundColor: "#8b6cff",
              boxShadow: "0 0 20px rgba(139, 108, 255, 0.8)",
            }}
          />
        </div>

        {/* Scan line animation */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(90deg, transparent, rgba(60, 255, 158, 0.5), transparent)",
            backgroundSize: "100% 2px",
            backgroundRepeat: "repeat-y",
            backgroundPosition: "0 -2px",
            animation: "scanline 8s linear infinite",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-28 text-center">
          <span
            className="animate-fade-up inline-block rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-widest border"
            style={{
              borderColor: "rgba(60, 255, 158, 0.4)",
              backgroundColor: "rgba(60, 255, 158, 0.05)",
              color: "#3cff9e",
              textShadow: "0 0 10px rgba(60, 255, 158, 0.5)",
            }}
          >
            Global Game Jam · Paraná
          </span>

          <h1 className="animate-fade-up delay-100 mt-8 text-5xl leading-tight font-extrabold sm:text-7xl">
            <span
              style={{
                color: "#3cff9e",
                textShadow: "0 0 30px rgba(60, 255, 158, 0.8), 0 0 60px rgba(60, 255, 158, 0.4)",
                display: "block",
              }}
            >
              Paraná
            </span>
            <span
              style={{
                color: "#8b6cff",
                textShadow: "0 0 30px rgba(139, 108, 255, 0.8), 0 0 60px rgba(139, 108, 255, 0.4)",
                display: "block",
              }}
            >
              Game Jam
            </span>
          </h1>

          <p className="animate-fade-up delay-200 mx-auto mt-7 max-w-2xl text-lg" style={{ color: "#b6c2ff" }}>
            Únete a 48 horas de puro desarrollo de videojuegos. Crea, colabora e innova con creativos de todo el mundo.
            Sin importar tu experiencia, hay un lugar para vos.
          </p>

          <div className="animate-fade-up delay-300 mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/registro"
              className="group flex items-center gap-2 rounded-lg px-7 py-3.5 font-semibold text-white transition-transform hover:scale-105"
              style={{
                backgroundColor: "#3cff9e",
                color: "#0b1020",
                boxShadow: "0 0 30px rgba(60, 255, 158, 0.6)",
              }}
            >
              <Gamepad2 className="h-5 w-5" />
              Registrarse
            </Link>
            <Link
              href="#features"
              className="rounded-lg px-7 py-3.5 font-semibold transition-transform hover:scale-105 border-2"
              style={{
                borderColor: "#8b6cff",
                backgroundColor: "rgba(139, 108, 255, 0.1)",
                color: "#8b6cff",
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
                className="relative rounded-lg px-4 py-6 border"
                style={{
                  backgroundColor: "rgba(60, 255, 158, 0.05)",
                  borderColor: "rgba(60, 255, 158, 0.2)",
                }}
              >
                <div
                  className="font-extrabold text-3xl"
                  style={{
                    color: "#3cff9e",
                    textShadow: "0 0 15px rgba(60, 255, 158, 0.6)",
                  }}
                >
                  {s.value}
                </div>
                <div className="mt-2 text-xs uppercase tracking-wider" style={{ color: "#b6c2ff" }}>
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
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            <span style={{ color: "#3cff9e", textShadow: "0 0 15px rgba(60, 255, 158, 0.5)" }}>
              Qué encontrás
            </span>{" "}
            <span
              style={{
                color: "#8b6cff",
                textShadow: "0 0 15px rgba(139, 108, 255, 0.5)",
              }}
            >
              en el Jam
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl" style={{ color: "#b6c2ff" }}>
            Todo lo que necesitás para desarrollar, aprender y conectar con otros creadores.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {features.map((f, i) => {
            const Icon = f.icon;
            const isGreen = f.accent === "green";
            return (
              <div
                key={f.title}
                className={`animate-fade-up delay-${(i + 1) * 100} group relative rounded-lg border p-7 transition-colors hover:shadow-lg`}
                style={{
                  backgroundColor: "rgba(18, 24, 45, 0.6)",
                  borderColor: isGreen ? "rgba(60, 255, 158, 0.3)" : "rgba(139, 108, 255, 0.3)",
                }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg border"
                  style={{
                    borderColor: isGreen ? "rgba(60, 255, 158, 0.4)" : "rgba(139, 108, 255, 0.4)",
                    backgroundColor: isGreen ? "rgba(60, 255, 158, 0.1)" : "rgba(139, 108, 255, 0.1)",
                  }}
                >
                  <Icon
                    className="h-6 w-6"
                    style={{ color: isGreen ? "#3cff9e" : "#8b6cff" }}
                  />
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "#b6c2ff" }}>
                  {f.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Community CTA ── */}
      <section id="comunidad" className="relative overflow-hidden border-t jam-section" style={{ borderColor: "rgba(60, 255, 158, 0.1)" }}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 50% 40% at 50% 30%, rgba(60, 255, 158, 0.1) 0%, transparent 100%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <Gamepad
            className="mx-auto h-10 w-10 animate-float"
            style={{
              color: "#3cff9e",
              filter: "drop-shadow(0 0 10px rgba(60, 255, 158, 0.6))",
            }}
          />
          <h2 className="mt-6 text-3xl sm:text-4xl font-extrabold">Sumate a la comunidad</h2>
          <p className="mx-auto mt-4 max-w-xl" style={{ color: "#b6c2ff" }}>
            Creá tu cuenta gratis y formá parte de la red de creativos más grande de Entre Ríos.
            Tu lugar en la escena empieza acá.
          </p>
          <div
            className="mt-9 h-px w-full"
            style={{
              background: "linear-gradient(90deg, transparent, #3cff9e, transparent)",
            }}
          />
          <Link
            href="/register"
            className="mt-9 inline-flex items-center gap-2 rounded-lg px-8 py-4 font-semibold text-white transition-transform hover:scale-105"
            style={{
              backgroundColor: "#3cff9e",
              color: "#0b1020",
              boxShadow: "0 0 30px rgba(60, 255, 158, 0.6)",
            }}
          >
            <Gamepad2 className="h-5 w-5" />
            Crear mi cuenta
          </Link>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm" style={{ borderColor: "rgba(60, 255, 158, 0.1)", color: "#b6c2ff" }}>
        <span className="font-extrabold" style={{ color: "#3cff9e" }}>
          Paraná Game Jam
        </span>{" "}
        · Global Game Jam 2026 · Entre Ríos, Argentina
      </footer>
    </>
  );
}

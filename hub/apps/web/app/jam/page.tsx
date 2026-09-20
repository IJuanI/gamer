"use client";

import Link from "next/link";
import { Gamepad2, Trophy, Users, CalendarDays, Zap, Gamepad } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { useState, useEffect } from "react";

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

function CountdownTimer() {
  const [time, setTime] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00" });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const target = new Date("2026-01-30T16:00:00").getTime();
      const diff = Math.max(0, target - now.getTime());

      const days = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, "0");
      const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, "0");
      const minutes = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, "0");
      const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");

      setTime({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="inline-block rounded-lg p-6 border font-mono text-lg font-bold tracking-wider"
      style={{
        borderColor: "#3cff9e",
        backgroundColor: "rgba(60, 255, 158, 0.05)",
        color: "#3cff9e",
        textShadow: "0 0 10px rgba(60, 255, 158, 0.6)",
      }}
    >
      {time.days}:{time.hours}:{time.minutes}:{time.seconds}
    </div>
  );
}

export default function JamPage() {
  return (
    <>
      <SiteNav />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden jam-hero">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 45% at 50% 30%, rgba(60, 255, 158, 0.12) 0%, rgba(139, 108, 255, 0.08) 100%)",
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
            <span
              className="block mt-3 text-2xl sm:text-3xl font-medium"
              style={{
                color: "#b6c2ff",
              }}
            >
              30 de Enero — 1 de Febrero
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

          {/* Countdown */}
          <div className="animate-fade-up delay-700 mt-10">
            <CountdownTimer />
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

"use client";

import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { Gamepad2, Trophy, Users, Zap } from "lucide-react";

const timeline = [
  { day: "Día 1", title: "Inicio", time: "16:00 hs", description: "Presentación y asignación de temas" },
  { day: "Día 1", title: "Desarrollo", time: "18:00 hs", description: "Comienza el desarrollo de 48 horas" },
  { day: "Día 3", title: "Cierre", time: "16:00 hs", description: "Entrega de proyectos" },
  { day: "Día 3", title: "Premiación", time: "17:30 hs", description: "Presentación y votación de juegos" },
];

export default function JamPage() {
  return (
    <>
      <SiteNav />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden jam-hero">
        <div className="absolute inset-0 pointer-events-none jam-background">
          <div className="absolute top-20 left-10 w-32 h-32 border border-jam-secondary/20 rotate-45 opacity-30" />
          <div className="absolute bottom-20 right-10 w-48 h-48 border border-jam-primary/20 rotate-12 opacity-30" />
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-jam-primary rounded-full animate-pulse" />
          <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-jam-secondary rounded-full animate-pulse" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-jam-card/50 backdrop-blur-sm border border-jam-secondary/30 rounded-full px-4 py-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-jam-primary animate-pulse" />
            <span className="text-sm text-jam-muted font-medium">Global Game Jam 2026 - Paraná</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-4 tracking-tight">
            <span className="text-jam-primary" style={{ textShadow: "0 0 20px rgba(60, 255, 158, 0.4)" }}>
              Paraná
            </span>{" "}
            <span className="text-jam-secondary" style={{ textShadow: "0 0 20px rgba(139, 108, 255, 0.4)" }}>
              Game
            </span>{" "}
            <span className="text-white">Jam</span>
          </h1>

          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px flex-1 max-w-20 bg-gradient-to-r from-transparent to-jam-secondary/50" />
            <p className="text-xl md:text-2xl font-bold text-white">
              <span className="text-jam-primary">30 DE ENERO</span>
              <span className="text-jam-muted"> AL </span>
              <span className="text-jam-secondary">1 DE FEBRERO</span>
            </p>
            <div className="h-px flex-1 max-w-20 bg-gradient-to-l from-transparent to-jam-secondary/50" />
          </div>

          <p className="text-jam-muted text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Únete a 48 horas de puro desarrollo de videojuegos. Crea, colabora e innova con creativos de todo el mundo.
            Sin importar tu experiencia, hay un lugar para vos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 rounded-lg px-8 py-4 font-semibold text-white transition-transform hover:scale-105"
              style={{
                backgroundColor: "#3cff9e",
                boxShadow: "0 0 20px rgba(60, 255, 158, 0.4)",
              }}
            >
              <Gamepad2 className="h-5 w-5" style={{ color: "#0b1020" }} />
              Registrarse Ahora
            </Link>
            <a
              href="https://discord.gg/Kh6JDj44cE"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-8 py-4 font-semibold transition-transform hover:scale-105"
              style={{
                borderColor: "#8b6cff",
                borderWidth: "2px",
                backgroundColor: "rgba(139, 108, 255, 0.1)",
                color: "#8b6cff",
              }}
            >
              Unirse al Discord
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-24 px-6 jam-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-jam-primary">¿Qué es</span>{" "}
              <span className="text-white">Global Game Jam?</span>
            </h2>
            <p className="text-jam-muted text-lg max-w-2xl mx-auto">
              La competencia de desarrollo de videojuegos más grande del mundo. En 48 horas, equipos de creativos se
              reúnen en una ubicación física para crear juegos basados en un tema común.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Trophy,
                title: "Competencia",
                description: "Compite con equipos de todo el mundo y deja tu marca en la escena gamer.",
              },
              {
                icon: Users,
                title: "Comunidad",
                description: "Conecta con desarrolladores, artistas y diseñadores apasionados por los videojuegos.",
              },
              {
                icon: Zap,
                title: "Creatividad",
                description: "Expresa tu creatividad con el tema único que se revela el primer día.",
              },
              {
                icon: Gamepad2,
                title: "Experiencia",
                description: "Participa sin importar tu nivel de experiencia. Hay un lugar para todos.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-6 rounded-lg border transition-all hover:shadow-lg"
                  style={{
                    backgroundColor: "rgba(18, 24, 45, 0.6)",
                    borderColor: "rgba(60, 255, 158, 0.2)",
                  }}
                >
                  <Icon className="h-8 w-8 mb-4 text-jam-primary" />
                  <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
                  <p className="text-jam-muted">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="cronograma" className="relative py-24 px-6 jam-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-jam-primary">Cronograma</span> <span className="text-white">del Evento</span>
            </h2>
            <p className="text-jam-muted text-lg">48 horas de desarrollo intenso</p>
          </div>

          <div className="space-y-6">
            {timeline.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-6 items-start p-6 rounded-lg border transition-all hover:shadow-lg"
                style={{
                  backgroundColor: "rgba(18, 24, 45, 0.6)",
                  borderColor: idx % 2 === 0 ? "rgba(60, 255, 158, 0.2)" : "rgba(139, 108, 255, 0.2)",
                }}
              >
                <div className="flex-shrink-0 w-24">
                  <div className="text-sm font-bold text-jam-muted">{item.day}</div>
                  <div
                    className="text-2xl font-bold mt-1"
                    style={{ color: idx % 2 === 0 ? "#3cff9e" : "#8b6cff" }}
                  >
                    {item.time}
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-jam-muted">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6 jam-section border-t" style={{ borderColor: "rgba(60, 255, 158, 0.1)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Sumate a la Experiencia</h2>
          <p className="text-jam-muted text-lg max-w-2xl mx-auto mb-10">
            Inscribite ahora y prepárate para 48 horas de puro desarrollo de videojuegos. ¡Nos vemos el 30 de enero!
          </p>

          <Link
            href="/registro"
            className="inline-flex items-center gap-2 rounded-lg px-8 py-4 font-semibold text-white transition-transform hover:scale-105"
            style={{
              backgroundColor: "#3cff9e",
              boxShadow: "0 0 20px rgba(60, 255, 158, 0.4)",
            }}
          >
            <Gamepad2 className="h-5 w-5" style={{ color: "#0b1020" }} />
            Registrarse Ahora
          </Link>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-jam-muted" style={{ borderColor: "rgba(139, 108, 255, 0.1)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <p>
            <span className="font-bold text-jam-primary">Paraná Game Jam</span> · Global Game Jam 2026 · Entre Ríos, Argentina
          </p>
        </div>
      </footer>
    </>
  );
}

"use client";

import Link from "next/link";
import { Gamepad2, Trophy, Users, Zap } from "lucide-react";
import { useState, useEffect } from "react";

const timeline = [
  { day: "Día 1", title: "Inicio", time: "16:00 hs", description: "Presentación y asignación de temas" },
  { day: "Día 1", title: "Desarrollo", time: "18:00 hs", description: "Comienza el desarrollo de 48 horas" },
  { day: "Día 3", title: "Cierre", time: "16:00 hs", description: "Entrega de proyectos" },
  { day: "Día 3", title: "Premiación", time: "17:30 hs", description: "Presentación y votación de juegos" },
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
      className="inline-block rounded-lg p-6 border"
      style={{
        backgroundColor: "rgba(18, 24, 45, 0.8)",
        borderColor: "rgba(60, 255, 158, 0.3)",
      }}
    >
      <div className="text-xs font-bold tracking-widest mb-4" style={{ color: "#8b6cff" }}>
        CUENTA REGRESIVA
      </div>
      <div className="flex gap-6 md:gap-12">
        {[
          { value: time.days, label: "DÍAS" },
          { value: time.hours, label: "HORAS" },
          { value: time.minutes, label: "MIN" },
          { value: time.seconds, label: "SEG" },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <div
              className="text-4xl md:text-6xl font-extrabold font-mono"
              style={{
                color: "#3cff9e",
                textShadow: "0 0 20px rgba(60, 255, 158, 0.6), 0 0 40px rgba(60, 255, 158, 0.3)",
                letterSpacing: "0.1em",
              }}
            >
              {item.value}
            </div>
            <div className="text-xs md:text-sm font-bold tracking-widest mt-2" style={{ color: "#b6c2ff" }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function JamPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0b1020", color: "#ffffff" }}>
      {/* Jam-specific Navigation */}
      <nav
        className="sticky top-0 z-50 border-b px-6 py-4"
        style={{
          backgroundColor: "rgba(11, 16, 32, 0.95)",
          borderColor: "rgba(60, 255, 158, 0.1)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/jam" className="font-extrabold text-xl md:text-2xl">
            <span style={{ color: "#3cff9e", textShadow: "0 0 10px rgba(60, 255, 158, 0.5)" }}>
              Paraná
            </span>
            <span style={{ color: "#8b6cff", textShadow: "0 0 10px rgba(139, 108, 255, 0.5)" }}>
              {" "}Game
            </span>
            <span className="text-white"> Jam</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <a href="#inicio" style={{ color: "#b6c2ff" }}>
              INICIO
            </a>
            <a href="#cronograma" style={{ color: "#b6c2ff" }}>
              CRONOGRAMA
            </a>
            <a href="#colaboradores" style={{ color: "#b6c2ff" }}>
              COLABORADORES
            </a>
            <a href="#contacto" style={{ color: "#b6c2ff" }}>
              CONTACTO
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://discord.gg/Kh6JDj44cE"
              className="hidden sm:inline-block rounded px-4 py-2 font-semibold"
              style={{
                backgroundColor: "#8b6cff",
                color: "#ffffff",
              }}
            >
              SER SPONSOR
            </a>
            <Link
              href="/registro"
              className="rounded px-4 py-2 font-semibold"
              style={{
                backgroundColor: "#3cff9e",
                color: "#0b1020",
                boxShadow: "0 0 15px rgba(60, 255, 158, 0.4)",
              }}
            >
              REGISTRARSE
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="relative min-h-screen flex items-center justify-center pt-12 overflow-hidden jam-hero">
        <div className="absolute inset-0 pointer-events-none jam-background">
          <div className="absolute top-20 left-10 w-32 h-32 border border-jam-secondary/20 rotate-45 opacity-30" />
          <div className="absolute bottom-20 right-10 w-48 h-48 border border-jam-primary/20 rotate-12 opacity-30" />
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-jam-primary rounded-full animate-pulse" style={{ boxShadow: "0 0 20px rgba(60, 255, 158, 0.8)" }} />
          <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-jam-secondary rounded-full animate-pulse" style={{ boxShadow: "0 0 20px rgba(139, 108, 255, 0.8)" }} />
          <Gamepad2 className="absolute top-1/4 right-20 w-12 h-12 opacity-30" style={{ color: "#8b6cff" }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          <div
            className="inline-flex items-center gap-2 backdrop-blur-sm border rounded-full px-4 py-2 mb-8"
            style={{
              backgroundColor: "rgba(18, 24, 45, 0.5)",
              borderColor: "rgba(60, 255, 158, 0.4)",
            }}
          >
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: "#3cff9e", boxShadow: "0 0 10px rgba(60, 255, 158, 0.8)" }}
            />
            <span className="text-sm font-medium" style={{ color: "#b6c2ff" }}>
              Global Game Jam 2026 - Sede Paraná
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-extrabold mb-6 tracking-tight">
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
              Game
            </span>
            <span className="text-white">Jam</span>
          </h1>

          <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
            <div
              className="h-px flex-1 max-w-32"
              style={{
                background: "linear-gradient(to right, transparent, rgba(60, 255, 158, 0.5))",
              }}
            />
            <p className="text-2xl md:text-3xl font-bold" style={{ color: "#ffffff", whiteSpace: "nowrap" }}>
              <span style={{ color: "#3cff9e" }}>30 DE ENERO</span>
              <span style={{ color: "#b6c2ff" }}> AL </span>
              <span style={{ color: "#8b6cff" }}>1 DE FEBRERO</span>
            </p>
            <div
              className="h-px flex-1 max-w-32"
              style={{
                background: "linear-gradient(to left, transparent, rgba(60, 255, 158, 0.5))",
              }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <div
              className="border rounded px-4 py-2 font-semibold text-sm"
              style={{
                borderColor: "#8b6cff",
                backgroundColor: "rgba(139, 108, 255, 0.15)",
                color: "#8b6cff",
              }}
            >
              INICIO 16 HS • CIERRE 19 HS
            </div>
            <a
              href="#"
              className="border rounded px-4 py-2 font-semibold text-sm flex items-center gap-2"
              style={{
                borderColor: "#3cff9e",
                backgroundColor: "rgba(60, 255, 158, 0.1)",
                color: "#b6c2ff",
              }}
            >
              <span style={{ color: "#ffffff" }}>LUGAR:</span> Mirador TEC
            </a>
          </div>

          <div
            className="inline-block border rounded-lg px-4 py-2 mb-8 text-sm"
            style={{
              borderColor: "#3cff9e",
              backgroundColor: "rgba(60, 255, 158, 0.1)",
              color: "#3cff9e",
            }}
          >
            Menores de edad: deben asistir acompañados por un adulto
          </div>

          <p className="text-base md:text-lg max-w-2xl mx-auto mb-12 leading-relaxed" style={{ color: "#b6c2ff" }}>
            Únete a 48 horas de puro desarrollo de videojuegos. Crea, colabora e innova con creativos de todo el mundo.
            Sin importar tu experiencia, hay un lugar para vos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 rounded-lg px-8 py-4 font-semibold font-bold text-sm transition-transform hover:scale-105"
              style={{
                backgroundColor: "#3cff9e",
                color: "#0b1020",
                boxShadow: "0 0 30px rgba(60, 255, 158, 0.6), 0 0 60px rgba(60, 255, 158, 0.3)",
              }}
            >
              <Gamepad2 className="h-5 w-5" />
              REGISTRARSE AHORA
            </Link>
            <a
              href="https://discord.gg/Kh6JDj44cE"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-8 py-4 font-semibold font-bold text-sm transition-transform hover:scale-105"
              style={{
                borderColor: "#8b6cff",
                borderWidth: "2px",
                backgroundColor: "transparent",
                color: "#8b6cff",
              }}
            >
              UNIRSE AL DISCORD
            </a>
          </div>

          {/* Countdown */}
          <CountdownTimer />
        </div>
      </section>

      {/* Features Section - From GamER hub style */}
      <section id="colaboradores" className="relative py-24 px-6 jam-section">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span style={{ color: "#3cff9e", textShadow: "0 0 20px rgba(60, 255, 158, 0.5)" }}>
                Qué vas a encontrar
              </span>{" "}
              <span style={{ color: "#8b6cff", textShadow: "0 0 20px rgba(139, 108, 255, 0.5)" }}>
                acá
              </span>
            </h2>
            <p style={{ color: "#b6c2ff" }} className="text-lg max-w-2xl mx-auto">
              Todo lo que necesitás para desarrollar, aprender y conectar con otros creadores.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Gamepad2,
                title: "Torneos",
                description: "Competencias presenciales, online e híbridas. Inscribite, jugá y subí en el ranking.",
              },
              {
                icon: Trophy,
                title: "Eventos",
                description: "Cyber cafés, LAN partys y encuentros en toda la región. Siempre hay algo pasando.",
              },
              {
                icon: Users,
                title: "Comunidad",
                description: "Conectá con gamers y creativos. Equipos, scrims y gente con la misma pasión que vos.",
              },
              {
                icon: Zap,
                title: "Tu perfil",
                description: "Panel propio con tu rol, tus eventos y tu actividad en un solo lugar.",
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="p-8 rounded-lg border transition-all hover:scale-105"
                  style={{
                    backgroundColor: "rgba(18, 24, 45, 0.7)",
                    borderColor: idx % 2 === 0 ? "rgba(60, 255, 158, 0.3)" : "rgba(139, 108, 255, 0.3)",
                  }}
                >
                  <Icon className="h-8 w-8 mb-4" style={{ color: idx % 2 === 0 ? "#3cff9e" : "#8b6cff" }} />
                  <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                  <p style={{ color: "#b6c2ff" }}>{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-24 px-6 jam-section">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { value: "+50", label: "Eventos al año" },
              { value: "+12", label: "Ciudades" },
              { value: "100%", label: "Entrerriano" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-8 rounded-lg border"
                style={{
                  backgroundColor: "rgba(18, 24, 45, 0.6)",
                  borderColor: "rgba(60, 255, 158, 0.2)",
                }}
              >
                <div
                  className="text-5xl md:text-6xl font-extrabold font-mono mb-3"
                  style={{
                    color: "#3cff9e",
                    textShadow: "0 0 20px rgba(60, 255, 158, 0.6), 0 0 40px rgba(60, 255, 158, 0.3)",
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-sm font-bold tracking-widest" style={{ color: "#b6c2ff" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="cronograma" className="relative py-24 px-6 jam-section">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span style={{ color: "#3cff9e", textShadow: "0 0 20px rgba(60, 255, 158, 0.5)" }}>
                Cronograma
              </span>{" "}
              <span className="text-white">del Evento</span>
            </h2>
            <p style={{ color: "#b6c2ff" }} className="text-lg">
              48 horas de desarrollo intenso
            </p>
          </div>

          <div className="space-y-6">
            {timeline.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-6 items-start p-6 rounded-lg border transition-all hover:shadow-lg"
                style={{
                  backgroundColor: "rgba(18, 24, 45, 0.6)",
                  borderColor: idx % 2 === 0 ? "rgba(60, 255, 158, 0.3)" : "rgba(139, 108, 255, 0.3)",
                }}
              >
                <div className="flex-shrink-0 w-24">
                  <div className="text-sm font-bold" style={{ color: "#b6c2ff" }}>
                    {item.day}
                  </div>
                  <div
                    className="text-2xl font-bold mt-1 font-mono"
                    style={{
                      color: idx % 2 === 0 ? "#3cff9e" : "#8b6cff",
                      textShadow: idx % 2 === 0 ? "0 0 10px rgba(60, 255, 158, 0.5)" : "0 0 10px rgba(139, 108, 255, 0.5)",
                    }}
                  >
                    {item.time}
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">{item.title}</h4>
                  <p style={{ color: "#b6c2ff" }}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community CTA Section */}
      <section
        className="relative overflow-hidden border-t py-24 px-6 jam-section"
        style={{ borderColor: "rgba(60, 255, 158, 0.1)" }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div
            className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full"
            style={{ backgroundColor: "#3cff9e", filter: "blur(80px)" }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full"
            style={{ backgroundColor: "#8b6cff", filter: "blur(60px)" }}
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <Zap className="mx-auto h-10 w-10 mb-6 animate-bounce" style={{ color: "#3cff9e" }} />
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Sumate a la comunidad
          </h2>
          <p style={{ color: "#b6c2ff" }} className="text-lg max-w-2xl mx-auto mb-10">
            Creá tu cuenta gratis y formá parte de la red gamer más grande de Entre Ríos.
            Compartí proyectos, colaborá con otros y crecé como creativo.
          </p>
          <div
            className="h-px w-full mb-10"
            style={{
              background: "linear-gradient(90deg, transparent, #3cff9e, transparent)",
            }}
          />
          <Link
            href="/registro"
            className="inline-flex items-center gap-2 rounded-lg px-8 py-4 font-semibold font-bold transition-transform hover:scale-105"
            style={{
              backgroundColor: "#3cff9e",
              color: "#0b1020",
              boxShadow: "0 0 30px rgba(60, 255, 158, 0.6), 0 0 60px rgba(60, 255, 158, 0.3)",
            }}
          >
            <Gamepad2 className="h-5 w-5" />
            CREAR MI CUENTA
          </Link>
        </div>
      </section>

      <footer
        className="border-t py-8 text-center text-sm"
        style={{ borderColor: "rgba(139, 108, 255, 0.1)", color: "#b6c2ff" }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <p>
            <span className="font-bold" style={{ color: "#3cff9e" }}>
              Paraná Game Jam
            </span>{" "}
            · Global Game Jam 2026 · Entre Ríos, Argentina
          </p>
        </div>
      </footer>
    </div>
  );
}

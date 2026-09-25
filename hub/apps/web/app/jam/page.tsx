"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Gamepad2, Trophy, Users, CalendarDays, Zap, Gamepad, Hexagon } from "lucide-react";
import { SiteNav } from "@/components/site-nav";

type BgIcon = typeof Gamepad2;
type IconElement = { kind: "icon"; Icon: BgIcon; className: string; style: React.CSSProperties; parallax?: boolean };
type BoxElement = { kind: "box"; className: string; style: React.CSSProperties; parallax?: boolean };
type DotElement = { kind: "dot"; className: string; style: React.CSSProperties; parallax?: boolean };
type BgElement = IconElement | BoxElement | DotElement;

const icon = (Icon: BgIcon, className: string, style: React.CSSProperties, parallax = true): IconElement => ({ kind: "icon", Icon, className, style, parallax });
const box = (className: string, style: React.CSSProperties, parallax = true): BoxElement => ({ kind: "box", className, style, parallax });
const dot = (className: string, style: React.CSSProperties, parallax = true): DotElement => ({ kind: "dot", className, style, parallax });

// Three alternate scatter distributions for the shared hero/features/community background.
// Each covers all four quadrants (including the upper-left, which earlier layouts left empty).
const BG_DISTRIBUTIONS: BgElement[][] = [
  [
    box("absolute top-20 left-10 w-32 h-32 border rotate-45 opacity-30", { borderColor: "rgba(139, 108, 255, 0.2)" }, false),
    box("absolute bottom-20 right-10 w-48 h-48 border rotate-12 opacity-30", { borderColor: "rgba(60, 255, 158, 0.2)" }, false),
    dot("absolute top-1/3 right-1/4 w-3 h-3 rounded-full animate-pulse-glow", { backgroundColor: "#3cff9e" }, false),
    dot("absolute bottom-1/3 left-1/4 w-3 h-3 rounded-full animate-pulse", { backgroundColor: "#8b6cff" }),
    dot("absolute top-1/2 left-10 w-2 h-2 rounded-full animate-ping", { backgroundColor: "#1ecf7a" }, false),
    dot("absolute bottom-1/4 right-1/3 w-2 h-2 rounded-full animate-ping", { backgroundColor: "#7d51fb", animationDelay: "0.5s" }),
    icon(Gamepad2, "absolute top-1/4 right-20 w-8 h-8 animate-float", { color: "rgba(139, 108, 255, 0.2)" }, false),
    icon(Zap, "absolute bottom-1/3 left-20 w-6 h-6 animate-float", { color: "rgba(60, 255, 158, 0.2)", animationDelay: "1s" }),
    icon(Gamepad, "absolute top-2/3 right-1/4 w-7 h-7 animate-float", { color: "rgba(60, 255, 158, 0.15)", animationDelay: "1.5s" }, false),
    icon(Hexagon, "absolute top-10 right-1/3 w-10 h-10 animate-float", { color: "rgba(139, 108, 255, 0.15)", animationDelay: "0.75s" }),
    icon(Hexagon, "absolute bottom-10 left-1/3 w-6 h-6 animate-float", { color: "rgba(60, 255, 158, 0.12)", animationDelay: "2s" }, false),
    icon(Zap, "absolute top-1/2 right-10 w-5 h-5 animate-float", { color: "rgba(139, 108, 255, 0.18)", animationDelay: "0.25s" }),
    box("absolute top-1/4 left-1/3 w-24 h-24 border rotate-12 opacity-20", { borderColor: "rgba(60, 255, 158, 0.15)" }, false),
    box("absolute bottom-1/4 right-1/4 w-20 h-20 border rotate-45 opacity-20", { borderColor: "rgba(139, 108, 255, 0.15)" }, false),
    dot("absolute top-16 left-1/2 w-2 h-2 rounded-full animate-pulse", { backgroundColor: "#3cff9e", animationDelay: "0.3s" }, false),
    dot("absolute bottom-16 left-16 w-2 h-2 rounded-full animate-ping", { backgroundColor: "#8b6cff", animationDelay: "1.2s" }),
    dot("absolute top-2/3 right-16 w-1.5 h-1.5 rounded-full animate-pulse-glow", { backgroundColor: "#1ecf7a" }, false),
    // upper-left coverage
    icon(Hexagon, "absolute top-[6%] left-[8%] w-8 h-8 animate-float", { color: "rgba(60, 255, 158, 0.15)", animationDelay: "0.6s" }, false),
    icon(Gamepad2, "absolute top-[22%] left-[18%] w-5 h-5 animate-float", { color: "rgba(139, 108, 255, 0.16)", animationDelay: "1.3s" }),
    dot("absolute top-[14%] left-[28%] w-2 h-2 rounded-full animate-ping", { backgroundColor: "#3cff9e", animationDelay: "0.9s" }, false),
    box("absolute top-[4%] left-[22%] w-16 h-16 border rotate-[18deg] opacity-15", { borderColor: "rgba(139, 108, 255, 0.15)" }, false),
  ],
  [
    box("absolute top-24 right-16 w-40 h-40 border rotate-12 opacity-25", { borderColor: "rgba(60, 255, 158, 0.2)" }, false),
    box("absolute bottom-24 left-12 w-32 h-32 border rotate-45 opacity-25", { borderColor: "rgba(139, 108, 255, 0.2)" }, false),
    dot("absolute top-1/4 left-1/3 w-2 h-2 rounded-full animate-pulse-glow", { backgroundColor: "#8b6cff" }, false),
    dot("absolute bottom-1/4 right-1/3 w-3 h-3 rounded-full animate-pulse", { backgroundColor: "#3cff9e" }),
    dot("absolute top-2/3 left-16 w-2 h-2 rounded-full animate-ping", { backgroundColor: "#7d51fb", animationDelay: "0.4s" }, false),
    dot("absolute bottom-1/2 right-14 w-2 h-2 rounded-full animate-ping", { backgroundColor: "#1ecf7a", animationDelay: "0.9s" }),
    icon(Hexagon, "absolute top-1/3 right-24 w-9 h-9 animate-float", { color: "rgba(139, 108, 255, 0.18)" }, false),
    icon(Gamepad2, "absolute bottom-1/3 right-1/4 w-6 h-6 animate-float", { color: "rgba(60, 255, 158, 0.16)", animationDelay: "1.1s" }),
    icon(Zap, "absolute top-1/2 left-1/4 w-5 h-5 animate-float", { color: "rgba(60, 255, 158, 0.2)", animationDelay: "0.6s" }, false),
    icon(Gamepad, "absolute bottom-16 left-1/3 w-7 h-7 animate-float", { color: "rgba(139, 108, 255, 0.15)", animationDelay: "1.8s" }),
    box("absolute top-[40%] right-[10%] w-20 h-20 border rotate-[8deg] opacity-20", { borderColor: "rgba(60, 255, 158, 0.15)" }, false),
    box("absolute bottom-[15%] right-[38%] w-24 h-24 border rotate-[30deg] opacity-15", { borderColor: "rgba(139, 108, 255, 0.15)" }, false),
    dot("absolute top-[55%] left-[45%] w-1.5 h-1.5 rounded-full animate-pulse", { backgroundColor: "#3cff9e", animationDelay: "0.3s" }, false),
    dot("absolute bottom-[10%] left-[20%] w-2 h-2 rounded-full animate-pulse-glow", { backgroundColor: "#8b6cff" }),
    icon(Zap, "absolute top-[70%] right-[15%] w-4 h-4 animate-float", { color: "rgba(139, 108, 255, 0.18)", animationDelay: "2.2s" }, false),
    // upper-left coverage
    icon(Gamepad, "absolute top-[8%] left-[10%] w-7 h-7 animate-float", { color: "rgba(60, 255, 158, 0.16)", animationDelay: "0.5s" }, false),
    icon(Zap, "absolute top-[18%] left-[24%] w-5 h-5 animate-float", { color: "rgba(139, 108, 255, 0.18)", animationDelay: "1.4s" }),
    dot("absolute top-[10%] left-[34%] w-2 h-2 rounded-full animate-pulse", { backgroundColor: "#1ecf7a", animationDelay: "0.7s" }),
    box("absolute top-[2%] left-[6%] w-20 h-20 border rotate-[35deg] opacity-15", { borderColor: "rgba(60, 255, 158, 0.15)" }, false),
  ],
  [
    box("absolute top-16 left-1/4 w-28 h-28 border rotate-[20deg] opacity-25", { borderColor: "rgba(139, 108, 255, 0.2)" }, false),
    box("absolute bottom-16 right-1/4 w-36 h-36 border rotate-[15deg] opacity-25", { borderColor: "rgba(60, 255, 158, 0.2)" }, false),
    dot("absolute top-1/2 right-1/3 w-2 h-2 rounded-full animate-pulse", { backgroundColor: "#3cff9e" }, false),
    dot("absolute bottom-1/2 left-1/3 w-3 h-3 rounded-full animate-pulse-glow", { backgroundColor: "#8b6cff" }),
    dot("absolute top-1/4 right-12 w-2 h-2 rounded-full animate-ping", { backgroundColor: "#1ecf7a", animationDelay: "0.6s" }, false),
    dot("absolute bottom-1/4 left-12 w-2 h-2 rounded-full animate-ping", { backgroundColor: "#7d51fb", animationDelay: "1.1s" }),
    icon(Zap, "absolute top-1/3 left-16 w-6 h-6 animate-float", { color: "rgba(60, 255, 158, 0.18)" }, false),
    icon(Gamepad2, "absolute bottom-1/3 right-16 w-8 h-8 animate-float", { color: "rgba(139, 108, 255, 0.18)", animationDelay: "0.9s" }),
    icon(Hexagon, "absolute top-2/3 right-1/3 w-7 h-7 animate-float", { color: "rgba(60, 255, 158, 0.14)", animationDelay: "1.6s" }, false),
    icon(Gamepad, "absolute bottom-[8%] left-[45%] w-6 h-6 animate-float", { color: "rgba(139, 108, 255, 0.16)", animationDelay: "0.3s" }),
    box("absolute top-[45%] left-[8%] w-16 h-16 border rotate-[10deg] opacity-20", { borderColor: "rgba(60, 255, 158, 0.15)" }, false),
    box("absolute bottom-[42%] right-[6%] w-24 h-24 border rotate-[25deg] opacity-15", { borderColor: "rgba(139, 108, 255, 0.15)" }, false),
    dot("absolute top-[80%] right-[30%] w-1.5 h-1.5 rounded-full animate-pulse-glow", { backgroundColor: "#1ecf7a" }, false),
    icon(Zap, "absolute bottom-[60%] left-[55%] w-5 h-5 animate-float", { color: "rgba(60, 255, 158, 0.2)", animationDelay: "1.9s" }),
    // upper-left coverage
    icon(Hexagon, "absolute top-[10%] left-[12%] w-9 h-9 animate-float", { color: "rgba(139, 108, 255, 0.16)", animationDelay: "0.4s" }, false),
    icon(Gamepad2, "absolute top-[26%] left-[6%] w-6 h-6 animate-float", { color: "rgba(60, 255, 158, 0.18)", animationDelay: "1.2s" }),
    dot("absolute top-[18%] left-[22%] w-2 h-2 rounded-full animate-ping", { backgroundColor: "#8b6cff", animationDelay: "0.8s" }, false),
    box("absolute top-[4%] left-[30%] w-14 h-14 border rotate-[5deg] opacity-15", { borderColor: "rgba(60, 255, 158, 0.15)" }, false),
  ],
];

const timelineEvents = [
  {
    date: "16 OCT",
    time: "17:00",
    title: "Apertura & Keynote",
    description: "Inicio del evento, presentación del tema y formación de equipos",
  },
  {
    date: "16 OCT",
    time: "17:30 - 18:30",
    title: "Brainstorming",
    description: "Cada equipo define la idea de su juego",
  },
  {
    date: "16 OCT",
    time: "18:30",
    title: "Presentación de Equipos",
    description: "Un representante de cada equipo presenta su idea y equipo",
  },
  {
    date: "17 OCT",
    time: "Todo el día",
    title: "Jornada de Desarrollo",
    description: "Desarrollo continuo, con mentores a disposición",
  },
  {
    date: "18 OCT",
    time: "17:00",
    title: "Entrega de Proyectos",
    description: "Fecha límite para subir los juegos a la plataforma",
  },
  {
    date: "18 OCT",
    time: "19:00",
    title: "Presentaciones & Cierre",
    description: "Demos de los juegos y ceremonia de clausura",
  },
];

const aboutFeatures = [
  {
    icon: Gamepad2,
    title: "Creá Videojuegos",
    body: "Desarrollá un juego desde cero en 48 horas junto a un equipo.",
  },
  {
    icon: Users,
    title: "Formá Equipos",
    body: "Conectá con artistas, programadores y diseñadores.",
  },
  {
    icon: CalendarDays,
    title: "48 Horas",
    body: "Desafío intenso con soporte continuo de mentores.",
  },
  {
    icon: Trophy,
    title: "Compartí tu Juego",
    body: "Publicá tu creación en la plataforma de Game Jam Plus.",
  },
];

const JAM_START = new Date("2026-10-16T17:00:00-03:00");

function getCountdown(now: Date) {
  const diffMs = Math.max(0, JAM_START.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  return [
    { value: String(Math.floor(totalSeconds / 86400)).padStart(2, "0"), label: "Días" },
    { value: String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, "0"), label: "Horas" },
    { value: String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0"), label: "Min" },
    { value: String(totalSeconds % 60).padStart(2, "0"), label: "Seg" },
  ];
}

export default function JamPage() {
  const [distribution, setDistribution] = useState<BgElement[] | null>(null);
  const [countdown, setCountdown] = useState<ReturnType<typeof getCountdown> | null>(null);
  const parallaxRefHero = useRef<HTMLDivElement>(null);
  const parallaxRefCommunity = useRef<HTMLDivElement>(null);

  // Compute countdown only on client to avoid hydration mismatch, then tick every second.
  useEffect(() => {
    setCountdown(getCountdown(new Date()));
    const interval = setInterval(() => setCountdown(getCountdown(new Date())), 1000);
    return () => clearInterval(interval);
  }, []);

  // Select random distribution only on client to avoid hydration mismatch
  useEffect(() => {
    setDistribution(BG_DISTRIBUTIONS[Math.floor(Math.random() * BG_DISTRIBUTIONS.length)]);
  }, []);

  // Update parallax transform via refs every frame, easing toward the scroll
  // target so stepped wheel/trackpad scroll deltas produce smooth drift
  // instead of the background snapping between positions.
  useEffect(() => {
    let frameId: number;
    let currentOffset = 0;
    const LERP_FACTOR = 0.08;

    const updateParallax = () => {
      const targetOffset = window.scrollY * 0.15;
      currentOffset += (targetOffset - currentOffset) * LERP_FACTOR;
      // Snap once close enough to avoid an endless fractional-pixel drift.
      if (Math.abs(targetOffset - currentOffset) < 0.05) {
        currentOffset = targetOffset;
      }
      if (parallaxRefHero.current) {
        parallaxRefHero.current.style.transform = `translateY(${currentOffset}px)`;
      }
      if (parallaxRefCommunity.current) {
        parallaxRefCommunity.current.style.transform = `translateY(${currentOffset}px)`;
      }
      frameId = requestAnimationFrame(updateParallax);
    };

    frameId = requestAnimationFrame(updateParallax);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <>
      <SiteNav section="jam" />

      <div className="font-oxanium">
      {/* ── Hero + Features + Community share one continuous background ── */}
      <div className="relative overflow-hidden" style={{ backgroundColor: "#0b1020" }}>
        {/* HUD Grid background — exact match to source .hud-grid */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(60, 255, 158, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(60, 255, 158, 0.03) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Hexagon pattern — exact match to source .hex-pattern */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%238b6cff' fill-opacity='0.03'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Static background elements (anchoring layer) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {distribution?.map((el, i) => {
            const isStatic = el.parallax === false;
            if (isStatic) {
              if (el.kind === "icon") {
                const Icon = el.Icon;
                return <Icon key={`static-icon-${i}`} className={el.className} style={el.style} />;
              }
              return <div key={`static-${i}`} className={el.className} style={el.style} />;
            }
            return null;
          })}
        </div>

        {/* Parallax background elements */}
        <div
          ref={parallaxRefHero}
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ willChange: "transform" }}
        >
          {distribution?.map((el, i) => {
            const isParallax = el.parallax !== false;
            if (isParallax) {
              if (el.kind === "icon") {
                const Icon = el.Icon;
                return <Icon key={`parallax-icon-${i}`} className={el.className} style={el.style} />;
              }
              return <div key={`parallax-${i}`} className={el.className} style={el.style} />;
            }
            return null;
          })}
        </div>

        {/* Scan line animation — single thin moving line, not a tiled wash */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(60, 255, 158, 0.6), transparent)",
            animation: "scanline 8s linear infinite",
          }}
        />

        {/* ── Hero ── */}
        <section className="relative" style={{ minHeight: "100vh" }}>
        <div className="font-oxanium relative mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-20 md:pt-24 md:pb-28 text-center">
          {/* Official Paraná Game Jam mark */}
          <div className="mb-6 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/jam/logo.svg" alt="Global Game Jam" className="animate-float-rotate h-16 sm:h-20 w-auto" />
          </div>

          <div
            className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2"
            style={{
              borderColor: "rgba(139, 108, 255, 0.3)",
              backgroundColor: "rgba(18, 24, 45, 0.5)",
            }}
          >
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: "#3cff9e" }} />
            <span className="text-sm font-medium" style={{ color: "#b6c2ff" }}>Game Jam Plus 2026 - Sede Paraná</span>
          </div>

          <h1 className="animate-fade-up delay-100 mb-4 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            <span style={{ color: "#3cff9e", textShadow: "0 0 8px rgba(60, 255, 158, 0.3), 0 0 16px rgba(60, 255, 158, 0.15)" }}>Paraná</span>{" "}
            <span style={{ color: "#8b6cff", textShadow: "0 0 8px rgba(139, 108, 255, 0.3), 0 0 16px rgba(139, 108, 255, 0.15)" }}>Game</span>{" "}
            <span style={{ color: "#ffffff" }}>Jam</span>
          </h1>

          {/* Event dates */}
          <div className="animate-fade-up delay-150 mb-6 flex items-center justify-center gap-4">
            <span className="h-px max-w-20 flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(139, 108, 255, 0.5))" }} />
            <p className="text-xl font-bold sm:text-2xl" style={{ color: "#ffffff" }}>
              <span style={{ color: "#3cff9e" }}>16 DE OCTUBRE</span>
              <span style={{ color: "#b6c2ff" }}> AL </span>
              <span style={{ color: "#8b6cff" }}>18 DE OCTUBRE</span>
            </p>
            <span className="h-px max-w-20 flex-1" style={{ background: "linear-gradient(270deg, transparent, rgba(139, 108, 255, 0.5))" }} />
          </div>

          {/* Event time & location — secondary filled, primary outlined (matching source) */}
          <div className="animate-fade-up delay-250 mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <div
              className="rounded border px-4 py-2"
              style={{ backgroundColor: "rgba(139, 108, 255, 0.2)", borderColor: "rgba(139, 108, 255, 0.3)" }}
            >
              <span className="font-bold" style={{ color: "#8b6cff" }}>INICIO 17 HS · CIERRE 19 HS</span>
            </div>
            <a
              href="https://miradortec.net.ar/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded border px-4 py-2"
              style={{ backgroundColor: "rgba(18, 24, 45, 0.5)", borderColor: "rgba(60, 255, 158, 0.3)" }}
            >
              <span className="mt-1 font-bold" style={{ color: "#b6c2ff" }}>LUGAR:</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/jam/mirador-tec.png" alt="Mirador TEC" className="h-5 w-auto" />
            </a>
          </div>

          {/* Minors notice */}
          <div
            className="animate-fade-up delay-275 mb-6 inline-flex items-center gap-2 rounded-lg border px-4 py-2"
            style={{ borderColor: "rgba(60, 255, 158, 0.3)", backgroundColor: "rgba(60, 255, 158, 0.1)" }}
          >
            <span className="text-sm" style={{ color: "#b6c2ff" }}>
              <span className="font-semibold" style={{ color: "#3cff9e" }}>Menores de edad:</span> deben asistir acompañados por un adulto
            </span>
          </div>

          <p className="animate-fade-up delay-200 mx-auto mb-10 max-w-3xl text-base leading-relaxed sm:text-lg" style={{ color: "#b6c2ff", fontFamily: "var(--font-inter)" }}>
            Únete a 48 horas de puro desarrollo de videojuegos. Crea, colabora e innova con creativos de todo el mundo.
            Sin importar tu experiencia, hay un lugar para vos.
          </p>

          <div className="animate-fade-up delay-300 mb-12 flex flex-col items-center justify-center gap-3 sm:gap-4 sm:flex-row">
            <a
              href="https://herohub.gamejamplus.com/#/jam"
              target="_blank"
              rel="noopener noreferrer"
              className="jam-glow-pulse flex h-11 w-auto items-center justify-center rounded-md px-8 font-bold uppercase tracking-wider transition-transform hover:scale-105 text-sm sm:text-base"
              style={{ backgroundColor: "#3cff9e", color: "#0b1020" }}
            >
              Registrarse Ahora
            </a>
            <a
              href="https://discord.gg/Kh6JDj44cE"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-auto items-center justify-center rounded-md border px-8 font-bold uppercase tracking-wider transition-transform hover:scale-105 text-sm sm:text-base"
              style={{ borderColor: "#8b6cff", backgroundColor: "transparent", color: "#8b6cff" }}
            >
              Unirse al Discord
            </a>
          </div>

          {/* Countdown — exact match to source HudFrame + CountdownTimer */}
          <div
            className="animate-fade-up delay-500 relative mx-auto mt-20 max-w-2xl p-6 backdrop-blur-sm"
            style={{
              backgroundColor: "rgba(18, 24, 45, 0.5)",
              border: "1px solid rgba(139, 108, 255, 0.2)",
              boxShadow:
                "0 0 0 1px rgba(139, 108, 255, 0.2), 0 0 10px rgba(139, 108, 255, 0.08), inset 0 0 10px rgba(139, 108, 255, 0.02)",
            }}
          >
            {/* Corner decorations — top-left and bottom-right only, per source .hud-corner */}
            <div
              style={{
                position: "absolute",
                top: "-1px",
                left: "-1px",
                width: "20px",
                height: "20px",
                borderTop: "2px solid rgba(139, 108, 255, 0.5)",
                borderLeft: "2px solid rgba(139, 108, 255, 0.5)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-1px",
                right: "-1px",
                width: "20px",
                height: "20px",
                borderBottom: "2px solid rgba(139, 108, 255, 0.5)",
                borderRight: "2px solid rgba(139, 108, 255, 0.5)",
              }}
            />
            <div
              className="absolute -top-3 left-4 px-2 text-xs font-bold uppercase tracking-widest"
              style={{ backgroundColor: "#0b1020", color: "#8b6cff" }}
            >
              Cuenta Regresiva
            </div>
            <div className="grid grid-cols-4 gap-1 sm:gap-3 md:gap-4">
              {(countdown ?? getCountdown(JAM_START)).map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl font-extrabold tabular-nums sm:text-5xl md:text-7xl lg:text-9xl" style={{ color: "#3cff9e", lineHeight: "1" }}>
                    {s.value}
                  </div>
                  <div
                    className="mt-1 text-xs font-semibold uppercase tracking-wider sm:mt-2 md:mt-3 text-[10px] sm:text-xs md:text-sm"
                    style={{ color: "#b6c2ff" }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </section>
      </div>

      {/* ── About with grid background ── */}
      <div className="relative overflow-hidden" style={{ backgroundColor: "#0b1020" }}>
        {/* HUD Grid background — unique to About section */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(60, 255, 158, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(60, 255, 158, 0.03) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

      <section id="about" className="relative mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-24">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">
            <span style={{ color: "#3cff9e", textShadow: "0 0 15px rgba(60, 255, 158, 0.5)" }}>¿Qué es</span>{" "}
            <span style={{ color: "#ffffff" }}>la Game Jam?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl" style={{ color: "#b6c2ff", fontFamily: "var(--font-inter)" }}>
            Game Jam Plus es el Mundial del desarrollo de videojuegos: una maratón de creación de 48 horas que
            arranca acá, en Paraná, y sigue rumbo a instancias continentales y globales, con mentorías para pulir
            tu juego y tu plan de negocio.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {aboutFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group relative p-4 sm:p-6 text-center backdrop-blur-sm transition-all duration-300"
                style={{
                  backgroundColor: "rgba(18, 24, 45, 0.5)",
                  border: "1px solid rgba(139, 108, 255, 0.2)",
                  boxShadow:
                    "0 0 0 1px rgba(139, 108, 255, 0.2), 0 0 10px rgba(139, 108, 255, 0.08), inset 0 0 10px rgba(139, 108, 255, 0.02)",
                }}
                onMouseEnter={(e) => {
                  if (window.matchMedia("(hover: hover)").matches) {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(60, 255, 158, 0.5)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 1px rgba(60, 255, 158, 0.5), 0 0 20px rgba(60, 255, 158, 0.2), inset 0 0 10px rgba(60, 255, 158, 0.05)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (window.matchMedia("(hover: hover)").matches) {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(139, 108, 255, 0.2)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 1px rgba(139, 108, 255, 0.2), 0 0 10px rgba(139, 108, 255, 0.08), inset 0 0 10px rgba(139, 108, 255, 0.02)";
                  }
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-1px",
                    left: "-1px",
                    width: "20px",
                    height: "20px",
                    borderTop: "2px solid rgba(139, 108, 255, 0.5)",
                    borderLeft: "2px solid rgba(139, 108, 255, 0.5)",
                    transition: "border-color 0.3s duration-300",
                  }}
                  className="group-hover:border-accent"
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "-1px",
                    right: "-1px",
                    width: "20px",
                    height: "20px",
                    borderBottom: "2px solid rgba(139, 108, 255, 0.5)",
                    borderRight: "2px solid rgba(139, 108, 255, 0.5)",
                    transition: "border-color 0.3s duration-300",
                  }}
                  className="group-hover:border-accent"
                />
                <div
                  className="mx-auto mb-3 sm:mb-4 flex h-12 sm:h-14 w-12 sm:w-14 items-center justify-center rounded-lg transition-all duration-300"
                  style={{ backgroundColor: "rgba(139, 108, 255, 0.2)" }}
                  onMouseEnter={(e) => {
                    if (window.matchMedia("(hover: hover)").matches) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(60, 255, 158, 0.2)";
                      const icon = (e.currentTarget as HTMLElement).querySelector("svg");
                      if (icon) icon.style.color = "#3cff9e";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (window.matchMedia("(hover: hover)").matches) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(139, 108, 255, 0.2)";
                      const icon = (e.currentTarget as HTMLElement).querySelector("svg");
                      if (icon) icon.style.color = "#8b6cff";
                    }
                  }}
                >
                  <Icon
                    className="h-6 sm:h-7 w-6 sm:w-7 transition-colors duration-300"
                    style={{ color: "#8b6cff" }}
                  />
                </div>
                <h3 className="mb-2 text-sm sm:text-base font-bold text-white">{f.title}</h3>
                <p className="text-xs sm:text-sm" style={{ color: "#b6c2ff", fontFamily: "var(--font-inter)" }}>
                  {f.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>
      </div>

      {/* ── Features with grid background ── */}
      <div className="relative overflow-hidden" style={{ backgroundColor: "#0b1020" }}>
        {/* HUD Grid background — unique to Features section */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(60, 255, 158, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(60, 255, 158, 0.03) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

      <section id="features" className="relative mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-24">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-2xl font-bold sm:text-3xl md:text-4xl">
            <span style={{ color: "#8b6cff" }}>
              Cronograma
            </span>{" "}
            <span style={{ color: "#ffffff" }}>
              del Evento
            </span>
          </h2>
          <p className="mx-auto max-w-3xl" style={{ color: "#b6c2ff", fontFamily: "var(--font-inter)" }}>
            48 horas de desarrollo intenso con actividades organizadas para maximizar tu creatividad.
          </p>
        </div>

        {/* Timeline — exact structure from source Timeline component */}
        <div
          className="relative mx-auto p-6 backdrop-blur-sm"
          style={{
            backgroundColor: "rgba(18, 24, 45, 0.5)",
            border: "1px solid rgba(139, 108, 255, 0.2)",
            boxShadow:
              "0 0 0 1px rgba(139, 108, 255, 0.2), 0 0 10px rgba(139, 108, 255, 0.08), inset 0 0 10px rgba(139, 108, 255, 0.02)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-1px",
              left: "-1px",
              width: "20px",
              height: "20px",
              borderTop: "2px solid rgba(139, 108, 255, 0.5)",
              borderLeft: "2px solid rgba(139, 108, 255, 0.5)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-1px",
              right: "-1px",
              width: "20px",
              height: "20px",
              borderBottom: "2px solid rgba(139, 108, 255, 0.5)",
              borderRight: "2px solid rgba(139, 108, 255, 0.5)",
            }}
          />
          <div
            className="absolute -top-3 left-4 px-2 text-xs font-bold uppercase tracking-widest"
            style={{ backgroundColor: "#0b1020", color: "#8b6cff" }}
          >
            Cronograma
          </div>

          <div className="relative">
            {/* Vertical line, centered on the dot column (w-20/w-28 date col + gap-4/gap-8 + half of w-4 dot col) */}
            <div
              className="absolute bottom-0 top-0 w-px left-[104px] md:left-[152px]"
              style={{ backgroundColor: "rgba(60, 255, 158, 0.2)" }}
            />
            <div className="space-y-8">
              {timelineEvents.map((event, i) => (
                <div key={i} className="flex gap-4 md:gap-8">
                  <div className="w-20 flex-shrink-0 pr-2 text-right md:w-28">
                    <div className="text-sm font-bold md:text-base" style={{ color: "#3cff9e" }}>
                      {event.date}
                    </div>
                    <div className="text-xs md:text-sm" style={{ color: "#b6c2ff" }}>
                      {event.time}
                    </div>
                  </div>
                  <div className="relative w-4 flex-shrink-0">
                    <div
                      className="absolute left-1/2 top-1 h-3 w-3 -translate-x-1/2 rounded-full"
                      style={{ backgroundColor: "#3cff9e", boxShadow: "0 0 10px rgba(60, 255, 158, 0.5)" }}
                    />
                  </div>
                  <div className="flex-1 pb-1">
                    <h4 className="text-sm font-semibold text-white md:text-base">{event.title}</h4>
                    <p className="mt-1 text-xs md:text-sm" style={{ color: "#b6c2ff", fontFamily: "var(--font-inter)" }}>
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      </div>

      {/* ── Community CTA with shared background ── */}
      <div className="relative overflow-hidden" style={{ borderTop: "1px solid rgba(60, 255, 158, 0.1)", backgroundColor: "#0b1020" }}>
        {/* Hexagon pattern */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%238b6cff' fill-opacity='0.03'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Static background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {distribution?.map((el, i) => {
            const isStatic = el.parallax === false;
            if (isStatic) {
              if (el.kind === "icon") {
                const Icon = el.Icon;
                return <Icon key={`community-static-icon-${i}`} className={el.className} style={el.style} />;
              }
              return <div key={`community-static-${i}`} className={el.className} style={el.style} />;
            }
            return null;
          })}
        </div>

        {/* Parallax background elements */}
        <div
          ref={parallaxRefCommunity}
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ willChange: "transform" }}
        >
          {distribution?.map((el, i) => {
            const isParallax = el.parallax !== false;
            if (isParallax) {
              if (el.kind === "icon") {
                const Icon = el.Icon;
                return <Icon key={`community-parallax-${i}`} className={el.className} style={el.style} />;
              }
              return <div key={`community-parallax-${i}`} className={el.className} style={el.style} />;
            }
            return null;
          })}
        </div>

        <section id="comunidad" className="relative">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-24 text-center">
          <Gamepad
            className="mx-auto h-10 w-10 animate-float"
            style={{
              color: "#3cff9e",
            }}
          />
          <h2 className="mt-6 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight" style={{ color: "#f2f4ff" }}>Creá tu cuenta gratis y formá parte de la red de videojuegos de Entre Ríos</h2>
          <p className="mx-auto mt-4 max-w-xl" style={{ color: "#b6c2ff", fontFamily: "var(--font-inter)" }}>
            Tu lugar en la escena empieza acá.
          </p>
          <div
            className="mt-9 h-px w-full"
            style={{
              background: "linear-gradient(90deg, transparent, #3cff9e, transparent)",
            }}
          />
          <a
            href="https://gameer.com.ar/registro"
            className="mt-9 inline-flex items-center gap-2 rounded-lg px-8 py-4 font-semibold transition-transform hover:scale-105"
            style={{
              backgroundColor: "#3cff9e",
              color: "#0b1020",
              display: "none",
            }}
          >
            <Gamepad2 className="h-5 w-5" />
            Crear mi cuenta
          </a>
        </div>
        </section>
      </div>

      <footer className="border-t py-12 px-6 relative" style={{ borderColor: "rgba(60, 255, 158, 0.1)", backgroundColor: "#0b1020" }}>
        <div className="mx-auto max-w-6xl flex flex-col items-center justify-center gap-6 md:flex-row md:justify-between md:items-center" style={{ position: "relative" }}>
          <div className="flex items-center gap-4 md:order-1">
            <span className="font-oxanium font-extrabold" style={{ color: "#3cff9e" }}>
              Paraná Game Jam
            </span>
            <span className="text-sm" style={{ color: "#b6c2ff" }}>|</span>
            <span className="text-sm" style={{ color: "#b6c2ff" }}>Game Jam Plus 2026</span>
          </div>

          <div className="flex items-center gap-6 text-sm md:order-3 md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
            <Link
              href="/jam/convivencia"
              className="transition-colors hover:text-white"
              style={{ color: "#b6c2ff" }}
            >
              Normas de Convivencia
            </Link>
            <a
              href="https://www.gamejamplus.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
              style={{ color: "#b6c2ff" }}
            >
              Game Jam Plus
            </a>
          </div>

          <p className="text-xs md:order-2" style={{ color: "#b6c2ff" }}>© 2026 Paraná Game Jam.</p>
        </div>
      </footer>
      </div>
    </>
  );
}

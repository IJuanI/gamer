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
    dot("absolute top-1/3 right-1/4 w-3 h-3 rounded-full animate-pulse-glow", { backgroundColor: "#3cff9e" }),
    dot("absolute bottom-1/3 left-1/4 w-3 h-3 rounded-full animate-pulse", { backgroundColor: "#8b6cff" }),
    dot("absolute top-1/2 left-10 w-2 h-2 rounded-full animate-ping", { backgroundColor: "#1ecf7a" }),
    dot("absolute bottom-1/4 right-1/3 w-2 h-2 rounded-full animate-ping", { backgroundColor: "#7d51fb", animationDelay: "0.5s" }),
    icon(Gamepad2, "absolute top-1/4 right-20 w-8 h-8 animate-float", { color: "rgba(139, 108, 255, 0.2)" }),
    icon(Zap, "absolute bottom-1/3 left-20 w-6 h-6 animate-float", { color: "rgba(60, 255, 158, 0.2)", animationDelay: "1s" }),
    icon(Gamepad, "absolute top-2/3 right-1/4 w-7 h-7 animate-float", { color: "rgba(60, 255, 158, 0.15)", animationDelay: "1.5s" }),
    icon(Hexagon, "absolute top-10 right-1/3 w-10 h-10 animate-float", { color: "rgba(139, 108, 255, 0.15)", animationDelay: "0.75s" }),
    icon(Hexagon, "absolute bottom-10 left-1/3 w-6 h-6 animate-float", { color: "rgba(60, 255, 158, 0.12)", animationDelay: "2s" }),
    icon(Zap, "absolute top-1/2 right-10 w-5 h-5 animate-float", { color: "rgba(139, 108, 255, 0.18)", animationDelay: "0.25s" }),
    box("absolute top-1/4 left-1/3 w-24 h-24 border rotate-12 opacity-20", { borderColor: "rgba(60, 255, 158, 0.15)" }, false),
    box("absolute bottom-1/4 right-1/4 w-20 h-20 border rotate-45 opacity-20", { borderColor: "rgba(139, 108, 255, 0.15)" }, false),
    dot("absolute top-16 left-1/2 w-2 h-2 rounded-full animate-pulse", { backgroundColor: "#3cff9e", animationDelay: "0.3s" }),
    dot("absolute bottom-16 left-16 w-2 h-2 rounded-full animate-ping", { backgroundColor: "#8b6cff", animationDelay: "1.2s" }),
    dot("absolute top-2/3 right-16 w-1.5 h-1.5 rounded-full animate-pulse-glow", { backgroundColor: "#1ecf7a" }),
    // upper-left coverage
    icon(Hexagon, "absolute top-[6%] left-[8%] w-8 h-8 animate-float", { color: "rgba(60, 255, 158, 0.15)", animationDelay: "0.6s" }),
    icon(Gamepad2, "absolute top-[22%] left-[18%] w-5 h-5 animate-float", { color: "rgba(139, 108, 255, 0.16)", animationDelay: "1.3s" }),
    dot("absolute top-[14%] left-[28%] w-2 h-2 rounded-full animate-ping", { backgroundColor: "#3cff9e", animationDelay: "0.9s" }),
    box("absolute top-[4%] left-[22%] w-16 h-16 border rotate-[18deg] opacity-15", { borderColor: "rgba(139, 108, 255, 0.15)" }, false),
  ],
  [
    box("absolute top-24 right-16 w-40 h-40 border rotate-12 opacity-25", { borderColor: "rgba(60, 255, 158, 0.2)" }, false),
    box("absolute bottom-24 left-12 w-32 h-32 border rotate-45 opacity-25", { borderColor: "rgba(139, 108, 255, 0.2)" }, false),
    dot("absolute top-1/4 left-1/3 w-2 h-2 rounded-full animate-pulse-glow", { backgroundColor: "#8b6cff" }),
    dot("absolute bottom-1/4 right-1/3 w-3 h-3 rounded-full animate-pulse", { backgroundColor: "#3cff9e" }),
    dot("absolute top-2/3 left-16 w-2 h-2 rounded-full animate-ping", { backgroundColor: "#7d51fb", animationDelay: "0.4s" }),
    dot("absolute bottom-1/2 right-14 w-2 h-2 rounded-full animate-ping", { backgroundColor: "#1ecf7a", animationDelay: "0.9s" }),
    icon(Hexagon, "absolute top-1/3 right-24 w-9 h-9 animate-float", { color: "rgba(139, 108, 255, 0.18)" }),
    icon(Gamepad2, "absolute bottom-1/3 right-1/4 w-6 h-6 animate-float", { color: "rgba(60, 255, 158, 0.16)", animationDelay: "1.1s" }),
    icon(Zap, "absolute top-1/2 left-1/4 w-5 h-5 animate-float", { color: "rgba(60, 255, 158, 0.2)", animationDelay: "0.6s" }),
    icon(Gamepad, "absolute bottom-16 left-1/3 w-7 h-7 animate-float", { color: "rgba(139, 108, 255, 0.15)", animationDelay: "1.8s" }),
    box("absolute top-[40%] right-[10%] w-20 h-20 border rotate-[8deg] opacity-20", { borderColor: "rgba(60, 255, 158, 0.15)" }, false),
    box("absolute bottom-[15%] right-[38%] w-24 h-24 border rotate-[30deg] opacity-15", { borderColor: "rgba(139, 108, 255, 0.15)" }, false),
    dot("absolute top-[55%] left-[45%] w-1.5 h-1.5 rounded-full animate-pulse", { backgroundColor: "#3cff9e", animationDelay: "0.3s" }),
    dot("absolute bottom-[10%] left-[20%] w-2 h-2 rounded-full animate-pulse-glow", { backgroundColor: "#8b6cff" }),
    icon(Zap, "absolute top-[70%] right-[15%] w-4 h-4 animate-float", { color: "rgba(139, 108, 255, 0.18)", animationDelay: "2.2s" }),
    // upper-left coverage
    icon(Gamepad, "absolute top-[8%] left-[10%] w-7 h-7 animate-float", { color: "rgba(60, 255, 158, 0.16)", animationDelay: "0.5s" }),
    icon(Zap, "absolute top-[18%] left-[24%] w-5 h-5 animate-float", { color: "rgba(139, 108, 255, 0.18)", animationDelay: "1.4s" }),
    dot("absolute top-[10%] left-[34%] w-2 h-2 rounded-full animate-pulse", { backgroundColor: "#1ecf7a", animationDelay: "0.7s" }),
    box("absolute top-[2%] left-[6%] w-20 h-20 border rotate-[35deg] opacity-15", { borderColor: "rgba(60, 255, 158, 0.15)" }, false),
  ],
  [
    box("absolute top-16 left-1/4 w-28 h-28 border rotate-[20deg] opacity-25", { borderColor: "rgba(139, 108, 255, 0.2)" }, false),
    box("absolute bottom-16 right-1/4 w-36 h-36 border rotate-[15deg] opacity-25", { borderColor: "rgba(60, 255, 158, 0.2)" }, false),
    dot("absolute top-1/2 right-1/3 w-2 h-2 rounded-full animate-pulse", { backgroundColor: "#3cff9e" }),
    dot("absolute bottom-1/2 left-1/3 w-3 h-3 rounded-full animate-pulse-glow", { backgroundColor: "#8b6cff" }),
    dot("absolute top-1/4 right-12 w-2 h-2 rounded-full animate-ping", { backgroundColor: "#1ecf7a", animationDelay: "0.6s" }),
    dot("absolute bottom-1/4 left-12 w-2 h-2 rounded-full animate-ping", { backgroundColor: "#7d51fb", animationDelay: "1.1s" }),
    icon(Zap, "absolute top-1/3 left-16 w-6 h-6 animate-float", { color: "rgba(60, 255, 158, 0.18)" }),
    icon(Gamepad2, "absolute bottom-1/3 right-16 w-8 h-8 animate-float", { color: "rgba(139, 108, 255, 0.18)", animationDelay: "0.9s" }),
    icon(Hexagon, "absolute top-2/3 right-1/3 w-7 h-7 animate-float", { color: "rgba(60, 255, 158, 0.14)", animationDelay: "1.6s" }),
    icon(Gamepad, "absolute bottom-[8%] left-[45%] w-6 h-6 animate-float", { color: "rgba(139, 108, 255, 0.16)", animationDelay: "0.3s" }),
    box("absolute top-[45%] left-[8%] w-16 h-16 border rotate-[10deg] opacity-20", { borderColor: "rgba(60, 255, 158, 0.15)" }, false),
    box("absolute bottom-[42%] right-[6%] w-24 h-24 border rotate-[25deg] opacity-15", { borderColor: "rgba(139, 108, 255, 0.15)" }, false),
    dot("absolute top-[80%] right-[30%] w-1.5 h-1.5 rounded-full animate-pulse-glow", { backgroundColor: "#1ecf7a" }),
    icon(Zap, "absolute bottom-[60%] left-[55%] w-5 h-5 animate-float", { color: "rgba(60, 255, 158, 0.2)", animationDelay: "1.9s" }),
    // upper-left coverage
    icon(Hexagon, "absolute top-[10%] left-[12%] w-9 h-9 animate-float", { color: "rgba(139, 108, 255, 0.16)", animationDelay: "0.4s" }),
    icon(Gamepad2, "absolute top-[26%] left-[6%] w-6 h-6 animate-float", { color: "rgba(60, 255, 158, 0.18)", animationDelay: "1.2s" }),
    dot("absolute top-[18%] left-[22%] w-2 h-2 rounded-full animate-ping", { backgroundColor: "#8b6cff", animationDelay: "0.8s" }),
    box("absolute top-[4%] left-[30%] w-14 h-14 border rotate-[5deg] opacity-15", { borderColor: "rgba(60, 255, 158, 0.15)" }, false),
  ],
];

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
  const [distribution] = useState(() => BG_DISTRIBUTIONS[Math.floor(Math.random() * BG_DISTRIBUTIONS.length)]);
  const [lerpedScrollY, setLerpedScrollY] = useState(0);
  const scrollYRef = useRef(0);
  const lerpRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let frameId: number;
    const lerp = () => {
      const target = scrollYRef.current;
      const current = lerpRef.current;
      const nextVal = current + (target - current) * 0.1; // 10% interpolation per frame
      lerpRef.current = nextVal;
      setLerpedScrollY(nextVal);
      frameId = requestAnimationFrame(lerp);
    };
    frameId = requestAnimationFrame(lerp);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <>
      <SiteNav />

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

        {/* Static background elements (anchoring layer) — only boxes stay still */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {distribution.map((el, i) => {
            const isStatic = el.kind === "box" && el.parallax === false;
            if (isStatic) {
              return <div key={`static-${i}`} className={el.className} style={el.style} />;
            }
            return null;
          })}
        </div>

        {/* Parallax background elements (lags behind scroll with lerp smoothing) — icons and dots move */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ transform: `translateY(${lerpedScrollY * -0.15}px)` }}
        >
          {distribution.map((el, i) => {
            const isParallax = el.kind === "icon" || el.kind === "dot" || el.parallax !== false;
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
        <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-28 text-center">
          {/* Official Paraná Game Jam mark */}
          <div className="mb-6 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/jam/logo.svg" alt="Global Game Jam" className="animate-float-rotate h-16 sm:h-20 w-auto" />
          </div>

          <span
            className="animate-fade-up inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border"
            style={{
              borderColor: "rgba(139, 108, 255, 0.3)",
              backgroundColor: "rgba(18, 24, 45, 0.5)",
              color: "#b6c2ff",
            }}
          >
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: "#3cff9e" }} />
            Global Game Jam 2026 · Sede Paraná
          </span>

          <h1 className="animate-fade-up delay-100 font-oxanium mt-4 text-5xl leading-tight font-extrabold tracking-tight sm:text-7xl">
            <span style={{ color: "#3cff9e", textShadow: "0 0 8px rgba(60, 255, 158, 0.3), 0 0 16px rgba(60, 255, 158, 0.15)" }}>Paraná</span>{" "}
            <span style={{ color: "#8b6cff", textShadow: "0 0 8px rgba(139, 108, 255, 0.3), 0 0 16px rgba(139, 108, 255, 0.15)" }}>Game</span>{" "}
            <span style={{ color: "#ffffff" }}>Jam</span>
          </h1>

          <p className="animate-fade-up delay-200 mx-auto mt-7 max-w-2xl text-lg" style={{ color: "#b6c2ff" }}>
            Únete a 48 horas de puro desarrollo de videojuegos. Crea, colabora e innova con creativos de todo el mundo.
            Sin importar tu experiencia, hay un lugar para vos.
          </p>

          {/* Info cards — secondary filled, secondary outlined (matching source) */}
          <div className="animate-fade-up delay-250 mx-auto mt-8 flex flex-wrap items-center justify-center gap-3">
            <span
              className="rounded-md px-4 py-2 text-sm font-semibold uppercase tracking-wide"
              style={{ backgroundColor: "#8b6cff", color: "#ffffff" }}
            >
              Inicio 16 HS
            </span>
            <span
              className="rounded-md border px-4 py-2 text-sm font-semibold uppercase tracking-wide"
              style={{ borderColor: "#8b6cff", color: "#8b6cff" }}
            >
              Lugar: MiradorTec
            </span>
          </div>

          <div className="animate-fade-up delay-300 mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/registro"
              className="group flex items-center gap-2 rounded-lg px-7 py-3.5 font-semibold transition-transform hover:scale-105"
              style={{
                backgroundColor: "#3cff9e",
                color: "#0b1020",
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
                backgroundColor: "transparent",
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
                className="relative p-6 border backdrop-blur-sm overflow-hidden rounded"
                style={{
                  backgroundColor: "rgba(18, 24, 45, 0.5)",
                  borderColor: "rgba(139, 108, 255, 0.25)",
                  borderWidth: "1px",
                  position: "relative",
                }}
              >
                {/* Corner brackets styling */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "20px",
                    height: "20px",
                    borderTop: "2px solid #8b6cff",
                    borderLeft: "2px solid #8b6cff",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "20px",
                    height: "20px",
                    borderTop: "2px solid #8b6cff",
                    borderRight: "2px solid #8b6cff",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "20px",
                    height: "20px",
                    borderBottom: "2px solid #3cff9e",
                    borderLeft: "2px solid #3cff9e",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: "20px",
                    height: "20px",
                    borderBottom: "2px solid #3cff9e",
                    borderRight: "2px solid #3cff9e",
                  }}
                />
                <div className="relative z-10 text-center">
                  <div className="font-extrabold text-4xl" style={{ color: "#3cff9e" }}>
                    {s.value}
                  </div>
                  <div className="mt-2 text-xs uppercase tracking-wider font-semibold" style={{ color: "#8b6cff" }}>
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
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

      <section id="features" className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            <span style={{ color: "#3cff9e", textShadow: "0 0 15px rgba(60, 255, 158, 0.5)" }}>
              Qué encontrás
            </span>{" "}
            <span style={{ color: "#ffffff" }}>
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
            return (
              <div
                key={f.title}
                className={`animate-fade-up delay-${(i + 1) * 100} group relative rounded-lg border p-7 backdrop-blur-sm transition-all duration-300 hover:border-primary/50`}
                style={{
                  backgroundColor: "rgba(18, 24, 45, 0.5)",
                  borderColor: "rgba(139, 108, 255, 0.2)",
                }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-lg transition-colors duration-300 group-hover:bg-primary/20"
                  style={{
                    backgroundColor: "rgba(139, 108, 255, 0.2)",
                  }}
                >
                  <Icon
                    className="h-6 w-6 transition-colors duration-300 group-hover:text-primary"
                    style={{ color: "#8b6cff" }}
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

        {/* Static background elements — only boxes stay still */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {distribution.map((el, i) => {
            const isStatic = el.kind === "box" && el.parallax === false;
            if (isStatic) {
              return <div key={`community-static-${i}`} className={el.className} style={el.style} />;
            }
            return null;
          })}
        </div>

        {/* Parallax background elements — icons and dots move */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ transform: `translateY(${lerpedScrollY * -0.15}px)` }}
        >
          {distribution.map((el, i) => {
            const isParallax = el.kind === "icon" || el.kind === "dot" || el.parallax !== false;
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
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <Gamepad
            className="mx-auto h-10 w-10 animate-float"
            style={{
              color: "#3cff9e",
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
            className="mt-9 inline-flex items-center gap-2 rounded-lg px-8 py-4 font-semibold transition-transform hover:scale-105"
            style={{
              backgroundColor: "#3cff9e",
              color: "#0b1020",
            }}
          >
            <Gamepad2 className="h-5 w-5" />
            Crear mi cuenta
          </Link>
        </div>
        </section>
      </div>

      <footer className="border-t py-8 text-center text-sm" style={{ borderColor: "rgba(60, 255, 158, 0.1)", color: "#b6c2ff" }}>
        <span className="font-extrabold" style={{ color: "#3cff9e" }}>
          Paraná Game Jam
        </span>{" "}
        · Global Game Jam 2026 · Entre Ríos, Argentina
      </footer>
    </>
  );
}

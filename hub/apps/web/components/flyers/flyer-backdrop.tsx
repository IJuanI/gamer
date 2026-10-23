import { Gamepad2, Hexagon, Zap } from "lucide-react";
import type { CSSProperties } from "react";
import type { FlyerBrandTokens } from "@/lib/flyer-brands";
import { BG_LAYER, type FlyerBackground } from "@/lib/flyer-kinds";
import { useStoryMotion } from "@/components/flyers/story-motion";

/** Shared keyframes for the flyer motion. Motion only shows in the preview; PNG export is static. */
export function FlyerKeyframes() {
  return (
    <style>{`
      @keyframes flyer-pulse { 0%, 100% { opacity: 0.6 } 50% { opacity: 1 } }
      @keyframes flyer-float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
      @keyframes flyer-float-rotate { 0%, 100% { transform: translateY(0) rotate(10deg) } 50% { transform: translateY(-10px) rotate(-5deg) } }
      @keyframes flyer-scan { from { transform: translateY(-10%) } to { transform: translateY(110%) } }
      .flyer-pulse { animation: flyer-pulse 2s ease-in-out infinite; }
      .flyer-float { animation: flyer-float 3.5s ease-in-out infinite; }
      .flyer-float-rotate { animation: flyer-float-rotate 3s ease-in-out infinite; }
      .flyer-scan { animation: flyer-scan 8s linear infinite; }
    `}</style>
  );
}

interface BackdropProps {
  brand: FlyerBrandTokens;
  width: number;
  height: number;
  u: number;
  background?: FlyerBackground;
}

/**
 * Background for every flyer. "clasico" is the brand's own motif. The other options are
 * shared patterns in the brand's colours. In the video, the backdrop drifts at its own speed
 * (parallax), the same idea as the /jam scroll layers.
 */
export function FlyerBackdrop({ brand, width, height, u, background = "clasico" }: BackdropProps) {
  const motion = useStoryMotion();
  const layers =
    background === "clasico" ? <ClassicBackdrop brand={brand} width={width} height={height} u={u} /> : <PatternBackdrop brand={brand} u={u} kind={background} />;

  // Always one tagged wrapper, so the design-elements export can pick up the decoration.
  // A bounded sway, so the backdrop never drifts past its extra margin and shows an edge.
  const drift = motion?.effects.includes("paralaje")
    ? `translateY(${Math.sin((motion.local / 1000) * Math.PI * 0.8) * 110 * u}px)`
    : undefined;
  return (
    <div
      data-export-layer={BG_LAYER}
      className="absolute"
      style={{ top: "-14%", bottom: "-14%", left: "-14%", right: "-14%", transform: drift }}
    >
      {layers}
    </div>
  );
}

function PatternBackdrop({ brand, u, kind }: { brand: FlyerBrandTokens; u: number; kind: Exclude<FlyerBackground, "clasico"> }) {
  const a = brand.accent;
  const b = brand.accentAlt;
  const fade = {
    maskImage: "radial-gradient(ellipse 85% 70% at 50% 40%, black 25%, transparent 80%)",
    WebkitMaskImage: "radial-gradient(ellipse 85% 70% at 50% 40%, black 25%, transparent 80%)",
  } as const;

  switch (kind) {
    case "grilla":
      return (
        <div
          className="flyer-pulse absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${brand.grid} ${1 * u}px, transparent ${1 * u}px), linear-gradient(90deg, ${brand.grid} ${1 * u}px, transparent ${1 * u}px)`,
            backgroundSize: `${60 * u}px ${60 * u}px`,
            ...fade,
          }}
        />
      );
    case "resplandor":
      return (
        <>
          <div
            className="flyer-pulse absolute inset-0"
            style={{ background: `radial-gradient(ellipse 70% 50% at 50% 18%, ${a}33, transparent)` }}
          />
          <div
            className="flyer-pulse absolute inset-0"
            style={{ background: `radial-gradient(ellipse 80% 45% at 50% 100%, ${b}2a, transparent)`, animationDelay: "-1s" }}
          />
        </>
      );
    case "anillos":
      return (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-radial-gradient(circle at 50% 32%, ${a} 0 ${1.5 * u}px, transparent ${1.5 * u}px ${56 * u}px)`,
              opacity: 0.22,
              ...fade,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-radial-gradient(circle at 88% 88%, ${b} 0 ${1.5 * u}px, transparent ${1.5 * u}px ${44 * u}px)`,
              opacity: 0.18,
              ...fade,
            }}
          />
        </>
      );
    case "puntos":
      return (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, ${a} ${2.5 * u}px, transparent ${2.5 * u}px), radial-gradient(circle, ${b} ${1.5 * u}px, transparent ${1.5 * u}px)`,
            backgroundSize: `${96 * u}px ${96 * u}px, ${64 * u}px ${64 * u}px`,
            backgroundPosition: `0 0, ${32 * u}px ${32 * u}px`,
            opacity: 0.35,
            ...fade,
          }}
        />
      );
    case "escaneo":
      return (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(${a}66 ${2 * u}px, transparent ${2 * u}px), linear-gradient(90deg, ${a}66 ${2 * u}px, transparent ${2 * u}px)`,
              backgroundSize: `${80 * u}px ${80 * u}px`,
              ...fade,
            }}
          />
          <div
            className="flyer-scan absolute inset-x-0"
            style={{
              top: 0,
              height: 260 * u,
              background: `linear-gradient(transparent, ${a}40 70%, ${a}cc 98%, transparent)`,
            }}
          />
        </>
      );
    case "tablero":
      return (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `conic-gradient(${a} 25%, transparent 0 50%, ${a} 0 75%, transparent 0)`,
            backgroundSize: `${120 * u}px ${120 * u}px`,
            opacity: 0.14,
            ...fade,
          }}
        />
      );
    case "ondas":
      return (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-radial-gradient(circle at 50% 100%, ${a} 0 ${2 * u}px, transparent ${2 * u}px ${70 * u}px)`,
            opacity: 0.3,
            ...fade,
          }}
        />
      );
    case "burbujas":
      return (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: [
              `radial-gradient(circle at 18% 22%, ${a}40 0 ${130 * u}px, transparent ${131 * u}px)`,
              `radial-gradient(circle at 84% 46%, ${b}36 0 ${170 * u}px, transparent ${171 * u}px)`,
              `radial-gradient(circle at 30% 82%, ${a}2e 0 ${210 * u}px, transparent ${211 * u}px)`,
              `radial-gradient(circle at 76% 90%, ${b}2a 0 ${95 * u}px, transparent ${96 * u}px)`,
            ].join(", "),
          }}
        />
      );
    case "cinta":
      return (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(-45deg, ${a} 0 ${40 * u}px, transparent ${40 * u}px ${80 * u}px)`,
            opacity: 0.12,
          }}
        />
      );
  }
}

/**
 * Brand-specific motifs, copied from each landing page.
 * GamER: purple radial glow behind the headline, a grid that fades out from the centre, scattered dots.
 * GameDevs: no grid and no radial glow. Only a faint green diagonal wash.
 * Jam: full HUD field, hairline grid, bleeding rings, floating hexagons and gamepads, scanline sweep.
 */
function ClassicBackdrop({ brand, width, height, u }: { brand: FlyerBrandTokens; width: number; height: number; u: number }) {
  if (brand.id === "gamer") {
    return (
      <>
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 60% 45% at 50% 30%, rgba(179,57,196,0.18), transparent)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${brand.grid} ${1 * u}px, transparent ${1 * u}px), linear-gradient(90deg, ${brand.grid} ${1 * u}px, transparent ${1 * u}px)`,
            backgroundSize: `${44 * u}px ${44 * u}px`,
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 75%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.1,
            backgroundImage: `radial-gradient(circle, #B339C4 ${2 * u}px, transparent ${2 * u}px), radial-gradient(circle, #84C552 ${1.5 * u}px, transparent ${1.5 * u}px)`,
            backgroundSize: `${120 * u}px ${120 * u}px, ${80 * u}px ${80 * u}px`,
            backgroundPosition: `0 0, ${40 * u}px ${40 * u}px`,
          }}
        />
        <div
          className="flyer-pulse absolute rounded-full"
          style={{
            bottom: -height * 0.12,
            left: -width * 0.2,
            width: width * 0.7,
            height: width * 0.7,
            background: "radial-gradient(circle, rgba(132,197,82,0.1), transparent 65%)",
          }}
        />
      </>
    );
  }

  if (brand.id === "gamedevs") {
    return (
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom right, transparent 0%, transparent 60%, rgba(114,179,65,0.05) 100%)" }}
      />
    );
  }

  // Jam: HUD field with rings, floating icons, pulsing dots and the scanline sweep.
  const ring = (extra: CSSProperties): CSSProperties => ({ position: "absolute", borderRadius: "9999px", ...extra });
  const hex = (color: string, size: number, pos: CSSProperties, delay = 0): CSSProperties => ({
    position: "absolute",
    width: size * u,
    height: size * u,
    color,
    animationDelay: `${delay}s`,
    ...pos,
  });
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${brand.grid} ${1.5 * u}px, transparent ${1.5 * u}px), linear-gradient(90deg, ${brand.grid} ${1.5 * u}px, transparent ${1.5 * u}px)`,
          backgroundSize: `${80 * u}px ${80 * u}px`,
        }}
      />
      <div style={ring({ top: -width * 0.45, left: -width * 0.5, width: width * 1.15, height: width * 1.15, border: `${2 * u}px solid rgba(60,255,158,0.25)` })} />
      <div style={ring({ bottom: -width * 0.55, right: -width * 0.4, width: width * 1.3, height: width * 1.3, border: `${2 * u}px solid rgba(139,108,255,0.25)` })} />
      <Hexagon className="flyer-float absolute" style={hex("rgba(139,108,255,0.3)", 64, { top: "5%", left: "8%" })} />
      <Hexagon className="flyer-float absolute" style={hex("rgba(60,255,158,0.28)", 52, { top: "63%", right: "8%" }, 1)} />
      <Hexagon className="flyer-float absolute" style={hex("rgba(139,108,255,0.24)", 40, { bottom: "6%", left: "14%" }, 2)} />
      <Gamepad2 className="flyer-float-rotate absolute" style={hex("rgba(60,255,158,0.3)", 46, { top: "16%", right: "10%" })} />
      <Zap className="flyer-float absolute" style={hex("rgba(60,255,158,0.3)", 34, { top: "9%", right: "26%" }, 0.5)} />
      <Zap className="flyer-float absolute" style={hex("rgba(139,108,255,0.3)", 28, { bottom: "10%", right: "30%" }, 1.5)} />
      <div className="flyer-pulse absolute rounded-full" style={{ top: "24%", right: "22%", width: 14 * u, height: 14 * u, backgroundColor: "#3cff9e", opacity: 0.6 }} />
      <div className="flyer-pulse absolute rounded-full" style={{ bottom: "34%", left: "10%", width: 10 * u, height: 10 * u, backgroundColor: "#3cff9e", opacity: 0.5 }} />
      <div className="flyer-pulse absolute rounded-full" style={{ top: "55%", left: "20%", width: 12 * u, height: 12 * u, backgroundColor: "#8b6cff", opacity: 0.5 }} />
      <div
        className="flyer-scan absolute inset-x-0"
        style={{ top: 0, height: 120 * u, background: "linear-gradient(transparent, rgba(60,255,158,0.08), transparent)" }}
      />
    </>
  );
}

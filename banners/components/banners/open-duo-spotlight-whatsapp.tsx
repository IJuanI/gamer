"use client";

import type { EventData, AccentColor } from "@/lib/event-data";
import { ACCENT_RGBA, ACCENT_HEX } from "@/lib/event-data";
import {
  GamepadIcon,
  GemIcon,
  CrosshairIcon,
  ShieldIcon,
  SwordIcon,
} from "./gaming-icons";
import { DEFAULT_VARIATION, type BannerVariation } from "@/lib/variation";

/**
 * Open Duo — Spotlight WhatsApp — 1080×1080 (1:1 square)
 * Safe zone: 60px all sides
 *
 * Per-game spotlight banner optimized for WhatsApp group sharing.
 */

interface GameSpotlightProps {
  event: EventData;
  game: {
    name: string;
    shortName: string;
    format: string;
    teams: string;
    schedule: string;
    caster?: string;
    accent: AccentColor;
  };
}

export function OpenDuoSpotlightWhatsApp({ event, game, variation = DEFAULT_VARIATION }: GameSpotlightProps & { variation?: BannerVariation }) {
  const [rot1, rot2, rot3] = variation.rotationOffsets;
  const [s1, s2, s3] = variation.positionSeeds;
  const [d1, d2, d3] = variation.decoratorSeeds;
  const lp = (s: number, lo: number, hi: number) => Math.round(lo + s * (hi - lo));
  const cv = variation.clipVariance;
  const isLoL = game.shortName === "LOL";
  const isCS2 = game.shortName === "CS2";
  const accent = ACCENT_RGBA[game.accent];
  const accentText = ACCENT_HEX[game.accent];

  return (
    <div
      className="banner-frame relative"
      style={{ width: 1080, height: 1080, background: "#1c1435" }}
    >
      {/* ===== Background layers ===== */}
      <div className="absolute inset-0 bg-grid-neon-fade" />

      {/* Angular color block */}
      <div
        className="absolute"
        style={{
          top: 0,
          left: 0,
          width: "100%",
          height: 350,
          background: `linear-gradient(180deg, ${accent}0.14), transparent)`,
          clipPath: `polygon(0 0, 100% 0, 100% ${65 + cv}%, 0 100%)`,
        }}
      />

      {/* Bottom gradient block */}
      <div
        className="absolute"
        style={{
          bottom: 0,
          left: 0,
          width: "100%",
          height: 300,
          background: `linear-gradient(0deg, ${accent}0.08), transparent)`,
          clipPath: "polygon(0 35%, 100% 0, 100% 100%, 0 100%)",
        }}
      />

      {/* Trapezoid */}
      <div
        className="absolute"
        style={{
          bottom: 0,
          right: 0,
          width: lp(d3, 120, 200),
          height: lp(d3, 180, 300),
          background: `${accent}0.1)`,
          clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)",
        }}
      />

      {/* Circular ring accents */}
      <div
        className="absolute"
        style={{
          top: lp(d1, 60, 160),
          right: lp(d1, 10, 60),
          width: lp(d1, 200, 300),
          height: lp(d1, 200, 300),
          borderRadius: "50%",
          border: `2px solid ${accent}0.16)`,
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: lp(d2, 50, 130),
          left: lp(d2, 0, 50),
          width: lp(d2, 160, 260),
          height: lp(d2, 160, 260),
          borderRadius: "50%",
          border: `2px solid ${accent}0.12)`,
        }}
      />

      {/* Dots */}
      <div
        className="absolute"
        style={{
          top: lp(d1, 50, 130),
          left: lp(d1, 30, 100),
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: `${accent}0.3)`,
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: lp(d2, 70, 150),
          right: lp(d2, 40, 110),
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: `${accent}0.22)`,
        }}
      />

      {/* ===== Gaming iconography ===== */}
      {isLoL ? (
        <>
          <ShieldIcon
            size={80}
            color={`${accent}0.2)`}
            style={{ top: lp(s1, 160, 380), right: lp(s1, 20, 200), transform: `rotate(${10 + rot1}deg)` }}
          />
          <GemIcon
            size={60}
            color={`${accent}0.16)`}
            style={{ bottom: lp(s2, 100, 320), left: lp(s2, 20, 200), transform: `rotate(${8 + rot2}deg)` }}
          />
        </>
      ) : isCS2 ? (
        <>
          <CrosshairIcon
            size={90}
            color={`${accent}0.2)`}
            style={{ bottom: lp(s1, 130, 380), right: lp(s1, 15, 180), transform: `rotate(${rot1}deg)` }}
          />
          <GamepadIcon
            size={80}
            color={`${accent}0.18)`}
            style={{ top: lp(s2, 120, 340), left: lp(s2, 15, 180), transform: `rotate(${-12 + rot2}deg)` }}
          />
        </>
      ) : (
        /* Rocket League */
        <>
          <GamepadIcon
            size={80}
            color={`${accent}0.2)`}
            style={{ top: lp(s1, 160, 380), right: lp(s1, 20, 200), transform: `rotate(${-10 + rot1}deg)` }}
          />
          <SwordIcon
            size={70}
            color={`${accent}0.18)`}
            style={{ bottom: lp(s2, 100, 320), left: lp(s2, 20, 200), transform: `rotate(${12 + rot2}deg)` }}
          />
          <GemIcon
            size={60}
            color={`${accent}0.16)`}
            style={{ top: lp(s3, 420, 660), left: lp(s3, 25, 200), transform: `rotate(${-8 + rot3}deg)` }}
          />
        </>
      )}

      {/* HUD accent bar */}
      <div
        className="absolute"
        style={{
          top: 240,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, ${accent}0.5), ${accent}0.1) 30%, transparent 50%, ${accent}0.1) 70%, ${accent}0.4))`,
        }}
      />

      {/* ===== Content ===== */}
      <div
        className="relative flex flex-col items-center justify-center h-full"
        style={{ padding: "60px", textAlign: "center" }}
      >
        {/* Logo + Date */}
        <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
          <img
            src="/logo.png"
            alt="GamER"
            style={{ height: 90, width: "auto" }}
          />
          <span
            className="font-azonix"
            style={{
              fontSize: 28,
              color: "#96D068",
              letterSpacing: "0.1em",
            }}
          >
            {event.date.toUpperCase()}
          </span>
        </div>

        {/* Game badge */}
        <div
          className="panel-clip-sm font-azonix"
          style={{
            padding: "14px 32px",
            background: `${accent}0.12)`,
            border: `1px solid ${accent}0.35)`,
            fontSize: 26,
            color: accentText,
            letterSpacing: "0.12em",
            marginBottom: 12,
          }}
        >
          TORNEO {game.shortName}
        </div>

        {/* Game name */}
        <h1
          className="font-azonix leading-none"
          style={{
            fontSize: 128,
            color: "#E8E8F0",
            textShadow: isLoL
              ? "0 0 40px rgba(179,57,196,0.35), 0 0 80px rgba(179,57,196,0.1)"
              : "0 0 40px rgba(132,197,82,0.35), 0 0 80px rgba(132,197,82,0.1)",
            margin: "8px 0 12px 0",
          }}
        >
          {game.name.split(" ")[0]}
        </h1>

        {/* Format */}
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              width: 30,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${accent}0.5))`,
              margin: "0 auto 8px",
            }}
          />
          <span
            className="font-azonix"
            style={{
              fontSize: 60,
              color: accentText,
              letterSpacing: "0.12em",
            }}
          >
            {game.format}
          </span>
        </div>

        {/* Details panel */}
        <div
          className="panel-clip relative"
          style={{
            marginTop: 8,
            padding: "20px 32px",
            background: `${accent}0.05)`,
            border: `1px solid ${accent}0.22)`,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            minWidth: 560,
          }}
        >
          <div className="hud-bracket-tl" />
          <div className="hud-bracket-br" />
          <div className="flex items-center justify-between" style={{ gap: 24 }}>
            <span className="font-azonix" style={{ fontSize: 18, color: "#B490C4", letterSpacing: "0.14em" }}>EQUIPOS</span>
            <span style={{ fontSize: 26, color: "#E8E8F0", fontWeight: 600 }}>{game.teams}</span>
          </div>
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${accent}0.25), transparent)` }} />
          <div className="flex items-center justify-between" style={{ gap: 24 }}>
            <span className="font-azonix" style={{ fontSize: 18, color: "#B490C4", letterSpacing: "0.14em" }}>HORARIO</span>
            <span style={{ fontSize: 26, color: "#E8E8F0", fontWeight: 600 }}>{game.schedule}</span>
          </div>
          {game.caster && (
            <>
              <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${accent}0.25), transparent)` }} />
              <div className="flex items-center justify-between" style={{ gap: 24 }}>
                <span className="font-azonix" style={{ fontSize: 18, color: "#B490C4", letterSpacing: "0.14em" }}>CASTER</span>
                <span style={{ fontSize: 26, color: "#E8E8F0", fontWeight: 600 }}>{game.caster}</span>
              </div>
            </>
          )}
        </div>

        {/* Bottom badges */}
        <div className="flex gap-3" style={{ marginTop: 18, justifyContent: "center" }}>
          <div
            className="panel-clip-sm font-azonix"
            style={{
              padding: "16px 34px",
              background: "rgba(132,197,82,0.12)",
              border: "1px solid rgba(132,197,82,0.4)",
              fontSize: 30,
              color: "#96D068",
              textShadow: "0 0 20px rgba(132,197,82,0.25)",
              letterSpacing: "0.04em",
            }}
          >
            {event.entryFee}
          </div>
          <div
            className="panel-clip-sm font-azonix"
            style={{
              padding: "16px 34px",
              background: "rgba(179,57,196,0.12)",
              border: "1px solid rgba(179,57,196,0.4)",
              fontSize: 30,
              color: "#C06DD0",
              textShadow: "0 0 20px rgba(179,57,196,0.25)",
              letterSpacing: "0.08em",
            }}
          >
            INSCRÍBETE
          </div>
        </div>
      </div>

      {/* ===== Corner brackets ===== */}
      <div
        className="absolute"
        style={{
          top: 20,
          left: 20,
          width: 40,
          height: 40,
          borderTop: `3px solid ${accent}0.5)`,
          borderLeft: `3px solid ${accent}0.5)`,
        }}
      />
      <div
        className="absolute"
        style={{
          top: 20,
          right: 20,
          width: 40,
          height: 40,
          borderTop: `3px solid ${accent}0.5)`,
          borderRight: `3px solid ${accent}0.5)`,
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 20,
          left: 20,
          width: 40,
          height: 40,
          borderBottom: `3px solid ${accent}0.5)`,
          borderLeft: `3px solid ${accent}0.5)`,
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 20,
          right: 20,
          width: 40,
          height: 40,
          borderBottom: `3px solid ${accent}0.5)`,
          borderRight: `3px solid ${accent}0.5)`,
        }}
      />
    </div>
  );
}

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
 * Open Duo — Spotlight Story — 1080×1920 (9:16)
 * Safe zone: 250px top/bottom
 *
 * Per-game spotlight banner in portrait format.
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

export function OpenDuoSpotlightStory({ event, game, variation = DEFAULT_VARIATION }: GameSpotlightProps & { variation?: BannerVariation }) {
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
      style={{ width: 1080, height: 1920, background: "#1c1435" }}
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
          height: 600,
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
          height: 450,
          background: `linear-gradient(0deg, ${accent}0.08), transparent)`,
          clipPath: "polygon(0 35%, 100% 0, 100% 100%, 0 100%)",
        }}
      />

      {/* Trapezoid */}
      <div
        className="absolute"
        style={{
          top: lp(d3, 60, 180),
          right: 0,
          width: lp(d3, 170, 280),
          height: lp(d3, 250, 400),
          background: `${accent}0.1)`,
          clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)",
        }}
      />

      {/* Large circular ring accents */}
      <div
        className="absolute"
        style={{
          top: lp(d1, 100, 260),
          right: lp(d1, 0, 60),
          width: lp(d1, 270, 390),
          height: lp(d1, 270, 390),
          borderRadius: "50%",
          border: `2px solid ${accent}0.18)`,
        }}
      />
      <div
        className="absolute"
        style={{
          top: lp(d1, 165, 325),
          right: lp(d1, 45, 105),
          width: lp(d1, 150, 230),
          height: lp(d1, 150, 230),
          borderRadius: "50%",
          border: `1px solid ${accent}0.1)`,
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: lp(d2, 60, 200),
          left: lp(d2, 0, 50),
          width: lp(d2, 230, 350),
          height: lp(d2, 230, 350),
          borderRadius: "50%",
          border: `2px solid ${accent}0.14)`,
        }}
      />
      {/* Dots */}
      <div
        className="absolute"
        style={{
          top: lp(d1, 350, 520),
          left: lp(d1, 40, 120),
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: `${accent}0.35)`,
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: lp(d2, 320, 500),
          right: lp(d2, 50, 130),
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: `${accent}0.25)`,
        }}
      />

      {/* ===== Gaming iconography ===== */}
      {isLoL ? (
        <>
          <ShieldIcon
            size={120}
            color={`${accent}0.22)`}
            style={{ top: lp(s1, 250, 650), right: lp(s1, 20, 200), transform: `rotate(${10 + rot1}deg)` }}
          />
          <SwordIcon
            size={110}
            color={`${accent}0.2)`}
            style={{ bottom: lp(s2, 280, 700), left: lp(s2, 15, 180), transform: `rotate(${-15 + rot2}deg)` }}
          />
          <GemIcon
            size={80}
            color={`${accent}0.18)`}
            style={{ top: lp(s3, 480, 900), left: lp(s3, 50, 240), transform: `rotate(${8 + rot3}deg)` }}
          />
        </>
      ) : isCS2 ? (
        <>
          <CrosshairIcon
            size={130}
            color={`${accent}0.22)`}
            style={{ bottom: lp(s1, 300, 750), right: lp(s1, 20, 180), transform: `rotate(${rot1}deg)` }}
          />
          <GamepadIcon
            size={120}
            color={`${accent}0.2)`}
            style={{ top: lp(s2, 180, 500), left: lp(s2, 15, 180), transform: `rotate(${-12 + rot2}deg)` }}
          />
          <GemIcon
            size={80}
            color={`${accent}0.18)`}
            style={{ bottom: lp(s3, 440, 860), left: lp(s3, 70, 260), transform: `rotate(${10 + rot3}deg)` }}
          />
        </>
      ) : (
        /* Rocket League */
        <>
          <GamepadIcon
            size={120}
            color={`${accent}0.22)`}
            style={{ top: lp(s1, 250, 650), right: lp(s1, 20, 200), transform: `rotate(${-10 + rot1}deg)` }}
          />
          <SwordIcon
            size={110}
            color={`${accent}0.2)`}
            style={{ bottom: lp(s2, 300, 700), left: lp(s2, 20, 180), transform: `rotate(${12 + rot2}deg)` }}
          />
          <GemIcon
            size={90}
            color={`${accent}0.18)`}
            style={{ top: lp(s3, 500, 900), left: lp(s3, 60, 240), transform: `rotate(${-8 + rot3}deg)` }}
          />
        </>
      )}

      {/* HUD accent bar */}
      <div
        className="absolute"
        style={{
          top: 280,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${accent}0.5), ${accent}0.1) 30%, transparent 50%, ${accent}0.1) 70%, ${accent}0.4))`,
        }}
      />

      {/* ===== Content ===== */}
      <div
        className="relative flex flex-col h-full"
        style={{ padding: "280px 60px 280px 60px" }}
      >
        {/* Logo + date */}
        <div className="flex items-center justify-between" style={{ marginBottom: 36 }}>
          <img
            src="/logo.png"
            alt="GamER"
            style={{ height: 90, width: "auto" }}
          />
          <div
            className="panel-clip-sm font-azonix"
            style={{
              padding: "12px 22px",
              background: `${accent}0.12)`,
              border: `1px solid ${accent}0.35)`,
              fontSize: 26,
              color: accentText,
              letterSpacing: "0.1em",
              textShadow: `0 0 20px ${accent}0.3)`,
            }}
          >
            {event.date.toUpperCase()}
          </div>
        </div>

        {/* Game focus */}
        <div
          className="flex-1 flex flex-col justify-center"
          style={{ gap: 40 }}
        >
          {/* Game badge */}
          <div
            className="panel-clip-sm font-azonix"
            style={{
              padding: "14px 30px",
              background: `${accent}0.12)`,
              border: `1px solid ${accent}0.35)`,
              fontSize: 26,
              color: accentText,
              letterSpacing: "0.15em",
              alignSelf: "flex-start",
            }}
          >
            TORNEO {game.shortName}
          </div>

          {/* Game name */}
          <h1
            className="font-azonix leading-none"
            style={{
              fontSize: 104,
              color: "#E8E8F0",
              textShadow: isLoL
                ? "0 0 40px rgba(179,57,196,0.4), 0 0 80px rgba(179,57,196,0.15)"
                : "0 0 40px rgba(132,197,82,0.4), 0 0 80px rgba(132,197,82,0.15)",
            }}
          >
            {game.name}
          </h1>

          {/* Format */}
          <div className="flex items-center gap-4">
            <div
              style={{
                width: 56,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${accent}0.6))`,
              }}
            />
            <span
              className="font-azonix"
              style={{
                fontSize: 62,
                color: accentText,
                letterSpacing: "0.15em",
              }}
            >
              {game.format}
            </span>
          </div>

          {/* Details panel */}
          <div
            className="panel-clip relative"
            style={{
              marginTop: 16,
              padding: "36px 40px",
              background: `${accent}0.06)`,
              border: `1px solid ${accent}0.2)`,
              display: "flex",
              flexDirection: "column",
              gap: 26,
            }}
          >
            <div className="hud-bracket-tl" />
            <div className="hud-bracket-br" />
            <DetailRow label="EQUIPOS" value={game.teams} />
            <DetailRow label="HORARIO" value={game.schedule} />
            {game.caster && (
              <DetailRow label="CASTER" value={game.caster} />
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col" style={{ gap: 18 }}>
          <div className="flex gap-4">
            <div
              className="panel-clip-sm"
              style={{
                padding: "14px 28px",
                background: "rgba(132,197,82,0.08)",
                border: "1px solid rgba(132,197,82,0.3)",
                fontSize: 28,
                color: "#96D068",
                fontWeight: 600,
              }}
            >
              {event.entryFee}
            </div>
            <div
              className="panel-clip-sm"
              style={{
                padding: "14px 28px",
                background: "rgba(179,57,196,0.08)",
                border: "1px solid rgba(179,57,196,0.3)",
                fontSize: 28,
                color: "#C06DD0",
                fontWeight: 600,
              }}
            >
              INSCRIPCIONES
            </div>
          </div>

          <div className="flex justify-center">
            <span
              className="font-azonix"
              style={{ fontSize: 26, color: "#888899" }}
            >
              {event.city}
            </span>
          </div>
        </div>
      </div>

      {/* ===== Corner brackets ===== */}
      <div
        className="absolute"
        style={{
          top: 20,
          left: 20,
          width: 50,
          height: 50,
          borderTop: `3px solid ${accent}0.5)`,
          borderLeft: `3px solid ${accent}0.5)`,
        }}
      />
      <div
        className="absolute"
        style={{
          top: 20,
          right: 20,
          width: 50,
          height: 50,
          borderTop: `3px solid ${accent}0.5)`,
          borderRight: `3px solid ${accent}0.5)`,
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 20,
          left: 20,
          width: 50,
          height: 50,
          borderBottom: `3px solid ${accent}0.5)`,
          borderLeft: `3px solid ${accent}0.5)`,
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 20,
          right: 20,
          width: 50,
          height: 50,
          borderBottom: `3px solid ${accent}0.5)`,
          borderRight: `3px solid ${accent}0.5)`,
        }}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span
        className="font-azonix"
        style={{
          fontSize: 22,
          color: "#B490C4",
          letterSpacing: "0.08em",
          minWidth: 160,
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 32, color: "#E8E8F0", fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}

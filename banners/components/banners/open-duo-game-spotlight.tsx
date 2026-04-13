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
 * Open Duo — Game Spotlight Feed Post — 1080×1350 (4:5)
 * Safe zone: 40px all sides
 *
 * One banner per game with specific tournament details.
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

export function OpenDuoGameSpotlight({ event, game, variation = DEFAULT_VARIATION }: GameSpotlightProps & { variation?: BannerVariation }) {
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
      style={{ width: 1080, height: 1350, background: "#1c1435" }}
    >
      {/* ===== Background layers ===== */}
      <div className="absolute inset-0 bg-grid-neon-fade" />

      {/* Angular color block */}
      <div
        className="absolute"
        style={{
          top: isLoL ? 0 : "auto",
          bottom: isLoL ? "auto" : 0,
          left: 0,
          width: "100%",
          height: 400,
          background: `linear-gradient(${isLoL ? "180deg" : "0deg"}, ${accent}0.14), transparent)`,
          clipPath: isLoL
            ? `polygon(0 0, 100% 0, 100% ${60 + cv}%, 0 100%)`
            : `polygon(0 ${40 - cv}%, 100% 0, 100% 100%, 0 100%)`,
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
          clipPath: `polygon(0 ${35 - cv}%, 100% 0, 100% 100%, 0 100%)`,
        }}
      />

      {/* Trapezoid */}
      <div
        className="absolute"
        style={{
          top: isLoL ? lp(d3, 70, 160) : "auto",
          bottom: isLoL ? "auto" : lp(d3, 70, 160),
          right: isLoL ? 0 : "auto",
          left: isLoL ? "auto" : 0,
          width: lp(d3, 140, 230),
          height: lp(d3, 200, 330),
          background: `${accent}0.1)`,
          clipPath: isLoL
            ? "polygon(30% 0, 100% 0, 100% 100%, 0 100%)"
            : "polygon(0 0, 100% 0, 70% 100%, 0 100%)",
        }}
      />

      {/* Large circular ring accents */}
      <div
        className="absolute"
        style={{
          top: isLoL ? lp(d1, 130, 230) : "auto",
          bottom: isLoL ? "auto" : lp(d1, 130, 230),
          right: isLoL ? lp(d1, 0, 50) : "auto",
          left: isLoL ? "auto" : lp(d1, 0, 50),
          width: lp(d1, 240, 340),
          height: lp(d1, 240, 340),
          borderRadius: "50%",
          border: `2px solid ${accent}0.18)`,
        }}
      />
      <div
        className="absolute"
        style={{
          top: isLoL ? lp(d1, 195, 295) : "auto",
          bottom: isLoL ? "auto" : lp(d1, 195, 295),
          right: isLoL ? lp(d1, 45, 95) : "auto",
          left: isLoL ? "auto" : lp(d1, 45, 95),
          width: lp(d1, 130, 210),
          height: lp(d1, 130, 210),
          borderRadius: "50%",
          border: `1px solid ${accent}0.1)`,
        }}
      />
      <div
        className="absolute"
        style={{
          top: isLoL ? "auto" : lp(d2, 90, 190),
          bottom: isLoL ? lp(d2, 90, 190) : "auto",
          left: isLoL ? lp(d2, 0, 50) : "auto",
          right: isLoL ? "auto" : lp(d2, 0, 50),
          width: lp(d2, 200, 300),
          height: lp(d2, 200, 300),
          borderRadius: "50%",
          border: `2px solid ${accent}0.14)`,
        }}
      />
      {/* Dot */}
      <div
        className="absolute"
        style={{
          top: isLoL ? lp(d1, 380, 500) : "auto",
          bottom: isLoL ? "auto" : lp(d1, 380, 500),
          left: isLoL ? lp(d1, 50, 110) : "auto",
          right: isLoL ? "auto" : lp(d1, 50, 110),
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: `${accent}0.35)`,
        }}
      />

      {/* ===== Gaming iconography ===== */}
      {isLoL ? (
        <>
          <ShieldIcon
            size={100}
            color={`${accent}0.22)`}
            style={{ top: lp(s1, 200, 560), right: lp(s1, 20, 200), transform: `rotate(${10 + rot1}deg)` }}
          />
          <SwordIcon
            size={90}
            color={`${accent}0.2)`}
            style={{ bottom: lp(s2, 180, 520), left: lp(s2, 20, 180), transform: `rotate(${-15 + rot2}deg)` }}
          />
          <GemIcon
            size={70}
            color={`${accent}0.18)`}
            style={{ top: lp(s3, 360, 720), left: lp(s3, 50, 220), transform: `rotate(${8 + rot3}deg)` }}
          />
        </>
      ) : isCS2 ? (
        <>
          <CrosshairIcon
            size={110}
            color={`${accent}0.22)`}
            style={{ bottom: lp(s1, 200, 560), right: lp(s1, 20, 180), transform: `rotate(${rot1}deg)` }}
          />
          <GamepadIcon
            size={100}
            color={`${accent}0.2)`}
            style={{ top: lp(s2, 180, 480), left: lp(s2, 15, 180), transform: `rotate(${-12 + rot2}deg)` }}
          />
          <GemIcon
            size={70}
            color={`${accent}0.18)`}
            style={{ bottom: lp(s3, 360, 720), left: lp(s3, 70, 240), transform: `rotate(${10 + rot3}deg)` }}
          />
        </>
      ) : (
        /* Rocket League */
        <>
          <GamepadIcon
            size={100}
            color={`${accent}0.22)`}
            style={{ top: lp(s1, 200, 560), right: lp(s1, 20, 200), transform: `rotate(${-10 + rot1}deg)` }}
          />
          <SwordIcon
            size={90}
            color={`${accent}0.2)`}
            style={{ bottom: lp(s2, 200, 520), left: lp(s2, 20, 180), transform: `rotate(${12 + rot2}deg)` }}
          />
          <GemIcon
            size={80}
            color={`${accent}0.18)`}
            style={{ top: lp(s3, 380, 720), left: lp(s3, 60, 220), transform: `rotate(${-8 + rot3}deg)` }}
          />
        </>
      )}

      {/* HUD accent bar */}
      <div
        className="absolute"
        style={{
          top: 180,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${accent}0.5), ${accent}0.1) 30%, transparent 50%, ${accent}0.1) 70%, ${accent}0.4))`,
        }}
      />

      {/* ===== Content ===== */}
      <div
        className="relative flex flex-col h-full"
        style={{ padding: "50px 60px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <img
            src="/logo.png"
            alt="GamER"
            style={{ height: 80, width: "auto" }}
          />
          <div className="flex flex-col items-end" style={{ gap: 6 }}>
            <span
              className="font-azonix"
              style={{ fontSize: 20, color: "#96D068" }}
            >
              {event.date.toUpperCase()}
            </span>
            <div className="flex items-center" style={{ gap: 10 }}>
              <span style={{ fontSize: 18, color: "#888899" }}>
                {event.title}
              </span>
              {event.venueLogo && (
                <img
                  src={event.venueLogo}
                  alt={event.venue ?? "Venue"}
                  style={{ height: 32, width: "auto", opacity: 0.8 }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            marginTop: 24,
            marginBottom: 24,
            height: 2,
            background: `linear-gradient(90deg, ${accent}0.4), transparent 40%, transparent 60%, ${accent}0.3))`,
          }}
        />

        {/* Center: Game focus */}
        <div
          className="flex-1 flex flex-col justify-center"
          style={{ gap: 28 }}
        >
          {/* Game badge */}
          <div
            className="panel-clip-sm font-azonix"
            style={{
              padding: "12px 28px",
              background: `${accent}0.1)`,
              border: `1px solid ${accent}0.3)`,
              fontSize: 20,
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
              fontSize: 68,
              color: "#E8E8F0",
              textShadow: isLoL
                ? "0 0 40px rgba(179,57,196,0.35), 0 0 80px rgba(179,57,196,0.1)"
                : "0 0 40px rgba(132,197,82,0.35), 0 0 80px rgba(132,197,82,0.1)",
            }}
          >
            {game.name}
          </h1>

          {/* Format */}
          <div className="flex items-center gap-4">
            <div
              style={{
                width: 50,
                height: 3,
                background: `linear-gradient(90deg, transparent, ${accent}0.5))`,
              }}
            />
            <span
              className="font-azonix"
              style={{
                fontSize: 44,
                color: accentText,
                letterSpacing: "0.2em",
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
              padding: "28px 36px",
              background: `${accent}0.04)`,
              border: `1px solid ${accent}0.15)`,
              display: "flex",
              flexDirection: "column",
              gap: 18,
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
        <div className="flex flex-col" style={{ gap: 16 }}>
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div
                className="panel-clip-sm font-azonix"
                style={{
                  padding: "14px 28px",
                  background: "rgba(132,197,82,0.12)",
                  border: "1px solid rgba(132,197,82,0.4)",
                  fontSize: 24,
                  color: "#96D068",
                  textShadow: "0 0 20px rgba(132,197,82,0.25)",
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap",
                }}
              >
                {event.entryFee}
              </div>
              <div
                className="panel-clip-sm font-azonix"
                style={{
                  padding: "14px 28px",
                  background: "rgba(179,57,196,0.12)",
                  border: "1px solid rgba(179,57,196,0.4)",
                  fontSize: 24,
                  color: "#C06DD0",
                  textShadow: "0 0 20px rgba(179,57,196,0.25)",
                  letterSpacing: "0.08em",
                  whiteSpace: "nowrap",
                }}
              >
                INSCRIPCIONES ABIERTAS
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <span
              className="font-azonix"
              style={{ fontSize: 20, color: "#888899" }}
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
    <div className="flex items-baseline gap-4">
      <span
        className="font-azonix"
        style={{
          fontSize: 20,
          color: "#B490C4",
          letterSpacing: "0.12em",
          minWidth: 150,
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 28, color: "#E8E8F0", fontWeight: 600 }}>
        {value}
      </span>
    </div>
  );
}

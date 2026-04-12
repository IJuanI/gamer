"use client";

import type { EventData } from "@/lib/event-data";

/**
 * Open Duo — Game Spotlight Feed Post — 1080×1350 (4:5)
 * Safe zone: 40px all sides
 *
 * One banner per game with specific tournament details.
 * Style: Gaming HUD with angular panels, circular rings, targeting brackets.
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
  };
}

export function OpenDuoGameSpotlight({ event, game }: GameSpotlightProps) {
  const isLoL = game.shortName === "LOL";
  const accent = isLoL ? "rgba(179,57,196," : "rgba(132,197,82,";
  const accentText = isLoL ? "#C06DD0" : "#96D068";

  return (
    <div
      className="banner-frame relative"
      style={{ width: 1080, height: 1350, background: "#0a0a12" }}
    >
      {/* ===== Background layers ===== */}
      <div className="absolute inset-0 bg-grid-neon-fade" />

      {/* Angular color block — shifts per game */}
      <div
        className="absolute"
        style={{
          top: isLoL ? 0 : "auto",
          bottom: isLoL ? "auto" : 0,
          left: 0,
          width: "100%",
          height: 400,
          background: `linear-gradient(${isLoL ? "180deg" : "0deg"}, ${accent}0.08), transparent)`,
          clipPath: isLoL
            ? "polygon(0 0, 100% 0, 100% 60%, 0 100%)"
            : "polygon(0 40%, 100% 0, 100% 100%, 0 100%)",
        }}
      />

      {/* Trapezoid accent */}
      <div
        className="absolute"
        style={{
          top: isLoL ? 100 : "auto",
          bottom: isLoL ? "auto" : 100,
          right: isLoL ? 0 : "auto",
          left: isLoL ? "auto" : 0,
          width: 180,
          height: 260,
          background: `${accent}0.06)`,
          clipPath: isLoL
            ? "polygon(30% 0, 100% 0, 100% 100%, 0 100%)"
            : "polygon(0 0, 100% 0, 70% 100%, 0 100%)",
        }}
      />

      {/* ── Circular / ring accents ── */}
      <div
        className="absolute"
        style={{
          top: isLoL ? 220 : "auto",
          bottom: isLoL ? "auto" : 220,
          right: isLoL ? 40 : "auto",
          left: isLoL ? "auto" : 40,
          width: 160,
          height: 160,
          borderRadius: "50%",
          border: `2px solid ${accent}0.1)`,
        }}
      />
      <div
        className="absolute"
        style={{
          top: isLoL ? 260 : "auto",
          bottom: isLoL ? "auto" : 260,
          right: isLoL ? 80 : "auto",
          left: isLoL ? "auto" : 80,
          width: 80,
          height: 80,
          borderRadius: "50%",
          border: `1px solid ${accent}0.06)`,
        }}
      />
      <div
        className="absolute"
        style={{
          top: isLoL ? "auto" : 180,
          bottom: isLoL ? 180 : "auto",
          left: isLoL ? 50 : "auto",
          right: isLoL ? "auto" : 50,
          width: 120,
          height: 120,
          borderRadius: "50%",
          border: `2px solid ${accent}0.07)`,
        }}
      />
      {/* Dot accent */}
      <div
        className="absolute"
        style={{
          top: isLoL ? 420 : "auto",
          bottom: isLoL ? "auto" : 420,
          left: isLoL ? 70 : "auto",
          right: isLoL ? "auto" : 70,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: `${accent}0.2)`,
        }}
      />

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
                OPEN DUO
              </span>
              <img
                src="/mirador-tec.png"
                alt="MiradorTec"
                style={{ height: 32, width: "auto", opacity: 0.8 }}
              />
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
                className="panel-clip-sm"
                style={{
                  padding: "10px 24px",
                  background: "rgba(132,197,82,0.06)",
                  border: "1px solid rgba(132,197,82,0.2)",
                  fontSize: 20,
                  color: "#96D068",
                  fontWeight: 600,
                }}
              >
                {event.entryFee}
              </div>
              <div
                className="panel-clip-sm"
                style={{
                  padding: "10px 24px",
                  background: "rgba(179,57,196,0.06)",
                  border: "1px solid rgba(179,57,196,0.2)",
                  fontSize: 20,
                  color: "#C06DD0",
                  fontWeight: 600,
                }}
              >
                INSCRIPCIONES ABIERTAS
              </div>
            </div>
          </div>

          {/* City */}
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
          fontSize: 18,
          color: "#833D90",
          letterSpacing: "0.1em",
          minWidth: 150,
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 26, color: "#D0D0DC", fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}

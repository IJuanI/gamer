"use client";

import type { EventData } from "@/lib/event-data";

/**
 * Open Duo — Instagram Story Announcement — 1080×1920 (9:16)
 * Safe zone: 250px top/bottom, 60px sides
 *
 * Style: Gaming HUD aesthetic — angular panels, targeting brackets,
 * color-blocked sections, mixed geometry (angular + circular).
 * Colors: desaturated text, neon reserved for accents/borders.
 */
export function OpenDuoStory({ event }: { event: EventData }) {
  return (
    <div
      className="banner-frame relative"
      style={{ width: 1080, height: 1920, background: "#0a0a12" }}
    >
      {/* ===== Background layers ===== */}
      <div className="absolute inset-0 bg-grid-neon-fade" />

      {/* Large angular color blocks */}
      <div
        className="absolute"
        style={{
          top: 0,
          left: 0,
          width: "100%",
          height: 480,
          background:
            "linear-gradient(180deg, rgba(179,57,196,0.08), transparent)",
          clipPath: "polygon(0 0, 100% 0, 100% 70%, 0 100%)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 0,
          left: 0,
          width: "100%",
          height: 480,
          background:
            "linear-gradient(0deg, rgba(132,197,82,0.06), transparent)",
          clipPath: "polygon(0 30%, 100% 0, 100% 100%, 0 100%)",
        }}
      />

      {/* Trapezoid top-right */}
      <div
        className="absolute"
        style={{
          top: 160,
          right: 0,
          width: 200,
          height: 300,
          background: "rgba(179,57,196,0.06)",
          clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)",
        }}
      />
      {/* Trapezoid bottom-left */}
      <div
        className="absolute"
        style={{
          bottom: 160,
          left: 0,
          width: 180,
          height: 280,
          background: "rgba(132,197,82,0.04)",
          clipPath: "polygon(0 0, 100% 0, 70% 100%, 0 100%)",
        }}
      />

      {/* ── Circular / ring accents ── */}
      <div
        className="absolute"
        style={{
          top: 340,
          right: 70,
          width: 180,
          height: 180,
          borderRadius: "50%",
          border: "2px solid rgba(179,57,196,0.1)",
        }}
      />
      <div
        className="absolute"
        style={{
          top: 380,
          right: 110,
          width: 100,
          height: 100,
          borderRadius: "50%",
          border: "1px solid rgba(179,57,196,0.06)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 380,
          left: 50,
          width: 220,
          height: 220,
          borderRadius: "50%",
          border: "2px solid rgba(132,197,82,0.08)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 430,
          left: 100,
          width: 120,
          height: 120,
          borderRadius: "50%",
          border: "1px solid rgba(132,197,82,0.05)",
        }}
      />
      {/* Small filled dot accents */}
      <div
        className="absolute"
        style={{
          top: 520,
          left: 90,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "rgba(179,57,196,0.2)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 540,
          right: 100,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "rgba(132,197,82,0.18)",
        }}
      />

      {/* Horizontal accent bars — HUD style */}
      <div
        className="absolute"
        style={{
          top: 250,
          left: 0,
          right: 0,
          height: 2,
          background:
            "linear-gradient(90deg, rgba(179,57,196,0.5), rgba(179,57,196,0.1) 30%, transparent 50%, rgba(132,197,82,0.1) 70%, rgba(132,197,82,0.4))",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 250,
          left: 0,
          right: 0,
          height: 2,
          background:
            "linear-gradient(90deg, rgba(132,197,82,0.4), rgba(132,197,82,0.1) 30%, transparent 50%, rgba(179,57,196,0.1) 70%, rgba(179,57,196,0.5))",
        }}
      />

      {/* Small chevron accents */}
      <div
        className="absolute"
        style={{
          top: 600,
          left: 60,
          width: 60,
          height: 20,
          background: "rgba(179,57,196,0.15)",
          clipPath:
            "polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%, 20% 50%)",
        }}
      />
      <div
        className="absolute"
        style={{
          top: 630,
          left: 60,
          width: 40,
          height: 14,
          background: "rgba(132,197,82,0.12)",
          clipPath:
            "polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%, 20% 50%)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 600,
          right: 60,
          width: 60,
          height: 20,
          background: "rgba(132,197,82,0.15)",
          clipPath:
            "polygon(20% 0, 100% 0, 80% 50%, 100% 100%, 20% 100%, 0 50%)",
        }}
      />

      {/* ===== Content (within safe zone) ===== */}
      <div
        className="relative flex flex-col h-full"
        style={{
          paddingTop: 270,
          paddingBottom: 270,
          paddingLeft: 80,
          paddingRight: 80,
        }}
      >
        {/* ── Top: Logo + Badge ── */}
        <div className="flex flex-col items-center" style={{ gap: 18 }}>
          <img
            src="/logo.png"
            alt="GamER"
            style={{ height: 130, width: "auto" }}
          />
          <div
            className="panel-clip-sm font-azonix"
            style={{
              padding: "12px 40px",
              background: "rgba(179,57,196,0.1)",
              border: "1px solid rgba(179,57,196,0.3)",
              fontSize: 20,
              color: "#C06DD0",
              letterSpacing: "0.2em",
            }}
          >
            TORNEO PRESENCIAL
          </div>
        </div>

        {/* ── Center: Main content panel ── */}
        <div
          className="flex-1 flex flex-col items-center justify-center"
          style={{ gap: 36 }}
        >
          {/* 2v2 format */}
          <div className="flex items-center gap-4">
            <div
              style={{
                width: 80,
                height: 3,
                background:
                  "linear-gradient(90deg, transparent, rgba(132,197,82,0.5))",
              }}
            />
            <span
              className="font-azonix"
              style={{
                fontSize: 38,
                color: "#96D068",
                letterSpacing: "0.3em",
              }}
            >
              2 VS 2
            </span>
            <div
              style={{
                width: 80,
                height: 3,
                background:
                  "linear-gradient(90deg, rgba(132,197,82,0.5), transparent)",
              }}
            />
          </div>

          {/* Title */}
          <h1
            className="font-azonix leading-none text-center"
            style={{
              fontSize: 120,
              color: "#E8E8F0",
              textShadow:
                "0 0 40px rgba(179,57,196,0.4), 0 0 80px rgba(179,57,196,0.15)",
            }}
          >
            OPEN DUO
          </h1>

          {/* Subtitle */}
          <p
            className="text-center"
            style={{
              fontSize: 28,
              color: "#D0D0DC",
              lineHeight: 1.4,
              maxWidth: 750,
            }}
          >
            Torneos de{" "}
            <span style={{ color: "#96D068", fontWeight: 700 }}>
              League of Legends
            </span>{" "}
            y{" "}
            <span style={{ color: "#96D068", fontWeight: 700 }}>
              Counter-Strike 2
            </span>
          </p>

          {/* Game format pills */}
          <div className="flex gap-5" style={{ marginTop: 4 }}>
            <div
              className="panel-clip-sm font-azonix"
              style={{
                padding: "14px 32px",
                background: "rgba(132,197,82,0.08)",
                border: "1px solid rgba(132,197,82,0.25)",
                fontSize: 22,
                color: "#96D068",
              }}
            >
              LOL ARAM 2V2
            </div>
            <div
              className="panel-clip-sm font-azonix"
              style={{
                padding: "14px 32px",
                background: "rgba(132,197,82,0.08)",
                border: "1px solid rgba(132,197,82,0.25)",
                fontSize: 22,
                color: "#96D068",
              }}
            >
              CS2 WINGMAN 2V2
            </div>
          </div>
        </div>

        {/* ── Bottom: Date + Venue info panel ── */}
        <div className="flex flex-col items-center" style={{ gap: 20 }}>
          {/* Date panel */}
          <div
            className="panel-clip relative"
            style={{
              padding: "24px 64px",
              background: "rgba(179,57,196,0.06)",
              border: "1px solid rgba(179,57,196,0.2)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div className="hud-bracket-tl" />
            <div className="hud-bracket-br" />
            <span
              className="font-azonix"
              style={{
                fontSize: 44,
                color: "#96D068",
                textShadow: "0 0 20px rgba(132,197,82,0.3)",
              }}
            >
              {event.date.toUpperCase()}
            </span>
            <span
              className="font-azonix"
              style={{ fontSize: 28, color: "#E8E8F0" }}
            >
              {event.time}
            </span>
          </div>

          {/* Venue */}
          <div
            className="flex flex-col items-center"
            style={{ gap: 8, marginTop: 6 }}
          >
            <img
              src="/mirador-tec.png"
              alt="MiradorTec"
              style={{ height: 56, width: "auto", opacity: 0.9 }}
            />
            <span
              className="font-azonix"
              style={{ fontSize: 26, color: "#888899" }}
            >
              {event.city}
            </span>
          </div>

          {/* Info pills */}
          <div className="flex gap-4" style={{ marginTop: 6 }}>
            {event.entryFee && (
              <div
                className="panel-clip-sm"
                style={{
                  padding: "10px 24px",
                  background: "rgba(132,197,82,0.06)",
                  border: "1px solid rgba(132,197,82,0.2)",
                  fontSize: 22,
                  color: "#96D068",
                  fontWeight: 600,
                }}
              >
                {event.entryFee}
              </div>
            )}
            <div
              className="panel-clip-sm"
              style={{
                padding: "10px 24px",
                background: "rgba(179,57,196,0.06)",
                border: "1px solid rgba(179,57,196,0.2)",
                fontSize: 22,
                color: "#C06DD0",
                fontWeight: 600,
              }}
            >
              INSCRIPCIONES ABIERTAS
            </div>
          </div>
        </div>
      </div>

      {/* ===== Corner brackets — gaming HUD ===== */}
      <div
        className="absolute"
        style={{
          top: 30,
          left: 30,
          width: 70,
          height: 70,
          borderTop: "3px solid rgba(179,57,196,0.5)",
          borderLeft: "3px solid rgba(179,57,196,0.5)",
        }}
      />
      <div
        className="absolute"
        style={{
          top: 30,
          right: 30,
          width: 70,
          height: 70,
          borderTop: "3px solid rgba(179,57,196,0.5)",
          borderRight: "3px solid rgba(179,57,196,0.5)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 30,
          left: 30,
          width: 70,
          height: 70,
          borderBottom: "3px solid rgba(132,197,82,0.5)",
          borderLeft: "3px solid rgba(132,197,82,0.5)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 30,
          right: 30,
          width: 70,
          height: 70,
          borderBottom: "3px solid rgba(132,197,82,0.5)",
          borderRight: "3px solid rgba(132,197,82,0.5)",
        }}
      />

      {/* Tick marks along edges */}
      {[0.25, 0.5, 0.75].map((pct) => (
        <div key={`lt-${pct}`}>
          <div
            className="absolute"
            style={{
              top: `${pct * 100}%`,
              left: 30,
              width: 12,
              height: 2,
              background: "rgba(179,57,196,0.2)",
            }}
          />
          <div
            className="absolute"
            style={{
              top: `${pct * 100}%`,
              right: 30,
              width: 12,
              height: 2,
              background: "rgba(179,57,196,0.2)",
            }}
          />
        </div>
      ))}
    </div>
  );
}

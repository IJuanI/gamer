"use client";

import type { EventData } from "@/lib/event-data";

/**
 * Open Duo — Countdown Story — 1080×1920 (9:16)
 * Safe zone: 250px top/bottom
 *
 * "Faltan X días" urgency banner. Giant number as visual anchor.
 * Style: Gaming HUD with angular panels, circular rings, targeting brackets.
 */
export function OpenDuoCountdownStory({
  event,
  daysLeft,
}: {
  event: EventData;
  daysLeft: number;
}) {
  return (
    <div
      className="banner-frame relative"
      style={{ width: 1080, height: 1920, background: "#0a0a12" }}
    >
      {/* ===== Background layers ===== */}
      <div className="absolute inset-0 bg-grid-neon-fade" />

      {/* Angular color blocks */}
      <div
        className="absolute"
        style={{
          top: 0,
          right: 0,
          width: "100%",
          height: 500,
          background:
            "linear-gradient(180deg, rgba(179,57,196,0.08), transparent)",
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 65%)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 0,
          left: 0,
          width: "100%",
          height: 500,
          background:
            "linear-gradient(0deg, rgba(132,197,82,0.06), transparent)",
          clipPath: "polygon(0 35%, 100% 0, 100% 100%, 0 100%)",
        }}
      />

      {/* Trapezoid accents */}
      <div
        className="absolute"
        style={{
          top: 300,
          left: 0,
          width: 200,
          height: 300,
          background: "rgba(179,57,196,0.05)",
          clipPath: "polygon(0 0, 100% 0, 70% 100%, 0 100%)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 300,
          right: 0,
          width: 180,
          height: 280,
          background: "rgba(132,197,82,0.04)",
          clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)",
        }}
      />

      {/* ── Circular / ring accents ── */}
      {/* Large ring around the number area */}
      <div
        className="absolute"
        style={{
          top: "50%",
          left: "50%",
          width: 500,
          height: 500,
          marginTop: -250,
          marginLeft: -250,
          borderRadius: "50%",
          border: "2px solid rgba(132,197,82,0.06)",
        }}
      />
      <div
        className="absolute"
        style={{
          top: "50%",
          left: "50%",
          width: 420,
          height: 420,
          marginTop: -210,
          marginLeft: -210,
          borderRadius: "50%",
          border: "1px solid rgba(132,197,82,0.04)",
        }}
      />
      {/* Smaller offset rings */}
      <div
        className="absolute"
        style={{
          top: 340,
          right: 60,
          width: 160,
          height: 160,
          borderRadius: "50%",
          border: "2px solid rgba(179,57,196,0.1)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 380,
          left: 50,
          width: 140,
          height: 140,
          borderRadius: "50%",
          border: "2px solid rgba(132,197,82,0.08)",
        }}
      />
      {/* Dot accents */}
      <div
        className="absolute"
        style={{
          top: 520,
          left: 100,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "rgba(179,57,196,0.2)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 530,
          right: 110,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "rgba(132,197,82,0.18)",
        }}
      />

      {/* HUD accent bars */}
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

      {/* Chevron accents */}
      <div
        className="absolute"
        style={{
          top: 650,
          right: 60,
          width: 60,
          height: 20,
          background: "rgba(179,57,196,0.15)",
          clipPath:
            "polygon(20% 0, 100% 0, 80% 50%, 100% 100%, 20% 100%, 0 50%)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 650,
          left: 60,
          width: 60,
          height: 20,
          background: "rgba(132,197,82,0.15)",
          clipPath:
            "polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%, 20% 50%)",
        }}
      />

      {/* ===== Content ===== */}
      <div
        className="relative flex flex-col items-center justify-between h-full"
        style={{
          paddingTop: 280,
          paddingBottom: 280,
          paddingLeft: 80,
          paddingRight: 80,
        }}
      >
        {/* Top: Logo + event name */}
        <div className="flex flex-col items-center" style={{ gap: 16 }}>
          <img
            src="/logo.png"
            alt="GamER"
            style={{ height: 120, width: "auto" }}
          />
          <span
            className="font-azonix"
            style={{
              fontSize: 38,
              color: "#C06DD0",
              letterSpacing: "0.1em",
            }}
          >
            OPEN DUO
          </span>
        </div>

        {/* Center: THE NUMBER */}
        <div className="flex flex-col items-center" style={{ gap: 20 }}>
          <span
            className="font-azonix"
            style={{
              fontSize: 44,
              color: "#D0D0DC",
              letterSpacing: "0.2em",
            }}
          >
            {daysLeft === 1 ? "FALTA" : "FALTAN"}
          </span>

          {/* Giant number with HUD frame */}
          <div
            className="relative flex items-center justify-center"
            style={{ width: 400, height: 320 }}
          >
            <div className="hud-bracket-tl" />
            <div className="hud-bracket-tr" />
            <div className="hud-bracket-bl" />
            <div className="hud-bracket-br" />
            <span
              className="font-azonix"
              style={{
                fontSize: 280,
                color: "#96D068",
                lineHeight: 0.85,
                textShadow:
                  "0 0 40px rgba(132,197,82,0.4), 0 0 80px rgba(132,197,82,0.15)",
              }}
            >
              {daysLeft}
            </span>
          </div>

          <span
            className="font-azonix"
            style={{
              fontSize: 64,
              color: "#E8E8F0",
              letterSpacing: "0.15em",
            }}
          >
            {daysLeft === 1 ? "DÍA" : "DÍAS"}
          </span>

          {/* Divider */}
          <div
            style={{
              width: 300,
              height: 2,
              marginTop: 12,
              background:
                "linear-gradient(90deg, transparent, rgba(179,57,196,0.4) 20%, rgba(179,57,196,0.4) 80%, transparent)",
            }}
          />

          {/* Date reminder */}
          <span
            className="font-azonix"
            style={{ fontSize: 34, color: "#C06DD0", marginTop: 4 }}
          >
            {event.date.toUpperCase()}
          </span>
        </div>

        {/* Bottom: Games + venue */}
        <div className="flex flex-col items-center" style={{ gap: 18 }}>
          <div className="flex gap-4">
            <span
              className="panel-clip-sm font-azonix"
              style={{
                padding: "12px 28px",
                background: "rgba(132,197,82,0.08)",
                border: "1px solid rgba(132,197,82,0.25)",
                fontSize: 22,
                color: "#96D068",
              }}
            >
              LOL 2V2
            </span>
            <span
              className="panel-clip-sm font-azonix"
              style={{
                padding: "12px 28px",
                background: "rgba(132,197,82,0.08)",
                border: "1px solid rgba(132,197,82,0.25)",
                fontSize: 22,
                color: "#96D068",
              }}
            >
              CS2 2V2
            </span>
          </div>
          <div className="flex items-center" style={{ gap: 16 }}>
            <img
              src="/mirador-tec.png"
              alt="MiradorTec"
              style={{ height: 44, width: "auto", opacity: 0.85 }}
            />
            <span
              className="font-azonix"
              style={{ fontSize: 24, color: "#888899" }}
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

      {/* Tick marks */}
      {[0.25, 0.5, 0.75].map((pct) => (
        <div key={`ct-${pct}`}>
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

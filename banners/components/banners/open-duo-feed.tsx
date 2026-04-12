"use client";

import type { EventData } from "@/lib/event-data";

/**
 * Open Duo — Instagram Feed Post — 1080×1350 (4:5)
 * Safe zone: 40px all sides
 *
 * Style: Gaming HUD — angular panels + circular accents.
 * Denser layout for feed with good vertical rhythm.
 */
export function OpenDuoFeed({ event }: { event: EventData }) {
  return (
    <div
      className="banner-frame relative"
      style={{ width: 1080, height: 1350, background: "#0a0a12" }}
    >
      {/* ===== Background layers ===== */}
      <div className="absolute inset-0 bg-grid-neon-fade" />

      {/* Angular color blocks */}
      <div
        className="absolute"
        style={{
          top: 0,
          left: 0,
          width: "100%",
          height: 380,
          background:
            "linear-gradient(180deg, rgba(179,57,196,0.08), transparent)",
          clipPath: "polygon(0 0, 100% 0, 100% 65%, 0 100%)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 0,
          left: 0,
          width: "100%",
          height: 380,
          background:
            "linear-gradient(0deg, rgba(132,197,82,0.06), transparent)",
          clipPath: "polygon(0 35%, 100% 0, 100% 100%, 0 100%)",
        }}
      />

      {/* Trapezoid accent */}
      <div
        className="absolute"
        style={{
          top: 100,
          right: 0,
          width: 160,
          height: 240,
          background: "rgba(179,57,196,0.06)",
          clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)",
        }}
      />

      {/* ── Circular / ring accents ── */}
      <div
        className="absolute"
        style={{
          top: 240,
          right: 50,
          width: 160,
          height: 160,
          borderRadius: "50%",
          border: "2px solid rgba(179,57,196,0.1)",
        }}
      />
      <div
        className="absolute"
        style={{
          top: 280,
          right: 90,
          width: 80,
          height: 80,
          borderRadius: "50%",
          border: "1px solid rgba(179,57,196,0.06)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 280,
          left: 40,
          width: 180,
          height: 180,
          borderRadius: "50%",
          border: "2px solid rgba(132,197,82,0.08)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 320,
          left: 80,
          width: 100,
          height: 100,
          borderRadius: "50%",
          border: "1px solid rgba(132,197,82,0.05)",
        }}
      />
      {/* Dot accents */}
      <div
        className="absolute"
        style={{
          top: 450,
          left: 70,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "rgba(179,57,196,0.2)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 440,
          right: 80,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "rgba(132,197,82,0.18)",
        }}
      />

      {/* HUD accent bar */}
      <div
        className="absolute"
        style={{
          top: 200,
          left: 0,
          right: 0,
          height: 2,
          background:
            "linear-gradient(90deg, rgba(179,57,196,0.5), rgba(179,57,196,0.1) 30%, transparent 50%, rgba(132,197,82,0.1) 70%, rgba(132,197,82,0.4))",
        }}
      />

      {/* ===== Content ===== */}
      <div
        className="relative flex flex-col h-full"
        style={{ padding: "50px 60px" }}
      >
        {/* ── Header: Logo + Badge ── */}
        <div className="flex items-center justify-between">
          <img
            src="/logo.png"
            alt="GamER"
            style={{ height: 100, width: "auto" }}
          />
          <div
            className="panel-clip-sm font-azonix"
            style={{
              padding: "10px 28px",
              background: "rgba(179,57,196,0.1)",
              border: "1px solid rgba(179,57,196,0.3)",
              fontSize: 17,
              color: "#C06DD0",
              letterSpacing: "0.15em",
            }}
          >
            TORNEO PRESENCIAL
          </div>
        </div>

        {/* Accent bar */}
        <div
          style={{
            marginTop: 28,
            marginBottom: 28,
            height: 2,
            background:
              "linear-gradient(90deg, rgba(179,57,196,0.4), transparent 40%, transparent 60%, rgba(132,197,82,0.3))",
          }}
        />

        {/* ── Center: Title block ── */}
        <div
          className="flex-1 flex flex-col justify-center"
          style={{ gap: 26 }}
        >
          {/* 2v2 label */}
          <div className="flex items-center gap-4">
            <div
              style={{
                width: 60,
                height: 3,
                background:
                  "linear-gradient(90deg, transparent, rgba(132,197,82,0.5))",
              }}
            />
            <span
              className="font-azonix"
              style={{
                fontSize: 34,
                color: "#96D068",
                letterSpacing: "0.25em",
              }}
            >
              2 VS 2
            </span>
            <div
              style={{
                width: 60,
                height: 3,
                background:
                  "linear-gradient(90deg, rgba(132,197,82,0.5), transparent)",
              }}
            />
          </div>

          {/* Title */}
          <h1
            className="font-azonix leading-none"
            style={{
              fontSize: 96,
              color: "#E8E8F0",
              textShadow:
                "0 0 40px rgba(179,57,196,0.4), 0 0 80px rgba(179,57,196,0.15)",
            }}
          >
            OPEN DUO
          </h1>

          {/* Games text */}
          <p
            style={{
              fontSize: 26,
              color: "#D0D0DC",
              lineHeight: 1.5,
              maxWidth: 800,
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
          <div className="flex gap-4" style={{ marginTop: 4 }}>
            <div
              className="panel-clip-sm font-azonix"
              style={{
                padding: "12px 28px",
                background: "rgba(132,197,82,0.08)",
                border: "1px solid rgba(132,197,82,0.25)",
                fontSize: 20,
                color: "#96D068",
              }}
            >
              LOL ARAM 2V2
            </div>
            <div
              className="panel-clip-sm font-azonix"
              style={{
                padding: "12px 28px",
                background: "rgba(132,197,82,0.08)",
                border: "1px solid rgba(132,197,82,0.25)",
                fontSize: 20,
                color: "#96D068",
              }}
            >
              CS2 WINGMAN 2V2
            </div>
          </div>
        </div>

        {/* ── Bottom: Date + Venue + Info ── */}
        <div className="flex flex-col" style={{ gap: 18 }}>
          {/* Date + Venue panel */}
          <div
            className="panel-clip relative"
            style={{
              padding: "20px 32px",
              background: "rgba(179,57,196,0.06)",
              border: "1px solid rgba(179,57,196,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div className="hud-bracket-tl" />
            <div className="hud-bracket-br" />
            <div className="flex flex-col gap-2">
              <span
                className="font-azonix"
                style={{
                  fontSize: 34,
                  color: "#96D068",
                  textShadow: "0 0 20px rgba(132,197,82,0.3)",
                }}
              >
                {event.date.toUpperCase()}
              </span>
              <span
                className="font-azonix"
                style={{ fontSize: 22, color: "#E8E8F0" }}
              >
                {event.time}
              </span>
            </div>
            <div className="flex flex-col items-end gap-3">
              <img
                src="/mirador-tec.png"
                alt="MiradorTec"
                style={{ height: 48, width: "auto", opacity: 0.9 }}
              />
              <span
                className="font-azonix"
                style={{ fontSize: 20, color: "#888899" }}
              >
                {event.city}
              </span>
            </div>
          </div>

          {/* Info pills */}
          <div className="flex gap-4 justify-center">
            {event.entryFee && (
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
            )}
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
      </div>

      {/* ===== Corner brackets ===== */}
      <div
        className="absolute"
        style={{
          top: 20,
          left: 20,
          width: 50,
          height: 50,
          borderTop: "3px solid rgba(179,57,196,0.5)",
          borderLeft: "3px solid rgba(179,57,196,0.5)",
        }}
      />
      <div
        className="absolute"
        style={{
          top: 20,
          right: 20,
          width: 50,
          height: 50,
          borderTop: "3px solid rgba(179,57,196,0.5)",
          borderRight: "3px solid rgba(179,57,196,0.5)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 20,
          left: 20,
          width: 50,
          height: 50,
          borderBottom: "3px solid rgba(132,197,82,0.5)",
          borderLeft: "3px solid rgba(132,197,82,0.5)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 20,
          right: 20,
          width: 50,
          height: 50,
          borderBottom: "3px solid rgba(132,197,82,0.5)",
          borderRight: "3px solid rgba(132,197,82,0.5)",
        }}
      />
    </div>
  );
}

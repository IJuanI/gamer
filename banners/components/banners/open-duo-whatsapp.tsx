"use client";

import type { EventData } from "@/lib/event-data";

/**
 * Open Duo — WhatsApp Status — 1080×1920 (9:16)
 * Safe zone: 120px top, 200px bottom, 60px sides
 *
 * Style: Gaming HUD — bolder and simpler for quick scan.
 * Mixed geometry: angular panels + circular ring accents.
 */
export function OpenDuoWhatsApp({ event }: { event: EventData }) {
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
          left: 0,
          width: "100%",
          height: 500,
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
          top: 200,
          right: 0,
          width: 200,
          height: 300,
          background: "rgba(179,57,196,0.06)",
          clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 300,
          left: 0,
          width: 160,
          height: 240,
          background: "rgba(132,197,82,0.04)",
          clipPath: "polygon(0 0, 100% 0, 70% 100%, 0 100%)",
        }}
      />

      {/* ── Circular / ring accents ── */}
      <div
        className="absolute"
        style={{
          top: 360,
          right: 60,
          width: 200,
          height: 200,
          borderRadius: "50%",
          border: "2px solid rgba(179,57,196,0.1)",
        }}
      />
      <div
        className="absolute"
        style={{
          top: 410,
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
          bottom: 420,
          left: 50,
          width: 200,
          height: 200,
          borderRadius: "50%",
          border: "2px solid rgba(132,197,82,0.08)",
        }}
      />
      {/* Dot accents */}
      <div
        className="absolute"
        style={{
          top: 580,
          left: 80,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "rgba(179,57,196,0.2)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 580,
          right: 90,
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
          top: 120,
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
          bottom: 200,
          left: 0,
          right: 0,
          height: 2,
          background:
            "linear-gradient(90deg, rgba(132,197,82,0.4), rgba(132,197,82,0.1) 30%, transparent 50%, rgba(179,57,196,0.1) 70%, rgba(179,57,196,0.5))",
        }}
      />

      {/* ===== Content (WhatsApp safe zone) ===== */}
      <div
        className="relative flex flex-col justify-between h-full"
        style={{
          paddingTop: 160,
          paddingBottom: 240,
          paddingLeft: 80,
          paddingRight: 80,
        }}
      >
        {/* ── Top: Logo ── */}
        <div className="flex justify-center">
          <img
            src="/logo.png"
            alt="GamER"
            style={{ height: 130, width: "auto" }}
          />
        </div>

        {/* ── Center: All key info ── */}
        <div className="flex flex-col items-center text-center" style={{ gap: 32 }}>
          {/* Badge */}
          <div
            className="panel-clip-sm font-azonix"
            style={{
              padding: "14px 40px",
              background: "rgba(179,57,196,0.1)",
              border: "1px solid rgba(179,57,196,0.3)",
              fontSize: 22,
              color: "#C06DD0",
              letterSpacing: "0.2em",
            }}
          >
            TORNEO PRESENCIAL
          </div>

          {/* 2v2 */}
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
                fontSize: 44,
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
            className="font-azonix leading-none"
            style={{
              fontSize: 130,
              color: "#E8E8F0",
              textShadow:
                "0 0 40px rgba(179,57,196,0.4), 0 0 80px rgba(179,57,196,0.15)",
            }}
          >
            OPEN DUO
          </h1>

          {/* Games text */}
          <p style={{ fontSize: 32, color: "#D0D0DC", lineHeight: 1.4 }}>
            <span style={{ color: "#96D068", fontWeight: 700 }}>
              League of Legends
            </span>{" "}
            &{" "}
            <span style={{ color: "#96D068", fontWeight: 700 }}>
              Counter-Strike 2
            </span>
          </p>

          {/* Divider */}
          <div
            style={{
              width: 500,
              height: 2,
              background:
                "linear-gradient(90deg, transparent, rgba(179,57,196,0.4) 20%, rgba(179,57,196,0.4) 80%, transparent)",
            }}
          />

          {/* Date panel */}
          <div
            className="panel-clip relative"
            style={{
              padding: "24px 56px",
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
                fontSize: 46,
                color: "#96D068",
                textShadow: "0 0 20px rgba(132,197,82,0.3)",
              }}
            >
              {event.date.toUpperCase()}
            </span>
            <span
              className="font-azonix"
              style={{ fontSize: 30, color: "#E8E8F0" }}
            >
              {event.time}
            </span>
          </div>
        </div>

        {/* ── Bottom: Venue + Entry ── */}
        <div className="flex flex-col items-center" style={{ gap: 20 }}>
          {/* MiradorTec logo + location */}
          <div className="flex flex-col items-center" style={{ gap: 8 }}>
            <img
              src="/mirador-tec.png"
              alt="MiradorTec"
              style={{ height: 60, width: "auto", opacity: 0.9 }}
            />
            <span
              className="font-azonix"
              style={{ fontSize: 26, color: "#888899" }}
            >
              {event.city}
            </span>
          </div>

          <div className="flex gap-4">
            {event.entryFee && (
              <div
                className="panel-clip-sm"
                style={{
                  padding: "12px 28px",
                  background: "rgba(132,197,82,0.06)",
                  border: "1px solid rgba(132,197,82,0.2)",
                  fontSize: 24,
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
                padding: "12px 28px",
                background: "rgba(179,57,196,0.06)",
                border: "1px solid rgba(179,57,196,0.2)",
                fontSize: 24,
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
    </div>
  );
}

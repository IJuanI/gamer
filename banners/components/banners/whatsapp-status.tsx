"use client";

import type { EventData } from "@/lib/event-data";

/**
 * WhatsApp Status Banner — 1080×1920 (9:16)
 * Safe zone: 120px top, 200px bottom, 60px sides
 *
 * Same dimensions as IG Story but tighter safe zone at bottom
 * (WhatsApp reply button). Slightly different layout emphasis.
 * Bolder, more direct — WhatsApp audience skews quick-read.
 */
export function WhatsAppStatus({ event }: { event: EventData }) {
  return (
    <div
      className="banner-frame bg-grid relative"
      style={{ width: 1080, height: 1920, background: "#0a0a12" }}
    >
      {/* Full-width purple band at top */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: 8,
          background: "linear-gradient(90deg, #833D90, #B339C4, #9E46AE)",
        }}
      />

      {/* Large geometric square accent */}
      <div
        className="absolute"
        style={{
          top: 200,
          right: -80,
          width: 260,
          height: 260,
          border: "2px solid rgba(179,57,196,0.1)",
          transform: "rotate(45deg)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 400,
          left: -60,
          width: 180,
          height: 180,
          border: "2px solid rgba(132,197,82,0.08)",
          transform: "rotate(45deg)",
        }}
      />

      {/* Scanline */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute left-0 right-0 h-[2px] animate-scanline"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(132,197,82,0.2), transparent)",
          }}
        />
      </div>

      {/* ===== Content (within WhatsApp safe zone) ===== */}
      <div
        className="relative flex flex-col justify-between h-full"
        style={{
          paddingTop: 160,
          paddingBottom: 240,
          paddingLeft: 80,
          paddingRight: 80,
        }}
      >
        {/* Top: Logo */}
        <div className="flex justify-center">
          <img
            src="/logo.png"
            alt="GamER"
            style={{ height: 90, width: "auto" }}
          />
        </div>

        {/* Center: Main content — big, bold, scannable */}
        <div className="flex flex-col items-center text-center gap-10">
          {/* Event type */}
          <div
            style={{
              padding: "10px 30px",
              background: "rgba(179,57,196,0.08)",
              border: "1px solid rgba(179,57,196,0.3)",
              fontSize: 22,
              color: "#B339C4",
              letterSpacing: "0.15em",
            }}
            className="font-azonix"
          >
            {event.type === "torneo-hibrido"
              ? "TORNEO HÍBRIDO"
              : event.type === "cyber-cafe"
                ? "NOCHE DE CYBER"
                : "TORNEO"}
          </div>

          {/* Title — extra large for quick readability */}
          <h1
            className="font-azonix glow-purple leading-none"
            style={{ fontSize: 88, color: "#B339C4" }}
          >
            {event.title}
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 30,
              color: "#9E46AE",
              maxWidth: 800,
              lineHeight: 1.3,
            }}
          >
            {event.subtitle}
          </p>

          {/* Games */}
          <div className="flex flex-wrap justify-center gap-4">
            {event.games.map((game) => (
              <div
                key={game}
                style={{
                  padding: "10px 28px",
                  background: "rgba(132,197,82,0.1)",
                  border: "1px solid rgba(132,197,82,0.3)",
                  fontSize: 26,
                  color: "#84C552",
                  fontWeight: 600,
                }}
              >
                {game}
              </div>
            ))}
          </div>

          {/* Date + Time — prominent */}
          <div
            className="box-glow-purple"
            style={{
              padding: "24px 60px",
              background: "rgba(179,57,196,0.06)",
              border: "1px solid rgba(179,57,196,0.3)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              className="font-azonix glow-green"
              style={{ fontSize: 44, color: "#84C552" }}
            >
              {event.date.toUpperCase()}
            </span>
            <span
              className="font-azonix"
              style={{ fontSize: 32, color: "#FFFFFF" }}
            >
              {event.time}
            </span>
          </div>
        </div>

        {/* Bottom: Venue + details */}
        <div className="flex flex-col items-center gap-4">
          {event.venue && (
            <span style={{ fontSize: 28, color: "#9E46AE" }}>
              {event.venue}
            </span>
          )}
          <span style={{ fontSize: 22, color: "#888899" }}>{event.city}</span>

          <div className="flex gap-4">
            {event.entryFee && (
              <div
                style={{
                  padding: "8px 22px",
                  background: "rgba(132,197,82,0.1)",
                  border: "1px solid rgba(132,197,82,0.2)",
                  fontSize: 22,
                  color: "#84C552",
                }}
              >
                {event.entryFee === "Gratis" ? "ENTRADA LIBRE" : event.entryFee}
              </div>
            )}
            {event.platforms && (
              <div
                style={{
                  padding: "8px 22px",
                  background: "rgba(179,57,196,0.06)",
                  border: "1px solid rgba(179,57,196,0.2)",
                  fontSize: 22,
                  color: "#B339C4",
                }}
              >
                {event.platforms.join(" · ")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import type { EventData } from "@/lib/event-data";

/**
 * Instagram Story Banner — 1080×1920 (9:16)
 * Safe zone: 250px top/bottom
 *
 * Full-screen vertical format. Content stays within safe zone.
 * Gaming aesthetic: dark background, grid pattern, diagonal accents,
 * AZONIX for headlines, glow effects.
 */
export function InstagramStory({ event }: { event: EventData }) {
  return (
    <div
      className="banner-frame bg-grid relative"
      style={{ width: 1080, height: 1920, background: "#0a0a12" }}
    >
      {/* Background diagonal stripe accent — top right */}
      <div
        className="diagonal-stripe absolute"
        style={{ top: 0, right: 0, width: 400, height: 600, opacity: 0.1 }}
      />
      {/* Background diagonal stripe accent — bottom left */}
      <div
        className="diagonal-stripe-green absolute"
        style={{ bottom: 0, left: 0, width: 350, height: 500, opacity: 0.08 }}
      />

      {/* Scanline overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute left-0 right-0 h-[2px] animate-scanline"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(179,57,196,0.3), transparent)",
          }}
        />
      </div>

      {/* Pixel scatter decorations */}
      <div className="absolute inset-0 pixel-scatter" />

      {/* ===== Content area (within safe zone) ===== */}
      <div
        className="relative flex flex-col justify-between"
        style={{
          paddingTop: 280,
          paddingBottom: 280,
          paddingLeft: 80,
          paddingRight: 80,
          height: "100%",
        }}
      >
        {/* Top section: Logo + Event type badge */}
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <img
            src="/logo.png"
            alt="GamER"
            style={{ height: 100, width: "auto" }}
          />

          {/* Event type badge */}
          <div
            className="hud-corners"
            style={{
              border: "1px solid rgba(179,57,196,0.4)",
              padding: "12px 32px",
              background: "rgba(179,57,196,0.08)",
            }}
          >
            <span
              className="font-azonix tracking-widest"
              style={{ fontSize: 22, color: "#B339C4" }}
            >
              {event.type === "torneo-hibrido"
                ? "TORNEO HÍBRIDO"
                : event.type === "cyber-cafe"
                  ? "NOCHE DE CYBER"
                  : "TORNEO"}
            </span>
          </div>
        </div>

        {/* Center section: Title + Games */}
        <div className="flex flex-col items-center text-center gap-8">
          {/* Main title */}
          <h1
            className="font-azonix glow-purple leading-none"
            style={{ fontSize: 82, color: "#B339C4" }}
          >
            {event.title}
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 32,
              color: "#9E46AE",
              maxWidth: 800,
              lineHeight: 1.3,
            }}
          >
            {event.subtitle}
          </p>

          {/* Games list */}
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

          {/* Decorative line */}
          <div
            style={{
              width: 200,
              height: 3,
              background:
                "linear-gradient(90deg, transparent, #B339C4, transparent)",
            }}
          />
        </div>

        {/* Bottom section: Date, Time, Venue, Details */}
        <div className="flex flex-col items-center gap-6">
          {/* Date + Time */}
          <div className="flex flex-col items-center gap-3">
            <span
              className="font-azonix glow-green"
              style={{ fontSize: 48, color: "#84C552" }}
            >
              {event.date.toUpperCase()}
            </span>
            <span
              className="font-azonix"
              style={{ fontSize: 36, color: "#FFFFFF" }}
            >
              {event.time}
            </span>
          </div>

          {/* Venue */}
          {event.venue && (
            <div className="flex flex-col items-center gap-1">
              <span style={{ fontSize: 28, color: "#9E46AE" }}>
                {event.venue}
              </span>
              <span style={{ fontSize: 24, color: "#888899" }}>
                {event.city}
              </span>
            </div>
          )}

          {/* Entry fee or extra info */}
          <div className="flex gap-6">
            {event.entryFee && (
              <div
                style={{
                  padding: "8px 24px",
                  background: "rgba(132,197,82,0.12)",
                  border: "1px solid rgba(132,197,82,0.25)",
                  fontSize: 24,
                  color: "#84C552",
                }}
              >
                {event.entryFee === "Gratis" ? "ENTRADA LIBRE" : event.entryFee}
              </div>
            )}
            {event.platforms && (
              <div
                style={{
                  padding: "8px 24px",
                  background: "rgba(179,57,196,0.08)",
                  border: "1px solid rgba(179,57,196,0.25)",
                  fontSize: 24,
                  color: "#B339C4",
                }}
              >
                {event.platforms.join(" · ")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Corner decorations */}
      <div
        className="absolute"
        style={{
          top: 40,
          left: 40,
          width: 60,
          height: 60,
          borderTop: "3px solid #B339C4",
          borderLeft: "3px solid #B339C4",
        }}
      />
      <div
        className="absolute"
        style={{
          top: 40,
          right: 40,
          width: 60,
          height: 60,
          borderTop: "3px solid #B339C4",
          borderRight: "3px solid #B339C4",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 40,
          left: 40,
          width: 60,
          height: 60,
          borderBottom: "3px solid #84C552",
          borderLeft: "3px solid #84C552",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 40,
          right: 40,
          width: 60,
          height: 60,
          borderBottom: "3px solid #84C552",
          borderRight: "3px solid #84C552",
        }}
      />
    </div>
  );
}

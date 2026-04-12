"use client";

import type { EventData } from "@/lib/event-data";

/**
 * Instagram Feed Tall — 1080×1440 (3:4)
 * Safe zone: 40px all sides
 *
 * Matches profile grid preview exactly — no cropping on grid.
 * More compact than story — tighter layout, bolder typography.
 */
export function InstagramFeedTall({ event }: { event: EventData }) {
  return (
    <div
      className="banner-frame bg-grid-dense relative"
      style={{ width: 1080, height: 1440, background: "#0a0a12" }}
    >
      {/* Top purple gradient bar */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: 6,
          background: "linear-gradient(90deg, #833D90, #B339C4, #84C552)",
        }}
      />

      {/* Diagonal accent — top right corner */}
      <div
        className="absolute"
        style={{
          top: 0,
          right: 0,
          width: 300,
          height: 300,
          background:
            "linear-gradient(135deg, rgba(179,57,196,0.12) 0%, transparent 60%)",
        }}
      />

      {/* Content */}
      <div
        className="relative flex flex-col h-full"
        style={{ padding: 60 }}
      >
        {/* Header: Logo + event badge */}
        <div className="flex items-center justify-between">
          <img src="/logo.png" alt="GamER" style={{ height: 70, width: "auto" }} />
          <div
            className="font-azonix"
            style={{
              fontSize: 18,
              color: "#84C552",
              padding: "8px 20px",
              border: "1px solid rgba(132,197,82,0.3)",
              background: "rgba(132,197,82,0.06)",
            }}
          >
            {event.type === "torneo-hibrido"
              ? "TORNEO HÍBRIDO"
              : event.type === "cyber-cafe"
                ? "CYBER NIGHT"
                : "TORNEO"}
          </div>
        </div>

        {/* Title block — centered, dominant */}
        <div
          className="flex-1 flex flex-col items-center justify-center text-center"
          style={{ gap: 28 }}
        >
          <h1
            className="font-azonix glow-purple leading-none"
            style={{ fontSize: 76, color: "#B339C4" }}
          >
            {event.title}
          </h1>

          <p style={{ fontSize: 28, color: "#9E46AE", maxWidth: 800 }}>
            {event.subtitle}
          </p>

          {/* Games */}
          <div className="flex flex-wrap justify-center gap-3" style={{ marginTop: 12 }}>
            {event.games.map((game) => (
              <span
                key={game}
                style={{
                  padding: "8px 22px",
                  background: "rgba(132,197,82,0.08)",
                  border: "1px solid rgba(132,197,82,0.25)",
                  fontSize: 22,
                  color: "#84C552",
                  fontWeight: 600,
                }}
              >
                {game}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom info strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          {/* Date + Time */}
          <div className="flex flex-col gap-1">
            <span
              className="font-azonix glow-green"
              style={{ fontSize: 36, color: "#84C552" }}
            >
              {event.date.toUpperCase()}
            </span>
            <span style={{ fontSize: 26, color: "#FFFFFF" }}>
              {event.time}
            </span>
          </div>

          {/* Venue */}
          <div className="flex flex-col items-end gap-1">
            {event.venue && (
              <span style={{ fontSize: 24, color: "#9E46AE" }}>
                {event.venue}
              </span>
            )}
            <span style={{ fontSize: 20, color: "#888899" }}>
              {event.city}
            </span>
          </div>
        </div>

        {/* Entry + Platforms row */}
        <div
          className="flex gap-4 justify-center"
          style={{ marginTop: 24 }}
        >
          {event.entryFee && (
            <div
              style={{
                padding: "6px 20px",
                background: "rgba(132,197,82,0.1)",
                border: "1px solid rgba(132,197,82,0.2)",
                fontSize: 20,
                color: "#84C552",
              }}
            >
              {event.entryFee === "Gratis" ? "ENTRADA LIBRE" : event.entryFee}
            </div>
          )}
          {event.platforms && (
            <div
              style={{
                padding: "6px 20px",
                background: "rgba(179,57,196,0.06)",
                border: "1px solid rgba(179,57,196,0.2)",
                fontSize: 20,
                color: "#B339C4",
              }}
            >
              {event.platforms.join(" · ")}
            </div>
          )}
        </div>
      </div>

      {/* Bottom gradient bar */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: 6,
          background: "linear-gradient(90deg, #84C552, #B339C4, #833D90)",
        }}
      />
    </div>
  );
}

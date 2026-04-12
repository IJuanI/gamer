"use client";

import type { EventData } from "@/lib/event-data";

/**
 * Instagram Feed Post — 1080×1350 (4:5)
 * Safe zone: 40px all sides
 *
 * Standard vertical feed format. Slightly more compact than 3:4.
 * Optimized for maximum feed real estate in classic layout.
 */
export function InstagramFeedPost({ event }: { event: EventData }) {
  return (
    <div
      className="banner-frame bg-grid relative"
      style={{ width: 1080, height: 1350, background: "#0a0a12" }}
    >
      {/* Left purple accent bar */}
      <div
        className="absolute top-0 left-0 bottom-0"
        style={{
          width: 6,
          background: "linear-gradient(180deg, #B339C4, #833D90, transparent)",
        }}
      />

      {/* Geometric accent — large angled block top-right */}
      <div
        className="absolute"
        style={{
          top: -60,
          right: -60,
          width: 280,
          height: 280,
          background: "rgba(179,57,196,0.06)",
          transform: "rotate(45deg)",
        }}
      />

      {/* Content */}
      <div
        className="relative flex flex-col h-full"
        style={{ padding: "50px 60px" }}
      >
        {/* Top: Logo + Date */}
        <div className="flex items-center justify-between">
          <img src="/logo.png" alt="GamER" style={{ height: 60, width: "auto" }} />
          <div className="flex flex-col items-end">
            <span
              className="font-azonix"
              style={{ fontSize: 22, color: "#84C552" }}
            >
              {event.date.toUpperCase()}
            </span>
            <span style={{ fontSize: 18, color: "#888899" }}>{event.time}</span>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background:
              "linear-gradient(90deg, #B339C4, rgba(179,57,196,0.2), transparent)",
            marginTop: 30,
            marginBottom: 30,
          }}
        />

        {/* Center: Title + Subtitle + Games */}
        <div
          className="flex-1 flex flex-col justify-center"
          style={{ gap: 24 }}
        >
          {/* Event type label */}
          <span
            className="font-azonix"
            style={{ fontSize: 20, color: "#833D90", letterSpacing: "0.15em" }}
          >
            {event.type === "torneo-hibrido"
              ? "TORNEO HÍBRIDO"
              : event.type === "cyber-cafe"
                ? "NOCHE DE CYBER"
                : "TORNEO"}
          </span>

          <h1
            className="font-azonix glow-purple leading-none"
            style={{ fontSize: 70, color: "#B339C4" }}
          >
            {event.title}
          </h1>

          <p
            style={{
              fontSize: 28,
              color: "#9E46AE",
              lineHeight: 1.3,
              maxWidth: 800,
            }}
          >
            {event.subtitle}
          </p>

          {/* Games */}
          <div className="flex flex-wrap gap-3">
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

        {/* Bottom: Venue + Prizes/Info */}
        <div>
          {/* Prizes row */}
          {event.prizes && event.prizes.length > 0 && (
            <div
              className="flex gap-4 flex-wrap"
              style={{ marginBottom: 20 }}
            >
              {event.prizes.map((prize, i) => (
                <div
                  key={i}
                  style={{
                    padding: "8px 20px",
                    background:
                      i === 0
                        ? "rgba(132,197,82,0.12)"
                        : "rgba(179,57,196,0.06)",
                    border: `1px solid ${i === 0 ? "rgba(132,197,82,0.3)" : "rgba(179,57,196,0.2)"}`,
                    fontSize: 20,
                    color: i === 0 ? "#84C552" : "#9E46AE",
                    fontWeight: 600,
                  }}
                >
                  {prize}
                </div>
              ))}
            </div>
          )}

          {/* Venue row */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              {event.venue && (
                <span style={{ fontSize: 24, color: "#9E46AE" }}>
                  📍 {event.venue}
                </span>
              )}
              <span style={{ fontSize: 20, color: "#888899" }}>
                {event.city}
              </span>
            </div>
            <div className="flex gap-3">
              {event.entryFee && (
                <div
                  style={{
                    padding: "6px 18px",
                    background: "rgba(132,197,82,0.1)",
                    border: "1px solid rgba(132,197,82,0.2)",
                    fontSize: 18,
                    color: "#84C552",
                  }}
                >
                  {event.entryFee === "Gratis"
                    ? "ENTRADA LIBRE"
                    : event.entryFee}
                </div>
              )}
              {event.platforms && (
                <div
                  style={{
                    padding: "6px 18px",
                    background: "rgba(179,57,196,0.06)",
                    border: "1px solid rgba(179,57,196,0.2)",
                    fontSize: 18,
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
    </div>
  );
}

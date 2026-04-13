"use client";

import type { EventData } from "@/lib/event-data";
import { DEFAULT_VARIATION, type BannerVariation } from "@/lib/variation";
import { ICON_MAP } from "./icon-map";

/**
 * Open Duo — Countdown Feed Post — 1080×1350 (4:5)
 * Safe zone: 40px all sides
 *
 * Countdown in feed format. Giant number scaled for 4:5 ratio.
 */
export function OpenDuoCountdownFeed({
  event,
  daysLeft,
  variation = DEFAULT_VARIATION,
}: {
  event: EventData;
  daysLeft: number;
  variation?: BannerVariation;
}) {
  const [Icon1, Icon2, Icon3] = variation.icons.map((n) => ICON_MAP[n]);
  const [rot1, rot2, rot3] = variation.rotationOffsets;
  const [s1, s2, s3] = variation.positionSeeds;
  const [d1, d2, d3] = variation.decoratorSeeds;
  const lp = (s: number, lo: number, hi: number) => Math.round(lo + s * (hi - lo));
  const cv = variation.clipVariance;
  const isPlural = daysLeft !== 1;
  const daysLabel = daysLeft === 0 ? "" : isPlural ? "DÍAS" : "DÍA";
  const fallsLabel = daysLeft === 0 ? "" : isPlural ? "FALTAN" : "FALTA";

  return (
    <div
      className="banner-frame relative"
      style={{ width: 1080, height: 1350, background: "#1c1435" }}
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
          height: 350,
          background: "linear-gradient(180deg, rgba(179,57,196,0.14), transparent)",
          clipPath: `polygon(0 0, 100% 0, 100% ${65 + cv}%, 0 100%)`,
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 0,
          left: 0,
          width: "100%",
          height: 350,
          background: "linear-gradient(0deg, rgba(132,197,82,0.1), transparent)",
          clipPath: "polygon(0 35%, 100% 0, 100% 100%, 0 100%)",
        }}
      />

      {/* Trapezoid accents */}
      <div
        className="absolute"
        style={{
          top: lp(d3, 100, 220),
          left: 0,
          width: lp(d3, 120, 210),
          height: lp(d3, 180, 300),
          background: "rgba(179,57,196,0.09)",
          clipPath: "polygon(0 0, 100% 0, 70% 100%, 0 100%)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: lp(d3, 100, 220),
          right: 0,
          width: lp(d3, 100, 190),
          height: lp(d3, 160, 280),
          background: "rgba(132,197,82,0.07)",
          clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)",
        }}
      />

      {/* Centered targeting-reticle rings — fixed, frame the countdown number */}
      <div
        className="absolute"
        style={{
          top: "50%",
          left: "50%",
          width: 480,
          height: 480,
          marginTop: -240,
          marginLeft: -240,
          borderRadius: "50%",
          border: "2px solid rgba(132,197,82,0.12)",
        }}
      />
      <div
        className="absolute"
        style={{
          top: "50%",
          left: "50%",
          width: 360,
          height: 360,
          marginTop: -180,
          marginLeft: -180,
          borderRadius: "50%",
          border: "1px solid rgba(132,197,82,0.07)",
        }}
      />

      {/* Offset rings */}
      <div
        className="absolute"
        style={{
          top: lp(d1, 130, 260),
          right: lp(d1, 0, 50),
          width: lp(d1, 200, 300),
          height: lp(d1, 200, 300),
          borderRadius: "50%",
          border: "2px solid rgba(179,57,196,0.15)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: lp(d2, 150, 280),
          left: lp(d2, -10, 50),
          width: lp(d2, 160, 260),
          height: lp(d2, 160, 260),
          borderRadius: "50%",
          border: "2px solid rgba(132,197,82,0.12)",
        }}
      />

      {/* Dots */}
      <div
        className="absolute"
        style={{
          top: lp(d1, 320, 460),
          left: lp(d1, 50, 130),
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "rgba(179,57,196,0.3)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: lp(d2, 300, 430),
          right: lp(d2, 60, 140),
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "rgba(132,197,82,0.25)",
        }}
      />

      {/* Gaming icons */}
      <Icon1
        size={100}
        color="rgba(179,57,196,0.22)"
        style={{ top: lp(s1, 180, 520), right: lp(s1, 20, 200), transform: `rotate(${-12 + rot1}deg)` }}
      />
      <Icon2
        size={70}
        color="rgba(132,197,82,0.2)"
        style={{ bottom: lp(s2, 260, 600), left: lp(s2, 30, 210), transform: `rotate(${8 + rot2}deg)` }}
      />
      <Icon3
        size={80}
        color="rgba(132,197,82,0.18)"
        style={{ bottom: lp(s3, 400, 760), right: lp(s3, 20, 190), transform: `rotate(${rot3}deg)` }}
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
            "linear-gradient(90deg, rgba(179,57,196,0.4), rgba(179,57,196,0.1) 30%, transparent 50%, rgba(132,197,82,0.1) 70%, rgba(132,197,82,0.3))",
        }}
      />

      {/* Corner brackets */}
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

      {/* ===== Content ===== */}
      <div
        className="relative flex flex-col h-full items-center"
        style={{ padding: "50px 60px" }}
      >
        {/* Logo */}
        <img
          src="/logo.png"
          alt="GamER"
          style={{ height: 120, width: "auto" }}
        />

        {/* Center: Giant countdown number — absolutely centered on canvas */}
        <div
          className="absolute flex flex-col items-center"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            gap: 16,
          }}
        >
          <span
            className="font-azonix leading-none"
            style={{
              fontSize: 180,
              color: "#96D068",
              textShadow:
                "0 0 40px rgba(132,197,82,0.4), 0 0 80px rgba(132,197,82,0.15)",
            }}
          >
            {daysLeft === 0 ? "HOY" : daysLeft}
          </span>
          <div style={{ textAlign: "center" }}>
            <span
              className="font-azonix block"
              style={{
                fontSize: 48,
                color: "#96D068",
                letterSpacing: "0.2em",
                lineHeight: 1,
              }}
            >
              {daysLabel}
            </span>
            <span
              className="font-azonix block"
              style={{
                fontSize: 32,
                color: "#C06DD0",
                letterSpacing: "0.18em",
                marginTop: 12,
              }}
            >
              {fallsLabel}
            </span>
          </div>
        </div>

        {/* Bottom: Event info */}
        <div
          className="flex flex-col items-center"
          style={{ gap: 16, marginTop: "auto" }}
        >
          <span
            className="font-azonix"
            style={{
              fontSize: 44,
              color: "#96D068",
              textShadow: "0 0 20px rgba(132,197,82,0.3)",
              letterSpacing: "0.04em",
            }}
          >
            {event.date.toUpperCase()}
          </span>

          <div className="flex flex-col items-center" style={{ gap: 8 }}>
            {event.venueLogo && (
              <img
                src={event.venueLogo}
                alt={event.venue ?? "Venue"}
                style={{ height: 56, width: "auto", opacity: 0.9 }}
              />
            )}
            <span
              className="font-azonix"
              style={{ fontSize: 24, color: "#888899" }}
            >
              {event.city}
            </span>
          </div>

          <div
            className="panel-clip-sm font-azonix"
            style={{
              padding: "14px 30px",
              background: "rgba(132,197,82,0.12)",
              border: "1px solid rgba(132,197,82,0.4)",
              fontSize: 26,
              color: "#96D068",
              textShadow: "0 0 20px rgba(132,197,82,0.25)",
              letterSpacing: "0.08em",
            }}
          >
            INSCRIPCIONES ABIERTAS
          </div>
        </div>
      </div>
    </div>
  );
}

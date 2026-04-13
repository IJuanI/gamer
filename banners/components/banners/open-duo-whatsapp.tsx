"use client";

import type { EventData } from "@/lib/event-data";
import { joinGameNames } from "@/lib/event-data";
import { DEFAULT_VARIATION, type BannerVariation } from "@/lib/variation";
import { ICON_MAP } from "./icon-map";

/**
 * Open Duo — WhatsApp Group — 1080×1080 (1:1 square)
 * Safe zone: 60px all sides
 * Optimized for WhatsApp group flyer sharing
 */
export function OpenDuoWhatsApp({ event, variation = DEFAULT_VARIATION }: { event: EventData; variation?: BannerVariation }) {
  const [Icon1, Icon2, Icon3] = variation.icons.map((n) => ICON_MAP[n]);
  const [rot1, rot2, rot3] = variation.rotationOffsets;
  const [s1, s2, s3] = variation.positionSeeds;
  const [d1, d2, d3] = variation.decoratorSeeds;
  const lp = (s: number, lo: number, hi: number) => Math.round(lo + s * (hi - lo));
  const cv = variation.clipVariance;
  return (
    <div
      className="banner-frame relative"
      style={{ width: 1080, height: 1080, background: "#1c1435" }}
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
          background:
            "linear-gradient(180deg, rgba(179,57,196,0.14), transparent)",
          clipPath: `polygon(0 0, 100% 0, 100% ${65 + cv}%, 0 100%)`,
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 0,
          right: 0,
          width: "100%",
          height: 350,
          background:
            "linear-gradient(0deg, rgba(132,197,82,0.1), transparent)",
          clipPath: `polygon(0 ${35 - cv}%, 100% 0, 100% 100%, 0 100%)`,
        }}
      />

      {/* Trapezoid accents */}
      <div
        className="absolute"
        style={{
          top: lp(d3, 110, 210),
          left: 0,
          width: lp(d3, 90, 160),
          height: lp(d3, 160, 260),
          background: "rgba(179,57,196,0.09)",
          clipPath: "polygon(0 0, 100% 0, 70% 100%, 0 100%)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: lp(d3, 110, 210),
          right: 0,
          width: lp(d3, 90, 160),
          height: lp(d3, 160, 260),
          background: "rgba(132,197,82,0.08)",
          clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)",
        }}
      />

      {/* Circular ring accents */}
      <div
        className="absolute"
        style={{
          top: lp(d1, 150, 280),
          right: lp(d1, -30, 20),
          width: lp(d1, 200, 300),
          height: lp(d1, 200, 300),
          borderRadius: "50%",
          border: "2px solid rgba(179,57,196,0.15)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: lp(d2, 100, 230),
          left: lp(d2, -70, -20),
          width: lp(d2, 240, 340),
          height: lp(d2, 240, 340),
          borderRadius: "50%",
          border: "2px solid rgba(132,197,82,0.12)",
        }}
      />

      {/* Dots */}
      <div
        className="absolute"
        style={{
          top: lp(d1, 70, 160),
          left: lp(d1, 40, 110),
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "rgba(179,57,196,0.3)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: lp(d2, 70, 160),
          right: lp(d2, 50, 120),
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "rgba(132,197,82,0.25)",
        }}
      />

      {/* ===== Gaming iconography ===== */}
      <Icon1
        size={100}
        color="rgba(179,57,196,0.25)"
        style={{ top: lp(s1, 150, 380), right: lp(s1, 30, 200), transform: `rotate(${-10 + rot1}deg)` }}
      />
      <Icon2
        size={70}
        color="rgba(132,197,82,0.22)"
        style={{ bottom: lp(s2, 80, 320), left: lp(s2, 30, 200), transform: `rotate(${12 + rot2}deg)` }}
      />
      <Icon3
        size={60}
        color="rgba(179,57,196,0.2)"
        style={{ top: lp(s3, 90, 320), left: lp(s3, 60, 250), transform: `rotate(${5 + rot3}deg)` }}
      />

      {/* HUD accent bar */}
      <div
        className="absolute"
        style={{
          top: 200,
          left: 0,
          right: 0,
          height: 1,
          background:
            "linear-gradient(90deg, rgba(179,57,196,0.5), rgba(179,57,196,0.1) 30%, transparent 50%, rgba(132,197,82,0.1) 70%, rgba(132,197,82,0.4))",
        }}
      />

      {/* ===== Content — Centered square layout ===== */}
      <div
        className="relative flex flex-col items-center justify-center h-full"
        style={{
          padding: "60px",
          textAlign: "center",
          gap: 20,
        }}
      >
        {/* Logo */}
        <img
          src="/logo.png"
          alt="GamER"
          style={{ height: 100, width: "auto", marginBottom: 10 }}
        />

        {/* Badge */}
        <div
          className="panel-clip-sm font-azonix"
          style={{
            padding: "12px 28px",
            background: "rgba(179,57,196,0.1)",
            border: "1px solid rgba(179,57,196,0.3)",
            fontSize: 22,
            color: "#C06DD0",
            letterSpacing: "0.15em",
          }}
        >
          TORNEO PRESENCIAL
        </div>

        {/* Main title */}
        <h1
          className="font-azonix leading-none"
          style={{
            fontSize: 110,
            color: "#E8E8F0",
            textShadow:
              "0 0 40px rgba(179,57,196,0.4), 0 0 80px rgba(179,57,196,0.15)",
            margin: "8px 0",
          }}
        >
          {event.title}
        </h1>

        {/* Games */}
        <p style={{ fontSize: 30, color: "#D0D0DC", lineHeight: 1.2, margin: 0 }}>
          <span style={{ color: "#96D068", fontWeight: 700 }}>
            {event.gameDetails
              ? event.gameDetails.map((g) => g.shortName).join(" · ")
              : joinGameNames(event.games)}
          </span>
        </p>

        {/* Date */}
        <div
          style={{
            padding: "12px 28px",
            background: "rgba(179,57,196,0.08)",
            border: "1px solid rgba(179,57,196,0.2)",
            borderRadius: "4px",
            marginTop: 8,
          }}
        >
          <span
            className="font-azonix"
            style={{
              fontSize: 42,
              color: "#96D068",
              textShadow: "0 0 20px rgba(132,197,82,0.3)",
              display: "block",
            }}
          >
            {event.date.toUpperCase()}
          </span>
          <span style={{ fontSize: 24, color: "#E8E8F0" }}>
            {event.time}
          </span>
        </div>

        {/* Venue */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, justifyContent: "center" }}>
          {event.venueLogo && (
            <img
              src={event.venueLogo}
              alt={event.venue ?? "Venue"}
              style={{ height: 44, width: "auto", opacity: 0.9 }}
            />
          )}
          <span
            className="font-azonix"
            style={{ fontSize: 26, color: "#888899" }}
          >
            {event.city}
          </span>
        </div>

        {/* Entry + Inscriptions */}
        <div className="flex" style={{ gap: 20, marginTop: 8 }}>
          {event.entryFee && (
            <div
              className="panel-clip-sm font-azonix"
              style={{
                padding: "14px 28px",
                background: "rgba(132,197,82,0.12)",
                border: "1px solid rgba(132,197,82,0.4)",
                fontSize: 28,
                color: "#96D068",
                textShadow: "0 0 20px rgba(132,197,82,0.25)",
                letterSpacing: "0.04em",
              }}
            >
              {event.entryFee}
            </div>
          )}
          <div
            className="panel-clip-sm font-azonix"
            style={{
              padding: "14px 28px",
              background: "rgba(179,57,196,0.12)",
              border: "1px solid rgba(179,57,196,0.4)",
              fontSize: 28,
              color: "#C06DD0",
              textShadow: "0 0 20px rgba(179,57,196,0.25)",
              letterSpacing: "0.08em",
            }}
          >
            INSCRÍBETE
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

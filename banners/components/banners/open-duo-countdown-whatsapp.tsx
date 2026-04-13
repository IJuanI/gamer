"use client";

import type { EventData } from "@/lib/event-data";
import { DEFAULT_VARIATION, type BannerVariation } from "@/lib/variation";
import { ICON_MAP } from "./icon-map";

/**
 * Open Duo — Countdown WhatsApp — 1080×1080 (1:1 square)
 * Safe zone: 60px all sides
 *
 * Countdown urgency banner optimized for WhatsApp group sharing.
 */
export function OpenDuoCountdownWhatsApp({
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
          right: 0,
          width: "100%",
          height: 300,
          background:
            "linear-gradient(180deg, rgba(179,57,196,0.14), transparent)",
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 65%)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 0,
          left: 0,
          width: "100%",
          height: 300,
          background:
            "linear-gradient(0deg, rgba(132,197,82,0.1), transparent)",
          clipPath: "polygon(0 35%, 100% 0, 100% 100%, 0 100%)",
        }}
      />

      {/* Trapezoid accents */}
      <div
        className="absolute"
        style={{
          top: lp(d3, 100, 210),
          left: 0,
          width: lp(d3, 90, 160),
          height: lp(d3, 140, 240),
          background: "rgba(179,57,196,0.08)",
          clipPath: "polygon(0 0, 100% 0, 70% 100%, 0 100%)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: lp(d3, 100, 210),
          right: 0,
          width: lp(d3, 90, 160),
          height: lp(d3, 140, 240),
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
          width: 400,
          height: 400,
          marginTop: -200,
          marginLeft: -200,
          borderRadius: "50%",
          border: "2px solid rgba(132,197,82,0.12)",
        }}
      />
      <div
        className="absolute"
        style={{
          top: "50%",
          left: "50%",
          width: 300,
          height: 300,
          marginTop: -150,
          marginLeft: -150,
          borderRadius: "50%",
          border: "1px solid rgba(132,197,82,0.07)",
        }}
      />

      {/* Offset rings */}
      <div
        className="absolute"
        style={{
          top: lp(d1, 80, 200),
          right: lp(d1, 10, 60),
          width: lp(d1, 160, 260),
          height: lp(d1, 160, 260),
          borderRadius: "50%",
          border: "2px solid rgba(179,57,196,0.15)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: lp(d2, 80, 200),
          left: lp(d2, 10, 60),
          width: lp(d2, 160, 260),
          height: lp(d2, 160, 260),
          borderRadius: "50%",
          border: "2px solid rgba(132,197,82,0.12)",
        }}
      />

      {/* Dot accents */}
      <div
        className="absolute"
        style={{
          top: lp(d1, 70, 150),
          left: lp(d1, 50, 120),
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "rgba(179,57,196,0.3)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: lp(d2, 70, 150),
          right: lp(d2, 50, 120),
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "rgba(132,197,82,0.28)",
        }}
      />

      {/* ===== Gaming iconography ===== */}
      <Icon1
        size={80}
        color="rgba(179,57,196,0.22)"
        style={{ top: lp(s1, 160, 360), right: lp(s1, 20, 200), transform: `rotate(${-15 + rot1}deg)` }}
      />
      <Icon2
        size={60}
        color="rgba(132,197,82,0.2)"
        style={{ bottom: lp(s2, 140, 340), left: lp(s2, 20, 200), transform: `rotate(${10 + rot2}deg)` }}
      />
      <Icon3
        size={70}
        color="rgba(132,197,82,0.16)"
        style={{ top: lp(s3, 100, 320), left: lp(s3, 20, 220), transform: `rotate(${rot3}deg)` }}
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
        }}
      >
        {/* Logo + Event name */}
        <img
          src="/logo.png"
          alt="GamER"
          style={{ height: 120, width: "auto", marginBottom: 14 }}
        />
        <span
          className="font-azonix"
          style={{
            fontSize: 32,
            color: "#C06DD0",
            letterSpacing: "0.1em",
            marginBottom: 18,
          }}
        >
          {event.title}
        </span>

        {/* Countdown label */}
        <span
          className="font-azonix"
          style={{
            fontSize: 36,
            color: "#D0D0DC",
            letterSpacing: "0.2em",
            marginBottom: 8,
          }}
        >
          {daysLeft === 0 ? "" : daysLeft === 1 ? "FALTA" : "FALTAN"}
        </span>

        {/* Giant number with HUD frame */}
        <div
          className="relative flex items-center justify-center"
          style={{ width: 340, height: 280, marginBottom: 12 }}
        >
          <div className="hud-bracket-tl" />
          <div className="hud-bracket-tr" />
          <div className="hud-bracket-bl" />
          <div className="hud-bracket-br" />
          <span
            className="font-azonix"
            style={{
              fontSize: daysLeft === 0 ? 180 : 240,
              color: "#96D068",
              lineHeight: 0.85,
              textShadow:
                "0 0 40px rgba(132,197,82,0.4), 0 0 80px rgba(132,197,82,0.15)",
            }}
          >
            {daysLeft === 0 ? "HOY" : daysLeft}
          </span>
        </div>

        {/* Days label */}
        <span
          className="font-azonix"
          style={{
            fontSize: 48,
            color: "#E8E8F0",
            letterSpacing: "0.15em",
            marginBottom: 16,
          }}
        >
          {daysLeft === 0 ? "" : daysLeft === 1 ? "DÍA" : "DÍAS"}
        </span>

        {/* Bottom info */}
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <div
            style={{
              width: 180,
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(179,57,196,0.4) 20%, rgba(179,57,196,0.4) 80%, transparent)",
              margin: "0 auto 8px",
            }}
          />
          <span
            className="font-azonix"
            style={{
              fontSize: 30,
              color: "#C06DD0",
              letterSpacing: "0.05em",
              display: "block",
              marginBottom: 6,
            }}
          >
            {event.date.toUpperCase()}
          </span>
          <span
            style={{
              fontSize: 32,
              color: "#96D068",
              display: "block",
              marginBottom: 12,
              letterSpacing: "0.08em",
            }}
          >
            {event.gameDetails
              ? event.gameDetails.map((g) => g.shortName).join(" · ")
              : event.games.join(" · ")}
          </span>
          <div className="flex items-center justify-center gap-2">
            <img
              src="/mirador-tec.png"
              alt="MiradorTec"
              style={{ height: 28, width: "auto", opacity: 0.85 }}
            />
            <span
              className="font-azonix"
              style={{ fontSize: 22, color: "#888899" }}
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
          top: 20,
          left: 20,
          width: 40,
          height: 40,
          borderTop: "3px solid rgba(179,57,196,0.5)",
          borderLeft: "3px solid rgba(179,57,196,0.5)",
        }}
      />
      <div
        className="absolute"
        style={{
          top: 20,
          right: 20,
          width: 40,
          height: 40,
          borderTop: "3px solid rgba(179,57,196,0.5)",
          borderRight: "3px solid rgba(179,57,196,0.5)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 20,
          left: 20,
          width: 40,
          height: 40,
          borderBottom: "3px solid rgba(132,197,82,0.5)",
          borderLeft: "3px solid rgba(132,197,82,0.5)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 20,
          right: 20,
          width: 40,
          height: 40,
          borderBottom: "3px solid rgba(132,197,82,0.5)",
          borderRight: "3px solid rgba(132,197,82,0.5)",
        }}
      />
    </div>
  );
}

"use client";

import type { EventData } from "@/lib/event-data";
import { joinGameNames } from "@/lib/event-data";
import { DEFAULT_VARIATION, type BannerVariation } from "@/lib/variation";
import { ICON_MAP } from "./icon-map";
import { SponsorStrip } from "./sponsor-strip";

/**
 * Open Duo — Instagram Feed Post — 1080×1350 (4:5)
 * Safe zone: 40px all sides
 */
export function OpenDuoFeed({
  event,
  variation = DEFAULT_VARIATION,
  sponsorLogos,
  bgImage,
}: {
  event: EventData;
  variation?: BannerVariation;
  sponsorLogos?: string[];
  bgImage?: string;
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
      style={{ width: 1080, height: 1350, background: bgImage ? "transparent" : "#1c1435" }}
    >
      {bgImage && (
        <img
          src={bgImage}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      )}
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
            "linear-gradient(180deg, rgba(179,57,196,0.14), transparent)",
          clipPath: `polygon(0 0, 100% 0, 100% ${65 + cv}%, 0 100%)`,
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
            "linear-gradient(0deg, rgba(132,197,82,0.1), transparent)",
          clipPath: `polygon(0 ${35 - cv}%, 100% 0, 100% 100%, 0 100%)`,
        }}
      />

      {/* Trapezoid */}
      <div
        className="absolute"
        style={{
          top: lp(d3, 60, 160),
          right: 0,
          width: lp(d3, 120, 210),
          height: lp(d3, 180, 300),
          background: "rgba(179,57,196,0.1)",
          clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)",
        }}
      />

      {/* Large circular ring accents */}
      <div
        className="absolute"
        style={{
          top: lp(d1, 130, 260),
          right: lp(d1, 0, 50),
          width: lp(d1, 240, 340),
          height: lp(d1, 240, 340),
          borderRadius: "50%",
          border: "2px solid rgba(179,57,196,0.17)",
        }}
      />
      <div
        className="absolute"
        style={{
          top: lp(d1, 185, 315),
          right: lp(d1, 45, 95),
          width: lp(d1, 130, 200),
          height: lp(d1, 130, 200),
          borderRadius: "50%",
          border: "1px solid rgba(179,57,196,0.1)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: lp(d2, 170, 310),
          left: lp(d2, -10, 50),
          width: lp(d2, 240, 360),
          height: lp(d2, 240, 360),
          borderRadius: "50%",
          border: "2px solid rgba(132,197,82,0.15)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: lp(d2, 220, 360),
          left: lp(d2, 40, 100),
          width: lp(d2, 160, 250),
          height: lp(d2, 160, 250),
          borderRadius: "50%",
          border: "1px solid rgba(132,197,82,0.09)",
        }}
      />
      {/* Dots */}
      <div
        className="absolute"
        style={{
          top: lp(d1, 380, 520),
          left: lp(d1, 40, 120),
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "rgba(179,57,196,0.35)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: lp(d2, 370, 510),
          right: lp(d2, 50, 130),
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "rgba(132,197,82,0.3)",
        }}
      />

      {/* ===== Gaming iconography ===== */}
      <Icon1
        size={100}
        color="rgba(179,57,196,0.25)"
        style={{ top: lp(s1, 220, 580), right: lp(s1, 20, 210), transform: `rotate(${-12 + rot1}deg)` }}
      />
      <Icon2
        size={70}
        color="rgba(132,197,82,0.22)"
        style={{ bottom: lp(s2, 280, 620), left: lp(s2, 30, 210), transform: `rotate(${8 + rot2}deg)` }}
      />
      <Icon3
        size={90}
        color="rgba(132,197,82,0.18)"
        style={{ bottom: lp(s3, 420, 780), right: lp(s3, 20, 190), transform: `rotate(${rot3}deg)` }}
      />
      <Icon1
        size={80}
        color="rgba(179,57,196,0.2)"
        style={{ top: lp(s1, 380, 720), left: lp(s1, 15, 180), transform: `rotate(${-20 + rot1}deg)` }}
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
        style={{ padding: `50px 60px ${sponsorLogos !== undefined ? 180 : 50}px` }}
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
              padding: "12px 32px",
              background: "rgba(179,57,196,0.12)",
              border: "1px solid rgba(179,57,196,0.4)",
              fontSize: 26,
              color: "#C06DD0",
              textShadow: "0 0 20px rgba(179,57,196,0.25)",
              letterSpacing: "0.12em",
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
          {/* Match format */}
          {event.matchFormat && (
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
                {event.matchFormat}
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
          )}

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
            {event.title}
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
              {joinGameNames(event.games)}
            </span>
          </p>

          {/* Game format pills */}
          {event.gameDetails && (
            <div className="flex gap-4 flex-wrap" style={{ marginTop: 4 }}>
              {event.gameDetails.map((g) => (
                <div
                  key={g.shortName}
                  className="panel-clip-sm font-azonix"
                  style={{
                    padding: "12px 28px",
                    background: "rgba(132,197,82,0.08)",
                    border: "1px solid rgba(132,197,82,0.25)",
                    fontSize: 20,
                    color: "#96D068",
                  }}
                >
                  {g.shortName}{g.format ? ` ${g.format}` : ""}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Bottom: Date + Venue + Info ── */}
        <div className="flex flex-col" style={{ gap: 16 }}>
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
          <div className="flex justify-center" style={{ gap: 20 }}>
            {event.entryFee && (
              <div
                className="panel-clip-sm font-azonix"
                style={{
                  padding: "14px 28px",
                  background: "rgba(132,197,82,0.12)",
                  border: "1px solid rgba(132,197,82,0.4)",
                  fontSize: 24,
                  color: "#96D068",
                  textShadow: "0 0 20px rgba(132,197,82,0.25)",
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap",
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
                fontSize: 24,
                color: "#C06DD0",
                textShadow: "0 0 20px rgba(179,57,196,0.25)",
                letterSpacing: "0.08em",
                whiteSpace: "nowrap",
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
      {sponsorLogos !== undefined && <SponsorStrip logos={sponsorLogos} bottom={40} />}
    </div>
  );
}

"use client";

import type { EventData } from "@/lib/event-data";
import { DEFAULT_VARIATION, type BannerVariation } from "@/lib/variation";
import { ICON_MAP } from "./icon-map";
import { SponsorStrip } from "./sponsor-strip";

/**
 * Open Duo — Countdown Story — 1080×1920 (9:16)
 * Safe zone: 250px top/bottom
 *
 * "Faltan X días" urgency banner. Giant number as visual anchor.
 */
export function OpenDuoCountdownStory({
  event,
  daysLeft,
  variation = DEFAULT_VARIATION,
  sponsorLogos,
  bgImage,
}: {
  event: EventData;
  daysLeft: number;
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
      style={{ width: 1080, height: 1920, background: bgImage ? "transparent" : "#1c1435" }}
    >
      {bgImage && <img src={bgImage} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
      {/* ===== Background layers ===== */}
      <div className="absolute inset-0 bg-grid-neon-fade" />

      {/* Angular color blocks */}
      <div
        className="absolute"
        style={{
          top: 0,
          right: 0,
          width: "100%",
          height: 500,
          background:
            "linear-gradient(180deg, rgba(179,57,196,0.14), transparent)",
          clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 ${65 + cv}%)`,
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
            "linear-gradient(0deg, rgba(132,197,82,0.1), transparent)",
          clipPath: `polygon(0 ${35 - cv}%, 100% 0, 100% 100%, 0 100%)`,
        }}
      />

      {/* Trapezoid accents */}
      <div
        className="absolute"
        style={{
          top: lp(d3, 220, 400),
          left: 0,
          width: lp(d3, 160, 260),
          height: lp(d3, 240, 380),
          background: "rgba(179,57,196,0.09)",
          clipPath: "polygon(0 0, 100% 0, 70% 100%, 0 100%)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: lp(d3, 220, 400),
          right: 0,
          width: lp(d3, 140, 240),
          height: lp(d3, 220, 360),
          background: "rgba(132,197,82,0.07)",
          clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)",
        }}
      />

      {/* Large centered targeting-reticle rings — fixed, frame the countdown number */}
      <div
        className="absolute"
        style={{
          top: "50%",
          left: "50%",
          width: 560,
          height: 560,
          marginTop: -280,
          marginLeft: -280,
          borderRadius: "50%",
          border: "2px solid rgba(132,197,82,0.12)",
        }}
      />
      <div
        className="absolute"
        style={{
          top: "50%",
          left: "50%",
          width: 460,
          height: 460,
          marginTop: -230,
          marginLeft: -230,
          borderRadius: "50%",
          border: "1px solid rgba(132,197,82,0.07)",
        }}
      />
      {/* Offset rings */}
      <div
        className="absolute"
        style={{
          top: lp(d1, 200, 360),
          right: lp(d1, 10, 70),
          width: lp(d1, 240, 340),
          height: lp(d1, 240, 340),
          borderRadius: "50%",
          border: "2px solid rgba(179,57,196,0.17)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: lp(d2, 240, 400),
          left: lp(d2, 0, 60),
          width: lp(d2, 220, 320),
          height: lp(d2, 220, 320),
          borderRadius: "50%",
          border: "2px solid rgba(132,197,82,0.15)",
        }}
      />
      {/* Dot accents */}
      <div
        className="absolute"
        style={{
          top: lp(d1, 460, 600),
          left: lp(d1, 70, 140),
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "rgba(179,57,196,0.35)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: lp(d2, 480, 620),
          right: lp(d2, 80, 160),
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "rgba(132,197,82,0.3)",
        }}
      />

      {/* ===== Gaming iconography ===== */}
      <Icon1
        size={110}
        color="rgba(179,57,196,0.25)"
        style={{ top: lp(s1, 300, 680), right: lp(s1, 20, 240), transform: `rotate(${-15 + rot1}deg)` }}
      />
      <Icon2
        size={80}
        color="rgba(132,197,82,0.22)"
        style={{ bottom: lp(s2, 380, 760), left: lp(s2, 30, 240), transform: `rotate(${10 + rot2}deg)` }}
      />
      <Icon3
        size={100}
        color="rgba(132,197,82,0.18)"
        style={{ top: lp(s3, 220, 560), left: lp(s3, 20, 200), transform: `rotate(${rot3}deg)` }}
      />
      <Icon1
        size={75}
        color="rgba(179,57,196,0.2)"
        style={{ bottom: lp(s1, 560, 1000), right: lp(s1, 20, 200), transform: `rotate(${-5 + rot1}deg)` }}
      />
      <Icon2
        size={80}
        color="rgba(179,57,196,0.18)"
        style={{ top: lp(s2, 560, 900), left: lp(s2, 20, 160), transform: `rotate(${-20 + rot2}deg)` }}
      />

      {/* HUD accent bars */}
      <div
        className="absolute"
        style={{
          top: 250,
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
          bottom: 250,
          left: 0,
          right: 0,
          height: 2,
          background:
            "linear-gradient(90deg, rgba(132,197,82,0.4), rgba(132,197,82,0.1) 30%, transparent 50%, rgba(179,57,196,0.1) 70%, rgba(179,57,196,0.5))",
        }}
      />

      {/* Chevron accents */}
      <div
        className="absolute"
        style={{
          top: 650,
          right: 60,
          width: 60,
          height: 20,
          background: "rgba(179,57,196,0.18)",
          clipPath:
            "polygon(20% 0, 100% 0, 80% 50%, 100% 100%, 20% 100%, 0 50%)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 650,
          left: 60,
          width: 60,
          height: 20,
          background: "rgba(132,197,82,0.18)",
          clipPath:
            "polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%, 20% 50%)",
        }}
      />

      {/* ===== Content — spread with breathing room ===== */}
      <div
        className="relative flex flex-col items-center justify-between h-full"
        style={{
          paddingTop: 280,
          paddingBottom: 280,
          paddingLeft: 80,
          paddingRight: 80,
        }}
      >
        {/* ── Top: Logo + event name ── */}
        <div className="flex flex-col items-center" style={{ gap: 14 }}>
          <img
            src="/logo.png"
            alt="GamER"
            style={{ height: 120, width: "auto" }}
          />
          <span
            className="font-azonix"
            style={{
              fontSize: 38,
              color: "#C06DD0",
              letterSpacing: "0.1em",
            }}
          >
            {event.title}
          </span>
        </div>

        {/* ── Center: THE NUMBER ── */}
        <div className="flex flex-col items-center" style={{ gap: 16 }}>
          <span
            className="font-azonix"
            style={{
              fontSize: 44,
              color: "#D0D0DC",
              letterSpacing: "0.2em",
            }}
          >
            {daysLeft === 0 ? "" : daysLeft === 1 ? "FALTA" : "FALTAN"}
          </span>

          {/* Giant number with HUD frame */}
          <div
            className="relative flex items-center justify-center"
            style={{ width: 400, height: 320 }}
          >
            <div className="hud-bracket-tl" />
            <div className="hud-bracket-tr" />
            <div className="hud-bracket-bl" />
            <div className="hud-bracket-br" />
            <span
              className="font-azonix"
              style={{
                fontSize: daysLeft === 0 ? 200 : 280,
                color: "#96D068",
                lineHeight: 0.85,
                textShadow:
                  "0 0 40px rgba(132,197,82,0.4), 0 0 80px rgba(132,197,82,0.15)",
              }}
            >
              {daysLeft === 0 ? "HOY" : daysLeft}
            </span>
          </div>

          <span
            className="font-azonix"
            style={{
              fontSize: 64,
              color: "#E8E8F0",
              letterSpacing: "0.15em",
            }}
          >
            {daysLeft === 0 ? "" : daysLeft === 1 ? "DÍA" : "DÍAS"}
          </span>
        </div>

        {/* ── Bottom: Date + Games + venue ── */}
        <div className="flex flex-col items-center" style={{ gap: 22 }}>
          <div className="flex flex-col items-center" style={{ gap: 14 }}>
            <div
              style={{
                width: 300,
                height: 2,
                background:
                  "linear-gradient(90deg, transparent, rgba(179,57,196,0.4) 20%, rgba(179,57,196,0.4) 80%, transparent)",
              }}
            />
            <span
              className="font-azonix"
              style={{ fontSize: 34, color: "#C06DD0" }}
            >
              {event.date.toUpperCase()}
            </span>
          </div>

          {event.gameDetails && (
            <div className="flex gap-4 flex-wrap justify-center">
              {event.gameDetails.map((g) => (
                <span
                  key={g.shortName}
                  className="panel-clip-sm font-azonix"
                  style={{
                    padding: "12px 28px",
                    background: "rgba(132,197,82,0.08)",
                    border: "1px solid rgba(132,197,82,0.25)",
                    fontSize: 22,
                    color: "#96D068",
                  }}
                >
                  {g.shortName} {g.format}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center" style={{ gap: 16 }}>
            {event.venueLogo && (
              <img
                src={event.venueLogo}
                alt={event.venue ?? "Venue"}
                style={{ height: 44, width: "auto", opacity: 0.85 }}
              />
            )}
            <span
              className="font-azonix"
              style={{ fontSize: 24, color: "#888899" }}
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

      {/* Tick marks */}
      {[0.25, 0.5, 0.75].map((pct) => (
        <div key={`ct-${pct}`}>
          <div
            className="absolute"
            style={{
              top: `${pct * 100}%`,
              left: 30,
              width: 12,
              height: 2,
              background: "rgba(179,57,196,0.25)",
            }}
          />
          <div
            className="absolute"
            style={{
              top: `${pct * 100}%`,
              right: 30,
              width: 12,
              height: 2,
              background: "rgba(179,57,196,0.25)",
            }}
          />
        </div>
      ))}
      {sponsorLogos !== undefined && <SponsorStrip logos={sponsorLogos} />}
    </div>
  );
}

"use client";

import type { EventData } from "@/lib/event-data";
import { joinGameNames } from "@/lib/event-data";
import { DEFAULT_VARIATION, type BannerVariation } from "@/lib/variation";
import { ICON_MAP } from "./icon-map";
import { SponsorStrip } from "./sponsor-strip";

/**
 * Open Duo — Instagram Story Announcement — 1080×1920 (9:16)
 * Safe zone: 250px top/bottom, 60px sides
 */
export function OpenDuoStory({ event, variation = DEFAULT_VARIATION, sponsorLogos, bgImage }: { event: EventData; variation?: BannerVariation; sponsorLogos?: string[]; bgImage?: string }) {
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
          left: 0,
          width: "100%",
          height: 480,
          background:
            "linear-gradient(180deg, rgba(179,57,196,0.14), transparent)",
          clipPath: `polygon(0 0, 100% 0, 100% ${70 + cv}%, 0 100%)`,
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 0,
          left: 0,
          width: "100%",
          height: 480,
          background:
            "linear-gradient(0deg, rgba(132,197,82,0.1), transparent)",
          clipPath: `polygon(0 ${30 - cv}%, 100% 0, 100% 100%, 0 100%)`,
        }}
      />

      {/* Trapezoids */}
      <div
        className="absolute"
        style={{
          top: lp(d3, 100, 240),
          right: 0,
          width: lp(d3, 160, 260),
          height: lp(d3, 240, 380),
          background: "rgba(179,57,196,0.1)",
          clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: lp(d3, 100, 240),
          left: 0,
          width: lp(d3, 140, 240),
          height: lp(d3, 220, 360),
          background: "rgba(132,197,82,0.08)",
          clipPath: "polygon(0 0, 100% 0, 70% 100%, 0 100%)",
        }}
      />

      {/* Large circular ring accents */}
      <div
        className="absolute"
        style={{
          top: lp(d1, 200, 360),
          right: lp(d1, 10, 70),
          width: lp(d1, 260, 360),
          height: lp(d1, 260, 360),
          borderRadius: "50%",
          border: "2px solid rgba(179,57,196,0.18)",
        }}
      />
      <div
        className="absolute"
        style={{
          top: lp(d1, 270, 430),
          right: lp(d1, 55, 115),
          width: lp(d1, 130, 200),
          height: lp(d1, 130, 200),
          borderRadius: "50%",
          border: "1px solid rgba(179,57,196,0.1)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: lp(d2, 240, 400),
          left: lp(d2, 0, 50),
          width: lp(d2, 280, 400),
          height: lp(d2, 280, 400),
          borderRadius: "50%",
          border: "2px solid rgba(132,197,82,0.16)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: lp(d2, 310, 470),
          left: lp(d2, 55, 105),
          width: lp(d2, 160, 260),
          height: lp(d2, 160, 260),
          borderRadius: "50%",
          border: "1px solid rgba(132,197,82,0.09)",
        }}
      />
      {/* Dot accents */}
      <div
        className="absolute"
        style={{
          top: lp(d1, 460, 600),
          left: lp(d1, 60, 130),
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
          right: lp(d2, 70, 140),
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "rgba(132,197,82,0.3)",
        }}
      />

      {/* ===== Gaming iconography ===== */}
      <Icon1
        size={120}
        color="rgba(179,57,196,0.28)"
        style={{ top: lp(s1, 250, 700), right: lp(s1, 20, 240), transform: `rotate(${-15 + rot1}deg)` }}
      />
      <Icon2
        size={85}
        color="rgba(132,197,82,0.25)"
        style={{ bottom: lp(s2, 350, 780), left: lp(s2, 30, 240), transform: `rotate(${10 + rot2}deg)` }}
      />
      <Icon3
        size={100}
        color="rgba(132,197,82,0.2)"
        style={{ bottom: lp(s3, 520, 1020), right: lp(s3, 20, 200), transform: `rotate(${rot3}deg)` }}
      />
      <Icon1
        size={90}
        color="rgba(179,57,196,0.22)"
        style={{ top: lp(s1, 560, 980), left: lp(s1, 15, 200), transform: `rotate(${-8 + rot1}deg)` }}
      />
      <Icon2
        size={70}
        color="rgba(179,57,196,0.2)"
        style={{ top: lp(s2, 110, 380), left: lp(s2, 90, 380), transform: `rotate(${5 + rot2}deg)` }}
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
          top: 600,
          left: 60,
          width: 60,
          height: 20,
          background: "rgba(179,57,196,0.18)",
          clipPath:
            "polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%, 20% 50%)",
        }}
      />
      <div
        className="absolute"
        style={{
          top: 630,
          left: 60,
          width: 40,
          height: 14,
          background: "rgba(132,197,82,0.15)",
          clipPath:
            "polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%, 20% 50%)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 600,
          right: 60,
          width: 60,
          height: 20,
          background: "rgba(132,197,82,0.18)",
          clipPath:
            "polygon(20% 0, 100% 0, 80% 50%, 100% 100%, 20% 100%, 0 50%)",
        }}
      />

      {/* ===== Content — spread out with breathing room ===== */}
      <div
        className="relative flex flex-col items-center justify-between h-full"
        style={{
          paddingTop: 280,
          paddingBottom: 280,
          paddingLeft: 80,
          paddingRight: 80,
        }}
      >
        {/* ── Top: Logo + Badge ── */}
        <div className="flex flex-col items-center" style={{ gap: 18 }}>
          <img
            src="/logo.png"
            alt="GamER"
            style={{ height: 130, width: "auto" }}
          />
          <div
            className="panel-clip-sm font-azonix"
            style={{
              padding: "12px 40px",
              background: "rgba(179,57,196,0.1)",
              border: "1px solid rgba(179,57,196,0.3)",
              fontSize: 20,
              color: "#C06DD0",
              letterSpacing: "0.2em",
            }}
          >
            TORNEO PRESENCIAL
          </div>
        </div>

        {/* ── Center: Title block ── */}
        <div
          className="flex flex-col items-center"
          style={{ gap: 30 }}
        >
          {/* Match format */}
          {event.gameDetails?.[0]?.matchFormat && (
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
                  fontSize: 38,
                  color: "#96D068",
                  letterSpacing: "0.3em",
                }}
              >
                {event.gameDetails[0].matchFormat}
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
          )}

          {/* Title */}
          <h1
            className="font-azonix leading-none text-center"
            style={{
              fontSize: 120,
              color: "#E8E8F0",
              textShadow:
                "0 0 40px rgba(179,57,196,0.4), 0 0 80px rgba(179,57,196,0.15)",
            }}
          >
            {event.title}
          </h1>

          {/* Subtitle */}
          <p
            className="text-center"
            style={{
              fontSize: 28,
              color: "#D0D0DC",
              lineHeight: 1.4,
              maxWidth: 750,
            }}
          >
            Torneos de{" "}
            <span style={{ color: "#96D068", fontWeight: 700 }}>
              {joinGameNames(event.games)}
            </span>
          </p>

          {/* Game format pills */}
          {event.gameDetails && (
            <div className="flex gap-5 flex-wrap justify-center">
              {event.gameDetails.map((g) => (
                <div
                  key={g.shortName}
                  className="panel-clip-sm font-azonix"
                  style={{
                    padding: "14px 32px",
                    background: "rgba(132,197,82,0.08)",
                    border: "1px solid rgba(132,197,82,0.25)",
                    fontSize: 22,
                    color: "#96D068",
                  }}
                >
                  {g.shortName}{g.format ? ` ${g.format}` : ""}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Bottom: Date + Venue ── */}
        <div className="flex flex-col items-center" style={{ gap: 22 }}>
          {/* Date panel */}
          <div
            className="panel-clip relative"
            style={{
              padding: "24px 64px",
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
                fontSize: 44,
                color: "#96D068",
                textShadow: "0 0 20px rgba(132,197,82,0.3)",
              }}
            >
              {event.date.toUpperCase()}
            </span>
            <span
              className="font-azonix"
              style={{ fontSize: 28, color: "#E8E8F0" }}
            >
              {event.time}
            </span>
          </div>

          {/* Venue */}
          <div className="flex flex-col items-center" style={{ gap: 10 }}>
            <img
              src="/mirador-tec.png"
              alt="MiradorTec"
              style={{ height: 56, width: "auto", opacity: 0.9 }}
            />
            <span
              className="font-azonix"
              style={{ fontSize: 26, color: "#888899" }}
            >
              {event.city}
            </span>
          </div>

          {/* Info pills */}
          <div className="flex gap-4" style={{ marginTop: 4 }}>
            {event.entryFee && (
              <div
                className="panel-clip-sm font-azonix"
                style={{
                  padding: "14px 28px",
                  background: "rgba(132,197,82,0.12)",
                  border: "1px solid rgba(132,197,82,0.4)",
                  fontSize: 26,
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
                fontSize: 26,
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
        <div key={`lt-${pct}`}>
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

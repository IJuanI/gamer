"use client";

import type { EventData } from "@/lib/event-data";
import { DEFAULT_VARIATION, type BannerVariation } from "@/lib/variation";
import { ICON_MAP } from "./icon-map";

/**
 * Open Duo — Público General Feed — 1080×1350 (4:5)
 * Safe zone: 40px all sides
 */
export function OpenDuoPublicFeed({
  event,
  variation = DEFAULT_VARIATION,
}: {
  event: EventData;
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
      style={{ width: 1080, height: 1350, background: "#1c1435" }}
    >
      <div className="absolute inset-0 bg-grid-neon-fade" />

      <div className="absolute" style={{ top: 0, left: 0, width: "100%", height: 380, background: "linear-gradient(180deg, rgba(132,197,82,0.14), transparent)", clipPath: `polygon(0 0, 100% 0, 100% ${65 + cv}%, 0 100%)` }} />
      <div className="absolute" style={{ bottom: 0, left: 0, width: "100%", height: 380, background: "linear-gradient(0deg, rgba(179,57,196,0.1), transparent)", clipPath: `polygon(0 ${35 - cv}%, 100% 0, 100% 100%, 0 100%)` }} />

      <div className="absolute" style={{ top: lp(d3, 60, 160), right: 0, width: lp(d3, 120, 210), height: lp(d3, 180, 300), background: "rgba(132,197,82,0.09)", clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)" }} />
      <div className="absolute" style={{ bottom: lp(d3, 60, 160), left: 0, width: lp(d3, 100, 190), height: lp(d3, 160, 280), background: "rgba(179,57,196,0.07)", clipPath: "polygon(0 0, 100% 0, 70% 100%, 0 100%)" }} />

      <div className="absolute" style={{ top: lp(d1, 100, 240), right: lp(d1, 10, 60), width: lp(d1, 200, 320), height: lp(d1, 200, 320), borderRadius: "50%", border: "2px solid rgba(132,197,82,0.16)" }} />
      <div className="absolute" style={{ bottom: lp(d2, 120, 260), left: lp(d2, 0, 50), width: lp(d2, 220, 340), height: lp(d2, 220, 340), borderRadius: "50%", border: "2px solid rgba(179,57,196,0.12)" }} />
      <div className="absolute" style={{ top: lp(d1, 160, 300), right: lp(d1, 50, 110), width: lp(d1, 110, 180), height: lp(d1, 110, 180), borderRadius: "50%", border: "1px solid rgba(132,197,82,0.08)" }} />

      <div className="absolute" style={{ top: lp(d1, 330, 460), left: lp(d1, 50, 120), width: 12, height: 12, borderRadius: "50%", background: "rgba(132,197,82,0.35)" }} />
      <div className="absolute" style={{ bottom: lp(d2, 350, 480), right: lp(d2, 60, 130), width: 10, height: 10, borderRadius: "50%", background: "rgba(179,57,196,0.3)" }} />

      <Icon1 size={100} color="rgba(132,197,82,0.22)" style={{ top: lp(s1, 200, 560), right: lp(s1, 20, 200), transform: `rotate(${-15 + rot1}deg)` }} />
      <Icon2 size={80} color="rgba(179,57,196,0.2)" style={{ bottom: lp(s2, 200, 520), left: lp(s2, 20, 180), transform: `rotate(${10 + rot2}deg)` }} />
      <Icon3 size={70} color="rgba(132,197,82,0.16)" style={{ top: lp(s3, 360, 720), left: lp(s3, 60, 240), transform: `rotate(${rot3}deg)` }} />

      <div className="absolute" style={{ top: 180, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, rgba(132,197,82,0.5), rgba(132,197,82,0.1) 30%, transparent 50%, rgba(179,57,196,0.1) 70%, rgba(179,57,196,0.4))" }} />

      {/* ===== Content ===== */}
      <div
        className="relative flex flex-col h-full"
        style={{ padding: "50px 60px" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <img src="/logo.png" alt="GamER" style={{ height: 80, width: "auto" }} />
          <div className="flex flex-col items-end" style={{ gap: 6 }}>
            <span className="font-azonix" style={{ fontSize: 20, color: "#96D068" }}>
              {event.date.toUpperCase()}
            </span>
            <div className="flex items-center" style={{ gap: 10 }}>
              <span style={{ fontSize: 18, color: "#888899" }}>{event.title}</span>
              {event.venueLogo && (
                <img src={event.venueLogo} alt={event.venue ?? "Venue"} style={{ height: 32, width: "auto", opacity: 0.8 }} />
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ marginTop: 24, marginBottom: 24, height: 2, background: "linear-gradient(90deg, rgba(132,197,82,0.4), transparent 40%, transparent 60%, rgba(179,57,196,0.3))" }} />

        {/* Center */}
        <div className="flex-1 flex flex-col justify-center" style={{ gap: 28 }}>
          <div
            className="panel-clip-sm font-azonix"
            style={{
              padding: "12px 28px",
              background: "rgba(132,197,82,0.1)",
              border: "1px solid rgba(132,197,82,0.35)",
              fontSize: 20,
              color: "#96D068",
              letterSpacing: "0.15em",
              alignSelf: "flex-start",
            }}
          >
            PÚBLICO GENERAL
          </div>

          <h1
            className="font-azonix leading-none"
            style={{
              fontSize: 80,
              color: "#E8E8F0",
              textShadow: "0 0 40px rgba(132,197,82,0.35), 0 0 80px rgba(132,197,82,0.1)",
            }}
          >
            {event.title}
          </h1>

          {/* Features */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="flex items-center" style={{ gap: 16 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#96D068", flexShrink: 0 }} />
              <span style={{ fontSize: 34, color: "#E8E8F0", fontWeight: 600 }}>
                ¡Vení a <span style={{ color: "#96D068", fontWeight: 800 }}>jugar en consolas</span>!
              </span>
            </div>
            <div className="flex items-center" style={{ gap: 16 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#C06DD0", flexShrink: 0 }} />
              <span style={{ fontSize: 34, color: "#E8E8F0", fontWeight: 600 }}>
                Y viví el <span style={{ color: "#C06DD0", fontWeight: 800 }}>torneo en vivo</span>
              </span>
            </div>
          </div>

          {/* Console games */}
          {event.consoleGames && event.consoleGames.length > 0 && (
            <div
              className="panel-clip relative"
              style={{
                marginTop: 8,
                padding: "20px 28px",
                background: "rgba(132,197,82,0.04)",
                border: "1px solid rgba(132,197,82,0.15)",
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div className="hud-bracket-tl" />
              <div className="hud-bracket-br" />
              {event.consoleGames.map((g) => (
                <span
                  key={g}
                  className="font-azonix"
                  style={{ fontSize: 20, color: "#96D068" }}
                >
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom */}
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            {event.publicEntryFee && (
              <div
                className="panel-clip-sm font-azonix"
                style={{
                  padding: "10px 28px",
                  background: "rgba(132,197,82,0.1)",
                  border: "1px solid rgba(132,197,82,0.35)",
                  fontSize: 24,
                  color: "#96D068",
                  fontWeight: 600,
                }}
              >
                {event.publicEntryFee}
              </div>
            )}
          </div>
          <span className="font-azonix" style={{ fontSize: 18, color: "#888899" }}>
            {event.city}
          </span>
        </div>
      </div>

      {/* Corner brackets */}
      <div className="absolute" style={{ top: 20, left: 20, width: 50, height: 50, borderTop: "3px solid rgba(132,197,82,0.5)", borderLeft: "3px solid rgba(132,197,82,0.5)" }} />
      <div className="absolute" style={{ top: 20, right: 20, width: 50, height: 50, borderTop: "3px solid rgba(132,197,82,0.5)", borderRight: "3px solid rgba(132,197,82,0.5)" }} />
      <div className="absolute" style={{ bottom: 20, left: 20, width: 50, height: 50, borderBottom: "3px solid rgba(179,57,196,0.5)", borderLeft: "3px solid rgba(179,57,196,0.5)" }} />
      <div className="absolute" style={{ bottom: 20, right: 20, width: 50, height: 50, borderBottom: "3px solid rgba(179,57,196,0.5)", borderRight: "3px solid rgba(179,57,196,0.5)" }} />
    </div>
  );
}

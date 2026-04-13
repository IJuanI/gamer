"use client";

import type { EventData } from "@/lib/event-data";
import { DEFAULT_VARIATION, type BannerVariation } from "@/lib/variation";
import { ICON_MAP } from "./icon-map";

/**
 * Open Duo — Público General WhatsApp — 1080×1080 (1:1)
 * Safe zone: 60px all sides
 */
export function OpenDuoPublicWhatsApp({
  event,
  variation = DEFAULT_VARIATION,
}: {
  event: EventData;
  variation?: BannerVariation;
}) {
  const [Icon1, Icon2] = variation.icons.map((n) => ICON_MAP[n]);
  const [rot1, rot2] = variation.rotationOffsets;
  const [s1, s2] = variation.positionSeeds;
  const [d1, d2, d3] = variation.decoratorSeeds;
  const lp = (s: number, lo: number, hi: number) => Math.round(lo + s * (hi - lo));
  const cv = variation.clipVariance;

  return (
    <div
      className="banner-frame relative"
      style={{ width: 1080, height: 1080, background: "#1c1435" }}
    >
      <div className="absolute inset-0 bg-grid-neon-fade" />

      <div className="absolute" style={{ top: 0, left: 0, width: "100%", height: 350, background: "linear-gradient(180deg, rgba(132,197,82,0.14), transparent)", clipPath: `polygon(0 0, 100% 0, 100% ${65 + cv}%, 0 100%)` }} />
      <div className="absolute" style={{ bottom: 0, right: 0, width: "100%", height: 350, background: "linear-gradient(0deg, rgba(179,57,196,0.1), transparent)", clipPath: `polygon(0 ${35 - cv}%, 100% 0, 100% 100%, 0 100%)` }} />

      <div className="absolute" style={{ top: lp(d3, 110, 210), right: 0, width: lp(d3, 90, 160), height: lp(d3, 140, 240), background: "rgba(132,197,82,0.08)", clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)" }} />
      <div className="absolute" style={{ bottom: lp(d3, 110, 210), left: 0, width: lp(d3, 90, 160), height: lp(d3, 140, 240), background: "rgba(179,57,196,0.07)", clipPath: "polygon(0 0, 100% 0, 70% 100%, 0 100%)" }} />

      <div className="absolute" style={{ top: lp(d1, 80, 200), right: lp(d1, 10, 60), width: lp(d1, 160, 260), height: lp(d1, 160, 260), borderRadius: "50%", border: "2px solid rgba(132,197,82,0.15)" }} />
      <div className="absolute" style={{ bottom: lp(d2, 80, 200), left: lp(d2, 10, 60), width: lp(d2, 160, 260), height: lp(d2, 160, 260), borderRadius: "50%", border: "2px solid rgba(179,57,196,0.12)" }} />

      <div className="absolute" style={{ top: lp(d1, 70, 150), left: lp(d1, 50, 120), width: 12, height: 12, borderRadius: "50%", background: "rgba(132,197,82,0.3)" }} />
      <div className="absolute" style={{ bottom: lp(d2, 70, 150), right: lp(d2, 50, 120), width: 10, height: 10, borderRadius: "50%", background: "rgba(179,57,196,0.28)" }} />

      <Icon1 size={80} color="rgba(132,197,82,0.22)" style={{ top: lp(s1, 160, 360), right: lp(s1, 20, 200), transform: `rotate(${-15 + rot1}deg)` }} />
      <Icon2 size={65} color="rgba(179,57,196,0.2)" style={{ bottom: lp(s2, 140, 340), left: lp(s2, 20, 200), transform: `rotate(${10 + rot2}deg)` }} />

      <div className="absolute" style={{ top: 200, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, rgba(132,197,82,0.5), rgba(132,197,82,0.1) 30%, transparent 50%, rgba(179,57,196,0.1) 70%, rgba(179,57,196,0.4))" }} />

      {/* ===== Content ===== */}
      <div
        className="relative flex flex-col items-center justify-between h-full"
        style={{ padding: "70px 60px", textAlign: "center" }}
      >
        {/* Top: Logo + date + badge */}
        <div className="flex flex-col items-center" style={{ gap: 14 }}>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="GamER" style={{ height: 64, width: "auto" }} />
            <span className="font-azonix" style={{ fontSize: 22, color: "#96D068", letterSpacing: "0.1em" }}>
              {event.date.toUpperCase()}
            </span>
          </div>
          <div
            className="panel-clip-sm font-azonix"
            style={{
              padding: "12px 30px",
              background: "rgba(132,197,82,0.12)",
              border: "1px solid rgba(132,197,82,0.4)",
              fontSize: 26,
              color: "#96D068",
              letterSpacing: "0.12em",
            }}
          >
            PÚBLICO GENERAL
          </div>
        </div>

        {/* Center: Title + features */}
        <div className="flex flex-col items-center" style={{ gap: 20 }}>
          <h1
            className="font-azonix leading-none"
            style={{
              fontSize: 84,
              color: "#E8E8F0",
              textShadow: "0 0 40px rgba(132,197,82,0.35), 0 0 80px rgba(132,197,82,0.1)",
            }}
          >
            {event.title}
          </h1>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 34, color: "#E8E8F0", fontWeight: 600 }}>
              ¡Vení a <span style={{ color: "#96D068", fontWeight: 800 }}>jugar en consolas</span>!
            </div>
            <div style={{ fontSize: 34, color: "#E8E8F0", fontWeight: 600 }}>
              Y viví el <span style={{ color: "#C06DD0", fontWeight: 800 }}>torneo en vivo</span>
            </div>
          </div>

          {event.consoleGames && event.consoleGames.length > 0 && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
              {event.consoleGames.map((g) => (
                <span
                  key={g}
                  className="panel-clip-sm font-azonix"
                  style={{ padding: "10px 22px", background: "rgba(132,197,82,0.08)", border: "1px solid rgba(132,197,82,0.3)", fontSize: 24, color: "#96D068" }}
                >
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom: Price + venue */}
        <div className="flex flex-col items-center" style={{ gap: 10 }}>
          <div style={{ width: 180, height: 1, background: "linear-gradient(90deg, transparent, rgba(132,197,82,0.4) 20%, rgba(132,197,82,0.4) 80%, transparent)" }} />
          {event.publicEntryFee && (
            <div
              className="font-azonix"
              style={{ fontSize: 44, color: "#96D068", textShadow: "0 0 20px rgba(132,197,82,0.35)", letterSpacing: "0.04em" }}
            >
              {event.publicEntryFee}
            </div>
          )}
          <div className="flex items-center justify-center" style={{ gap: 18 }}>
            {event.venueLogo && (
              <img src={event.venueLogo} alt={event.venue ?? "Venue"} style={{ height: 44, width: "auto", opacity: 0.9 }} />
            )}
            <span className="font-azonix" style={{ fontSize: 28, color: "#888899" }}>
              {event.city}
            </span>
          </div>
        </div>
      </div>

      {/* Corner brackets */}
      <div className="absolute" style={{ top: 20, left: 20, width: 40, height: 40, borderTop: "3px solid rgba(132,197,82,0.5)", borderLeft: "3px solid rgba(132,197,82,0.5)" }} />
      <div className="absolute" style={{ top: 20, right: 20, width: 40, height: 40, borderTop: "3px solid rgba(132,197,82,0.5)", borderRight: "3px solid rgba(132,197,82,0.5)" }} />
      <div className="absolute" style={{ bottom: 20, left: 20, width: 40, height: 40, borderBottom: "3px solid rgba(179,57,196,0.5)", borderLeft: "3px solid rgba(179,57,196,0.5)" }} />
      <div className="absolute" style={{ bottom: 20, right: 20, width: 40, height: 40, borderBottom: "3px solid rgba(179,57,196,0.5)", borderRight: "3px solid rgba(179,57,196,0.5)" }} />
    </div>
  );
}

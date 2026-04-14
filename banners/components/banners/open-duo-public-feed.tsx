"use client";

import type { EventData } from "@/lib/event-data";
import { DEFAULT_VARIATION, type BannerVariation } from "@/lib/variation";
import { GamepadIcon } from "./gaming-icons";
import { ICON_MAP } from "./icon-map";

function InstagramIcon({ size = 24, color = "#96D068" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="6" stroke={color} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.5" stroke={color} strokeWidth="1.5" />
      <circle cx="17.5" cy="6.5" r="1.2" fill={color} />
    </svg>
  );
}

/**
 * Open Duo — Público General Feed — 1080×1350 (4:5)
 * Composition: Option B — two activity blocks (JUGÁ EN CONSOLAS / VIVÍ EL TORNEO)
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

      <div className="absolute" style={{ top: lp(d1, 330, 460), left: lp(d1, 50, 120), width: 12, height: 12, borderRadius: "50%", background: "rgba(132,197,82,0.35)" }} />
      <div className="absolute" style={{ bottom: lp(d2, 350, 480), right: lp(d2, 60, 130), width: 10, height: 10, borderRadius: "50%", background: "rgba(179,57,196,0.3)" }} />

      <Icon1 size={100} color="rgba(132,197,82,0.18)" style={{ top: lp(s1, 200, 560), right: lp(s1, 20, 200), transform: `rotate(${-15 + rot1}deg)` }} />
      <Icon2 size={80} color="rgba(179,57,196,0.16)" style={{ bottom: lp(s2, 200, 520), left: lp(s2, 20, 180), transform: `rotate(${10 + rot2}deg)` }} />
      <Icon3 size={70} color="rgba(132,197,82,0.12)" style={{ top: lp(s3, 360, 720), left: lp(s3, 60, 240), transform: `rotate(${rot3}deg)` }} />

      {/* Corner brackets */}
      <div className="absolute" style={{ top: 20, left: 20, width: 50, height: 50, borderTop: "3px solid rgba(132,197,82,0.5)", borderLeft: "3px solid rgba(132,197,82,0.5)" }} />
      <div className="absolute" style={{ top: 20, right: 20, width: 50, height: 50, borderTop: "3px solid rgba(132,197,82,0.5)", borderRight: "3px solid rgba(132,197,82,0.5)" }} />
      <div className="absolute" style={{ bottom: 20, left: 20, width: 50, height: 50, borderBottom: "3px solid rgba(179,57,196,0.5)", borderLeft: "3px solid rgba(179,57,196,0.5)" }} />
      <div className="absolute" style={{ bottom: 20, right: 20, width: 50, height: 50, borderBottom: "3px solid rgba(179,57,196,0.5)", borderRight: "3px solid rgba(179,57,196,0.5)" }} />

      {/* ===== Content ===== */}
      <div
        className="relative flex flex-col items-center justify-between h-full"
        style={{ padding: "50px 60px" }}
      >
        {/* Top: Logo only */}
        <img src="/logo.png" alt="GamER" style={{ height: 110, width: "auto" }} />

        {/* Center: two activity blocks */}
        <div className="flex flex-col items-center" style={{ gap: 36 }}>
          {/* Activity 1: Consoles */}
          <div className="flex flex-col items-center" style={{ gap: 14 }}>
            <h2
              className="font-azonix leading-none text-center"
              style={{ fontSize: 82, color: "#96D068", textShadow: "0 0 30px rgba(132,197,82,0.3)" }}
            >
              JUGÁ EN<br />CONSOLAS
            </h2>
            {event.consoleGames && event.consoleGames.length > 0 && (
              <div className="flex items-center flex-wrap justify-center" style={{ gap: 12 }}>
                <GamepadIcon size={32} color="rgba(132,197,82,0.6)" className="" />
                {event.consoleGames.map((g, i) => (
                  <span key={g} style={{ fontSize: 30, color: "rgba(132,197,82,0.7)" }}>
                    {g}{i < event.consoleGames!.length - 1 ? " ·" : ""}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ width: 180, height: 2, background: "linear-gradient(90deg, transparent, rgba(132,197,82,0.4) 20%, rgba(179,57,196,0.4) 80%, transparent)" }} />

          {/* Activity 2: Watch */}
          <div className="flex flex-col items-center" style={{ gap: 12 }}>
            <h2
              className="font-azonix leading-none text-center"
              style={{ fontSize: 82, color: "#C06DD0", textShadow: "0 0 30px rgba(179,57,196,0.3)" }}
            >
              VIVÍ EL<br />TORNEO
            </h2>
            <span style={{ fontSize: 28, color: "#B0B0BC" }}>¡No necesitás inscribirte!</span>
          </div>
        </div>

        {/* Bottom: date/venue row + price/CTA */}
        <div className="flex flex-col items-center" style={{ gap: 28 }}>
          {/* Compact date + venue inline */}
          <div className="flex items-center justify-center" style={{ gap: 20 }}>
            <span className="font-azonix" style={{ fontSize: 38, color: "#96D068" }}>{event.date.toUpperCase()}</span>
            <div style={{ width: 1, height: 28, background: "rgba(132,197,82,0.3)" }} />
            {event.venueLogo && (
              <img src={event.venueLogo} alt={event.venue ?? "Venue"} style={{ height: 34, width: "auto", opacity: 0.85 }} />
            )}
          </div>
          {/* Price + CTA unified panel */}
          <div
            className="panel-clip-sm"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              padding: "20px 48px",
              background: "rgba(132,197,82,0.08)",
              border: "1px solid rgba(132,197,82,0.35)",
            }}
          >
            {event.publicEntryFee && (
              <span className="font-azonix" style={{ fontSize: 34, color: "#E8E8F0", textShadow: "0 0 16px rgba(132,197,82,0.25)" }}>
                {event.publicEntryFee}
              </span>
            )}
            <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg, transparent, rgba(132,197,82,0.3) 20%, rgba(132,197,82,0.3) 80%, transparent)" }} />
            <div className="flex items-center" style={{ gap: 12 }}>
              <InstagramIcon size={26} color="#96D068" />
              <span className="font-azonix" style={{ fontSize: 28, color: "#96D068", letterSpacing: "0.06em" }}>@gamer_eerr</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

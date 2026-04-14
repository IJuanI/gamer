"use client";

import type { EventData } from "@/lib/event-data";
import { DEFAULT_VARIATION, type BannerVariation } from "@/lib/variation";
import { GamepadIcon } from "./gaming-icons";
import { ICON_MAP } from "./icon-map";

function InstagramIcon({ size = 28, color = "#96D068" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="6" stroke={color} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.5" stroke={color} strokeWidth="1.5" />
      <circle cx="17.5" cy="6.5" r="1.2" fill={color} />
    </svg>
  );
}

/**
 * Open Duo — Público General Story — 1080×1920 (9:16)
 * Safe zone: 250px top/bottom
 *
 * Invites general public to attend the event (no tournament registration needed).
 */
export function OpenDuoPublicStory({
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
      style={{ width: 1080, height: 1920, background: "#1c1435" }}
    >
      {/* ===== Background ===== */}
      <div className="absolute inset-0 bg-grid-neon-fade" />

      <div
        className="absolute"
        style={{
          top: 0, left: 0, width: "100%", height: 480,
          background: "linear-gradient(180deg, rgba(132,197,82,0.14), transparent)",
          clipPath: `polygon(0 0, 100% 0, 100% ${70 + cv}%, 0 100%)`,
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 0, left: 0, width: "100%", height: 480,
          background: "linear-gradient(0deg, rgba(179,57,196,0.1), transparent)",
          clipPath: `polygon(0 ${30 - cv}%, 100% 0, 100% 100%, 0 100%)`,
        }}
      />

      {/* Trapezoids */}
      <div className="absolute" style={{ top: lp(d3, 100, 240), right: 0, width: lp(d3, 160, 260), height: lp(d3, 240, 380), background: "rgba(132,197,82,0.09)", clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)" }} />
      <div className="absolute" style={{ bottom: lp(d3, 100, 240), left: 0, width: lp(d3, 140, 240), height: lp(d3, 220, 360), background: "rgba(179,57,196,0.07)", clipPath: "polygon(0 0, 100% 0, 70% 100%, 0 100%)" }} />

      {/* Rings */}
      <div className="absolute" style={{ top: lp(d1, 200, 360), right: lp(d1, 10, 70), width: lp(d1, 260, 360), height: lp(d1, 260, 360), borderRadius: "50%", border: "2px solid rgba(132,197,82,0.18)" }} />
      <div className="absolute" style={{ top: lp(d1, 270, 430), right: lp(d1, 55, 115), width: lp(d1, 130, 200), height: lp(d1, 130, 200), borderRadius: "50%", border: "1px solid rgba(132,197,82,0.1)" }} />
      <div className="absolute" style={{ bottom: lp(d2, 240, 400), left: lp(d2, 0, 50), width: lp(d2, 280, 400), height: lp(d2, 280, 400), borderRadius: "50%", border: "2px solid rgba(179,57,196,0.14)" }} />

      {/* Dots */}
      <div className="absolute" style={{ top: lp(d1, 460, 600), left: lp(d1, 60, 130), width: 14, height: 14, borderRadius: "50%", background: "rgba(132,197,82,0.35)" }} />
      <div className="absolute" style={{ bottom: lp(d2, 480, 620), right: lp(d2, 70, 140), width: 10, height: 10, borderRadius: "50%", background: "rgba(179,57,196,0.3)" }} />

      {/* Icons */}
      <Icon1 size={120} color="rgba(132,197,82,0.25)" style={{ top: lp(s1, 250, 700), right: lp(s1, 20, 240), transform: `rotate(${-15 + rot1}deg)` }} />
      <Icon2 size={85} color="rgba(179,57,196,0.22)" style={{ bottom: lp(s2, 350, 780), left: lp(s2, 30, 240), transform: `rotate(${10 + rot2}deg)` }} />
      <Icon3 size={100} color="rgba(132,197,82,0.18)" style={{ bottom: lp(s3, 520, 1020), right: lp(s3, 20, 200), transform: `rotate(${rot3}deg)` }} />
      <Icon1 size={90} color="rgba(132,197,82,0.2)" style={{ top: lp(s1, 560, 980), left: lp(s1, 15, 200), transform: `rotate(${-8 + rot1}deg)` }} />

      {/* HUD bars */}
      <div className="absolute" style={{ top: 250, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, rgba(132,197,82,0.5), rgba(132,197,82,0.1) 30%, transparent 50%, rgba(179,57,196,0.1) 70%, rgba(179,57,196,0.4))" }} />
      <div className="absolute" style={{ bottom: 250, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, rgba(179,57,196,0.4), rgba(179,57,196,0.1) 30%, transparent 50%, rgba(132,197,82,0.1) 70%, rgba(132,197,82,0.5))" }} />

      {/* ===== Content ===== */}
      <div
        className="relative flex flex-col items-center justify-between h-full"
        style={{ paddingTop: 280, paddingBottom: 280, paddingLeft: 80, paddingRight: 80 }}
      >
        {/* Top: Logo + badge */}
        <div className="flex flex-col items-center" style={{ gap: 18 }}>
          <img src="/logo.png" alt="GamER" style={{ height: 130, width: "auto" }} />
        </div>

        {/* Center: title + features */}
        <div className="flex flex-col items-center" style={{ gap: 32 }}>
          <h1
            className="font-azonix leading-none text-center"
            style={{
              fontSize: 120,
              color: "#E8E8F0",
              textShadow: "0 0 40px rgba(132,197,82,0.35), 0 0 80px rgba(132,197,82,0.12)",
            }}
          >
            {event.title}
          </h1>

          {/* Feature list */}
          <div className="flex flex-col items-center" style={{ gap: 16 }}>
            <div className="flex items-center" style={{ gap: 20 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#96D068" }} />
              <span style={{ fontSize: 38, color: "#E8E8F0", fontWeight: 600 }}>
                ¡Vení a <span style={{ color: "#96D068", fontWeight: 800 }}>jugar en consolas</span>!
              </span>
            </div>
            <div className="flex items-center" style={{ gap: 20 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#C06DD0" }} />
              <span style={{ fontSize: 38, color: "#E8E8F0", fontWeight: 600 }}>
                Y viví el <span style={{ color: "#C06DD0", fontWeight: 800 }}>torneo en vivo</span>
              </span>
            </div>
          </div>

          {/* Console games — lightweight inline list */}
          {event.consoleGames && event.consoleGames.length > 0 && (
            <div className="flex items-center flex-wrap justify-center" style={{ gap: 14 }}>
              <GamepadIcon size={34} color="rgba(132,197,82,0.6)" className="" />
              {event.consoleGames.map((g, i) => (
                <span key={g} style={{ fontSize: 30, color: "rgba(132,197,82,0.7)" }}>
                  {g}{i < event.consoleGames!.length - 1 ? " ·" : ""}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom: date + venue + price + CTA */}
        <div className="flex flex-col items-center" style={{ gap: 32 }}>
          <div
            className="panel-clip relative"
            style={{
              padding: "24px 64px",
              background: "rgba(132,197,82,0.06)",
              border: "1px solid rgba(132,197,82,0.2)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div className="hud-bracket-tl" />
            <div className="hud-bracket-br" />
            <span className="font-azonix" style={{ fontSize: 44, color: "#96D068", textShadow: "0 0 20px rgba(132,197,82,0.3)" }}>
              {event.date.toUpperCase()}
            </span>
            <span className="font-azonix" style={{ fontSize: 28, color: "#E8E8F0" }}>
              {event.time}
            </span>
          </div>

          <div className="flex flex-col items-center" style={{ gap: 10 }}>
            {event.venueLogo && (
              <img src={event.venueLogo} alt={event.venue ?? "Venue"} style={{ height: 56, width: "auto", opacity: 0.9 }} />
            )}
            <span className="font-azonix" style={{ fontSize: 26, color: "#888899" }}>
              {event.city}
            </span>
          </div>

          {/* Price + Instagram CTA — unified panel */}
          <div
            className="panel-clip-sm"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              padding: "20px 52px",
              background: "rgba(132,197,82,0.08)",
              border: "1px solid rgba(132,197,82,0.35)",
            }}
          >
            {event.publicEntryFee && (
              <span
                className="font-azonix"
                style={{
                  fontSize: 34,
                  color: "#96D068",
                  textShadow: "0 0 20px rgba(132,197,82,0.25)",
                  letterSpacing: "0.05em",
                }}
              >
                {event.publicEntryFee}
              </span>
            )}
            <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg, transparent, rgba(132,197,82,0.3) 20%, rgba(132,197,82,0.3) 80%, transparent)" }} />
            <div className="flex items-center" style={{ gap: 12 }}>
              <InstagramIcon size={28} color="#96D068" />
              <span style={{ fontSize: 24, color: "#B0B0BC", letterSpacing: "0.04em" }}>
                ¡Conseguí tu entrada por Instagram!
              </span>
            </div>
            <span
              className="font-azonix"
              style={{ fontSize: 28, color: "#96D068", letterSpacing: "0.08em" }}
            >
              @gamer_eerr
            </span>
          </div>
        </div>
      </div>

      {/* Corner brackets */}
      <div className="absolute" style={{ top: 30, left: 30, width: 70, height: 70, borderTop: "3px solid rgba(132,197,82,0.5)", borderLeft: "3px solid rgba(132,197,82,0.5)" }} />
      <div className="absolute" style={{ top: 30, right: 30, width: 70, height: 70, borderTop: "3px solid rgba(132,197,82,0.5)", borderRight: "3px solid rgba(132,197,82,0.5)" }} />
      <div className="absolute" style={{ bottom: 30, left: 30, width: 70, height: 70, borderBottom: "3px solid rgba(179,57,196,0.5)", borderLeft: "3px solid rgba(179,57,196,0.5)" }} />
      <div className="absolute" style={{ bottom: 30, right: 30, width: 70, height: 70, borderBottom: "3px solid rgba(179,57,196,0.5)", borderRight: "3px solid rgba(179,57,196,0.5)" }} />
    </div>
  );
}

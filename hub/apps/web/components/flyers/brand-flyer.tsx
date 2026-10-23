"use client";

import type { CSSProperties } from "react";
import type { FlyerBrandTokens } from "@/lib/flyer-brands";
import type { FlyerFormat } from "@/lib/flyer-formats";
import { countdownParts, DATE_PLACEHOLDER, type FlyerData, type FlyerKind } from "@/lib/flyer-kinds";

interface BrandFlyerProps {
  brand: FlyerBrandTokens;
  kind: FlyerKind;
  eyebrow: string;
  data: FlyerData;
  format: FlyerFormat;
  now: Date;
}

/**
 * Generic flyer for GamER and GameDevs (all kinds), and for the Jam teaser / countdown.
 * The Jam event flyer keeps its dedicated artwork in jam-flyer.tsx.
 * Only approved brand tokens are used. No CTA buttons, no photography.
 */
export function BrandFlyer({ brand, kind, eyebrow, data, format, now }: BrandFlyerProps) {
  const { width, height, safeZone } = format;
  const u = width / 1080;
  const isSquare = height === width;
  const cd = countdownParts(data.countdownTo, now);
  const dateTBD = data.dateText === DATE_PLACEHOLDER;
  const pad = (n: number) => String(n).padStart(2, "0");

  const headline: CSSProperties = {
    fontFamily: brand.titleFont === "azonix" ? "'Azonix', sans-serif" : "inherit",
    color: brand.text,
    lineHeight: 0.95,
    textTransform: brand.titleFont === "azonix" ? "uppercase" : "none",
    fontWeight: 800,
  };

  const kindLabel = kind === "event" ? "Evento" : kind === "teaser" ? "Anotá la fecha" : "Cuenta regresiva";

  return (
    <div className="flyer-frame relative overflow-hidden" style={{ width, height, background: brand.bg, color: brand.text }}>
      <style>{`
        @keyframes flyer-glow { 0%, 100% { opacity: 0.55 } 50% { opacity: 1 } }
        @keyframes flyer-scan { from { transform: translateY(-10%) } to { transform: translateY(110%) } }
        .flyer-glow { animation: flyer-glow 3.2s ease-in-out infinite; }
        .flyer-scan { animation: flyer-scan 6s linear infinite; }
      `}</style>

      {/* grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${brand.grid} ${1.5 * u}px, transparent ${1.5 * u}px), linear-gradient(90deg, ${brand.grid} ${1.5 * u}px, transparent ${1.5 * u}px)`,
          backgroundSize: `${80 * u}px ${80 * u}px`,
        }}
      />
      {/* glows */}
      <div
        className="flyer-glow absolute rounded-full"
        style={{
          top: -height * 0.15,
          right: -width * 0.25,
          width: width * 0.9,
          height: width * 0.9,
          background: `radial-gradient(circle, ${brand.accent}55 0%, transparent 65%)`,
        }}
      />
      <div
        className="flyer-glow absolute rounded-full"
        style={{
          bottom: -height * 0.2,
          left: -width * 0.3,
          width: width * 0.9,
          height: width * 0.9,
          background: `radial-gradient(circle, ${brand.accentAlt}44 0%, transparent 65%)`,
          animationDelay: "1.6s",
        }}
      />
      {/* moving scanline */}
      <div
        className="flyer-scan absolute inset-x-0"
        style={{ top: 0, height: 120 * u, background: `linear-gradient(transparent, ${brand.accent}14, transparent)` }}
      />
      {/* HUD corners */}
      <div className="absolute" style={{ top: safeZone.top, left: safeZone.left, width: 72 * u, height: 72 * u, borderTop: `${3 * u}px solid ${brand.accent}`, borderLeft: `${3 * u}px solid ${brand.accent}` }} />
      <div className="absolute" style={{ bottom: safeZone.bottom, right: safeZone.right, width: 72 * u, height: 72 * u, borderBottom: `${3 * u}px solid ${brand.accentAlt}`, borderRight: `${3 * u}px solid ${brand.accentAlt}` }} />

      {/* content column */}
      <div
        className="absolute flex flex-col items-center justify-between text-center"
        style={{ top: safeZone.top, bottom: safeZone.bottom, left: safeZone.left, right: safeZone.right }}
      >
        {/* logo + kind badge */}
        <div className="flex flex-col items-center" style={{ gap: 28 * u }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={brand.logo} alt={brand.logoAlt} style={{ height: (isSquare ? 90 : 120) * u, width: "auto" }} />
          <span
            className="font-semibold uppercase tracking-[0.25em]"
            style={{ fontSize: 26 * u, color: brand.accent, border: `${2 * u}px solid ${brand.accent}66`, padding: `${8 * u}px ${20 * u}px`, borderRadius: 4 * u }}
          >
            {kindLabel}
          </span>
        </div>

        {/* title block */}
        <div className="flex flex-col items-center" style={{ gap: 22 * u }}>
          <p className="font-bold uppercase tracking-[0.2em]" style={{ fontSize: 34 * u, color: brand.accent }}>
            {eyebrow}
          </p>
          {brand.titleImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.titleImage} alt={data.title} style={{ width: isSquare ? "70%" : "84%", height: "auto" }} />
          ) : (
            <h2 style={{ ...headline, fontSize: (isSquare ? 104 : 124) * u }}>{data.title}</h2>
          )}
          <p style={{ fontSize: 40 * u, lineHeight: 1.3, color: brand.muted, maxWidth: 820 * u, textWrap: "balance" }}>{data.subtitle}</p>
        </div>

        {/* kind-specific block */}
        {kind === "countdown" && (
          <div className="flex flex-col items-center" style={{ gap: 18 * u }}>
            {cd.finished ? (
              <p className="font-bold" style={{ ...headline, fontSize: 96 * u, color: brand.accentAlt }}>¡Ya empezó!</p>
            ) : (
              <>
                <p className="font-bold leading-none" style={{ ...headline, fontSize: 260 * u, color: brand.accentAlt }}>{cd.days}</p>
                <p className="font-semibold uppercase tracking-[0.3em]" style={{ fontSize: 34 * u, color: brand.text }}>
                  {cd.days === 1 ? "día" : "días"} · {pad(cd.hours)}h {pad(cd.minutes)}m
                </p>
              </>
            )}
          </div>
        )}
        {kind === "teaser" && (
          <div className="flex flex-col items-center" style={{ gap: 18 * u }}>
            {dateTBD ? (
              <p className="font-bold leading-none" style={{ ...headline, fontFamily: "inherit", fontSize: 92 * u, color: brand.accentAlt }}>Próximamente</p>
            ) : (
              <p className="font-bold leading-none" style={{ ...headline, fontSize: 96 * u, color: brand.accentAlt }}>{data.dateText}</p>
            )}
            {data.city && <p className="font-semibold" style={{ fontSize: 44 * u, color: brand.text }}>{data.city}</p>}
          </div>
        )}
        {kind === "event" && (
          <div className="flex flex-col items-center" style={{ gap: 22 * u }}>
            <p
              className="font-bold"
              style={dateTBD ? { fontFamily: "inherit", fontSize: 48 * u, color: brand.accent } : { ...headline, fontSize: 64 * u, color: brand.text }}
            >
              {data.dateText}
            </p>
            {data.venue && (
              <p className="font-semibold" style={{ fontSize: 38 * u, color: brand.muted, border: `${1 * u}px solid ${brand.accent}55`, borderRadius: 4 * u, padding: `${10 * u}px ${24 * u}px` }}>
                {data.venue}
              </p>
            )}
            <p className="font-semibold" style={{ fontSize: 44 * u, color: brand.muted }}>{data.city}</p>
          </div>
        )}
      </div>
    </div>
  );
}

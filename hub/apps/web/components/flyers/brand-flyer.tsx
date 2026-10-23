"use client";

import type { CSSProperties, ReactNode } from "react";
import type { FlyerBrandTokens } from "@/lib/flyer-brands";
import type { FlyerFormat } from "@/lib/flyer-formats";
import {
  countdownParts,
  DATE_FALLBACK,
  EVENT_VARIANTS,
  isFieldHidden,
  MAX_SPONSORS,
  venueShown,
  venueText,
  type EventVariant,
  type FlyerData,
  type FlyerFieldKey,
  type FlyerHidden,
  type FlyerKind,
  type SponsorLogo,
  type VenueData,
} from "@/lib/flyer-kinds";
import { FlyerBackdrop, FlyerKeyframes } from "@/components/flyers/flyer-backdrop";
import { Reveal } from "@/components/flyers/story-motion";

interface BrandFlyerProps {
  brand: FlyerBrandTokens;
  kind: FlyerKind;
  variant: EventVariant;
  eyebrow: string;
  data: FlyerData;
  format: FlyerFormat;
  now: Date;
  hidden: FlyerHidden;
}

const ACCENTED = /([ÁÉÍÓÚáéíóúñÑ¡¿])/;

/**
 * AZONIX has no accented glyphs. Those characters fall back to the system sans
 * so "PRÓXIMAMENTE" keeps its accent. Other brands get the text untouched.
 */
function withAccentFallback(text: string, brand: FlyerBrandTokens) {
  if (brand.titleFont !== "azonix") return text;
  return text.split(ACCENTED).map((part, i) =>
    ACCENTED.test(part) ? (
      <span key={i} style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/** Footer strip height and the bottom space the content keeps free for it, in design units. */
export const SPONSOR_H = 56;
export const SPONSOR_BLOCK = 84;

/** Event logo for the upper-right corner. Sized by height, capped by width. */
export function EventLogoImg({ src, u, alt = "Logo del evento" }: { src: string; u: number; alt?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} style={{ height: 120 * u, width: "auto", maxWidth: 240 * u, objectFit: "contain" }} />;
}

/** Sponsor and organiser logos for the footer, in a single row. */
export function SponsorStrip({ sponsors, u }: { sponsors: SponsorLogo[]; u: number }) {
  return (
    <div className="flex items-center justify-center" style={{ gap: 40 * u, maxWidth: "100%" }}>
      {sponsors.slice(0, MAX_SPONSORS).map((s, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={`${s.name}-${i}`} src={s.src} alt={s.name} style={{ height: 44 * u, width: "auto", maxWidth: 200 * u, objectFit: "contain" }} />
      ))}
    </div>
  );
}

/*
 * Reveal order for each block. In the video, blocks enter in this order ("uno" / "escribir").
 * Static renders ignore it.
 */
const ORDER = { logo: 0, kind: 1, eyebrow: 2, title: 3, subtitle: 4, date: 5, venue: 6, city: 7, countdown: 8 } as const;

/**
 * Generic flyer for GamER and GameDevs (all kinds), and for the Jam teaser / countdown.
 * The Jam event flyer keeps its dedicated artwork in jam-flyer.tsx.
 * Only approved brand tokens are used. No CTA buttons, no photography.
 */
export function BrandFlyer({ brand, kind, variant, eyebrow, data, format, now, hidden }: BrandFlyerProps) {
  const { width, height, safeZone } = format;
  const u = width / 1080;
  const isSquare = height === width;
  const shown = (key: FlyerFieldKey) => !isFieldHidden(hidden, key);
  const cd = countdownParts(data.countdownTo, now);
  const dateEmpty = data.dateText.trim() === "";
  const dateStr = dateEmpty ? DATE_FALLBACK : data.dateText.trim();
  const layout = kind === "event" ? EVENT_VARIANTS[variant].layout : "centrado";
  const pad = (n: number) => String(n).padStart(2, "0");

  const headline: CSSProperties = {
    fontFamily: brand.titleFont === "azonix" ? "'Azonix', sans-serif" : "inherit",
    color: brand.titleColor ?? brand.text,
    lineHeight: 0.95,
    textTransform: brand.titleFont === "azonix" ? "uppercase" : "none",
    fontWeight: 800,
  };
  // Each brand's glow is the one its landing uses: purple on GamER, green on GameDevs, none on Jam.
  const titleGlow: CSSProperties =
    brand.id === "gamer"
      ? { textShadow: "0 0 10px rgba(179,57,196,0.3), 0 0 30px rgba(179,57,196,0.1)" }
      : brand.id === "gamedevs"
        ? { textShadow: "0 0 10px rgba(132,197,82,0.5), 0 0 30px rgba(132,197,82,0.2)" }
        : {};

  const kindLabel = kind === "event" ? "Evento" : kind === "teaser" ? "Anotá la fecha" : "Cuenta regresiva";

  const eventLogoEl = shown("eventLogo") && data.eventLogo ? <EventLogoImg src={data.eventLogo} u={u} /> : null;
  const sponsorsEl = shown("sponsors") && data.sponsors.length > 0 ? <SponsorStrip sponsors={data.sponsors} u={u} /> : null;

  const logo = (
    <Reveal order={ORDER.logo} u={u}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={brand.logo}
        alt={brand.logoAlt}
        className={brand.id === "gamedevs" ? "flyer-float" : undefined}
        style={{ height: (isSquare ? 90 : 120) * u, width: "auto" }}
      />
    </Reveal>
  );

  const kindTag = (
    <Reveal order={ORDER.kind} u={u}>
      <span className="font-semibold uppercase tracking-[0.25em]" style={{ fontSize: 26 * u, color: brand.accent }}>
        {kindLabel}
      </span>
    </Reveal>
  );

  const eyebrowEl = shown("eyebrow") && eyebrow ? (
    <Reveal order={ORDER.eyebrow} u={u}>
      <p className="font-bold uppercase tracking-[0.2em]" style={{ fontSize: 34 * u, color: brand.accent }}>
        {eyebrow}
      </p>
    </Reveal>
  ) : null;

  const titleEl = shown("title") ? (
    <Reveal order={ORDER.title} u={u}>
      {brand.titleImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={brand.titleImage} alt={data.title} style={{ width: isSquare ? "70%" : "84%", height: "auto" }} />
      ) : (
        <h2 style={{ ...headline, ...titleGlow, fontSize: (isSquare ? 104 : 124) * u }}>{data.title}</h2>
      )}
    </Reveal>
  ) : null;

  const subtitleEl = shown("subtitle") ? (
    <Reveal order={ORDER.subtitle} u={u}>
      <p style={{ fontSize: 40 * u, lineHeight: 1.3, color: brand.muted, maxWidth: 820 * u, textWrap: "balance" }}>{data.subtitle}</p>
    </Reveal>
  ) : null;

  /** The date slot. Empty date renders "Próximamente" in the accent colour. */
  const dateEl = (size: number, color = brand.text, extra: CSSProperties = {}) =>
    shown("date") ? (
      <Reveal order={ORDER.date} u={u}>
        <p className="font-bold leading-none" style={{ ...headline, fontSize: size * u, color: dateEmpty ? brand.accentAlt : color, whiteSpace: "nowrap", ...extra }}>
          {dateEmpty ? withAccentFallback(dateStr, brand) : dateStr}
        </p>
      </Reveal>
    ) : null;

  const venueEl = (size: number, extra: CSSProperties = {}): ReactNode => {
    if (!shown("venue") || !venueShown(data.venue)) return null;
    const venue: VenueData = data.venue;
    const isImage = venue.mode === "mirador" || venue.mode === "logo";
    return (
      <Reveal order={ORDER.venue} u={u}>
        <div
          className="flex items-center justify-center"
          style={{
            borderRadius: 4 * u,
            border: `${1 * u}px solid ${brand.accent}55`,
            padding: isImage ? `${28 * u}px ${44 * u}px` : `${12 * u}px ${24 * u}px`,
            backgroundColor: "rgba(0,0,0,0.25)",
            ...extra,
          }}
        >
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={venue.mode === "mirador" ? "/jam/mirador-tec.png" : venue.logoSrc} alt={venueText(venue) || "Lugar"} style={{ height: 60 * u, width: "auto" }} />
          ) : (
            <span className="font-semibold" style={{ fontSize: size * u, color: brand.muted }}>
              {venueText(venue)}
            </span>
          )}
        </div>
      </Reveal>
    );
  };

  const cityEl = shown("city") && data.city ? (
    <Reveal order={ORDER.city} u={u}>
      <p className="font-semibold" style={{ fontSize: 44 * u, color: brand.muted }}>
        {data.city}
      </p>
    </Reveal>
  ) : null;

  const frame = (content: ReactNode) => (
    <div className="flyer-frame relative overflow-hidden" style={{ width, height, background: brand.bg, color: brand.text }}>
      <FlyerKeyframes />
      <FlyerBackdrop brand={brand} width={width} height={height} u={u} background={data.background} />
      {/* HUD corners */}
      <div className="absolute" style={{ top: safeZone.top, left: safeZone.left, width: 72 * u, height: 72 * u, borderTop: `${3 * u}px solid ${brand.accent}`, borderLeft: `${3 * u}px solid ${brand.accent}` }} />
      <div className="absolute" style={{ bottom: safeZone.bottom, right: safeZone.right, width: 72 * u, height: 72 * u, borderBottom: `${3 * u}px solid ${brand.accentAlt}`, borderRight: `${3 * u}px solid ${brand.accentAlt}` }} />
      {eventLogoEl && (
        <div className="absolute" style={{ top: safeZone.top, right: safeZone.right }}>
          {eventLogoEl}
        </div>
      )}
      <div className="absolute" style={{ top: safeZone.top, bottom: safeZone.bottom, left: safeZone.left, right: safeZone.right, paddingBottom: sponsorsEl ? SPONSOR_BLOCK * u : 0 }}>
        {content}
      </div>
      {sponsorsEl && (
        <div className="absolute flex items-center justify-center" style={{ bottom: safeZone.bottom, left: safeZone.left, right: safeZone.right, height: SPONSOR_H * u }}>
          {sponsorsEl}
        </div>
      )}
    </div>
  );

  // Centred stack: the default for teaser, countdown and the principal event.
  if (kind === "countdown") {
    return frame(
      <div className="flex h-full flex-col items-center justify-between text-center">
        <div className="flex flex-col items-center" style={{ gap: 28 * u }}>
          {logo}
          {kindTag}
        </div>
        <div className="flex flex-col items-center" style={{ gap: 22 * u }}>
          {eyebrowEl}
          {titleEl}
          {subtitleEl}
        </div>
        <div className="flex flex-col items-center" style={{ gap: 18 * u }}>
          {shown("countdown") && (
            <Reveal order={ORDER.countdown} u={u}>
              {cd.finished ? (
                <p className="font-bold" style={{ ...headline, fontSize: 96 * u, color: brand.accentAlt }}>¡Ya empezó!</p>
              ) : (
                <div className="flex flex-col items-center" style={{ gap: 18 * u }}>
                  <p className="font-bold leading-none" style={{ ...headline, fontSize: 260 * u, color: brand.accent }}>{cd.days}</p>
                  <p className="font-semibold uppercase tracking-[0.3em]" style={{ fontSize: 34 * u, color: brand.text }}>
                    {cd.days === 1 ? "día" : "días"} · {pad(cd.hours)}h {pad(cd.minutes)}m
                  </p>
                </div>
              )}
            </Reveal>
          )}
          {cityEl}
        </div>
      </div>,
    );
  }

  if (kind === "teaser") {
    const teaserSize = dateEmpty ? (brand.titleFont === "azonix" ? 76 : 92) : brand.id === "jam" ? 84 : 96;
    return frame(
      <div className="flex h-full flex-col items-center justify-between text-center">
        <div className="flex flex-col items-center" style={{ gap: 28 * u }}>
          {logo}
          {kindTag}
        </div>
        <div className="flex flex-col items-center" style={{ gap: 22 * u }}>
          {eyebrowEl}
          {titleEl}
          {subtitleEl}
        </div>
        <div className="flex flex-col items-center" style={{ gap: 18 * u }}>
          {dateEl(teaserSize, brand.accentAlt)}
          {cityEl}
        </div>
      </div>,
    );
  }

  // kind === "event": one composition per repost variant.
  if (layout === "editorial") {
    return frame(
      <div className="flex h-full flex-col justify-between text-left" style={{ alignItems: "flex-start" }}>
        <div className="flex flex-col items-start" style={{ gap: 24 * u }}>
          {logo}
          {kindTag}
        </div>
        <div className="flex flex-col items-start" style={{ gap: 22 * u }}>
          {eyebrowEl}
          <div style={{ width: 160 * u, height: 4 * u, backgroundColor: brand.accent }} />
          {shown("title") && (
            <Reveal order={ORDER.title} u={u}>
              <h2 style={{ ...headline, ...titleGlow, fontSize: 150 * u }}>{data.title}</h2>
            </Reveal>
          )}
          {subtitleEl && <div style={{ maxWidth: 760 * u }}>{subtitleEl}</div>}
        </div>
        <div className="flex flex-col items-start" style={{ gap: 22 * u, borderLeft: `${6 * u}px solid ${brand.accentAlt}`, paddingLeft: 32 * u }}>
          {dateEl(88, brand.text, { whiteSpace: "normal" })}
          {venueEl(38)}
          {cityEl}
        </div>
      </div>,
    );
  }

  if (layout === "ticket") {
    const showDate = shown("date");
    const showVenue = shown("venue") && venueShown(data.venue);
    return frame(
      <div className="flex h-full flex-col items-center justify-between text-center">
        <div className="flex flex-col items-center" style={{ gap: 28 * u }}>
          {logo}
          {kindTag}
        </div>
        <div className="flex flex-col items-center" style={{ gap: 22 * u }}>
          {eyebrowEl}
          {titleEl}
          {subtitleEl}
        </div>
        <div className="flex flex-col items-center" style={{ gap: 18 * u, width: "100%" }}>
          {(showDate || showVenue) && (
            <div
              className="flex w-full items-stretch"
              style={{ border: `${3 * u}px solid ${brand.accent}`, borderRadius: 20 * u, backgroundColor: "rgba(0,0,0,0.35)" }}
            >
              {showDate && (
                <div className="flex flex-1 flex-col items-center justify-center" style={{ gap: 12 * u, padding: `${40 * u}px ${28 * u}px` }}>
                  <span className="font-semibold uppercase tracking-[0.25em]" style={{ fontSize: 24 * u, color: brand.accent }}>Fecha</span>
                  {dateEl(80)}
                </div>
              )}
              {showDate && showVenue && <div style={{ borderLeft: `${3 * u}px dashed ${brand.accent}88` }} />}
              {showVenue && (
                <div className="flex flex-1 flex-col items-center justify-center" style={{ gap: 14 * u, padding: `${40 * u}px ${28 * u}px` }}>
                  <span className="font-semibold uppercase tracking-[0.25em]" style={{ fontSize: 24 * u, color: brand.accent }}>Lugar</span>
                  {venueEl(40)}
                </div>
              )}
            </div>
          )}
          {cityEl}
        </div>
      </div>,
    );
  }

  if (layout === "hoy") {
    // "Día D" must fit the frame: the date wraps and is sized to the frame width, not forced onto one line.
    return frame(
      <div className="flex h-full flex-col items-center justify-between text-center">
        <div className="flex flex-col items-center" style={{ gap: 28 * u }}>
          {logo}
          {kindTag}
        </div>
        <div className="flex flex-col items-center" style={{ gap: 32 * u, maxWidth: 900 * u }}>
          {eyebrowEl && (
            <Reveal order={ORDER.eyebrow} u={u}>
              <p
                className="font-extrabold uppercase tracking-[0.15em]"
                style={{ fontSize: 34 * u, color: brand.bg, backgroundColor: brand.accentAlt, borderRadius: 999, padding: `${14 * u}px ${36 * u}px` }}
              >
                {eyebrow}
              </p>
            </Reveal>
          )}
          {shown("title") && (
            <Reveal order={ORDER.title} u={u}>
              <h2 style={{ ...headline, ...titleGlow, fontSize: (brand.titleFont === "azonix" ? 124 : 144) * u, overflowWrap: "anywhere" }}>{data.title}</h2>
            </Reveal>
          )}
          {subtitleEl}
        </div>
        <div className="flex flex-col items-center" style={{ gap: 22 * u, maxWidth: "100%" }}>
          {dateEl(96, brand.accent, { whiteSpace: "normal", textAlign: "center" })}
          {venueEl(38)}
          {cityEl}
        </div>
      </div>,
    );
  }

  // Default event: the centred stack.
  return frame(
    <div className="flex h-full flex-col items-center justify-between text-center">
      <div className="flex flex-col items-center" style={{ gap: 28 * u }}>
        {logo}
        {kindTag}
      </div>
      <div className="flex flex-col items-center" style={{ gap: 22 * u }}>
        {eyebrowEl}
        {titleEl}
        {subtitleEl}
      </div>
      <div className="flex flex-col items-center" style={{ gap: 22 * u }}>
        {dateEl(64, brand.text)}
        {venueEl(38)}
        {cityEl}
      </div>
    </div>,
  );
}

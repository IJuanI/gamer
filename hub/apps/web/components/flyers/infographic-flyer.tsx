"use client";

import type { CSSProperties, ReactNode } from "react";
import type { FlyerBrandTokens } from "@/lib/flyer-brands";
import type { FlyerFormat } from "@/lib/flyer-formats";
import { isFieldHidden, parseItems, type FlyerData, type FlyerHidden, type InfographicVariant } from "@/lib/flyer-kinds";
import { FlyerBackdrop, FlyerKeyframes } from "@/components/flyers/flyer-backdrop";
import { Reveal } from "@/components/flyers/story-motion";
import { EventLogoImg, SPONSOR_BLOCK, SPONSOR_H, SponsorStrip } from "@/components/flyers/brand-flyer";

interface InfographicFlyerProps {
  brand: FlyerBrandTokens;
  variant: InfographicVariant;
  data: FlyerData;
  format: FlyerFormat;
  hidden: FlyerHidden;
}

const RATIO = /^(\d+)\s*\/\s*(\d+)$/;

/**
 * Explains event details in a few short data points. Each line of `itemsText`
 * is one point ("Precio | $0"). Three layouts share one header and footer.
 * In the video, the header enters first and then each data point in turn.
 */
export function InfographicFlyer({ brand, variant, data, format, hidden }: InfographicFlyerProps) {
  const { width, height, safeZone } = format;
  const u = width / 1080;
  const shown = (key: "eyebrow" | "title" | "subtitle" | "items" | "city") => !isFieldHidden(hidden, key);
  const items = shown("items") ? parseItems(data.itemsText) : [];
  const eventLogoEl = !isFieldHidden(hidden, "eventLogo") && data.eventLogo ? <EventLogoImg src={data.eventLogo} u={u} /> : null;
  const sponsorsEl =
    !isFieldHidden(hidden, "sponsors") && data.sponsors.length > 0 ? <SponsorStrip sponsors={data.sponsors} u={u} /> : null;

  const headline: CSSProperties = {
    fontFamily: brand.titleFont === "azonix" ? "'Azonix', sans-serif" : "inherit",
    color: brand.titleColor ?? brand.text,
    lineHeight: 0.95,
    textTransform: brand.titleFont === "azonix" ? "uppercase" : "none",
    fontWeight: 800,
  };

  const header = (
    <Reveal order={0} u={u}>
      <div className="flex flex-col items-center text-center" style={{ gap: 22 * u }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brand.logo} alt={brand.logoAlt} style={{ height: 96 * u, width: "auto" }} />
        <span className="font-semibold uppercase tracking-[0.25em]" style={{ fontSize: 26 * u, color: brand.accent }}>
          Infografía
        </span>
        {shown("eyebrow") && data.eyebrow && (
          <p className="font-bold uppercase tracking-[0.2em]" style={{ fontSize: 30 * u, color: brand.accent }}>{data.eyebrow}</p>
        )}
        {shown("title") && <h2 style={{ ...headline, fontSize: 96 * u }}>{data.title}</h2>}
        {shown("subtitle") && (
          <p style={{ fontSize: 34 * u, lineHeight: 1.3, color: brand.muted, maxWidth: 800 * u }}>{data.subtitle}</p>
        )}
      </div>
    </Reveal>
  );

  const footer = shown("city") && data.city ? (
    <p className="font-semibold text-center" style={{ fontSize: 40 * u, color: brand.muted }}>{data.city}</p>
  ) : null;

  const card = (children: ReactNode, extra: CSSProperties = {}) => (
    <div
      style={{
        border: `${2 * u}px solid ${brand.accent}66`,
        borderRadius: 16 * u,
        backgroundColor: "rgba(0,0,0,0.35)",
        padding: `${28 * u}px ${30 * u}px`,
        ...extra,
      }}
    >
      {children}
    </div>
  );

  let body: ReactNode;

  if (variant === "tarjetas") {
    body = (
      <div className="grid grid-cols-2" style={{ gap: 22 * u }}>
        {items.map((item, i) => (
          <Reveal key={`${item.label}-${i}`} order={i + 1} u={u}>
            {card(
              <>
                <p className="font-semibold uppercase tracking-[0.15em]" style={{ fontSize: 26 * u, color: brand.muted }}>{item.label}</p>
                <p className="font-bold" style={{ ...headline, fontSize: 56 * u, color: brand.accent, marginTop: 14 * u }}>{item.value}</p>
              </>,
            )}
          </Reveal>
        ))}
      </div>
    );
  } else if (variant === "cronograma") {
    body = (
      <div className="flex flex-col" style={{ gap: 0 }}>
        {items.map((item, i) => (
          <Reveal key={`${item.label}-${i}`} order={i + 1} u={u}>
            <div className="flex items-stretch" style={{ gap: 28 * u }}>
              <div className="flex flex-col items-center" style={{ width: 28 * u }}>
                <div style={{ width: 22 * u, height: 22 * u, borderRadius: 9999, backgroundColor: brand.accent, marginTop: 10 * u }} />
                {i < items.length - 1 && <div style={{ flex: 1, width: 3 * u, backgroundColor: `${brand.accent}55` }} />}
              </div>
              <div style={{ paddingBottom: 36 * u, textAlign: "left" }}>
                <p className="font-semibold uppercase tracking-[0.15em]" style={{ fontSize: 26 * u, color: brand.accent }}>{item.label}</p>
                <p className="font-bold" style={{ fontSize: 58 * u, color: brand.text, marginTop: 6 * u }}>{item.value}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    );
  } else {
    body = (
      <div className="flex flex-col" style={{ gap: 36 * u }}>
        {items.map((item, i) => {
          const ratio = item.value.match(RATIO);
          const pct = ratio && Number(ratio[2]) > 0 ? Math.min(100, (Number(ratio[1]) / Number(ratio[2])) * 100) : null;
          return (
            <Reveal key={`${item.label}-${i}`} order={i + 1} u={u}>
              <div className="flex flex-col">
                <div className="flex items-baseline justify-between">
                  <p className="font-semibold uppercase tracking-[0.15em]" style={{ fontSize: 30 * u, color: brand.muted }}>{item.label}</p>
                  <p className="font-bold" style={{ ...headline, fontSize: 56 * u, color: brand.accent }}>{item.value}</p>
                </div>
                {pct !== null && (
                  <div style={{ marginTop: 14 * u, height: 18 * u, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", backgroundColor: brand.accent }} />
                  </div>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flyer-frame relative overflow-hidden" style={{ width, height, background: brand.bg, color: brand.text }}>
      <FlyerKeyframes />
      <FlyerBackdrop brand={brand} width={width} height={height} u={u} background={data.background} />
      <div className="absolute" style={{ top: safeZone.top, left: safeZone.left, width: 72 * u, height: 72 * u, borderTop: `${3 * u}px solid ${brand.accent}`, borderLeft: `${3 * u}px solid ${brand.accent}` }} />
      <div className="absolute" style={{ bottom: safeZone.bottom, right: safeZone.right, width: 72 * u, height: 72 * u, borderBottom: `${3 * u}px solid ${brand.accentAlt}`, borderRight: `${3 * u}px solid ${brand.accentAlt}` }} />
      {eventLogoEl && (
        <div className="absolute" style={{ top: safeZone.top, right: safeZone.right }}>
          {eventLogoEl}
        </div>
      )}
      <div
        className="absolute flex flex-col justify-between"
        style={{
          top: safeZone.top,
          bottom: safeZone.bottom,
          left: safeZone.left,
          right: safeZone.right,
          gap: 48 * u,
          paddingBottom: sponsorsEl ? SPONSOR_BLOCK * u : 0,
        }}
      >
        {header}
        <div style={{ width: "100%" }}>{body}</div>
        {footer}
      </div>
      {sponsorsEl && (
        <div className="absolute flex items-center justify-center" style={{ bottom: safeZone.bottom, left: safeZone.left, right: safeZone.right, height: SPONSOR_H * u }}>
          {sponsorsEl}
        </div>
      )}
    </div>
  );
}

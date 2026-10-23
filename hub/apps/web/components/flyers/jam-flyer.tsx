"use client";

import { Gamepad2, Hexagon, Zap, Joystick, Swords } from "lucide-react";
import { JAM_FLYER_DATA, type JamFlyerData } from "@/lib/jam-flyer-data";
import { FLYER_BRANDS } from "@/lib/flyer-brands";
import type { FlyerFormat } from "@/lib/flyer-formats";
import {
  DATE_FALLBACK,
  MAX_SPONSORS,
  isFieldHidden,
  venueShown,
  venueText,
  type FlyerBackground,
  type FlyerHidden,
  type SponsorLogo,
  type VenueData,
} from "@/lib/flyer-kinds";
import { FlyerBackdrop } from "@/components/flyers/flyer-backdrop";
import { Reveal } from "@/components/flyers/story-motion";

/** The principal Jam artwork has no eyebrow line; only repost variants add one. */
const JAM_DEFAULT_EYEBROW = JAM_FLYER_DATA.eyebrow;

/** The Jam event data, with the venue as an object so it can be a MiradorTEC logo, text or an upload. */
export type JamEvent = Omit<JamFlyerData, "venue"> & { venue: VenueData };

/** Splits the hero copy into its two lines: "Torneo de … Videojuegos." and "Crea, colabora e innova." */
function heroLines(text: string): [string, string] {
  const cut = text.indexOf(". ");
  return cut === -1 ? [text, ""] : [text.slice(0, cut + 1), text.slice(cut + 2)];
}

/**
 * Paraná Game Jam flyer — a phone-first announcement, not a site recap.
 * Big type, a dense field of motifs across the whole canvas, minimal copy.
 * The "clasico" background is this HUD field. Other backgrounds replace it with the shared patterns.
 */
export function JamFlyer({
  event,
  format,
  hidden = {},
  background = "clasico",
  eventLogo = "",
  sponsors = [],
}: {
  event: JamEvent;
  format: FlyerFormat;
  hidden?: FlyerHidden;
  background?: FlyerBackground;
  eventLogo?: string;
  /**
   * One or two sponsors use the two corner slots of the approved artwork. Three or more switch to a
   * single centred row across the footer, so every logo is drawn.
   */
  sponsors?: SponsorLogo[];
}) {
  const { width, height, safeZone } = format;
  const shown = (key: keyof FlyerHidden) => !isFieldHidden(hidden, key);
  const eventLogoShown = shown("eventLogo") && eventLogo !== "";
  const sponsorList = shown("sponsors") ? sponsors.slice(0, MAX_SPONSORS) : [];
  const sponsorRow = sponsorList.length > 2;
  const [sponsorA, sponsorB] = sponsorRow ? [] : sponsorList;
  const [heroLine1, heroLine2] = heroLines(event.heroText);
  const showVenue = shown("venue") && venueShown(event.venue);
  const isSquare = format.id === "whatsapp-status";
  const u = width / 1080; // scale unit relative to the story format
  const moveUp = height * 0.05; // shift everything but the gamepad mark & gamedevs mark up 5%
  const moveDown = height * 0.02; // then nudge title + content back down a touch
  const contentShift = moveDown - moveUp;
  const footerHeight = 110 * u * 0.3 + moveUp;
  const footerBottomMargin = 64 * u; // independent bottom margin for just the footer mark
  const footerLeftMargin = 90 * u; // independent left margin for just the footer mark
  const isImageVenue = event.venue.mode === "mirador" || event.venue.mode === "logo";

  return (
    <div
      className="flyer-frame relative overflow-hidden"
      style={{ width, height, background: "#0b1020" }}
    >
      {background !== "clasico" && (
        <FlyerBackdrop brand={FLYER_BRANDS.jam} width={width} height={height} u={u} background={background} />
      )}

      {background === "clasico" && (
        <>
          {/* HUD grid — bold, clearly visible hairlines */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(60, 255, 158, 0.3) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(60, 255, 158, 0.3) 1.5px, transparent 1.5px)",
              backgroundSize: `${80 * u}px ${80 * u}px`,
            }}
          />

          {/* dense field of motifs across the entire canvas */}
          <Hexagon className="absolute" style={{ top: "5%", left: "8%", width: 64 * u, height: 64 * u, color: "rgba(139,108,255,0.4)" }} />
          <Hexagon className="absolute" style={{ top: "63%", right: "8%", width: 52 * u, height: 52 * u, color: "rgba(60,255,158,0.35)" }} />
          <Hexagon className="absolute" style={{ bottom: "6%", left: "14%", width: 40 * u, height: 40 * u, color: "rgba(139,108,255,0.3)", transform: "rotate(18deg)" }} />
          <Hexagon className="absolute" style={{ top: "34%", right: "20%", width: 30 * u, height: 30 * u, color: "rgba(60,255,158,0.3)", transform: "rotate(8deg)" }} />
          <Hexagon className="absolute" style={{ top: "78%", left: "24%", width: 26 * u, height: 26 * u, color: "rgba(139,108,255,0.28)" }} />
          <Gamepad2 className="absolute" style={{ top: "16%", right: "10%", width: 46 * u, height: 46 * u, color: "rgba(60,255,158,0.4)" }} />
          <Joystick className="absolute" style={{ top: "46%", left: "6%", width: 44 * u, height: 44 * u, color: "rgba(139,108,255,0.35)" }} />
          <Swords className="absolute" style={{ bottom: "24%", right: "12%", width: 42 * u, height: 42 * u, color: "rgba(139,108,255,0.32)" }} />
          <Swords className="absolute" style={{ top: "3%", left: "34%", width: 28 * u, height: 28 * u, color: "rgba(60,255,158,0.32)", transform: "rotate(-20deg)" }} />
          <Gamepad2 className="absolute" style={{ bottom: "3%", right: "34%", width: 30 * u, height: 30 * u, color: "rgba(139,108,255,0.3)" }} />
          <Zap className="absolute" style={{ top: "9%", right: "26%", width: 34 * u, height: 34 * u, color: "rgba(60,255,158,0.45)" }} />
          <Zap className="absolute" style={{ bottom: "10%", right: "30%", width: 28 * u, height: 28 * u, color: "rgba(139,108,255,0.4)" }} />
          <Zap className="absolute" style={{ top: "58%", right: "4%", width: 24 * u, height: 24 * u, color: "rgba(60,255,158,0.35)" }} />
          <Zap className="absolute" style={{ bottom: "42%", left: "4%", width: 22 * u, height: 22 * u, color: "rgba(139,108,255,0.35)" }} />

          <div className="absolute rounded-full" style={{ top: "24%", right: "22%", width: 14 * u, height: 14 * u, backgroundColor: "#3cff9e", opacity: 0.7 }} />
          <div className="absolute rounded-full" style={{ top: "55%", left: "20%", width: 12 * u, height: 12 * u, backgroundColor: "#8b6cff", opacity: 0.7 }} />
          <div className="absolute rounded-full" style={{ bottom: "34%", left: "10%", width: 10 * u, height: 10 * u, backgroundColor: "#3cff9e", opacity: 0.6 }} />
          <div className="absolute rounded-full" style={{ top: "8%", left: "40%", width: 10 * u, height: 10 * u, backgroundColor: "#8b6cff", opacity: 0.6 }} />
          <div className="absolute rounded-full" style={{ top: "38%", right: "36%", width: 8 * u, height: 8 * u, backgroundColor: "#3cff9e", opacity: 0.55 }} />
          <div className="absolute rounded-full" style={{ bottom: "18%", left: "30%", width: 8 * u, height: 8 * u, backgroundColor: "#8b6cff", opacity: 0.55 }} />
          <div className="absolute rounded-full" style={{ top: "70%", right: "18%", width: 9 * u, height: 9 * u, backgroundColor: "#3cff9e", opacity: 0.55 }} />

          {/* big thin circular rings, bleeding off the canvas edges */}
          <div
            className="absolute rounded-full"
            style={{
              top: -width * 0.45,
              left: -width * 0.5,
              width: width * 1.15,
              height: width * 1.15,
              border: `${2 * u}px solid rgba(60,255,158,0.4)`,
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              bottom: -width * 0.55,
              right: -width * 0.4,
              width: width * 1.3,
              height: width * 1.3,
              border: `${2 * u}px solid rgba(139,108,255,0.4)`,
            }}
          />
        </>
      )}

      {/* HUD corner brackets, bigger */}
      <div
        className="absolute"
        style={{ top: safeZone.top, left: safeZone.left, width: 72 * u, height: 72 * u, borderTop: `${3 * u}px solid #3cff9e`, borderLeft: `${3 * u}px solid #3cff9e` }}
      />
      <div
        className="absolute"
        style={{ top: safeZone.top, right: safeZone.right, width: 72 * u, height: 72 * u, borderTop: `${3 * u}px solid #8b6cff`, borderRight: `${3 * u}px solid #8b6cff` }}
      />

      {/* Layout: empty top margin (gamepad mark centered in it) / title dead center / remaining
          space spread evenly below / footer pinned to the bottom with its own small margin */}
      <div
        className="absolute grid"
        style={{
          top: safeZone.top,
          bottom: footerHeight + footerBottomMargin,
          left: safeZone.left,
          right: safeZone.right,
          gridTemplateRows: "1fr auto 1fr",
          rowGap: 24 * u,
        }}
      >
        <div className="flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/jam/logo.svg"
            alt=""
            style={{
              width: 260 * u,
              height: "auto",
              transform: "rotate(-26deg)",
              transformOrigin: "85% 85%",
            }}
          />
        </div>

        <div className="flex justify-center" style={{ transform: `translateY(${contentShift}px)` }}>
          {shown("title") && (
            <Reveal order={3} u={u}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/jam/pgj-logo.png"
                alt="Paraná Game Jam"
                style={{ width: isSquare ? "72%" : "88%", height: "auto" }}
              />
            </Reveal>
          )}
        </div>

        <div
          className="flex flex-col items-center justify-between text-center"
          style={{ transform: `translateY(${contentShift}px)` }}
        >
          {/* Group 1: hero text */}
          <div>
            {shown("subtitle") && (
              <Reveal order={4} u={u}>
                <p className="font-medium" style={{ fontSize: 30 * u, lineHeight: 1.3, color: "#d6dcff" }}>
                  {heroLine1}
                </p>
                <p className="mt-[1%] font-medium" style={{ fontSize: 46 * u, lineHeight: 1.3, color: "#d6dcff" }}>
                  {heroLine2}
                </p>
              </Reveal>
            )}
          </div>

          {/* Group 2: date + lugar, kept close together, same horizontal span
              (grid, not flex, so both rows reliably share the width of the widest one) */}
          <div className="grid justify-items-stretch" style={{ rowGap: 18 * u }}>
            {shown("eyebrow") && event.eyebrow && event.eyebrow !== JAM_DEFAULT_EYEBROW && (
              <Reveal order={2} u={u}>
                <p className="font-semibold text-center uppercase tracking-[0.2em]" style={{ fontSize: 30 * u, color: "#3cff9e" }}>
                  {event.eyebrow}
                </p>
              </Reveal>
            )}
            {shown("date") && (
              <Reveal order={5} u={u}>
                <p className="font-bold text-center" style={{ fontSize: 64 * u, color: event.dateRange.trim() ? "#ffffff" : "#8b6cff" }}>
                  {event.dateRange.trim() || DATE_FALLBACK}
                </p>
              </Reveal>
            )}

            {/* MiradorTEC — venue pill, exact styling pulled from the site's source
                (bg-card/50, border-primary/30, rounded = 4px, text-muted-foreground).
                Image venues get more inner margin so the logo breathes. */}
            {showVenue && (
              <Reveal order={6} u={u}>
                <div
                  className="flex items-center justify-center"
                  style={{
                    gap: 22 * u,
                    borderRadius: 4 * u,
                    border: `1px solid rgba(60,255,158,0.3)`,
                    backgroundColor: "rgba(18,24,45,0.5)",
                    padding: isImageVenue ? `${28 * u}px ${44 * u}px` : `${12 * u}px ${24 * u}px`,
                  }}
                >
                  <span className="font-bold leading-none" style={{ fontSize: 38 * u, color: "#b6c2ff" }}>
                    LUGAR:
                  </span>
                  {event.venue.mode === "text" ? (
                    <span className="font-bold leading-none" style={{ fontSize: 38 * u, color: "#b6c2ff" }}>
                      {venueText(event.venue)}
                    </span>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.venue.mode === "logo" ? event.venue.logoSrc : "/jam/mirador-tec.png"}
                      alt={event.venue.mode === "logo" ? "Lugar" : "MiradorTEC"}
                      style={{ height: 60 * u, width: "auto", transform: `translateY(-${14 * u}px)` }}
                    />
                  )}
                </div>
              </Reveal>
            )}
          </div>

          {/* Group 3: city */}
          {shown("city") && (
            <Reveal order={7} u={u}>
              <p className="font-semibold" style={{ fontSize: 44 * u, color: "#d6dcff", transform: `translateY(${4 * u}px)` }}>
                {event.city}
              </p>
            </Reveal>
          )}
        </div>
      </div>

      {/* Sponsor slot 1, bottom-left, pinned with its own small margin */}
      {sponsorA && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sponsorA.src}
          alt={sponsorA.name}
          className="absolute"
          style={{
            left: safeZone.left + footerLeftMargin,
            bottom: footerBottomMargin,
            height: footerHeight,
            width: "auto",
            filter: "drop-shadow(0 0 18px rgba(0,0,0,0.45))",
          }}
        />
      )}

      {/* Event logo, upper right corner */}
      {eventLogoShown && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={eventLogo}
          alt="Logo del evento"
          className="absolute"
          style={{
            top: safeZone.top + 30 * u,
            right: safeZone.right + 20 * u,
            width: 130 * u * 1.5,
            height: "auto",
            filter: "drop-shadow(0 0 18px rgba(0,0,0,0.45))",
          }}
        />
      )}

      {/* Sponsor slot 2, bottom right, to the right of slot 1 */}
      {sponsorB && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sponsorB.src}
          alt={sponsorB.name}
          className="absolute"
          style={{
            right: safeZone.right + footerLeftMargin * 0.5,
            bottom: footerBottomMargin - footerHeight * 0.25,
            height: footerHeight * 1.5,
            width: "auto",
            opacity: 0.6,
            filter: "drop-shadow(0 0 18px rgba(0,0,0,0.45))",
          }}
        />
      )}

      {/* Three or more sponsors: one centred row across the footer, between the same margins */}
      {sponsorRow && (
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: safeZone.left + footerLeftMargin,
            right: safeZone.right + footerLeftMargin * 0.5,
            bottom: footerBottomMargin,
            height: footerHeight,
            gap: 48 * u,
          }}
        >
          {sponsorList.map((s, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${s.name}-${i}`}
              src={s.src}
              alt={s.name}
              style={{
                height: "100%",
                width: "auto",
                minWidth: 0,
                maxWidth: `${(width - 2 * footerLeftMargin - 48 * u * (sponsorList.length - 1)) / sponsorList.length}px`,
                objectFit: "contain",
                filter: "drop-shadow(0 0 18px rgba(0,0,0,0.45))",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

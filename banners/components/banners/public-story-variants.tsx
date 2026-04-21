"use client";

import type { EventData } from "@/lib/event-data";
import { DEFAULT_VARIATION, type BannerVariation } from "@/lib/variation";
import { GamepadIcon } from "./gaming-icons";
import { ICON_MAP } from "./icon-map";
import { SponsorStrip } from "./sponsor-strip";

function InstagramIcon({ size = 28, color = "#96D068" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="6" stroke={color} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.5" stroke={color} strokeWidth="1.5" />
      <circle cx="17.5" cy="6.5" r="1.2" fill={color} />
    </svg>
  );
}

/** Shared background decorations for all variants */
function SharedBackground({ variation }: { variation: BannerVariation }) {
  const [Icon1, Icon2, Icon3] = variation.icons.map((n) => ICON_MAP[n]);
  const [rot1, rot2, rot3] = variation.rotationOffsets;
  const [s1, s2, s3] = variation.positionSeeds;
  const [d1, d2, d3] = variation.decoratorSeeds;
  const lp = (s: number, lo: number, hi: number) => Math.round(lo + s * (hi - lo));
  const cv = variation.clipVariance;

  return (
    <>
      <div className="absolute inset-0 bg-grid-neon-fade" />
      <div className="absolute" style={{ top: 0, left: 0, width: "100%", height: 480, background: "linear-gradient(180deg, rgba(132,197,82,0.14), transparent)", clipPath: `polygon(0 0, 100% 0, 100% ${70 + cv}%, 0 100%)` }} />
      <div className="absolute" style={{ bottom: 0, left: 0, width: "100%", height: 480, background: "linear-gradient(0deg, rgba(179,57,196,0.1), transparent)", clipPath: `polygon(0 ${30 - cv}%, 100% 0, 100% 100%, 0 100%)` }} />
      <div className="absolute" style={{ top: lp(d3, 100, 240), right: 0, width: lp(d3, 160, 260), height: lp(d3, 240, 380), background: "rgba(132,197,82,0.09)", clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)" }} />
      <div className="absolute" style={{ bottom: lp(d3, 100, 240), left: 0, width: lp(d3, 140, 240), height: lp(d3, 220, 360), background: "rgba(179,57,196,0.07)", clipPath: "polygon(0 0, 100% 0, 70% 100%, 0 100%)" }} />
      <div className="absolute" style={{ top: lp(d1, 200, 360), right: lp(d1, 10, 70), width: lp(d1, 260, 360), height: lp(d1, 260, 360), borderRadius: "50%", border: "2px solid rgba(132,197,82,0.18)" }} />
      <div className="absolute" style={{ bottom: lp(d2, 240, 400), left: lp(d2, 0, 50), width: lp(d2, 280, 400), height: lp(d2, 280, 400), borderRadius: "50%", border: "2px solid rgba(179,57,196,0.14)" }} />
      <div className="absolute" style={{ top: lp(d1, 460, 600), left: lp(d1, 60, 130), width: 14, height: 14, borderRadius: "50%", background: "rgba(132,197,82,0.35)" }} />
      <div className="absolute" style={{ bottom: lp(d2, 480, 620), right: lp(d2, 70, 140), width: 10, height: 10, borderRadius: "50%", background: "rgba(179,57,196,0.3)" }} />
      <Icon1 size={120} color="rgba(132,197,82,0.25)" style={{ top: lp(s1, 250, 700), right: lp(s1, 20, 240), transform: `rotate(${-15 + rot1}deg)` }} />
      <Icon2 size={85} color="rgba(179,57,196,0.22)" style={{ bottom: lp(s2, 350, 780), left: lp(s2, 30, 240), transform: `rotate(${10 + rot2}deg)` }} />
      <Icon3 size={100} color="rgba(132,197,82,0.18)" style={{ bottom: lp(s3, 520, 1020), right: lp(s3, 20, 200), transform: `rotate(${rot3}deg)` }} />
      <Icon1 size={90} color="rgba(132,197,82,0.2)" style={{ top: lp(s1, 560, 980), left: lp(s1, 15, 200), transform: `rotate(${-8 + rot1}deg)` }} />
      <div className="absolute" style={{ top: 250, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, rgba(132,197,82,0.5), rgba(132,197,82,0.1) 30%, transparent 50%, rgba(179,57,196,0.1) 70%, rgba(179,57,196,0.4))" }} />
      <div className="absolute" style={{ bottom: 250, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, rgba(179,57,196,0.4), rgba(179,57,196,0.1) 30%, transparent 50%, rgba(132,197,82,0.1) 70%, rgba(132,197,82,0.5))" }} />
      {/* Corner brackets */}
      <div className="absolute" style={{ top: 30, left: 30, width: 70, height: 70, borderTop: "3px solid rgba(132,197,82,0.5)", borderLeft: "3px solid rgba(132,197,82,0.5)" }} />
      <div className="absolute" style={{ top: 30, right: 30, width: 70, height: 70, borderTop: "3px solid rgba(132,197,82,0.5)", borderRight: "3px solid rgba(132,197,82,0.5)" }} />
      <div className="absolute" style={{ bottom: 30, left: 30, width: 70, height: 70, borderBottom: "3px solid rgba(179,57,196,0.5)", borderLeft: "3px solid rgba(179,57,196,0.5)" }} />
      <div className="absolute" style={{ bottom: 30, right: 30, width: 70, height: 70, borderBottom: "3px solid rgba(179,57,196,0.5)", borderRight: "3px solid rgba(179,57,196,0.5)" }} />
    </>
  );
}

/** Console games inline list */
function ConsoleList({ games }: { games: string[] }) {
  return (
    <div className="flex items-center flex-wrap justify-center" style={{ gap: 14 }}>
      <GamepadIcon size={34} color="rgba(132,197,82,0.6)" className="" />
      {games.map((g, i) => (
        <span key={g} style={{ fontSize: 30, color: "rgba(132,197,82,0.7)" }}>
          {g}{i < games.length - 1 ? " ·" : ""}
        </span>
      ))}
    </div>
  );
}

/** Price + IG CTA unified panel */
function PriceCTA({ fee }: { fee?: string }) {
  return (
    <div
      className="panel-clip-sm"
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        padding: "20px 52px",
        background: "rgba(132,197,82,0.08)", border: "1px solid rgba(132,197,82,0.35)",
      }}
    >
      {fee && (
        <span className="font-azonix" style={{ fontSize: 34, color: "#96D068", textShadow: "0 0 20px rgba(132,197,82,0.25)", letterSpacing: "0.05em" }}>
          {fee}
        </span>
      )}
      <div style={{ width: "100%", height: 1, background: "linear-gradient(90deg, transparent, rgba(132,197,82,0.3) 20%, rgba(132,197,82,0.3) 80%, transparent)" }} />
      <div className="flex items-center" style={{ gap: 12 }}>
        <InstagramIcon size={28} color="#96D068" />
        <span style={{ fontSize: 24, color: "#B0B0BC", letterSpacing: "0.04em" }}>
          ¡Conseguí tu entrada por Instagram!
        </span>
      </div>
      <span className="font-azonix" style={{ fontSize: 28, color: "#96D068", letterSpacing: "0.08em" }}>
        @gamer_eerr
      </span>
    </div>
  );
}

interface Props {
  event: EventData;
  variation?: BannerVariation;
  sponsorLogos?: string[];
  bgImage?: string;
}

// ─────────────────────────────────────────────
// OPTION A — "Invitation-first"
// Hero = "¡VENÍ A JUGAR!" · Open Duo as context
// ─────────────────────────────────────────────
export function PublicStoryA({ event, variation = DEFAULT_VARIATION }: Props) {
  return (
    <div className="banner-frame relative" style={{ width: 1080, height: 1920, background: "#1c1435" }}>
      <SharedBackground variation={variation} />
      <div className="relative flex flex-col items-center justify-between h-full" style={{ paddingTop: 280, paddingBottom: 280, paddingLeft: 80, paddingRight: 80 }}>
        {/* Top: Logo + event context line */}
        <div className="flex flex-col items-center" style={{ gap: 16 }}>
          <img src="/logo.png" alt="GamER" style={{ height: 120, width: "auto" }} />
          <span className="font-azonix" style={{ fontSize: 22, color: "#888899", letterSpacing: "0.15em" }}>
            {event.title} · {event.date.toUpperCase()}
          </span>
        </div>

        {/* Center: Hero invitation */}
        <div className="flex flex-col items-center" style={{ gap: 36 }}>
          <h1 className="font-azonix leading-none text-center" style={{ fontSize: 110, color: "#E8E8F0", textShadow: "0 0 40px rgba(132,197,82,0.35), 0 0 80px rgba(132,197,82,0.12)" }}>
            ¡VENÍ A<br />JUGAR!
          </h1>

          <span style={{ fontSize: 30, color: "#B0B0BC", textAlign: "center", lineHeight: 1.5 }}>
            No necesitás inscribirte al torneo
          </span>

          {event.consoleGames && event.consoleGames.length > 0 && (
            <ConsoleList games={event.consoleGames} />
          )}
        </div>

        {/* Bottom: Date + venue + price/CTA */}
        <div className="flex flex-col items-center" style={{ gap: 28 }}>
          <div className="panel-clip relative" style={{ padding: "24px 64px", background: "rgba(132,197,82,0.06)", border: "1px solid rgba(132,197,82,0.2)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div className="hud-bracket-tl" />
            <div className="hud-bracket-br" />
            <span className="font-azonix" style={{ fontSize: 44, color: "#96D068", textShadow: "0 0 20px rgba(132,197,82,0.3)" }}>
              {event.date.toUpperCase()}
            </span>
            <span className="font-azonix" style={{ fontSize: 28, color: "#E8E8F0" }}>{event.time}</span>
          </div>
          <div className="flex flex-col items-center" style={{ gap: 10 }}>
            {event.venueLogo && <img src={event.venueLogo} alt={event.venue ?? "Venue"} style={{ height: 56, width: "auto", opacity: 0.9 }} />}
            <span className="font-azonix" style={{ fontSize: 26, color: "#888899" }}>{event.city}</span>
          </div>
          <PriceCTA fee={event.publicEntryFee} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// OPTION B — "What you get"
// Two big activity blocks: JUGÁ EN CONSOLAS / MIRÁ EL TORNEO
// ─────────────────────────────────────────────
export function PublicStoryB({ event, variation = DEFAULT_VARIATION, sponsorLogos, bgImage }: Props) {
  return (
    <div className="banner-frame relative" style={{ width: 1080, height: 1920, background: bgImage ? "transparent" : "#1c1435" }}>
      {bgImage && <img src={bgImage} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
      <SharedBackground variation={variation} />
      <div className="relative flex flex-col items-center justify-between h-full" style={{ paddingTop: 280, paddingBottom: 280, paddingLeft: 80, paddingRight: 80 }}>
        {/* Top — logo only */}
        <img src="/logo.png" alt="GamER" style={{ height: 130, width: "auto" }} />

        {/* Center: hero — two activity blocks */}
        <div className="flex flex-col items-center" style={{ gap: 50 }}>
          {/* Activity 1: Consoles */}
          <div className="flex flex-col items-center" style={{ gap: 18 }}>
            <h2 className="font-azonix leading-none text-center" style={{ fontSize: 100, color: "#96D068", textShadow: "0 0 40px rgba(132,197,82,0.35)" }}>
              JUGÁ EN<br />CONSOLAS
            </h2>
            {event.consoleGames && event.consoleGames.length > 0 && (
              <ConsoleList games={event.consoleGames} />
            )}
          </div>

          {/* Divider */}
          <div style={{ width: 240, height: 2, background: "linear-gradient(90deg, transparent, rgba(132,197,82,0.4) 20%, rgba(179,57,196,0.4) 80%, transparent)" }} />

          {/* Activity 2: Watch */}
          <div className="flex flex-col items-center" style={{ gap: 14 }}>
            <h2 className="font-azonix leading-none text-center" style={{ fontSize: 100, color: "#C06DD0", textShadow: "0 0 40px rgba(179,57,196,0.35)" }}>
              VIVÍ EL<br />TORNEO
            </h2>
            <span style={{ fontSize: 38, color: "#B0B0BC" }}>
              ¡No necesitás inscribirte!
            </span>
          </div>
        </div>

        {/* Bottom — compact: date · price · handle */}
        <div className="flex flex-col items-center" style={{ gap: 24 }}>
          <span className="font-azonix" style={{ fontSize: 38, color: "#96D068", letterSpacing: "0.06em" }}>{event.date.toUpperCase()}</span>
          {event.publicEntryFee && (
            <span className="font-azonix" style={{ fontSize: 44, color: "#E8E8F0", textShadow: "0 0 20px rgba(132,197,82,0.25)" }}>
              {event.publicEntryFee}
            </span>
          )}
          <div className="flex items-center" style={{ gap: 12 }}>
            <InstagramIcon size={30} color="#96D068" />
            <span className="font-azonix" style={{ fontSize: 30, color: "#96D068", letterSpacing: "0.06em" }}>@gamer_eerr</span>
          </div>
        </div>
      </div>

      {/* Venue — sponsor strip at bottom edge; shifts up when sponsor mode is on */}
      {event.venueLogo && (
        <div className="absolute flex items-center justify-center" style={{ bottom: sponsorLogos !== undefined ? 160 : 44, left: 0, right: 0, gap: 14 }}>
          <div style={{ width: 50, height: 1, background: "rgba(132,197,82,0.2)" }} />
          <img src={event.venueLogo} alt={event.venue ?? "Venue"} style={{ height: 48, width: "auto", opacity: 0.75 }} />
          <span style={{ fontSize: 28, color: "#777788" }}>{event.city}</span>
          <div style={{ width: 50, height: 1, background: "rgba(132,197,82,0.2)" }} />
        </div>
      )}
      {sponsorLogos !== undefined && <SponsorStrip logos={sponsorLogos} />}
    </div>
  );
}

// ─────────────────────────────────────────────
// OPTION C — "Date-led event poster"
// Date hero · "Evento gamer en MiradorTec" · features
// ─────────────────────────────────────────────
export function PublicStoryC({ event, variation = DEFAULT_VARIATION }: Props) {
  return (
    <div className="banner-frame relative" style={{ width: 1080, height: 1920, background: "#1c1435" }}>
      <SharedBackground variation={variation} />
      <div className="relative flex flex-col items-center justify-between h-full" style={{ paddingTop: 280, paddingBottom: 280, paddingLeft: 80, paddingRight: 80 }}>
        {/* Top: Logo */}
        <img src="/logo.png" alt="GamER" style={{ height: 110, width: "auto" }} />

        {/* Center: Date hero + event description */}
        <div className="flex flex-col items-center" style={{ gap: 36 }}>
          {/* Date as hero */}
          <div className="flex flex-col items-center" style={{ gap: 4 }}>
            <span className="font-azonix" style={{ fontSize: 40, color: "#888899", letterSpacing: "0.2em" }}>SÁBADO</span>
            <span className="font-azonix leading-none" style={{ fontSize: 110, color: "#96D068", textShadow: "0 0 40px rgba(132,197,82,0.35)" }}>
              25 ABRIL
            </span>
            <span className="font-azonix" style={{ fontSize: 32, color: "#E8E8F0" }}>{event.time}</span>
          </div>

          {/* Event framing */}
          <div className="flex flex-col items-center" style={{ gap: 8 }}>
            <span className="font-azonix text-center" style={{ fontSize: 48, color: "#E8E8F0", lineHeight: 1.2 }}>
              EVENTO GAMER
            </span>
            <span className="font-azonix" style={{ fontSize: 28, color: "#888899" }}>
              EN {(event.venue ?? "").toUpperCase()}
            </span>
          </div>

          {/* Features */}
          <div className="flex flex-col items-center" style={{ gap: 16 }}>
            <span style={{ fontSize: 36, color: "#E8E8F0", fontWeight: 600 }}>
              · Jugá en <span style={{ color: "#96D068", fontWeight: 800 }}>consolas</span>
            </span>
            <span style={{ fontSize: 36, color: "#E8E8F0", fontWeight: 600 }}>
              · Viví el <span style={{ color: "#C06DD0", fontWeight: 800 }}>torneo {event.title} en vivo</span>
            </span>
          </div>

          {event.consoleGames && event.consoleGames.length > 0 && (
            <ConsoleList games={event.consoleGames} />
          )}

          <div className="panel-clip-sm font-azonix" style={{ padding: "14px 44px", background: "rgba(132,197,82,0.12)", border: "1px solid rgba(132,197,82,0.45)", fontSize: 28, color: "#96D068", letterSpacing: "0.1em" }}>
            NO REQUIERE INSCRIPCIÓN
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center" style={{ gap: 24 }}>
          <div className="flex flex-col items-center" style={{ gap: 10 }}>
            {event.venueLogo && <img src={event.venueLogo} alt={event.venue ?? "Venue"} style={{ height: 56, width: "auto", opacity: 0.9 }} />}
            <span className="font-azonix" style={{ fontSize: 26, color: "#888899" }}>{event.city}</span>
          </div>
          <PriceCTA fee={event.publicEntryFee} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// OPTION D — "Split banner"
// Top = tournament context · Bottom = "¿No jugás? ¡Vení igual!"
// ─────────────────────────────────────────────
export function PublicStoryD({ event, variation = DEFAULT_VARIATION }: Props) {
  return (
    <div className="banner-frame relative" style={{ width: 1080, height: 1920, background: "#1c1435" }}>
      <SharedBackground variation={variation} />
      <div className="relative flex flex-col h-full" style={{ paddingTop: 280, paddingBottom: 280, paddingLeft: 80, paddingRight: 80 }}>
        {/* TOP HALF — Tournament context */}
        <div className="flex flex-col items-center" style={{ gap: 20, flex: "0 0 auto" }}>
          <img src="/logo.png" alt="GamER" style={{ height: 110, width: "auto" }} />
          <span className="font-azonix" style={{ fontSize: 60, color: "#E8E8F0", textShadow: "0 0 30px rgba(132,197,82,0.2)" }}>
            {event.title}
          </span>
          <span style={{ fontSize: 26, color: "#888899" }}>
            Torneo 2v2 · {event.venue} · {event.date}
          </span>
        </div>

        {/* Divider */}
        <div style={{ margin: "50px 0", height: 2, background: "linear-gradient(90deg, rgba(132,197,82,0.5), transparent 30%, transparent 70%, rgba(179,57,196,0.5))" }} />

        {/* BOTTOM HALF — Public invitation (hero) */}
        <div className="flex-1 flex flex-col items-center justify-between">
          <div className="flex flex-col items-center" style={{ gap: 28 }}>
            <h2 className="font-azonix leading-none text-center" style={{ fontSize: 72, color: "#96D068", textShadow: "0 0 30px rgba(132,197,82,0.3)" }}>
              ¿NO JUGÁS<br />EN EL TORNEO?
            </h2>
            <h2 className="font-azonix leading-none text-center" style={{ fontSize: 90, color: "#E8E8F0", textShadow: "0 0 40px rgba(132,197,82,0.25)" }}>
              ¡VENÍ<br />IGUAL!
            </h2>

            <div className="flex flex-col items-center" style={{ gap: 12 }}>
              <div className="flex items-center" style={{ gap: 16 }}>
                <GamepadIcon size={36} color="#96D068" className="" />
                <span style={{ fontSize: 34, color: "#E8E8F0", fontWeight: 600 }}>
                  Jugá en <span style={{ color: "#96D068", fontWeight: 800 }}>consolas</span>
                </span>
              </div>
              {event.consoleGames && event.consoleGames.length > 0 && (
                <ConsoleList games={event.consoleGames} />
              )}
            </div>
          </div>

          <div className="flex flex-col items-center" style={{ gap: 24 }}>
            <div className="flex flex-col items-center" style={{ gap: 10 }}>
              <span className="font-azonix" style={{ fontSize: 36, color: "#96D068", textShadow: "0 0 20px rgba(132,197,82,0.3)" }}>
                {event.time}
              </span>
              {event.venueLogo && <img src={event.venueLogo} alt={event.venue ?? "Venue"} style={{ height: 50, width: "auto", opacity: 0.9 }} />}
              <span className="font-azonix" style={{ fontSize: 24, color: "#888899" }}>{event.city}</span>
            </div>
            <PriceCTA fee={event.publicEntryFee} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// OPTION E — "Bold clarification"
// Open Duo hero + high-contrast "ENTRADA SIN INSCRIPCIÓN" panel
// ─────────────────────────────────────────────
export function PublicStoryE({ event, variation = DEFAULT_VARIATION }: Props) {
  return (
    <div className="banner-frame relative" style={{ width: 1080, height: 1920, background: "#1c1435" }}>
      <SharedBackground variation={variation} />
      <div className="relative flex flex-col items-center justify-between h-full" style={{ paddingTop: 280, paddingBottom: 280, paddingLeft: 80, paddingRight: 80 }}>
        {/* Top */}
        <div className="flex flex-col items-center" style={{ gap: 16 }}>
          <img src="/logo.png" alt="GamER" style={{ height: 120, width: "auto" }} />
        </div>

        {/* Center: Title + clarification block */}
        <div className="flex flex-col items-center" style={{ gap: 36 }}>
          <h1 className="font-azonix leading-none text-center" style={{ fontSize: 110, color: "#E8E8F0", textShadow: "0 0 40px rgba(132,197,82,0.35)" }}>
            {event.title}
          </h1>

          {/* HIGH-CONTRAST clarification panel */}
          <div
            className="panel-clip"
            style={{
              padding: "28px 60px",
              background: "rgba(132,197,82,0.14)",
              border: "2px solid rgba(132,197,82,0.5)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            }}
          >
            <span className="font-azonix" style={{ fontSize: 36, color: "#96D068", letterSpacing: "0.08em" }}>
              ENTRADA SIN INSCRIPCIÓN
            </span>
            <span style={{ fontSize: 28, color: "#D0D0DC", textAlign: "center" }}>
              Vení a disfrutar el evento<br />sin anotarte al torneo
            </span>
          </div>

          <div className="flex flex-col items-center" style={{ gap: 14 }}>
            <span style={{ fontSize: 34, color: "#E8E8F0", fontWeight: 600 }}>
              · Jugá en <span style={{ color: "#96D068", fontWeight: 800 }}>consolas</span>
            </span>
            <span style={{ fontSize: 34, color: "#E8E8F0", fontWeight: 600 }}>
              · Mirá el <span style={{ color: "#C06DD0", fontWeight: 800 }}>torneo en vivo</span>
            </span>
          </div>

          {event.consoleGames && event.consoleGames.length > 0 && (
            <ConsoleList games={event.consoleGames} />
          )}
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center" style={{ gap: 28 }}>
          <div className="panel-clip relative" style={{ padding: "24px 64px", background: "rgba(132,197,82,0.06)", border: "1px solid rgba(132,197,82,0.2)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div className="hud-bracket-tl" />
            <div className="hud-bracket-br" />
            <span className="font-azonix" style={{ fontSize: 44, color: "#96D068", textShadow: "0 0 20px rgba(132,197,82,0.3)" }}>{event.date.toUpperCase()}</span>
            <span className="font-azonix" style={{ fontSize: 28, color: "#E8E8F0" }}>{event.time}</span>
          </div>
          <div className="flex flex-col items-center" style={{ gap: 10 }}>
            {event.venueLogo && <img src={event.venueLogo} alt={event.venue ?? "Venue"} style={{ height: 56, width: "auto", opacity: 0.9 }} />}
            <span className="font-azonix" style={{ fontSize: 26, color: "#888899" }}>{event.city}</span>
          </div>
          <PriceCTA fee={event.publicEntryFee} />
        </div>
      </div>
    </div>
  );
}

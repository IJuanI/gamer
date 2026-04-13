"use client";

import {
  GamepadIcon,
  GemIcon,
  CrosshairIcon,
  AlienIcon,
  ShieldIcon,
  SwordIcon,
} from "./gaming-icons";

/**
 * Background-only versions of each banner — all decorative layers,
 * no text content. Used for "download background" feature.
 */

/* ── Story 1080×1920 background (used by Story + WhatsApp) ── */
export function StoryBackground({
  variant,
  accent,
}: {
  variant: "story" | "whatsapp";
  accent?: "purple" | "green" | "orange";
}) {
  const isWA = variant === "whatsapp";
  // Primary accent color
  const ac =
    accent === "green"
      ? "rgba(132,197,82,"
      : accent === "orange"
        ? "rgba(255,130,0,"
        : "rgba(179,57,196,";
  // Background accent (for dual-color layouts; defaults to green when no accent specified)
  const bg = accent ? ac : "rgba(132,197,82,";

  return (
    <div
      className="banner-frame relative"
      style={{ width: 1080, height: 1920, background: "#1c1435" }}
    >
      <div className="absolute inset-0 bg-grid-neon-fade" />

      {/* Angular color blocks */}
      <div
        className="absolute"
        style={{
          top: 0,
          left: 0,
          width: "100%",
          height: isWA ? 500 : 480,
          background: `linear-gradient(180deg, ${ac}0.14), transparent)`,
          clipPath: isWA
            ? "polygon(0 0, 100% 0, 100% 65%, 0 100%)"
            : "polygon(0 0, 100% 0, 100% 70%, 0 100%)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: 0,
          left: 0,
          width: "100%",
          height: isWA ? 500 : 480,
          background: `linear-gradient(0deg, ${bg}0.1), transparent)`,
          clipPath: isWA
            ? "polygon(0 35%, 100% 0, 100% 100%, 0 100%)"
            : "polygon(0 30%, 100% 0, 100% 100%, 0 100%)",
        }}
      />

      {/* Trapezoids */}
      <div
        className="absolute"
        style={{
          top: isWA ? 200 : 160,
          right: 0,
          width: 200,
          height: 300,
          background: "rgba(179,57,196,0.1)",
          clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: isWA ? 300 : 160,
          left: 0,
          width: 180,
          height: 280,
          background: "rgba(132,197,82,0.08)",
          clipPath: "polygon(0 0, 100% 0, 70% 100%, 0 100%)",
        }}
      />

      {/* Large circles */}
      <div
        className="absolute"
        style={{
          top: isWA ? 280 : 260,
          right: isWA ? 20 : 30,
          width: isWA ? 320 : 300,
          height: isWA ? 320 : 300,
          borderRadius: "50%",
          border: "2px solid rgba(179,57,196,0.18)",
        }}
      />
      <div
        className="absolute"
        style={{
          top: isWA ? 360 : 330,
          right: 80,
          width: 160,
          height: 160,
          borderRadius: "50%",
          border: "1px solid rgba(179,57,196,0.1)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: isWA ? 340 : 300,
          left: 20,
          width: 340,
          height: 340,
          borderRadius: "50%",
          border: "2px solid rgba(132,197,82,0.16)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: isWA ? 410 : 370,
          left: 80,
          width: 200,
          height: 200,
          borderRadius: "50%",
          border: "1px solid rgba(132,197,82,0.09)",
        }}
      />

      {/* Dots */}
      <div
        className="absolute"
        style={{
          top: isWA ? 580 : 520,
          left: isWA ? 80 : 90,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "rgba(179,57,196,0.35)",
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: isWA ? 580 : 540,
          right: isWA ? 90 : 100,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "rgba(132,197,82,0.3)",
        }}
      />

      {/* Gaming icons */}
      {isWA ? (
        <>
          <GamepadIcon size={130} color="rgba(179,57,196,0.28)" style={{ top: 350, right: 70, transform: "rotate(-10deg)" }} />
          <GemIcon size={90} color="rgba(132,197,82,0.25)" style={{ bottom: 460, left: 80, transform: "rotate(12deg)" }} />
          <AlienIcon size={80} color="rgba(179,57,196,0.22)" style={{ top: 200, left: 140, transform: "rotate(5deg)" }} />
          <ShieldIcon size={90} color="rgba(132,197,82,0.2)" style={{ bottom: 660, right: 50, transform: "rotate(8deg)" }} />
          <SwordIcon size={80} color="rgba(179,57,196,0.2)" style={{ top: 640, left: 40, transform: "rotate(-18deg)" }} />
        </>
      ) : (
        <>
          <GamepadIcon size={120} color="rgba(179,57,196,0.28)" style={{ top: 380, right: 80, transform: "rotate(-15deg)" }} />
          <GemIcon size={85} color="rgba(132,197,82,0.25)" style={{ bottom: 480, left: 100, transform: "rotate(10deg)" }} />
          <CrosshairIcon size={100} color="rgba(132,197,82,0.2)" style={{ bottom: 700, right: 50 }} />
          <ShieldIcon size={90} color="rgba(179,57,196,0.22)" style={{ top: 700, left: 40, transform: "rotate(-8deg)" }} />
          <AlienIcon size={70} color="rgba(179,57,196,0.2)" style={{ top: 180, left: 200, transform: "rotate(5deg)" }} />
        </>
      )}

      {/* HUD bars */}
      <div
        className="absolute"
        style={{
          top: isWA ? 120 : 250,
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
          bottom: isWA ? 200 : 250,
          left: 0,
          right: 0,
          height: 2,
          background:
            "linear-gradient(90deg, rgba(132,197,82,0.4), rgba(132,197,82,0.1) 30%, transparent 50%, rgba(179,57,196,0.1) 70%, rgba(179,57,196,0.5))",
        }}
      />

      {/* Chevrons (story only) */}
      {!isWA && (
        <>
          <div className="absolute" style={{ top: 600, left: 60, width: 60, height: 20, background: "rgba(179,57,196,0.18)", clipPath: "polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%, 20% 50%)" }} />
          <div className="absolute" style={{ top: 630, left: 60, width: 40, height: 14, background: "rgba(132,197,82,0.15)", clipPath: "polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%, 20% 50%)" }} />
          <div className="absolute" style={{ bottom: 600, right: 60, width: 60, height: 20, background: "rgba(132,197,82,0.18)", clipPath: "polygon(20% 0, 100% 0, 80% 50%, 100% 100%, 20% 100%, 0 50%)" }} />
        </>
      )}

      {/* Corner brackets */}
      <div className="absolute" style={{ top: 30, left: 30, width: 70, height: 70, borderTop: "3px solid rgba(179,57,196,0.5)", borderLeft: "3px solid rgba(179,57,196,0.5)" }} />
      <div className="absolute" style={{ top: 30, right: 30, width: 70, height: 70, borderTop: "3px solid rgba(179,57,196,0.5)", borderRight: "3px solid rgba(179,57,196,0.5)" }} />
      <div className="absolute" style={{ bottom: 30, left: 30, width: 70, height: 70, borderBottom: "3px solid rgba(132,197,82,0.5)", borderLeft: "3px solid rgba(132,197,82,0.5)" }} />
      <div className="absolute" style={{ bottom: 30, right: 30, width: 70, height: 70, borderBottom: "3px solid rgba(132,197,82,0.5)", borderRight: "3px solid rgba(132,197,82,0.5)" }} />

      {/* Tick marks */}
      {[0.25, 0.5, 0.75].map((pct) => (
        <div key={`bg-${pct}`}>
          <div className="absolute" style={{ top: `${pct * 100}%`, left: 30, width: 12, height: 2, background: "rgba(179,57,196,0.25)" }} />
          <div className="absolute" style={{ top: `${pct * 100}%`, right: 30, width: 12, height: 2, background: "rgba(179,57,196,0.25)" }} />
        </div>
      ))}
    </div>
  );
}

/* ── Countdown 1080×1920 background ── */
export function CountdownBackground() {
  return (
    <div
      className="banner-frame relative"
      style={{ width: 1080, height: 1920, background: "#1c1435" }}
    >
      <div className="absolute inset-0 bg-grid-neon-fade" />

      <div className="absolute" style={{ top: 0, right: 0, width: "100%", height: 500, background: "linear-gradient(180deg, rgba(179,57,196,0.14), transparent)", clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 65%)" }} />
      <div className="absolute" style={{ bottom: 0, left: 0, width: "100%", height: 500, background: "linear-gradient(0deg, rgba(132,197,82,0.1), transparent)", clipPath: "polygon(0 35%, 100% 0, 100% 100%, 0 100%)" }} />

      <div className="absolute" style={{ top: 300, left: 0, width: 200, height: 300, background: "rgba(179,57,196,0.09)", clipPath: "polygon(0 0, 100% 0, 70% 100%, 0 100%)" }} />
      <div className="absolute" style={{ bottom: 300, right: 0, width: 180, height: 280, background: "rgba(132,197,82,0.07)", clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)" }} />

      {/* Targeting rings */}
      <div className="absolute" style={{ top: "50%", left: "50%", width: 560, height: 560, marginTop: -280, marginLeft: -280, borderRadius: "50%", border: "2px solid rgba(132,197,82,0.12)" }} />
      <div className="absolute" style={{ top: "50%", left: "50%", width: 460, height: 460, marginTop: -230, marginLeft: -230, borderRadius: "50%", border: "1px solid rgba(132,197,82,0.07)" }} />
      <div className="absolute" style={{ top: 260, right: 30, width: 280, height: 280, borderRadius: "50%", border: "2px solid rgba(179,57,196,0.17)" }} />
      <div className="absolute" style={{ bottom: 300, left: 20, width: 260, height: 260, borderRadius: "50%", border: "2px solid rgba(132,197,82,0.15)" }} />

      <div className="absolute" style={{ top: 520, left: 100, width: 14, height: 14, borderRadius: "50%", background: "rgba(179,57,196,0.35)" }} />
      <div className="absolute" style={{ bottom: 530, right: 110, width: 10, height: 10, borderRadius: "50%", background: "rgba(132,197,82,0.3)" }} />

      <GamepadIcon size={110} color="rgba(179,57,196,0.25)" style={{ top: 370, right: 70, transform: "rotate(-15deg)" }} />
      <GemIcon size={80} color="rgba(132,197,82,0.22)" style={{ bottom: 440, left: 70, transform: "rotate(10deg)" }} />
      <CrosshairIcon size={100} color="rgba(132,197,82,0.18)" style={{ top: 300, left: 50 }} />
      <AlienIcon size={75} color="rgba(179,57,196,0.2)" style={{ bottom: 620, right: 50, transform: "rotate(-5deg)" }} />
      <SwordIcon size={80} color="rgba(179,57,196,0.18)" style={{ top: 600, left: 40, transform: "rotate(-20deg)" }} />

      <div className="absolute" style={{ top: 250, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, rgba(179,57,196,0.5), rgba(179,57,196,0.1) 30%, transparent 50%, rgba(132,197,82,0.1) 70%, rgba(132,197,82,0.4))" }} />
      <div className="absolute" style={{ bottom: 250, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, rgba(132,197,82,0.4), rgba(132,197,82,0.1) 30%, transparent 50%, rgba(179,57,196,0.1) 70%, rgba(179,57,196,0.5))" }} />

      <div className="absolute" style={{ top: 650, right: 60, width: 60, height: 20, background: "rgba(179,57,196,0.18)", clipPath: "polygon(20% 0, 100% 0, 80% 50%, 100% 100%, 20% 100%, 0 50%)" }} />
      <div className="absolute" style={{ bottom: 650, left: 60, width: 60, height: 20, background: "rgba(132,197,82,0.18)", clipPath: "polygon(0 0, 80% 0, 100% 50%, 80% 100%, 0 100%, 20% 50%)" }} />

      <div className="absolute" style={{ top: 30, left: 30, width: 70, height: 70, borderTop: "3px solid rgba(179,57,196,0.5)", borderLeft: "3px solid rgba(179,57,196,0.5)" }} />
      <div className="absolute" style={{ top: 30, right: 30, width: 70, height: 70, borderTop: "3px solid rgba(179,57,196,0.5)", borderRight: "3px solid rgba(179,57,196,0.5)" }} />
      <div className="absolute" style={{ bottom: 30, left: 30, width: 70, height: 70, borderBottom: "3px solid rgba(132,197,82,0.5)", borderLeft: "3px solid rgba(132,197,82,0.5)" }} />
      <div className="absolute" style={{ bottom: 30, right: 30, width: 70, height: 70, borderBottom: "3px solid rgba(132,197,82,0.5)", borderRight: "3px solid rgba(132,197,82,0.5)" }} />

      {[0.25, 0.5, 0.75].map((pct) => (
        <div key={`cb-${pct}`}>
          <div className="absolute" style={{ top: `${pct * 100}%`, left: 30, width: 12, height: 2, background: "rgba(179,57,196,0.25)" }} />
          <div className="absolute" style={{ top: `${pct * 100}%`, right: 30, width: 12, height: 2, background: "rgba(179,57,196,0.25)" }} />
        </div>
      ))}
    </div>
  );
}

/* ── Feed 1080×1350 background ── */
export function FeedBackground({ accent }: { accent?: "purple" | "green" | "orange" | "mixed" }) {
  const a = accent ?? "mixed";
  const isPurple = a === "purple";
  const isGreen = a === "green";
  const isOrange = a === "orange";
  const ac = isPurple ? "rgba(179,57,196," : isGreen ? "rgba(132,197,82," : isOrange ? "rgba(255,130,0," : null;

  return (
    <div
      className="banner-frame relative"
      style={{ width: 1080, height: 1350, background: "#1c1435" }}
    >
      <div className="absolute inset-0 bg-grid-neon-fade" />

      <div className="absolute" style={{ top: 0, left: 0, width: "100%", height: 380, background: `linear-gradient(180deg, ${ac ? `${ac}0.14)` : "rgba(179,57,196,0.14)"}, transparent)`, clipPath: "polygon(0 0, 100% 0, 100% 65%, 0 100%)" }} />
      <div className="absolute" style={{ bottom: 0, left: 0, width: "100%", height: 380, background: `linear-gradient(0deg, ${ac ? `${ac}0.1)` : "rgba(132,197,82,0.1)"}, transparent)`, clipPath: "polygon(0 35%, 100% 0, 100% 100%, 0 100%)" }} />

      <div className="absolute" style={{ top: 100, right: 0, width: 160, height: 240, background: ac ? `${ac}0.1)` : "rgba(179,57,196,0.1)", clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)" }} />

      <div className="absolute" style={{ top: 180, right: 20, width: 280, height: 280, borderRadius: "50%", border: `2px solid ${ac ? `${ac}0.18)` : "rgba(179,57,196,0.17)"}` }} />
      <div className="absolute" style={{ top: 240, right: 70, width: 160, height: 160, borderRadius: "50%", border: `1px solid ${ac ? `${ac}0.1)` : "rgba(179,57,196,0.1)"}` }} />
      <div className="absolute" style={{ bottom: 220, left: 10, width: 300, height: 300, borderRadius: "50%", border: `2px solid ${ac ? `${ac}0.15)` : "rgba(132,197,82,0.15)"}` }} />
      <div className="absolute" style={{ bottom: 270, left: 60, width: 200, height: 200, borderRadius: "50%", border: `1px solid ${ac ? `${ac}0.09)` : "rgba(132,197,82,0.09)"}` }} />

      <div className="absolute" style={{ top: 450, left: 70, width: 14, height: 14, borderRadius: "50%", background: ac ? `${ac}0.35)` : "rgba(179,57,196,0.35)" }} />
      <div className="absolute" style={{ bottom: 440, right: 80, width: 10, height: 10, borderRadius: "50%", background: ac ? `${ac}0.3)` : "rgba(132,197,82,0.3)" }} />

      {isPurple ? (
        <>
          <ShieldIcon size={100} color={`${ac}0.22)`} style={{ top: 300, right: 50, transform: "rotate(10deg)" }} />
          <SwordIcon size={90} color={`${ac}0.2)`} style={{ bottom: 260, left: 30, transform: "rotate(-15deg)" }} />
          <GemIcon size={70} color={`${ac}0.18)`} style={{ top: 480, left: 90, transform: "rotate(8deg)" }} />
        </>
      ) : isGreen ? (
        <>
          <CrosshairIcon size={110} color={`${ac}0.22)`} style={{ bottom: 300, right: 40 }} />
          <GamepadIcon size={100} color={`${ac}0.2)`} style={{ top: 260, left: 30, transform: "rotate(-12deg)" }} />
          <GemIcon size={70} color={`${ac}0.18)`} style={{ bottom: 460, left: 110, transform: "rotate(10deg)" }} />
        </>
      ) : isOrange ? (
        <>
          <GamepadIcon size={100} color={`${ac}0.22)`} style={{ top: 300, right: 50, transform: "rotate(-10deg)" }} />
          <SwordIcon size={90} color={`${ac}0.2)`} style={{ bottom: 260, left: 30, transform: "rotate(12deg)" }} />
          <GemIcon size={70} color={`${ac}0.18)`} style={{ top: 480, left: 100, transform: "rotate(-8deg)" }} />
        </>
      ) : (
        <>
          <GamepadIcon size={100} color="rgba(179,57,196,0.25)" style={{ top: 300, right: 70, transform: "rotate(-12deg)" }} />
          <GemIcon size={70} color="rgba(132,197,82,0.22)" style={{ bottom: 360, left: 80, transform: "rotate(8deg)" }} />
          <CrosshairIcon size={90} color="rgba(132,197,82,0.18)" style={{ bottom: 520, right: 40 }} />
          <ShieldIcon size={70} color="rgba(179,57,196,0.2)" style={{ top: 480, left: 30, transform: "rotate(-8deg)" }} />
        </>
      )}

      <div className="absolute" style={{ top: 200, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${ac ? `${ac}0.5)` : "rgba(179,57,196,0.5)"}, transparent 30%, transparent 70%, ${ac ? `${ac}0.4)` : "rgba(132,197,82,0.4)"})` }} />

      <div className="absolute" style={{ top: 20, left: 20, width: 50, height: 50, borderTop: `3px solid ${ac ? `${ac}0.5)` : "rgba(179,57,196,0.5)"}`, borderLeft: `3px solid ${ac ? `${ac}0.5)` : "rgba(179,57,196,0.5)"}` }} />
      <div className="absolute" style={{ top: 20, right: 20, width: 50, height: 50, borderTop: `3px solid ${ac ? `${ac}0.5)` : "rgba(179,57,196,0.5)"}`, borderRight: `3px solid ${ac ? `${ac}0.5)` : "rgba(179,57,196,0.5)"}` }} />
      <div className="absolute" style={{ bottom: 20, left: 20, width: 50, height: 50, borderBottom: `3px solid ${ac ? `${ac}0.5)` : "rgba(132,197,82,0.5)"}`, borderLeft: `3px solid ${ac ? `${ac}0.5)` : "rgba(132,197,82,0.5)"}` }} />
      <div className="absolute" style={{ bottom: 20, right: 20, width: 50, height: 50, borderBottom: `3px solid ${ac ? `${ac}0.5)` : "rgba(132,197,82,0.5)"}`, borderRight: `3px solid ${ac ? `${ac}0.5)` : "rgba(132,197,82,0.5)"}` }} />
    </div>
  );
}

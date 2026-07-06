"use client";

export type CredentialAccent = "purple" | "green" | "orange" | "pink";

export interface StaffCredentialProps {
  /** Person's name. Empty → a blank write-on line to fill by hand. */
  name: string;
  /** Event name shown under the logo */
  eventTitle: string;
  /** Accent color */
  accent?: CredentialAccent;
}

const ACCENT: Record<CredentialAccent, { solid: string; deep: string; soft: string }> = {
  purple: { solid: "#B339C4", deep: "#7B2A8E", soft: "rgba(179,57,196,0.16)" },
  green:  { solid: "#84C552", deep: "#4F8B26", soft: "rgba(132,197,82,0.18)" },
  orange: { solid: "#FF8200", deep: "#B85E00", soft: "rgba(255,130,0,0.16)" },
  pink:   { solid: "#E94B8B", deep: "#B22A66", soft: "rgba(233,75,139,0.16)" },
};

const W = 1240;
const H = 874;

/**
 * A7 horizontal (105×74mm @300dpi = 1240×874px) event credential.
 *
 * The card is about the person's NAME. The role/title is intentionally absent —
 * print a batch and hand-write each name on the blank line (leave name empty),
 * or pass a name to print it directly. A punch slot is drawn at the top center
 * as a lanyard cut guide.
 */
export function StaffCredential({
  name,
  eventTitle,
  accent = "purple",
}: StaffCredentialProps) {
  const a = ACCENT[accent];

  // Auto-fit a typed name so long names never overflow (AZONIX ~0.82×fontSize/char).
  const usable = W - 220;
  const maxByWidth = usable / (Math.max(name.length, 1) * 0.82);
  const nameSize = Math.min(150, Math.floor(maxByWidth));

  return (
    <div
      className="banner-frame"
      style={{
        position: "relative",
        width: W,
        height: H,
        background: "#fffaf5",
        overflow: "hidden",
        color: "#0a0a12",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Soft brand-tinted gradient blobs */}
      <div
        style={{
          position: "absolute",
          top: -360, left: -300, width: 900, height: 900, borderRadius: "50%",
          background: `radial-gradient(circle, ${a.soft} 0%, transparent 62%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -420, right: -340, width: 1000, height: 1000, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(132,197,82,0.14) 0%, transparent 62%)`,
          pointerEvents: "none",
        }}
      />

      {/* Accent side band */}
      <div
        style={{
          position: "absolute",
          top: 0, bottom: 0, left: 0, width: 36,
          background: a.solid,
          pointerEvents: "none",
        }}
      />

      {/* Diagonal stripe accent, bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: 0, right: 0, width: 520, height: 150,
          background: `repeating-linear-gradient(-45deg, transparent, transparent 20px, ${a.solid} 20px, ${a.solid} 26px)`,
          opacity: 0.16,
          pointerEvents: "none",
        }}
      />

      {/* Lanyard punch slot (cut guide) */}
      <div
        style={{
          position: "absolute",
          top: 44,
          left: "50%",
          transform: "translateX(-50%)",
          width: 180,
          height: 40,
          borderRadius: 20,
          border: "3px dashed #b8b2aa",
          background: "rgba(255,255,255,0.6)",
          pointerEvents: "none",
        }}
      />

      {/* Top: brand mark (larger) */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 90,
          display: "flex",
          alignItems: "center",
          gap: 30,
        }}
      >
        <img src="/logo.png" alt="GamER" style={{ height: 132, width: "auto" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            className="font-azonix"
            style={{ fontSize: 38, letterSpacing: "0.2em", color: "#7a7a86", textTransform: "uppercase" }}
          >
            ENTRE RÍOS GAMERS
          </div>
          <div style={{ fontSize: 44, fontWeight: 700, color: a.deep, lineHeight: 1 }}>
            {eventTitle}
          </div>
        </div>
      </div>

      {/* Center: name (the hero) */}
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 70,
          bottom: 150,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {name ? (
          <div
            className="font-azonix"
            style={{
              fontSize: nameSize,
              letterSpacing: "0.02em",
              color: "#0a0a12",
              lineHeight: 0.95,
              textTransform: "uppercase",
              textShadow: `0 0 24px ${a.soft}`,
            }}
          >
            {name}
          </div>
        ) : (
          // Blank write-on line — print a batch and hand-write each name.
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              className="font-azonix"
              style={{ fontSize: 30, letterSpacing: "0.24em", color: "#9a9aa6", textTransform: "uppercase" }}
            >
              Nombre
            </div>
            <div style={{ height: 96, borderBottom: `5px solid ${a.deep}`, opacity: 0.55 }} />
          </div>
        )}
      </div>

      {/* Bottom accent rule */}
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 70,
          bottom: 100,
          height: 8,
          background: a.solid,
          borderRadius: 4,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

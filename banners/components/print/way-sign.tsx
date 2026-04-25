"use client";

export type ArrowDir = "none" | "left" | "right" | "up" | "down";

export interface WaySignProps {
  /** Main label, AZONIX, very large */
  title: string;
  /** Optional smaller line under the arrow / title */
  subtitle?: string;
  /** Arrow placed below the title; "none" omits it */
  arrow?: ArrowDir;
  /** Show the GamER logo in the top-left corner */
  showLogo?: boolean;
  /** Accent color for HUD brackets and arrow */
  accent?: "purple" | "green";
}

const ACCENT = {
  purple: { solid: "#B339C4", deep: "#7B2A8E", soft: "rgba(179,57,196,0.20)" },
  green:  { solid: "#84C552", deep: "#4F8B26", soft: "rgba(132,197,82,0.22)" },
};

const W = 3508;
const H = 2480;
const SIDE_PADDING = 220;
const USABLE = W - SIDE_PADDING * 2;

/**
 * A4 horizontal (297×210mm @300dpi = 3508×2480px) directional sign.
 * Light, print-friendly background with bold brand-color HUD brackets and a
 * chunky arrow placed BELOW the title so the layout works for both
 * "BAÑOS →" and "ENTRADA". Title font auto-shrinks to fit the canvas width.
 */
export function WaySign({
  title,
  subtitle,
  arrow = "none",
  showLogo = true,
  accent = "purple",
}: WaySignProps) {
  const a = ACCENT[accent];
  const hasArrow = arrow !== "none";

  // ─ Auto-fit the title font so even long words like "ENTRADA" never overflow.
  // AZONIX is wide (~0.78 × fontSize per char including letter-spacing).
  const baseSize = hasArrow ? 720 : 880;
  const charW = 0.78;
  const maxByWidth = USABLE / (Math.max(title.length, 1) * charW);
  const titleSize = Math.min(baseSize, Math.floor(maxByWidth));

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
      {/* Soft brand-tinted gradient blobs (large, no fine grids) */}
      <div
        style={{
          position: "absolute",
          top: -700, left: -700, width: 2000, height: 2000, borderRadius: "50%",
          background: `radial-gradient(circle, ${a.soft} 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -800, right: -700, width: 2200, height: 2200, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(132,197,82,0.16) 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />

      {/* Diagonal stripe band, top-right corner */}
      <div
        style={{
          position: "absolute",
          top: 0, right: 0, width: 900, height: 220,
          background: `repeating-linear-gradient(-45deg, transparent, transparent 28px, ${a.solid} 28px, ${a.solid} 36px)`,
          opacity: 0.18,
          pointerEvents: "none",
        }}
      />

      {/* HUD brackets — chunky borders, brand colors */}
      <HudBracket pos="tl" color={a.solid} />
      <HudBracket pos="tr" color={a.solid} />
      <HudBracket pos="bl" color="#84C552" />
      <HudBracket pos="br" color="#84C552" />

      {/* ── Top-left brand mark ── */}
      {showLogo && (
        <div
          style={{
            position: "absolute",
            top: 200,
            left: 240,
            display: "flex",
            alignItems: "center",
            gap: 32,
          }}
        >
          <img src="/logo.png" alt="GamER" style={{ height: 160, width: "auto" }} />
          <div
            className="font-azonix"
            style={{
              fontSize: 50,
              letterSpacing: "0.4em",
              color: "#7a7a86",
              textTransform: "uppercase",
            }}
          >
            ENTRE RÍOS GAMERS
          </div>
        </div>
      )}

      {/* ── Center: title stacked over arrow ── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: `260px ${SIDE_PADDING}px`,
          gap: 70,
        }}
      >
        <div
          className="font-azonix"
          style={{
            fontSize: titleSize,
            letterSpacing: "0.04em",
            color: "#0a0a12",
            lineHeight: 0.95,
            textTransform: "uppercase",
            textAlign: "center",
            textShadow: `0 0 30px ${a.soft}`,
          }}
        >
          {title}
        </div>

        {hasArrow && <Arrow dir={arrow} color={a.solid} />}

        {subtitle && (
          <div
            className="font-azonix"
            style={{
              fontSize: 150,
              letterSpacing: "0.18em",
              color: a.deep,
              lineHeight: 1,
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

function HudBracket({ pos, color }: { pos: "tl" | "tr" | "bl" | "br"; color: string }) {
  const size = 320;
  const thick = 18;
  const inset = 110;
  const styles: React.CSSProperties = { position: "absolute", width: size, height: size, pointerEvents: "none" };
  if (pos === "tl") { styles.top = inset; styles.left = inset; styles.borderTop = `${thick}px solid ${color}`; styles.borderLeft = `${thick}px solid ${color}`; }
  else if (pos === "tr") { styles.top = inset; styles.right = inset; styles.borderTop = `${thick}px solid ${color}`; styles.borderRight = `${thick}px solid ${color}`; }
  else if (pos === "bl") { styles.bottom = inset; styles.left = inset; styles.borderBottom = `${thick}px solid ${color}`; styles.borderLeft = `${thick}px solid ${color}`; }
  else { styles.bottom = inset; styles.right = inset; styles.borderBottom = `${thick}px solid ${color}`; styles.borderRight = `${thick}px solid ${color}`; }
  return <div style={styles} />;
}

function Arrow({ dir, color }: { dir: Exclude<ArrowDir, "none">; color: string }) {
  const size = 900;
  const rotation = { right: 0, down: 90, left: 180, up: 270 }[dir];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ flexShrink: 0 }}
    >
      <g transform={`rotate(${rotation} 50 50)`}>
        <path
          d="M 4 38 H 68 V 16 L 96 50 L 68 84 V 62 H 4 Z"
          fill={color}
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

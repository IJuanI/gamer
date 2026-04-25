"use client";

import { QrCode } from "./qr-code";

export interface QrSignProps {
  /**
   * Prominent line under the GamER logo — e.g. the platform handle
   * "@gaming_eerr" or the wifi network "GamER". This is the visible
   * focus of the sign.
   */
  handle: string;
  /** Short tagline / instruction. Keep concise so it fits in one line. */
  subtitle: string;
  /** What the QR encodes. */
  value: string;
  /**
   * Brand icon overlaid on the QR center (Instagram / Discord / Wifi).
   * Required — communicates which platform the QR connects to.
   */
  centerIcon: React.ReactNode;
  /** Accent color for the handle and the gradient blobs. */
  accent?: "purple" | "green" | "pink";
}

const ACCENT = {
  purple: { glow: "#B339C4", soft: "rgba(179,57,196,0.18)", text: "#7B2A8E" },
  green:  { glow: "#84C552", soft: "rgba(132,197,82,0.20)", text: "#4F8B26" },
  pink:   { glow: "#E94B8B", soft: "rgba(233,75,139,0.18)", text: "#B22A66" },
};

/**
 * A6 vertical (105×148mm @300dpi = 1240×1748px) friendly QR poster.
 *
 * The platform identity comes from the icon embedded in the QR center —
 * not from a giant title. The brand focus is the GamER logo + handle pair
 * at the top.
 *
 * Edge-to-edge QR (~1080px ≈ 91mm) scans reliably from up to ~9m away.
 */
export function QrSign({
  handle,
  subtitle,
  value,
  centerIcon,
  accent = "purple",
}: QrSignProps) {
  const a = ACCENT[accent];
  const W = 1240;
  const H = 1748;
  const QR_SIZE = 1080;

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
      {/* Corner gradient blobs — soft, organic, no fine grids */}
      <div
        style={{
          position: "absolute",
          top: -260, left: -260, width: 720, height: 720, borderRadius: "50%",
          background: `radial-gradient(circle, ${a.soft} 0%, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -300, right: -260, width: 780, height: 780, borderRadius: "50%",
          background: `radial-gradient(circle, rgba(132,197,82,0.16) 0%, transparent 65%)`,
        }}
      />

      <div
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "70px 60px 50px",
        }}
      >
        {/* ── Top: GamER brand mark (the visible focus) ── */}
        <img src="/logo.png" alt="GamER" style={{ height: 130, width: "auto" }} />

        {/* ── Handle (account / network name) ── */}
        <div
          className="font-azonix"
          style={{
            marginTop: 26,
            fontSize: 92,
            letterSpacing: "0.04em",
            color: a.text,
            lineHeight: 1,
            textAlign: "center",
          }}
        >
          {handle}
        </div>

        {/* ── Short subtitle ── */}
        <div
          style={{
            marginTop: 18,
            fontSize: 38,
            color: "#3a3a44",
            textAlign: "center",
            lineHeight: 1.25,
            fontWeight: 500,
            marginBottom: 36,
          }}
        >
          {subtitle}
        </div>

        {/* ── QR card with center icon ── */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: 40,
            padding: 20,
            boxShadow: "0 30px 60px rgba(10,10,18,0.10)",
            border: `4px solid ${a.soft}`,
          }}
        >
          <QrCode
            value={value}
            size={QR_SIZE}
            ec="H"
            cornerRadius={0.18}
            centerLogo={centerIcon}
            centerLogoSize={Math.round(QR_SIZE * 0.20)}
          />
        </div>

        {/* ── Bottom mark ── */}
        <div
          className="font-azonix"
          style={{
            marginTop: "auto",
            fontSize: 26,
            letterSpacing: "0.4em",
            color: "#7a7a86",
          }}
        >
          ENTRE RÍOS GAMERS
        </div>
      </div>
    </div>
  );
}

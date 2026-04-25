"use client";

import qrcode from "qrcode-generator";

export interface QrCodeProps {
  value: string;
  size: number;
  fg?: string;
  bg?: string;
  /** error correction level — higher allows more design tolerance */
  ec?: "L" | "M" | "Q" | "H";
  /** quiet zone in modules (default 4 — required by spec for reliable scans) */
  margin?: number;
  /** module corner radius as fraction of cell size (0 = sharp, 0.5 = circle) */
  cornerRadius?: number;
  /** Optional brand icon overlaid on the QR center. Use ec="H" for safety. */
  centerLogo?: React.ReactNode;
  /** Diameter of the center logo container in px (default ~18% of size). */
  centerLogoSize?: number;
}

/**
 * Renders a QR code as inline SVG. Modules are rendered as touching rounded
 * squares (not separated dots) so the result remains reliably scannable when
 * printed, while still feeling softer than a stock black-and-white grid.
 *
 * Wifi auto-connect strings: format as `WIFI:T:WPA;S:<ssid>;P:<password>;;`
 * with backslash-escaped `\\ : ; , "` inside ssid/password.
 */
export function QrCode({
  value,
  size,
  fg = "#0a0a12",
  bg = "#ffffff",
  ec = "H",
  margin = 4,
  cornerRadius = 0.2,
  centerLogo,
  centerLogoSize,
}: QrCodeProps) {
  const qr = qrcode(0, ec);
  qr.addData(value);
  qr.make();
  const count = qr.getModuleCount();
  const total = count + margin * 2;
  const cell = size / total;
  const offset = margin * cell;
  const rx = cell * cornerRadius;
  const logoBox = centerLogoSize ?? Math.round(size * 0.20);

  const cells: React.ReactElement[] = [];
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (!qr.isDark(r, c)) continue;
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={offset + c * cell}
          y={offset + r * cell}
          width={cell}
          height={cell}
          rx={rx}
          ry={rx}
        />,
      );
    }
  }

  const svg = (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      <rect width={size} height={size} fill={bg} />
      <g fill={fg}>{cells}</g>
    </svg>
  );

  if (!centerLogo) return svg;

  // Wrap in a relatively-positioned div so the logo overlays the QR center.
  // With H error correction (~30% redundancy) the QR remains scannable as
  // long as the logo covers no more than ~22% of the area.
  return (
    <div style={{ position: "relative", width: size, height: size, lineHeight: 0 }}>
      {svg}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: logoBox,
          height: logoBox,
          background: bg,
          borderRadius: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 14,
          boxSizing: "border-box",
        }}
      >
        {centerLogo}
      </div>
    </div>
  );
}

/** Build a wifi auto-connect QR payload. Auth defaults to WPA. */
export function buildWifiPayload(
  ssid: string,
  password: string,
  auth: "WPA" | "WEP" | "nopass" = "WPA",
  hidden = false,
): string {
  const esc = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");
  const parts = [`T:${auth}`, `S:${esc(ssid)}`];
  if (auth !== "nopass") parts.push(`P:${esc(password)}`);
  if (hidden) parts.push("H:true");
  return `WIFI:${parts.join(";")};;`;
}

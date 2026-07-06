"use client";

export interface CenteredTextProps {
  title: string;
  subtitle?: string;
  lines: string[];
  showLogo?: boolean;
  accent?: "purple" | "green";
}

export function CenteredText({
  title,
  subtitle,
  lines,
  showLogo = true,
  accent = "purple",
}: CenteredTextProps) {
  const W = 3508;
  const H = 2480;
  const accentColor = accent === "purple" ? "#B339C4" : "#84C552";
  const accentGlow = accent === "purple" ? "rgba(179,57,196,0.30)" : "rgba(132,197,82,0.18)";

  return (
    <div
      className="banner-frame"
      style={{
        position: "relative",
        width: W,
        height: H,
        background: "#0a0a12",
        overflow: "hidden",
        color: "#ffffff",
        fontFamily: "Inter, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Radial glows */}
      <div
        style={{
          position: "absolute",
          top: -700,
          left: -700,
          width: 2200,
          height: 2200,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accentGlow} 0%, transparent 60%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -800,
          right: -800,
          width: 2400,
          height: 2400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(132,197,82,0.18) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* Logo — top left if shown */}
      {showLogo && (
        <img
          src="/logo.png"
          alt="GamER"
          style={{
            position: "absolute",
            top: 80,
            left: 100,
            height: 120,
            width: "auto",
          }}
        />
      )}

      {/* HUD corners */}
      <HudBracket pos="tl" color={accentColor} />
      <HudBracket pos="tr" color={accentColor} />
      <HudBracket pos="bl" color={accentColor} />
      <HudBracket pos="br" color={accentColor} />

      {/* Center content */}
      <div
        style={{
          position: "relative",
          textAlign: "center",
          maxWidth: "90%",
          display: "flex",
          flexDirection: "column",
          gap: 40,
          alignItems: "center",
        }}
      >
        {/* Title */}
        <div
          className="font-azonix"
          style={{
            fontSize: 200,
            letterSpacing: "0.06em",
            lineHeight: 1,
            color: "#ffffff",
            textTransform: "uppercase",
            textShadow: `0 0 40px ${accentGlow}`,
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div
            className="font-azonix"
            style={{
              fontSize: 100,
              letterSpacing: "0.08em",
              color: accentColor,
              textTransform: "uppercase",
            }}
          >
            {subtitle}
          </div>
        )}

        {/* Lines */}
        {lines.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              fontSize: 80,
              color: "#e0e0ea",
              lineHeight: 1.3,
              fontWeight: 500,
            }}
          >
            {lines.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom text */}
      <div
        className="font-azonix"
        style={{
          position: "absolute",
          bottom: 50,
          fontSize: 32,
          letterSpacing: "0.5em",
          color: "#5a5a66",
        }}
      >
        ENTRE RÍOS GAMERS
      </div>
    </div>
  );
}

function HudBracket({
  pos,
  color,
}: {
  pos: "tl" | "tr" | "bl" | "br";
  color: string;
}) {
  const size = 280;
  const thick = 16;
  const inset = 100;
  const styles: React.CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    pointerEvents: "none",
  };
  if (pos === "tl") {
    styles.top = inset;
    styles.left = inset;
    styles.borderTop = `${thick}px solid ${color}`;
    styles.borderLeft = `${thick}px solid ${color}`;
  } else if (pos === "tr") {
    styles.top = inset;
    styles.right = inset;
    styles.borderTop = `${thick}px solid ${color}`;
    styles.borderRight = `${thick}px solid ${color}`;
  } else if (pos === "bl") {
    styles.bottom = inset;
    styles.left = inset;
    styles.borderBottom = `${thick}px solid ${color}`;
    styles.borderLeft = `${thick}px solid ${color}`;
  } else {
    styles.bottom = inset;
    styles.right = inset;
    styles.borderBottom = `${thick}px solid ${color}`;
    styles.borderRight = `${thick}px solid ${color}`;
  }
  return <div style={styles} />;
}

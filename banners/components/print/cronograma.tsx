"use client";

export interface ScheduleItem {
  /** Time label, e.g. "15:00" or "18:30" */
  time: string;
  /** Activity label, e.g. "Inicio", "Torneo LoL" */
  label: string;
  /** Optional accent override per item */
  accent?: "purple" | "green" | "orange";
}

export interface CronogramaProps {
  eventTitle: string;
  /** e.g. "Sábado 25 de Abril" */
  date: string;
  /** e.g. "MiradorTec — Paraná" */
  venue?: string;
  items: ScheduleItem[];
}

const ACCENT = {
  purple: { solid: "#B339C4", deep: "#9E46AE", soft: "rgba(179,57,196,0.30)", text: "#E1A8E8" },
  green:  { solid: "#84C552", deep: "#6BA440", soft: "rgba(132,197,82,0.30)", text: "#C5E89E" },
  orange: { solid: "#FF8200", deep: "#CC6800", soft: "rgba(255,130,0,0.30)",  text: "#FFB766" },
};

/**
 * A4 vertical (210×297mm @300dpi = 2480×3508px) event schedule.
 * Dark gaming aesthetic: HUD brackets, radial glows, AZONIX title with neon
 * shadow, time pills with chunky brand-color borders and inner glow.
 */
export function Cronograma({ eventTitle, date, venue, items }: CronogramaProps) {
  const W = 2480;
  const H = 3508;

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
      }}
    >
      {/* Big radial glows */}
      <div
        style={{
          position: "absolute",
          top: -700,
          left: -600,
          width: 1900,
          height: 1900,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(179,57,196,0.28) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -800,
          right: -600,
          width: 2100,
          height: 2100,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(132,197,82,0.22) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* Top diagonal stripe band */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 1100,
          height: 260,
          background: `repeating-linear-gradient(-45deg, transparent, transparent 26px, #B339C4 26px, #B339C4 34px)`,
          opacity: 0.18,
          pointerEvents: "none",
        }}
      />

      {/* HUD brackets */}
      <HudBracket pos="tl" color="#B339C4" />
      <HudBracket pos="tr" color="#B339C4" />
      <HudBracket pos="bl" color="#84C552" />
      <HudBracket pos="br" color="#84C552" />

      <div
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "260px 200px 220px",
        }}
      >
        {/* ── Header ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36, marginBottom: 110 }}>
          <img src="/logo.png" alt="GamER" style={{ height: 170, width: "auto" }} />
          <div
            className="font-azonix"
            style={{
              fontSize: 72,
              letterSpacing: "0.5em",
              color: "#7a7a86",
              textTransform: "uppercase",
            }}
          >
            CRONOGRAMA
          </div>
          <div
            className="font-azonix"
            style={{
              fontSize: 280,
              letterSpacing: "0.04em",
              color: "#ffffff",
              lineHeight: 1,
              textAlign: "center",
              textShadow: "0 0 30px rgba(179,57,196,0.5), 0 0 80px rgba(179,57,196,0.25)",
            }}
          >
            {eventTitle}
          </div>
          <div style={{ fontSize: 60, color: "#c8c8d2", textAlign: "center", marginTop: 10 }}>
            {date}
            {venue && <span style={{ color: "#7a7a86" }}>{`  ·  ${venue}`}</span>}
          </div>
          {/* Decorative neon line */}
          <div
            style={{
              marginTop: 30,
              width: 720,
              height: 5,
              background: "linear-gradient(90deg, transparent, rgba(179,57,196,0.4) 15%, #B339C4 50%, rgba(179,57,196,0.4) 85%, transparent)",
            }}
          />
        </div>

        {/* ── Timeline ── */}
        <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", gap: 70 }}>
          {items.map((it, i) => {
            const a = ACCENT[it.accent ?? "purple"];
            return (
              <div key={i} style={{ position: "relative", display: "flex", alignItems: "center", gap: 60 }}>
                {/* Time pill — clipped panel with glow */}
                <div
                  className="font-azonix panel-clip"
                  style={{
                    flexShrink: 0,
                    width: 720,
                    background: `linear-gradient(135deg, ${a.soft}, rgba(10,10,18,0.4))`,
                    border: `6px solid ${a.solid}`,
                    padding: "60px 0",
                    fontSize: 180,
                    color: "#ffffff",
                    textAlign: "center",
                    letterSpacing: "0.04em",
                    boxShadow: `0 0 30px ${a.soft}, 0 0 70px ${a.soft}`,
                    textShadow: `0 0 20px ${a.solid}`,
                  }}
                >
                  {it.time}
                </div>
                {/* Connector with glow */}
                <div
                  style={{
                    flexShrink: 0,
                    width: 140,
                    height: 14,
                    background: a.solid,
                    boxShadow: `0 0 14px ${a.solid}, 0 0 30px ${a.soft}`,
                  }}
                />
                {/* Label */}
                <div
                  style={{
                    fontSize: 140,
                    fontWeight: 700,
                    color: "#ffffff",
                    letterSpacing: "-0.01em",
                    flex: 1,
                  }}
                >
                  {it.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div
          className="font-azonix"
          style={{
            marginTop: 100,
            textAlign: "center",
            fontSize: 48,
            letterSpacing: "0.5em",
            color: "#5a5a66",
          }}
        >
          ENTRE RÍOS GAMERS
        </div>
      </div>
    </div>
  );
}

function HudBracket({ pos, color }: { pos: "tl" | "tr" | "bl" | "br"; color: string }) {
  const size = 240;
  const thick = 14;
  const inset = 100;
  const styles: React.CSSProperties = { position: "absolute", width: size, height: size, pointerEvents: "none" };
  if (pos === "tl") {
    styles.top = inset; styles.left = inset;
    styles.borderTop = `${thick}px solid ${color}`;
    styles.borderLeft = `${thick}px solid ${color}`;
  } else if (pos === "tr") {
    styles.top = inset; styles.right = inset;
    styles.borderTop = `${thick}px solid ${color}`;
    styles.borderRight = `${thick}px solid ${color}`;
  } else if (pos === "bl") {
    styles.bottom = inset; styles.left = inset;
    styles.borderBottom = `${thick}px solid ${color}`;
    styles.borderLeft = `${thick}px solid ${color}`;
  } else {
    styles.bottom = inset; styles.right = inset;
    styles.borderBottom = `${thick}px solid ${color}`;
    styles.borderRight = `${thick}px solid ${color}`;
  }
  return <div style={styles} />;
}

"use client";

import { useState } from "react";
import {
  GamepadIcon,
  GemIcon,
  CrosshairIcon,
  ShieldIcon,
} from "@/components/banners/gaming-icons";

const CANDIDATES = [
  { hex: "#0f0f1a", label: "Current dark", note: "Original — deep space dark" },
  { hex: "#151528", label: "Current pick", note: "Purple-saturated dark" },
  { hex: "#14142a", label: "Deep indigo", note: "Slightly richer purple base" },
  { hex: "#181832", label: "Vivid indigo", note: "More visible purple tint" },
  { hex: "#1a1530", label: "Warm purple", note: "Purple-leaning, warmer" },
  { hex: "#121228", label: "Cool midnight", note: "Between cave and indigo" },
  { hex: "#1c1435", label: "Rich plum", note: "Strong purple presence" },
  { hex: "#161622", label: "Neutral dark", note: "Balanced, less colored" },
  { hex: "#181828", label: "Soft indigo", note: "Light enough, not grey" },
  { hex: "#1e1a36", label: "Bold violet", note: "Most saturated option" },
];

/**
 * Renders a full 1080×1350 banner at that exact bg color,
 * then scales it down via CSS transform for preview.
 * This ensures transparency stacking matches the real banners.
 */
function BannerSample({ bg, expanded }: { bg: string; expanded: boolean }) {
  const scale = expanded ? 0.5 : 0.38;
  const w = 1080;
  const h = 1350;

  return (
    <div
      style={{
        width: w * scale,
        height: h * scale,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          width: w,
          height: h,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "relative",
          background: bg,
          overflow: "hidden",
        }}
      >
        {/* Grid overlay — same as real banners */}
        <div className="absolute inset-0 bg-grid-neon-fade" />

        {/* Angular color blocks — same as feed banner */}
        <div
          className="absolute"
          style={{
            top: 0,
            left: 0,
            width: "100%",
            height: 380,
            background:
              "linear-gradient(180deg, rgba(179,57,196,0.14), transparent)",
            clipPath: "polygon(0 0, 100% 0, 100% 65%, 0 100%)",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: 0,
            left: 0,
            width: "100%",
            height: 380,
            background:
              "linear-gradient(0deg, rgba(132,197,82,0.1), transparent)",
            clipPath: "polygon(0 35%, 100% 0, 100% 100%, 0 100%)",
          }}
        />

        {/* Trapezoid */}
        <div
          className="absolute"
          style={{
            top: 100,
            right: 0,
            width: 160,
            height: 240,
            background: "rgba(179,57,196,0.1)",
            clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)",
          }}
        />

        {/* Circles — same sizes as feed */}
        <div
          className="absolute"
          style={{
            top: 180,
            right: 20,
            width: 280,
            height: 280,
            borderRadius: "50%",
            border: "2px solid rgba(179,57,196,0.17)",
          }}
        />
        <div
          className="absolute"
          style={{
            top: 240,
            right: 70,
            width: 160,
            height: 160,
            borderRadius: "50%",
            border: "1px solid rgba(179,57,196,0.1)",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: 220,
            left: 10,
            width: 300,
            height: 300,
            borderRadius: "50%",
            border: "2px solid rgba(132,197,82,0.15)",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: 270,
            left: 60,
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
            top: 450,
            left: 70,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "rgba(179,57,196,0.35)",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: 440,
            right: 80,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "rgba(132,197,82,0.3)",
          }}
        />

        {/* Gaming icons — same as feed */}
        <GamepadIcon
          size={100}
          color="rgba(179,57,196,0.25)"
          style={{ top: 300, right: 70, transform: "rotate(-12deg)" }}
        />
        <GemIcon
          size={70}
          color="rgba(132,197,82,0.22)"
          style={{ bottom: 360, left: 80, transform: "rotate(8deg)" }}
        />
        <CrosshairIcon
          size={90}
          color="rgba(132,197,82,0.18)"
          style={{ bottom: 520, right: 40 }}
        />
        <ShieldIcon
          size={70}
          color="rgba(179,57,196,0.2)"
          style={{ top: 480, left: 30, transform: "rotate(-8deg)" }}
        />

        {/* HUD accent bar */}
        <div
          className="absolute"
          style={{
            top: 200,
            left: 0,
            right: 0,
            height: 2,
            background:
              "linear-gradient(90deg, rgba(179,57,196,0.5), rgba(179,57,196,0.1) 30%, transparent 50%, rgba(132,197,82,0.1) 70%, rgba(132,197,82,0.4))",
          }}
        />

        {/* Corner brackets */}
        <div
          className="absolute"
          style={{
            top: 20,
            left: 20,
            width: 50,
            height: 50,
            borderTop: "3px solid rgba(179,57,196,0.5)",
            borderLeft: "3px solid rgba(179,57,196,0.5)",
          }}
        />
        <div
          className="absolute"
          style={{
            top: 20,
            right: 20,
            width: 50,
            height: 50,
            borderTop: "3px solid rgba(179,57,196,0.5)",
            borderRight: "3px solid rgba(179,57,196,0.5)",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: 20,
            left: 20,
            width: 50,
            height: 50,
            borderBottom: "3px solid rgba(132,197,82,0.5)",
            borderLeft: "3px solid rgba(132,197,82,0.5)",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: 20,
            right: 20,
            width: 50,
            height: 50,
            borderBottom: "3px solid rgba(132,197,82,0.5)",
            borderRight: "3px solid rgba(132,197,82,0.5)",
          }}
        />

        {/* Content — mirrors feed layout */}
        <div
          className="relative flex flex-col h-full"
          style={{ padding: "50px 60px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <img
              src="/logo.png"
              alt="GamER"
              style={{ height: 100, width: "auto" }}
            />
            <div
              className="panel-clip-sm font-azonix"
              style={{
                padding: "10px 28px",
                background: "rgba(179,57,196,0.1)",
                border: "1px solid rgba(179,57,196,0.3)",
                fontSize: 17,
                color: "#C06DD0",
                letterSpacing: "0.15em",
              }}
            >
              TORNEO PRESENCIAL
            </div>
          </div>

          <div
            style={{
              marginTop: 28,
              marginBottom: 28,
              height: 2,
              background:
                "linear-gradient(90deg, rgba(179,57,196,0.4), transparent 40%, transparent 60%, rgba(132,197,82,0.3))",
            }}
          />

          {/* Center */}
          <div
            className="flex-1 flex flex-col justify-center"
            style={{ gap: 26 }}
          >
            <div className="flex items-center gap-4">
              <div
                style={{
                  width: 60,
                  height: 3,
                  background:
                    "linear-gradient(90deg, transparent, rgba(132,197,82,0.5))",
                }}
              />
              <span
                className="font-azonix"
                style={{ fontSize: 34, color: "#96D068", letterSpacing: "0.25em" }}
              >
                2 VS 2
              </span>
              <div
                style={{
                  width: 60,
                  height: 3,
                  background:
                    "linear-gradient(90deg, rgba(132,197,82,0.5), transparent)",
                }}
              />
            </div>

            <h1
              className="font-azonix leading-none"
              style={{
                fontSize: 96,
                color: "#E8E8F0",
                textShadow:
                  "0 0 40px rgba(179,57,196,0.4), 0 0 80px rgba(179,57,196,0.15)",
              }}
            >
              OPEN DUO
            </h1>

            <p style={{ fontSize: 26, color: "#D0D0DC", lineHeight: 1.5 }}>
              Torneos de{" "}
              <span style={{ color: "#96D068", fontWeight: 700 }}>
                League of Legends
              </span>{" "}
              y{" "}
              <span style={{ color: "#96D068", fontWeight: 700 }}>
                Counter-Strike 2
              </span>
            </p>

            <div className="flex gap-4" style={{ marginTop: 4 }}>
              <div
                className="panel-clip-sm font-azonix"
                style={{
                  padding: "12px 28px",
                  background: "rgba(132,197,82,0.08)",
                  border: "1px solid rgba(132,197,82,0.25)",
                  fontSize: 20,
                  color: "#96D068",
                }}
              >
                LOL ARAM 2V2
              </div>
              <div
                className="panel-clip-sm font-azonix"
                style={{
                  padding: "12px 28px",
                  background: "rgba(132,197,82,0.08)",
                  border: "1px solid rgba(132,197,82,0.25)",
                  fontSize: 20,
                  color: "#96D068",
                }}
              >
                CS2 WINGMAN 2V2
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="flex flex-col" style={{ gap: 16 }}>
            <div
              className="panel-clip relative"
              style={{
                padding: "20px 32px",
                background: "rgba(179,57,196,0.06)",
                border: "1px solid rgba(179,57,196,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div className="hud-bracket-tl" />
              <div className="hud-bracket-br" />
              <div className="flex flex-col gap-2">
                <span
                  className="font-azonix"
                  style={{
                    fontSize: 34,
                    color: "#96D068",
                    textShadow: "0 0 20px rgba(132,197,82,0.3)",
                  }}
                >
                  SÁBADO 25 DE ABRIL
                </span>
                <span
                  className="font-azonix"
                  style={{ fontSize: 22, color: "#E8E8F0" }}
                >
                  15:00 a 21:00 HS
                </span>
              </div>
              <div className="flex flex-col items-end gap-3">
                <img
                  src="/mirador-tec.png"
                  alt="MiradorTec"
                  style={{ height: 48, width: "auto", opacity: 0.9 }}
                />
                <span
                  className="font-azonix"
                  style={{ fontSize: 20, color: "#888899" }}
                >
                  Paraná, Entre Ríos
                </span>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <div
                className="panel-clip-sm"
                style={{
                  padding: "10px 24px",
                  background: "rgba(132,197,82,0.06)",
                  border: "1px solid rgba(132,197,82,0.2)",
                  fontSize: 20,
                  color: "#96D068",
                  fontWeight: 600,
                }}
              >
                $7.500 por persona
              </div>
              <div
                className="panel-clip-sm"
                style={{
                  padding: "10px 24px",
                  background: "rgba(179,57,196,0.06)",
                  border: "1px solid rgba(179,57,196,0.2)",
                  fontSize: 20,
                  color: "#C06DD0",
                  fontWeight: 600,
                }}
              >
                INSCRIPCIONES ABIERTAS
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BgSampler() {
  const [selected, setSelected] = useState<string | null>(null);
  const [pageBg, setPageBg] = useState<"dark" | "white">("dark");

  return (
    <div
      style={{
        padding: 40,
        background: pageBg === "dark" ? "#0a0a12" : "#ffffff",
        minHeight: "100vh",
        transition: "background 0.3s ease",
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: 12 }}
      >
        <h1
          className="font-azonix"
          style={{
            fontSize: 28,
            color: pageBg === "dark" ? "#E8E8F0" : "#1a1a2e",
          }}
        >
          Background Sampler
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setPageBg("dark")}
            style={{
              padding: "8px 20px",
              borderRadius: 6,
              border:
                pageBg === "dark"
                  ? "2px solid #B339C4"
                  : "1px solid rgba(179,57,196,0.3)",
              background: pageBg === "dark" ? "rgba(179,57,196,0.15)" : "transparent",
              color: pageBg === "dark" ? "#C06DD0" : "#888899",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Dark page
          </button>
          <button
            onClick={() => setPageBg("white")}
            style={{
              padding: "8px 20px",
              borderRadius: 6,
              border:
                pageBg === "white"
                  ? "2px solid #B339C4"
                  : "1px solid rgba(179,57,196,0.3)",
              background:
                pageBg === "white" ? "rgba(179,57,196,0.15)" : "transparent",
              color: pageBg === "white" ? "#C06DD0" : "#888899",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            White page
          </button>
        </div>
      </div>
      <p
        style={{
          color: pageBg === "dark" ? "#888899" : "#666",
          marginBottom: 40,
          fontSize: 16,
        }}
      >
        Full-size banner rendered at each background, then scaled down. Click to
        enlarge. Toggle page background to see how banners look on IG white feed.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 32,
        }}
      >
        {CANDIDATES.map((c) => (
          <div key={c.hex} style={{ display: "flex", flexDirection: "column" }}>
            <button
              onClick={() => setSelected(selected === c.hex ? null : c.hex)}
              style={{
                all: "unset",
                cursor: "pointer",
                border:
                  selected === c.hex
                    ? "3px solid #B339C4"
                    : "1px solid rgba(179,57,196,0.2)",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <BannerSample bg={c.hex} expanded={selected === c.hex} />
            </button>
            <div
              style={{
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <span
                  className="font-azonix"
                  style={{
                    fontSize: 14,
                    color: pageBg === "dark" ? "#E8E8F0" : "#1a1a2e",
                  }}
                >
                  {c.label}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: pageBg === "dark" ? "#888899" : "#666",
                    marginLeft: 10,
                  }}
                >
                  {c.note}
                </span>
              </div>
              <code style={{ fontSize: 14, color: "#C06DD0", fontFamily: "monospace" }}>
                {c.hex}
              </code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

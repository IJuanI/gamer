"use client";

import { Gamepad2, Hexagon, Zap, Joystick, Swords } from "lucide-react";
import type { JamFlyerData } from "@/lib/jam-flyer-data";
import type { FlyerFormat } from "@/lib/flyer-formats";

/**
 * Paraná Game Jam flyer — a phone-first announcement, not a site recap.
 * Big type, a dense field of motifs across the whole canvas, minimal copy.
 */
export function JamFlyer({ event, format }: { event: JamFlyerData; format: FlyerFormat }) {
  const { width, height, safeZone } = format;
  const isSquare = format.id === "whatsapp-status";
  const u = width / 1080; // scale unit relative to the story format
  const moveUp = height * 0.05; // shift everything but the gamepad mark & gamedevs mark up 5%
  const moveDown = height * 0.02; // then nudge title + content back down a touch
  const contentShift = moveDown - moveUp;
  const footerHeight = 110 * u * 0.3 + moveUp;
  const footerBottomMargin = 64 * u; // independent bottom margin for just the footer mark
  const footerLeftMargin = 90 * u; // independent left margin for just the footer mark

  return (
    <div
      className="flyer-frame relative overflow-hidden"
      style={{ width, height, background: "#0b1020" }}
    >
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/jam/pgj-logo.png"
            alt="Paraná Game Jam"
            style={{ width: isSquare ? "72%" : "88%", height: "auto" }}
          />
        </div>

        <div
          className="flex flex-col items-center justify-between text-center"
          style={{ transform: `translateY(${contentShift}px)` }}
        >
          {/* Group 1: hero text */}
          <div>
            <p className="font-medium" style={{ fontSize: 30 * u, lineHeight: 1.3, color: "#d6dcff" }}>
              Torneo de desarrollo de Videojuegos.
            </p>
            <p className="mt-[1%] font-medium" style={{ fontSize: 46 * u, lineHeight: 1.3, color: "#d6dcff" }}>
              Crea, colabora e innova.
            </p>
          </div>

          {/* Group 2: date + lugar, kept close together, same horizontal span
              (grid, not flex, so both rows reliably share the width of the widest one) */}
          <div className="grid justify-items-stretch" style={{ rowGap: 18 * u }}>
            <p className="font-bold text-center" style={{ fontSize: 64 * u, color: "#ffffff" }}>
              {event.dateRange}
            </p>

            {/* MiradorTEC — venue pill, exact styling pulled from the site's source
                (bg-card/50, border-primary/30, rounded = 4px, px-4 py-2, gap-2, text-muted-foreground) */}
            <div
              className="flex items-center justify-center"
              style={{
                gap: 22 * u,
                borderRadius: 4 * u,
                border: `1px solid rgba(60,255,158,0.3)`,
                backgroundColor: "rgba(18,24,45,0.5)",
                padding: `${12 * u}px ${24 * u}px`,
              }}
            >
              <span className="font-bold leading-none" style={{ fontSize: 38 * u, color: "#b6c2ff" }}>
                LUGAR:
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/jam/mirador-tec.png"
                alt="MiradorTEC"
                style={{ height: 60 * u, width: "auto", transform: `translateY(-${14 * u}px)` }}
              />
            </div>
          </div>

          {/* Group 3: city */}
          <p className="font-semibold" style={{ fontSize: 44 * u, color: "#d6dcff", transform: `translateY(${4 * u}px)` }}>
            {event.city}
          </p>
        </div>
      </div>

      {/* GameDevs footer, bottom-left, pinned with its own small margin */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/gamedevs-icon.svg"
        alt="GameDevs"
        className="absolute"
        style={{
          left: safeZone.left + footerLeftMargin,
          bottom: footerBottomMargin,
          height: footerHeight,
          width: "auto",
          filter: "drop-shadow(0 0 18px rgba(0,0,0,0.45))",
        }}
      />

      {/* GameJamPlus logo, upper right corner (added without disturbing any existing element) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/gamejamplus-logo.png"
        alt="Game Jam Plus"
        className="absolute"
        style={{
          top: safeZone.top + 30 * u,
          right: safeZone.right + 20 * u,
          width: 130 * u * 1.5,
          height: "auto",
          filter: "drop-shadow(0 0 18px rgba(0,0,0,0.45))",
        }}
      />

      {/* Ghost Creative Studio logo, bottom right — to the right of the GameDevs mark */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/ghost-creative-studio-logo.png"
        alt="Ghost Creative Studio"
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
    </div>
  );
}

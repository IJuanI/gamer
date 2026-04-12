"use client";

import { useRef, useState } from "react";
import {
  OpenDuoStory,
  OpenDuoFeed,
  OpenDuoWhatsApp,
  OpenDuoCountdownStory,
  OpenDuoGameSpotlight,
} from "@/components/banners";
import { OPEN_DUO_EVENT } from "@/lib/event-data";
import { FORMATS } from "@/lib/formats";
import { exportBanner } from "@/lib/export-banner";

const LOL_GAME = {
  name: "LEAGUE OF LEGENDS",
  shortName: "LOL",
  format: "ARAM 2V2",
  teams: "8 equipos (llave simple)",
  schedule: "16:00 a 18:25 HS",
  caster: "Martín",
};

const CS2_GAME = {
  name: "COUNTER-STRIKE 2",
  shortName: "CS2",
  format: "WINGMAN 2V2",
  teams: "8 equipos (llave simple)",
  schedule: "18:45 a 21:00 HS",
};

interface BannerEntry {
  id: string;
  label: string;
  category: string;
  format: { width: number; height: number; aspectRatio: string };
  render: () => React.ReactNode;
}

const BANNERS: BannerEntry[] = [
  {
    id: "open-duo-story",
    label: "Anuncio — IG Story",
    category: "Anuncio",
    format: FORMATS["instagram-story"],
    render: () => <OpenDuoStory event={OPEN_DUO_EVENT} />,
  },
  {
    id: "open-duo-feed",
    label: "Anuncio — IG Feed (4:5)",
    category: "Anuncio",
    format: FORMATS["instagram-feed-post"],
    render: () => <OpenDuoFeed event={OPEN_DUO_EVENT} />,
  },
  {
    id: "open-duo-whatsapp",
    label: "Anuncio — WhatsApp",
    category: "Anuncio",
    format: FORMATS["whatsapp-status"],
    render: () => <OpenDuoWhatsApp event={OPEN_DUO_EVENT} />,
  },
  {
    id: "open-duo-countdown-14",
    label: "Countdown — 14 días",
    category: "Countdown",
    format: FORMATS["instagram-story"],
    render: () => <OpenDuoCountdownStory event={OPEN_DUO_EVENT} daysLeft={14} />,
  },
  {
    id: "open-duo-countdown-7",
    label: "Countdown — 7 días",
    category: "Countdown",
    format: FORMATS["instagram-story"],
    render: () => <OpenDuoCountdownStory event={OPEN_DUO_EVENT} daysLeft={7} />,
  },
  {
    id: "open-duo-countdown-3",
    label: "Countdown — 3 días",
    category: "Countdown",
    format: FORMATS["instagram-story"],
    render: () => <OpenDuoCountdownStory event={OPEN_DUO_EVENT} daysLeft={3} />,
  },
  {
    id: "open-duo-countdown-1",
    label: "Countdown — Mañana",
    category: "Countdown",
    format: FORMATS["instagram-story"],
    render: () => <OpenDuoCountdownStory event={OPEN_DUO_EVENT} daysLeft={1} />,
  },
  {
    id: "open-duo-lol",
    label: "Spotlight — LoL",
    category: "Spotlight",
    format: FORMATS["instagram-feed-post"],
    render: () => <OpenDuoGameSpotlight event={OPEN_DUO_EVENT} game={LOL_GAME} />,
  },
  {
    id: "open-duo-cs2",
    label: "Spotlight — CS2",
    category: "Spotlight",
    format: FORMATS["instagram-feed-post"],
    render: () => <OpenDuoGameSpotlight event={OPEN_DUO_EVENT} game={CS2_GAME} />,
  },
];

export default function GalleryPage() {
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState(BANNERS[0].id);
  const selected = BANNERS.find((b) => b.id === selectedId)!;
  const scale = Math.min(450 / selected.format.width, 1);

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <header className="mb-8 w-full max-w-3xl">
        <h1 className="font-azonix text-2xl text-[#B339C4] mb-1">
          Open Duo — Banners
        </h1>
        <p className="text-sm text-[#888899]">
          Seleccioná un banner para previsualizar. &quot;Descargar&quot; exporta
          PNG a resolución real.
        </p>
      </header>

      {/* Banner selector */}
      <nav className="mb-8 w-full max-w-3xl">
        {["Anuncio", "Countdown", "Spotlight"].map((cat) => (
          <div key={cat} className="mb-3">
            <span
              className="text-xs font-azonix text-[#833D90] mb-1 block"
              style={{ letterSpacing: "0.1em" }}
            >
              {cat}
            </span>
            <div className="flex gap-2 flex-wrap">
              {BANNERS.filter((b) => b.category === cat).map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedId(b.id)}
                  className="px-3 py-1.5 text-xs font-medium cursor-pointer transition-all"
                  style={{
                    background:
                      b.id === selectedId
                        ? "rgba(179,57,196,0.2)"
                        : "rgba(179,57,196,0.04)",
                    border: `1px solid ${b.id === selectedId ? "rgba(179,57,196,0.5)" : "rgba(179,57,196,0.15)"}`,
                    color: b.id === selectedId ? "#B339C4" : "#9E46AE",
                  }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Preview */}
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <h2 className="text-sm text-[#9E46AE] font-medium">
            {selected.label}
          </h2>
          <p className="text-xs text-[#888899]">
            {selected.format.width}×{selected.format.height}px ·{" "}
            {selected.format.aspectRatio}
          </p>
        </div>

        <div
          style={{
            width: selected.format.width * scale,
            height: selected.format.height * scale,
            overflow: "hidden",
            border: "1px solid rgba(179,57,196,0.2)",
          }}
        >
          <div
            ref={bannerRef}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            {selected.render()}
          </div>
        </div>

        <button
          onClick={() => {
            if (bannerRef.current) {
              const el = bannerRef.current.firstElementChild as HTMLElement;
              if (el) exportBanner(el, `gamer-${selected.id}`);
            }
          }}
          className="px-4 py-2 text-sm font-medium cursor-pointer"
          style={{
            background: "rgba(132,197,82,0.12)",
            border: "1px solid rgba(132,197,82,0.3)",
            color: "#84C552",
          }}
        >
          Descargar PNG
        </button>
      </div>
    </div>
  );
}

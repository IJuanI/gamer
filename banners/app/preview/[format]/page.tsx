"use client";

import { use, useRef } from "react";
import {
  InstagramStory,
  InstagramFeedTall,
  InstagramFeedPost,
  WhatsAppStatus,
} from "@/components/banners";
import { SAMPLE_EVENTS } from "@/lib/event-data";
import { getFormat } from "@/lib/formats";
import { exportBanner } from "@/lib/export-banner";

const BANNER_COMPONENTS = {
  "instagram-story": InstagramStory,
  "instagram-feed-tall": InstagramFeedTall,
  "instagram-feed-post": InstagramFeedPost,
  "whatsapp-status": WhatsAppStatus,
} as const;

export default function PreviewPage({
  params,
}: {
  params: Promise<{ format: string }>;
}) {
  const { format: formatId } = use(params);
  const ref = useRef<HTMLDivElement>(null);
  const event = SAMPLE_EVENTS[0];

  let format;
  try {
    format = getFormat(formatId);
  } catch {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#888899]">
          Formato no encontrado: <code>{formatId}</code>
        </p>
      </div>
    );
  }

  const Component =
    BANNER_COMPONENTS[formatId as keyof typeof BANNER_COMPONENTS];
  if (!Component) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#888899]">
          Componente no disponible: <code>{formatId}</code>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      {/* Controls bar */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3"
        style={{ background: "rgba(10,10,18,0.95)", borderBottom: "1px solid rgba(179,57,196,0.2)" }}
      >
        <div className="flex items-center gap-4">
          <a href="/" className="text-[#9E46AE] text-sm hover:text-[#B339C4]">
            ← Galería
          </a>
          <span className="font-azonix text-sm text-[#B339C4]">
            {format.name}
          </span>
          <span className="text-xs text-[#888899]">
            {format.width}×{format.height}px
          </span>
        </div>
        <button
          onClick={() => {
            if (ref.current) exportBanner(ref.current, `gamer-${formatId}`);
          }}
          className="px-4 py-1.5 text-sm font-medium cursor-pointer"
          style={{
            background: "rgba(132,197,82,0.12)",
            border: "1px solid rgba(132,197,82,0.3)",
            color: "#84C552",
          }}
        >
          Descargar PNG
        </button>
      </div>

      {/* Full-size banner */}
      <div className="pt-16 flex justify-center">
        <div ref={ref}>
          <Component event={event} />
        </div>
      </div>
    </div>
  );
}

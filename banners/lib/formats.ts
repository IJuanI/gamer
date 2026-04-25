export interface BannerFormat {
  id: string;
  name: string;
  platform: string;
  width: number;
  height: number;
  aspectRatio: string;
  safeZone: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  description: string;
}

export const FORMATS: Record<string, BannerFormat> = {
  "instagram-story": {
    id: "instagram-story",
    name: "Instagram Story",
    platform: "Instagram",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    safeZone: { top: 250, bottom: 250, left: 60, right: 60 },
    description:
      "Formato vertical pantalla completa. Evitar texto en los 250px superior e inferior por overlays de la app.",
  },
  "instagram-feed-tall": {
    id: "instagram-feed-tall",
    name: "Instagram Feed (3:4)",
    platform: "Instagram",
    width: 1080,
    height: 1440,
    aspectRatio: "3:4",
    safeZone: { top: 40, bottom: 40, left: 40, right: 40 },
    description:
      "Formato tall para feed. Coincide con el crop del perfil grid — no se recorta en la grilla.",
  },
  "instagram-feed-post": {
    id: "instagram-feed-post",
    name: "Instagram Feed Post (4:5)",
    platform: "Instagram",
    width: 1080,
    height: 1350,
    aspectRatio: "4:5",
    safeZone: { top: 40, bottom: 40, left: 40, right: 40 },
    description:
      "Formato estándar vertical del feed. Máximo espacio vertical permitido en el feed clásico.",
  },
  "whatsapp-status": {
    id: "whatsapp-status",
    name: "WhatsApp Group",
    platform: "WhatsApp",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
    safeZone: { top: 60, bottom: 60, left: 60, right: 60 },
    description:
      "Formato cuadrado 1:1 optimizado para compartir flyers en grupos de WhatsApp. Sin cropping en el chat.",
  },
  // ── Print formats — pixel sizes assume 300dpi ─────────────────────────
  "print-a6-portrait": {
    id: "print-a6-portrait",
    name: "A6 vertical (impresión)",
    platform: "Print",
    width: 1240,
    height: 1748,
    aspectRatio: "5:7",
    safeZone: { top: 90, bottom: 90, left: 90, right: 90 },
    description:
      "A6 vertical 105×148mm @300dpi. Para señalética con QR (wifi, redes sociales).",
  },
  "print-a4-landscape": {
    id: "print-a4-landscape",
    name: "A4 horizontal (impresión)",
    platform: "Print",
    width: 3508,
    height: 2480,
    aspectRatio: "297:210",
    safeZone: { top: 200, bottom: 200, left: 200, right: 200 },
    description:
      "A4 horizontal 297×210mm @300dpi. Señalización direccional (BAÑOS, ENTRADA) y menús de evento.",
  },
  "print-a4-portrait": {
    id: "print-a4-portrait",
    name: "A4 vertical (impresión)",
    platform: "Print",
    width: 2480,
    height: 3508,
    aspectRatio: "210:297",
    safeZone: { top: 200, bottom: 200, left: 180, right: 180 },
    description:
      "A4 vertical 210×297mm @300dpi. Cronograma de evento.",
  },
} as const;

export const FORMAT_LIST = Object.values(FORMATS);

export function getFormat(id: string): BannerFormat {
  const format = FORMATS[id];
  if (!format) throw new Error(`Unknown format: ${id}`);
  return format;
}

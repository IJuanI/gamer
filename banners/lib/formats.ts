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
    name: "WhatsApp Status",
    platform: "WhatsApp",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    safeZone: { top: 120, bottom: 200, left: 60, right: 60 },
    description:
      "Mismo tamaño que IG Story pero con safe zone diferente: 120px arriba (nombre de usuario), 200px abajo (botón responder).",
  },
} as const;

export const FORMAT_LIST = Object.values(FORMATS);

export function getFormat(id: string): BannerFormat {
  const format = FORMATS[id];
  if (!format) throw new Error(`Unknown format: ${id}`);
  return format;
}

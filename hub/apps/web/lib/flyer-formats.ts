/** Export formats for the admin flyer/banner tool. Mirrors ../../banners/lib/formats.ts. */

export interface FlyerFormat {
  id: string;
  name: string;
  platform: string;
  width: number;
  height: number;
  aspectRatio: string;
  safeZone: { top: number; bottom: number; left: number; right: number };
}

export const FLYER_FORMATS: Record<string, FlyerFormat> = {
  "instagram-story": {
    id: "instagram-story",
    name: "Instagram Story",
    platform: "Instagram",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    safeZone: { top: 250, bottom: 250, left: 60, right: 60 },
  },
  "instagram-feed-post": {
    id: "instagram-feed-post",
    name: "Instagram Feed Post (4:5)",
    platform: "Instagram",
    width: 1080,
    height: 1350,
    aspectRatio: "4:5",
    safeZone: { top: 40, bottom: 40, left: 40, right: 40 },
  },
  "whatsapp-status": {
    id: "whatsapp-status",
    name: "WhatsApp / Cuadrado",
    platform: "WhatsApp",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
    safeZone: { top: 60, bottom: 60, left: 60, right: 60 },
  },
};

export const FLYER_FORMAT_LIST = Object.values(FLYER_FORMATS);

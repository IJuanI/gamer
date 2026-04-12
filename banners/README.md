# GamER Banners — Next.js App

Renders GamER event announcement banners at exact social media pixel dimensions. Preview in-browser, export to PNG.

## Setup

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

- **`/`** — Gallery showing all banner formats as scaled thumbnails. Each has a "Descargar PNG" button and a "Ver tamaño real" link.
- **`/preview/[format-id]`** — Full-size single banner with export button. Format IDs: `instagram-story`, `instagram-feed-tall`, `instagram-feed-post`, `whatsapp-status`.

## Project structure

```
banners/
├── app/
│   ├── globals.css              # Brand colors, gaming CSS utilities, animations
│   ├── layout.tsx               # Root layout (Inter font, dark background)
│   ├── page.tsx                 # Gallery page
│   └── preview/[format]/
│       └── page.tsx             # Full-size preview route
├── components/banners/
│   ├── index.ts                 # Barrel export
│   ├── instagram-story.tsx      # 1080×1920 (9:16)
│   ├── instagram-feed-tall.tsx  # 1080×1440 (3:4)
│   ├── instagram-feed-post.tsx  # 1080×1350 (4:5)
│   └── whatsapp-status.tsx      # 1080×1920 (9:16)
└── lib/
    ├── formats.ts               # Format definitions (dimensions, safe zones)
    ├── event-data.ts            # EventData type + sample events
    └── export-banner.ts         # html-to-image PNG export utility
```

## How to change event content

Edit `lib/event-data.ts` — modify an existing sample event or add a new one. The gallery automatically renders the first event in `SAMPLE_EVENTS`.

```typescript
{
  title: "TORNEO VALORANT",
  subtitle: "Clasificatorio Regional Entre Ríos",
  type: "torneo-hibrido",
  games: ["Valorant"],
  date: "Sábado 26 de Abril",
  time: "15:00 HS",
  venue: "Nexus Cyber Café",
  city: "Paraná, Entre Ríos",
  // ...
}
```

## How to modify a banner design

1. Open the component in `components/banners/`
2. Every component receives `{ event: EventData }` as props
3. The root div must have `className="banner-frame"` and `style={{ width, height }}` matching the format exactly
4. Keep text within the format's safe zone (see `../FORMATS.md`)
5. Use the CSS utilities from `globals.css`: `bg-grid`, `glow-purple`, `hud-corners`, `diagonal-stripe`, animation classes, etc.

## How to export a PNG

**From the UI**: click "Descargar PNG" on any banner in the gallery or preview page.

**Programmatically**:

```typescript
import { exportBanner } from "@/lib/export-banner";

// ref is a reference to the banner's root DOM element
await exportBanner(ref.current, "my-banner-name");
// Downloads my-banner-name.png at the component's exact pixel dimensions
```

## Adding a new format

1. Add the format spec in `lib/formats.ts`
2. Create a component in `components/banners/`
3. Export from `components/banners/index.ts`
4. Add to `BANNER_COMPONENTS` in `app/page.tsx`

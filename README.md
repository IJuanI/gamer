# GamER — Brand System & Banner Generator

Brand assets, guidelines, and an LLM-powered banner generation playground for **GamER** (Entre Ríos Gamers) — a gaming community and esports organization from Entre Ríos, Argentina.

## Repo structure

```
docs/           Brand system, format specs, prompt templates
events/         Event planning documents
assets/         Source logo and icon files
banners/        Next.js app for generating and exporting banners
```

## Quick start — Banner generator

```bash
cd banners
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the banner gallery.

- **Gallery page** — scaled previews of all banner formats with "Descargar PNG" buttons
- **Full-size preview** — click "Ver tamaño real" to see any banner at actual pixel dimensions
- **PNG export** — downloads the banner at exact resolution (e.g., 1080×1920 for Instagram Story)

## Supported formats

| Format | Size | Ratio | Platform |
|---|---|---|---|
| Instagram Story | 1080×1920 | 9:16 | Instagram |
| Instagram Feed (tall) | 1080×1440 | 3:4 | Instagram |
| Instagram Feed (post) | 1080×1350 | 4:5 | Instagram |
| WhatsApp Status | 1080×1920 | 9:16 | WhatsApp |

## Generating banners with an LLM

1. Open this repo in your LLM coding tool (Claude Code, Cursor, etc.)
2. Describe the event — include: event name, game(s), date, time, venue, and any prizes
3. The LLM will update the event data and banner component, then you can preview and export

See `docs/prompts.md` for copy-paste prompt templates.

### Example prompt

> Generar un banner de Instagram Story para un torneo de Valorant el sábado 26 de abril a las 15:00 en Nexus Cyber Café, Paraná. Inscripción gratuita. Premios: 1° $50.000, 2° $25.000. Formato 5v5.

## Brand colors

| Color | HEX | Usage |
|---|---|---|
| Primary purple | `#B339C4` | Main brand identity, headlines |
| Secondary purple (light) | `#9E46AE` | Supporting surfaces |
| Secondary purple (dark) | `#833D90` | Depth, dark contexts |
| Accent green | `#84C552` | Highlights, game tags, dates |

Full brand system in `docs/brand.md`.

## Tech stack

- **Next.js 16** + TypeScript + Tailwind CSS v4
- **AZONIX** font (CDNFonts) for display headlines
- **html-to-image** for PNG export
- **Lucide React** for icons

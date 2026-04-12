# GamER Banner Generator — Agent Instructions

Next.js playground for generating branded social media banners for **GamER** (Entre Ríos Gamers), a gaming community / esports organization from Entre Ríos, Argentina.

## Read first

- Read `../docs/brand.md` before generating or modifying banners.
- Read `../docs/prompts.md` when working from prompt-driven generation.

## Project purpose

- Render event announcement banners as React components at exact social-media dimensions
- Preview banners in-browser
- Export banners to PNG

## Stack

- Next.js 16 + TypeScript + Tailwind CSS v4
- `html-to-image` for PNG export
- AZONIX for display text
- Inter for body text

## Key files

- `components/banners/*.tsx` — banner components
- `components/banners/index.ts` — banner exports
- `lib/formats.ts` — format sizes and safe zones
- `lib/event-data.ts` — event types and sample data
- `lib/export-banner.ts` — PNG export utility
- `app/page.tsx` — gallery preview and format registry
- `app/preview/[format]/page.tsx` — full-size preview
- `app/globals.css` — brand variables, utilities, effects, animations

## Brand essentials

- Use GamER brand rules from `../docs/brand.md`
- Main colors:
  - primary purple `#B339C4`
  - secondary purple `#9E46AE`
  - dark purple `#833D90`
  - accent green `#84C552`
  - banner background `#0a0a12`
- Use AZONIX for headlines, titles, labels
- Use Inter for body copy
- Never use AZONIX for long body text

## Supported formats

- `instagram-story` — 1080×1920, safe zone 250px top/bottom
- `instagram-feed-tall` — 1080×1440
- `instagram-feed-post` — 1080×1350
- `whatsapp-status` — 1080×1920, safe zone 120px top / 200px bottom

Always use exact pixel dimensions and keep critical content inside the safe zone.

## Banner component contract

Each banner component must:
- accept `{ event: EventData }`
- render a root `div` with `className="banner-frame"`
- set exact `width` and `height` from the format
- set root background to `#0a0a12`
- keep important content inside the safe zone
- use brand colors from `globals.css`
- use `.font-azonix` for display text

## Content and style rules

- Language: Argentine Spanish
- Event types:
  - `torneo-hibrido`
  - `cyber-cafe`
  - `torneo-online`
  - `torneo-presencial`
- No CTA buttons or “registrate ahora” style prompts
- No photography; graphics only
- Visual style: dark background, geometric gaming aesthetic, grid/pixel details, glow, diagonal accents, HUD-style framing
- Keep layouts clean, legible, and high-contrast

## CSS utilities

Use the utilities from `app/globals.css` instead of inventing ad-hoc effects.

- Backgrounds: `bg-grid`, `bg-grid-dense`, `pixel-scatter`
- Accents: `diagonal-stripe`, `diagonal-stripe-green`, `hud-corners`
- Glows: `glow-purple`, `glow-green`, `box-glow-purple`, `box-glow-green`
- Animations: `animate-pulse-glow`, `animate-float`, `animate-scanline`, `animate-slide-left`, `animate-slide-right`, `animate-fade-up`, `animate-pixel-flicker`, `delay-100` to `delay-1000`

## Workflow

When creating or updating a banner:
1. define or update event data in `lib/event-data.ts`
2. create or modify the banner component in `components/banners/`
3. follow the exact format size and safe-zone rules from `lib/formats.ts`
4. use existing CSS variables and utilities from `app/globals.css`
5. export from `components/banners/index.ts`
6. register new formats in `app/page.tsx` if needed

## Run locally

    cd banners
    pnpm dev

Gallery: `http://localhost:3000`  
Full preview: `/preview/[format-id]`
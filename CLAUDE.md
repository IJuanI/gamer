# GamER — Agent Instructions

Repository for the **GamER** brand system and banner-generation tooling for **Entre Ríos Gamers**, a gaming community / esports organization from Entre Ríos, Argentina.

## Read first

1. Read `docs/brand.md`
2. If working on banners, also read `banners/CLAUDE.md`
3. If generating banner content, read `docs/prompts.md`
4. If working on format dimensions or safe zones, read `docs/formats.md`
5. If working in `hub/` (the community platform app), read `hub/CLAUDE.md` first

## Repo layout

```text
gamer/
├── CLAUDE.md
├── README.md
├── GamER branding RAW.pdf
├── docs/
│   ├── brand.md
│   ├── formats.md
│   └── prompts.md
├── events/
├── assets/
└── banners/
    ├── CLAUDE.md
    └── ...
```

## Brand essentials

- Brand name: `GamER`
- Full name: `Entre Ríos Gamers`
- Primary purple: `#B339C4`
- Accent green: `#84C552`
- Secondary purples: `#9E46AE`, `#833D90`
- Display font: `AZONIX` for headlines only
- Language: Argentine Spanish
- Tone: energetic, community-oriented, gaming-literate, professional but approachable

When documentation conflicts, defer to `GamER branding RAW.pdf`.

## Common tasks

### Generate or modify a banner
- Use `docs/prompts.md` for prompt structure
- Use `banners/CLAUDE.md` for implementation rules
- Update banner event data in `banners/lib/event-data.ts`
- Update or create components in `banners/components/banners/`

### Update branding
- Edit `docs/brand.md`
- If colors or tokens change, update `banners/app/globals.css`

### Add a new social format
- Add the format in `banners/lib/formats.ts`
- Add the banner component
- Export it from `banners/components/banners/index.ts`
- Register it in `banners/app/page.tsx`
- Update `docs/formats.md`

## Git workflow

- Never push commits directly to `main`. Always create a feature branch and
  open a pull request, even for small fixes — `main` should only receive
  merges from reviewed PRs.

## Hard rules

- Do not introduce off-palette colors without explicit approval
- Do not use AZONIX for body text
- Banner copy must be in Argentine Spanish
- No CTA buttons on banners
- No photography in banners; graphics only
- Use dark banner backgrounds only
- Respect the safe zone for each format
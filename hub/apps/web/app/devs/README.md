# GameDevs `/devs` Route Implementation

## Overview

This directory contains the **GameDevs Developer Community** landing page (`/devs` route), a new section of the hub that uses GameDevs branding instead of GamER branding.

**Status**: ✅ Complete & Validated

---

## What Was Built

### 1. Design Analysis & Color Extraction ✓
- **Source**: `E:/Descargas/GameDevs Branding.ai` (4.9MB Adobe Illustrator file)
- **Method**: Converted .ai → SVG via Inkscape for programmatic analysis
- **Reference**: 10 visual workbenches exported from Illustrator for design validation

### 2. Design Tokens System ✓
**File**: `apps/web/lib/gamedevs-tokens.ts`

Defines the approved GameDevs color palette:
- **Primary Green**: `#72b341` (main brand color)
- **Secondary Green**: `#619f2f` (hover states, emphasis)
- **Tertiary Green**: `#518c1c` (dark accents, maximum contrast)
- **Text Colors**: `#4d4d4d`, `#231f20`, `#000000`
- **Neutrals**: `#ffffff`, `#808080`, `#666666`

Features:
- TypeScript-enforced color constants
- `validateGameDevsColor()` function for design guard
- CSS custom properties for easy styling
- Inline documentation with design approval notes

### 3. Landing Page Route ✓
**File**: `app/devs/page.tsx`

Mirrors the GamER landing page structure (`/`) with GameDevs branding:

**Sections**:
1. **Hero** — Brand introduction, CTA buttons, statistics
2. **Features** — 4 feature cards (Collab Dev, Project Showcase, Talent Network, Workshops)
3. **Community CTA** — Call to action for registration
4. **Footer** — Attribution and links

**Design Compliance**:
- ✅ All colors from `GAMEDEVS_COLORS` token system
- ✅ No hardcoded colors (uses `style={{}}` with tokens)
- ✅ No off-palette colors detected
- ✅ Content in Argentine Spanish
- ✅ Responsive design matching landing page structure
- ✅ Uses approved AZONIX font for headlines

### 4. Visual Validation Component ✓
**File**: `components/gamedevs-design-guide.tsx`

Provides:
- Interactive color palette display with hex codes
- Usage examples (correct vs. incorrect)
- Implementation guidelines
- Design compliance checklist

Use this component to verify color accuracy and document the design system.

### 5. Design Documentation ✓
**File**: `app/devs/DESIGN.md`

Comprehensive guide including:
- Design source and extraction method
- Complete color palette with usage guidelines
- Layout structure and typography rules
- Implementation guidelines
- Validation checklist
- Testing procedures
- Maintenance notes

### 6. Automated Validation Script ✓
**File**: `scripts/validate-gamedevs-colors.js`

Node.js script that scans `/devs` route for:
- ❌ Forbidden GamER colors (`#B339C4`, `#9E46AE`, `#833D90`)
- ❌ Off-palette colors (warns when hardcoded hex is found)
- ❌ Missing imports (checks if tokens are imported properly)
- ✅ Approved GameDevs palette usage

**Run**: `node scripts/validate-gamedevs-colors.js`

---

## Design Fidelity Guardrails

### TypeScript Level
- All colors are constants from `GAMEDEVS_COLORS`
- Type safety prevents accidental off-palette usage
- `validateGameDevsColor()` provides runtime warnings

### Linting Level
- Validation script detects off-palette colors
- CI/CD can enforce design compliance before deployment

### Documentation Level
- `DESIGN.md` serves as single source of truth
- Inline code comments reference design source
- Visual reference component available for designers

### Browser Level
- Visual comparison against extracted design files
- Color accuracy verified against source PNGs

---

## Color Palette Reference

| Use Case | Color | Hex | Visual Ref |
|----------|-------|-----|-----------|
| Primary Brand | Green | `#72b341` | Logo, CTAs, highlights |
| Hover/Emphasis | Dark Green | `#619f2f` | Button states, active elements |
| Dark Accents | Darker Green | `#518c1c` | Borders, shadows, contrast |
| Body Text | Dark Gray | `#4d4d4d` | Readable text |
| Headlines | Near Black | `#231f20` | h1, h2, strong text |
| Max Contrast | Black | `#000000` | Critical elements |
| Backgrounds | White | `#ffffff` | Light backgrounds |
| Neutral Gray | Medium | `#808080` | Secondary elements |
| Muted Text | Light Gray | `#666666` | Tertiary text |

---

## File Structure

```
apps/web/app/devs/
├── page.tsx              # Landing page route (main implementation)
├── DESIGN.md             # Design documentation & validation checklist
└── README.md             # This file

apps/web/lib/
└── gamedevs-tokens.ts    # Design token system (color constants)

apps/web/components/
└── gamedevs-design-guide.tsx  # Visual validation component

scripts/
└── validate-gamedevs-colors.js  # Design compliance validator
```

---

## Quick Start

### View the Route
Navigate to `http://localhost:3000/devs` in your browser.

### Use Design Tokens
```tsx
import { GAMEDEVS_COLORS } from "@/lib/gamedevs-tokens";

<div style={{ color: GAMEDEVS_COLORS.primary }}>
  GameDevs Content
</div>
```

### Validate Colors
```bash
node scripts/validate-gamedevs-colors.js
```

### View Color Palette
Add this to `/devs` route or create a `/design-guide` route:
```tsx
import { GameDevsColorPalette } from "@/components/gamedevs-design-guide";

export default function DesignGuide() {
  return <GameDevsColorPalette />;
}
```

---

## Design Source Verification

All colors extracted from `E:/Descargas/GameDevs Branding.ai`:
- ✅ Verified against 10 exported design workbenches (PNG)
- ✅ Logo colors confirmed accurate
- ✅ Social media icons match palette
- ✅ Business card designs validate colors
- ✅ App icon colors consistent across variants

**Note**: As mentioned by designer, text hex codes in source file were incorrect. All colors extracted programmatically from SVG for accuracy.

---

## Maintenance & Updates

### If Colors Change
1. Update `GAMEDEVS_COLORS` in `apps/web/lib/gamedevs-tokens.ts`
2. Update `DESIGN.md` with new colors
3. Re-run validation script
4. Test visually in browser against new design source

### If Structure Changes
1. Update `page.tsx` components
2. Update `DESIGN.md` layout section
3. Verify color usage remains accurate

### If Adding New Features
1. **Always** use `GAMEDEVS_COLORS` tokens
2. Run validation script before committing
3. Verify colors against original AI file
4. Document in `DESIGN.md`

---

## Testing Checklist

- [ ] `/devs` route loads at `localhost:3000/devs`
- [ ] Green primary color (`#72b341`) appears in CTAs
- [ ] No purple (GamER) colors visible
- [ ] Text is readable and properly contrasted
- [ ] Responsive layout works on mobile
- [ ] `npm run dev` shows no compilation errors
- [ ] `node scripts/validate-gamedevs-colors.js` passes
- [ ] All links navigate correctly

---

## References

- **Design Source**: `E:/Descargas/GameDevs Branding.ai`
- **Design Workbenches**: `E:/Descargas/GameDevs/Mesa de trabajo *.png` (10 files)
- **Design Tokens**: `apps/web/lib/gamedevs-tokens.ts`
- **Landing Page Reference**: `apps/web/app/page.tsx` (GamER branding for structure)
- **Brand Guidelines**: `CLAUDE.md` (project root)

---

## Support

For questions about:
- **Design accuracy**: Check `DESIGN.md` and compare against source AI file
- **Color usage**: See `gamedevs-tokens.ts` and `gamedevs-design-guide.tsx`
- **Validation**: Run `scripts/validate-gamedevs-colors.js`
- **Implementation**: Review `page.tsx` and component styling patterns

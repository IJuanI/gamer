# GameDevs `/devs` Route - Design Documentation

## Design Source
- **File**: `E:/Descargas/GameDevs Branding.ai` (4.9 MB Adobe Illustrator)
- **Extracted**: 2026-09-18
- **Conversion Method**: Inkscape (AI → SVG for analysis)

## Color Palette (Verified from Source)

### Primary Colors
- **Primary Green**: `#72b341` — Main brand color, used for CTAs, accents, highlights
- **Secondary Green**: `#619f2f` — Darker green for emphasis, hover states
- **Tertiary Green**: `#518c1c` — Darkest green for maximum contrast, backgrounds

### Text & Neutrals
- **Text Primary**: `#4d4d4d` — Body text, default readable color
- **Text Accent**: `#231f20` — Headings, strong emphasis (near-black)
- **Text Contrast**: `#000000` — Maximum contrast for critical elements
- **Background Light**: `#ffffff` — White backgrounds
- **Gray Neutral**: `#808080` — Secondary elements
- **Gray Muted**: `#666666` — Muted text, secondary information

## Design Tokens Location
- **File**: `apps/web/lib/gamedevs-tokens.ts`
- **Purpose**: Single source of truth for all GameDevs colors
- **Validation**: TypeScript enforces color usage against palette
- **Guard**: `validateGameDevsColor()` warns on off-palette colors

## Layout & Structure

The `/devs` route mirrors the `/` (GamER) landing page structure:

```
1. Hero Section
   - Hero text with GameDevs branding
   - Two CTAs (Join / Learn More)
   - Statistics cards (developers, projects, regions)

2. Features Section
   - 4 feature cards with icons
   - Collab development, project showcase, talent network, workshops
   - Green accent borders and backgrounds

3. Community CTA Section
   - Call to action for registration
   - Brand-appropriate styling with green accents

4. Footer
   - Attribution and links
```

## Component Usage Guidelines

### Colors
Always use from `GAMEDEVS_COLORS` constant:
```tsx
import { GAMEDEVS_COLORS } from "@/lib/gamedevs-tokens";

<div style={{ color: GAMEDEVS_COLORS.primary }}>Text</div>
<button style={{ backgroundColor: GAMEDEVS_COLORS.primary }}>CTA</button>
```

### Forbidden (Off-Palette)
- ❌ Hardcoded colors (use tokens)
- ❌ GamER purple (`#B339C4`, `#9E46AE`, `#833D90`)
- ❌ Custom green shades not in approved palette
- ❌ Grayscale without explicit GameDevs approval

### Approved Fonts
- **Headlines**: AZONIX (from GamER design system)
- **Body**: System fonts (Inter, system-ui, sans-serif)

## Validation Checklist

- [x] All colors extracted from GameDevs branding file
- [x] Colors documented in `GAMEDEVS_COLORS` constant
- [x] Layout mirrors landing page structure (for consistency)
- [x] Copy localized to Argentine Spanish
- [x] No off-palette colors in implementation
- [x] TypeScript enforces color validation
- [x] Visual guardrails in place (`validateGameDevsColor()`)
- [x] Inline style documentation for color origins

## Testing & QA

### Visual Verification
Open `/devs` route in browser and verify:
1. Green primary color (`#72b341`) appears in CTAs and highlights
2. Text is readable (dark grays on white)
3. All interactive elements are properly styled
4. No purple (GamER) colors are visible
5. Layout is responsive and matches landing page structure

### Code Validation
```bash
# Search for off-palette colors
grep -r "#B339C4\|#9E46AE\|#833D90" apps/web/app/devs/
# Should return: (no results)

# Verify tokens usage
grep -r "GAMEDEVS_COLORS" apps/web/app/devs/
# Should return: color references
```

### Design Adherence
- Route uses only colors from extracted GameDevs palette
- Layout structure mirrors approved landing page design
- No design elements added without approval
- All text is in Argentine Spanish
- Fonts match branding guidelines

## Maintenance Notes

If updating this route:
1. **Never hardcode colors** — use `GAMEDEVS_COLORS` from `libs/gamedevs-tokens.ts`
2. **Validate new colors** against original AI file before use
3. **Update this file** if palette changes
4. **Run visual tests** after modifications
5. **Consult branding doc** (CLAUDE.md) for changes

## References
- Branding Source: `E:/Descargas/GameDevs Branding.ai`
- Brand Guide: `docs/brand.md` (GamER branding)
- Design Tokens: `libs/gamedevs-tokens.ts`
- Landing Page: `apps/web/app/page.tsx` (for structure reference)

/**
 * GameDevs Branding Design Tokens
 * Extracted from: E:/Descargas/GameDevs Branding.ai
 * Color accuracy: CRITICAL - DO NOT modify without design approval
 */

export const GAMEDEVS_COLORS = {
  // Primary palette - GameDevs green spectrum
  primary: "#72b341", // Primary Green - MAIN BRAND COLOR
  primaryDark: "#619f2f", // Secondary Green - Darker accent
  primaryDarker: "#518c1c", // Tertiary Green - Darkest accent

  // Neutrals
  text: {
    primary: "#4d4d4d", // Dark Gray - Body text
    accent: "#231f20", // Near Black - Headings/emphasis
    contrast: "#000000", // Black - Max contrast
  },

  background: {
    light: "#ffffff", // White
    neutral: "#808080", // Medium Gray
    muted: "#666666", // Muted Gray
  },
} as const;

export type GameDevsColorKey = keyof typeof GAMEDEVS_COLORS;

/**
 * Validate that a color value is in the GameDevs palette
 * Throws if color is off-palette (defensive check for design fidelity)
 */
export function validateGameDevsColor(
  color: string,
  context: string
): boolean {
  const paletteValues = Object.values(GAMEDEVS_COLORS).flat();
  const isValid = paletteValues.some((c) =>
    typeof c === "string" ? c.toLowerCase() === color.toLowerCase() : false
  );

  if (!isValid) {
    console.warn(
      `[GameDevs Design Guard] Off-palette color detected in ${context}: ${color}. ` +
        `Approved palette: ${JSON.stringify(GAMEDEVS_COLORS)}`
    );
  }

  return isValid;
}

/**
 * CSS custom properties for GameDevs branding
 * Use in globals.css or component stylesheets
 */
export const GAMEDEVS_CSS_VARS = `
  --gamedevs-primary: ${GAMEDEVS_COLORS.primary};
  --gamedevs-primary-dark: ${GAMEDEVS_COLORS.primaryDark};
  --gamedevs-primary-darker: ${GAMEDEVS_COLORS.primaryDarker};
  --gamedevs-text-primary: ${GAMEDEVS_COLORS.text.primary};
  --gamedevs-text-accent: ${GAMEDEVS_COLORS.text.accent};
  --gamedevs-text-contrast: ${GAMEDEVS_COLORS.text.contrast};
  --gamedevs-bg-light: ${GAMEDEVS_COLORS.background.light};
  --gamedevs-bg-neutral: ${GAMEDEVS_COLORS.background.neutral};
  --gamedevs-bg-muted: ${GAMEDEVS_COLORS.background.muted};
`;

/**
 * Font configuration for GameDevs
 * Updated from CLAUDE.md: Use brand-appropriate fonts
 */
export const GAMEDEVS_FONTS = {
  display: "var(--font-azonix, 'AZONIX', system-ui, sans-serif)", // Brand headline font
  body: "system-ui, -apple-system, sans-serif",
} as const;

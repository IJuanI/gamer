/**
 * GameDevs Design Guide & Validation Component
 *
 * Visual verification tool for GameDevs branding compliance.
 * Displays approved color palette from E:/Descargas/GameDevs Branding.ai
 *
 * Usage:
 * - Add to /devs route for visual reference
 * - Use in Storybook for documentation
 * - Reference when implementing new GameDevs components
 */

import { GAMEDEVS_COLORS } from "@/lib/gamedevs-tokens";

export function GameDevsColorPalette() {
  const colorGroups = [
    {
      label: "Primary Palette",
      colors: [
        {
          name: "Primary Green",
          value: GAMEDEVS_COLORS.primary,
          hex: "#72b341",
          usage: "Main brand color, CTAs, highlights",
        },
        {
          name: "Secondary Green",
          value: GAMEDEVS_COLORS.primaryDark,
          hex: "#619f2f",
          usage: "Hover states, emphasis",
        },
        {
          name: "Tertiary Green",
          value: GAMEDEVS_COLORS.primaryDarker,
          hex: "#518c1c",
          usage: "Dark accents, maximum contrast",
        },
      ],
    },
    {
      label: "Text Colors",
      colors: [
        {
          name: "Text Primary",
          value: GAMEDEVS_COLORS.text.primary,
          hex: "#4d4d4d",
          usage: "Body text, default readable color",
        },
        {
          name: "Text Accent",
          value: GAMEDEVS_COLORS.text.accent,
          hex: "#231f20",
          usage: "Headings, strong emphasis",
        },
        {
          name: "Text Contrast",
          value: GAMEDEVS_COLORS.text.contrast,
          hex: "#000000",
          usage: "Maximum contrast for critical elements",
        },
      ],
    },
    {
      label: "Background & Neutral",
      colors: [
        {
          name: "Background Light",
          value: GAMEDEVS_COLORS.background.light,
          hex: "#ffffff",
          usage: "White backgrounds",
        },
        {
          name: "Gray Neutral",
          value: GAMEDEVS_COLORS.background.neutral,
          hex: "#808080",
          usage: "Secondary elements",
        },
        {
          name: "Gray Muted",
          value: GAMEDEVS_COLORS.background.muted,
          hex: "#666666",
          usage: "Muted text, secondary information",
        },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-[#231f20]">
          GameDevs Design System
        </h1>
        <p className="mt-2 text-[#4d4d4d]">
          Color palette extracted from{" "}
          <code className="rounded bg-gray-100 px-2 py-1">
            GameDevs Branding.ai
          </code>
        </p>
        <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Design Validation:</strong> All colors verified against
            source AI file. Do not modify without explicit approval.
          </p>
        </div>
      </div>

      {colorGroups.map((group) => (
        <div key={group.label} className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-[#231f20]">
            {group.label}
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {group.colors.map((color) => (
              <div
                key={color.name}
                className="overflow-hidden rounded-lg border border-gray-200 shadow-sm"
              >
                <div
                  className="h-32 w-full"
                  style={{ backgroundColor: color.value }}
                />
                <div className="p-4">
                  <h3 className="font-semibold text-[#231f20]">
                    {color.name}
                  </h3>
                  <p className="mt-1 font-mono text-sm font-bold text-[#4d4d4d]">
                    {color.hex}
                  </p>
                  <p className="mt-3 text-xs text-[#666666]">{color.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-12 rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h2 className="text-lg font-bold text-blue-900">Implementation Guide</h2>
        <div className="mt-4 space-y-3 text-sm text-blue-800">
          <p>
            <strong>✓ Correct Usage:</strong>
          </p>
          <pre className="overflow-x-auto rounded bg-white p-3 text-xs">
            {`import { GAMEDEVS_COLORS } from "@/lib/gamedevs-tokens";

<div style={{ color: GAMEDEVS_COLORS.primary }}>
  GameDevs Content
</div>`}
          </pre>
          <p className="mt-3">
            <strong>✗ Incorrect Usage:</strong>
          </p>
          <pre className="overflow-x-auto rounded bg-white p-3 text-xs">
            {`// ❌ Hardcoded color
<div style={{ color: "#72b341" }}>...</div>

// ❌ Off-palette color
<div style={{ color: "#B339C4" }}>...</div>`}
          </pre>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-6">
        <h2 className="text-lg font-bold text-green-900">
          Validation Checklist
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-green-800">
          <li>✓ All colors from approved GameDevs palette</li>
          <li>✓ No hardcoded hex values (use tokens)</li>
          <li>✓ No GamER brand colors (#B339C4, #9E46AE, #833D90)</li>
          <li>✓ Proper font usage (AZONIX for headlines)</li>
          <li>✓ Typography follows branding guide</li>
          <li>✓ Contrast ratios meet accessibility standards</li>
          <li>✓ Layout mirrors approved design structure</li>
        </ul>
      </div>
    </div>
  );
}

export function GameDevsColorSwatchInline({ colorName, colorValue }: { colorName: string; colorValue: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-6 w-6 rounded border border-gray-300"
        style={{ backgroundColor: colorValue }}
        title={colorName}
      />
      <span className="text-sm font-mono">{colorValue}</span>
    </div>
  );
}

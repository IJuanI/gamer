import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // NOTE: Polo Tecnológico del Paraná has no officially confirmed brand
        // colors (see ../README.md). These blues are placeholders/estimates,
        // chosen to fit the "blue and white" identity described publicly.
        brand: {
          50: "#eef5fb",
          100: "#d6e6f5",
          500: "#1e5a96",
          600: "#184b7e",
          700: "#123a62",
          900: "#0b2540",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

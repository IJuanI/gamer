import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    // Unit tests only — Playwright owns e2e/visual under tests/e2e.
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    globals: true,
    reporters: ["default"],
  },
});

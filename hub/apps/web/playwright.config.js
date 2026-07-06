"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const WEB_PORT = 3100; // dedicated port so visual runs don't collide with `pnpm dev`
const BASE_URL = `http://localhost:${WEB_PORT}`;
/**
 * Visual regression for the GamER Hub frontend (es-AR).
 * Public pages (landing/login/register) snapshot standalone. The dashboard test
 * logs in against the API, so the full stack must be up for that spec:
 *   docker compose up -d  (or pnpm db:up && pnpm dev)
 */
exports.default = (0, test_1.defineConfig)({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: [
        ["html", { open: "never" }],
        ["list"],
        ["json", { outputFile: "test-results/results.json" }],
    ],
    use: {
        baseURL: BASE_URL,
        locale: "es-AR",
        timezoneId: "America/Argentina/Buenos_Aires",
        trace: "on-first-retry",
    },
    expect: {
        // Tolerate sub-pixel font/AA noise across machines.
        toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: "disabled" },
    },
    projects: [{ name: "chromium", use: { ...test_1.devices["Desktop Chrome"] } }],
    // Auto-managed dev server. Opt-in via PW_WEB_SERVER=1 (set in CI) — locally the
    // server is expected to already be running on WEB_PORT (`pnpm dev`/docker compose),
    // which is also what AI agents rely on. Enabling webServer without an already-up
    // server has been observed to make the runner exit 0 with no output in this env.
    ...(process.env.PW_WEB_SERVER
        ? {
            webServer: {
                command: `pnpm exec next dev --port ${WEB_PORT}`,
                url: BASE_URL,
                reuseExistingServer: !process.env.CI,
                timeout: 120_000,
                env: { NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000" },
            },
        }
        : {}),
});

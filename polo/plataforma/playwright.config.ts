import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
// Use 127.0.0.1 (not "localhost") to avoid Node's IPv6 (::1) resolution racing
// against a server bound on IPv4 — that mismatch makes the webServer URL poll
// hang until timeout even when the server is up.
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  // Snapshots (visual regression) live next to specs.
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{arg}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  // Deterministic rendering for visual regression.
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: "disabled" },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  // Serve on a dedicated test port. Direct invocation (no tee) so Playwright's
  // URL poller can detect readiness without buffering interference.
  webServer: {
    command: `npx next start -H 127.0.0.1 -p ${PORT}`,
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
  },
});

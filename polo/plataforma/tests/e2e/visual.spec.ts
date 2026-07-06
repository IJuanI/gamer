import { test, expect } from "@playwright/test";

// Visual regression — full-page screenshot snapshots of public pages.
// First run generates baselines under tests/e2e/__screenshots__.
// Run `npm run test:e2e:update` to refresh baselines intentionally.

const pages = [
  { name: "home", path: "/" },
  { name: "empresas", path: "/empresas" },
  { name: "ideas", path: "/ideas" },
  { name: "login", path: "/login" },
  { name: "register", path: "/register" },
];

for (const { name, path } of pages) {
  test(`visual: ${name}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
  });
}

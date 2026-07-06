import { test, expect } from "@playwright/test";

/** Visual regression for the public, unauthenticated pages. */

const pages = [
  { name: "landing", path: "/" },
  { name: "login", path: "/login" },
  { name: "register", path: "/register" },
];

for (const { name, path } of pages) {
  test(`${name} se ve consistente`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    // Fonts (Inter + AZONIX) must settle before snapshotting.
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
  });
}

test("la página está en español (es-AR)", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-AR");
});

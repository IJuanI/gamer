"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
/** Visual regression for the public, unauthenticated pages. */
const pages = [
    { name: "landing", path: "/" },
    { name: "login", path: "/login" },
    { name: "register", path: "/register" },
];
for (const { name, path } of pages) {
    (0, test_1.test)(`${name} se ve consistente`, async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        // Fonts (Inter + AZONIX) must settle before snapshotting.
        await page.evaluate(() => document.fonts.ready);
        await (0, test_1.expect)(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
    });
}
(0, test_1.test)("la página está en español (es-AR)", async ({ page }) => {
    await page.goto("/");
    await (0, test_1.expect)(page.locator("html")).toHaveAttribute("lang", "es-AR");
});

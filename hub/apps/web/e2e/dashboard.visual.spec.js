"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
/**
 * Authenticated dashboard snapshot. Requires the API + DB running with the seed
 * users. If the API isn't reachable, the login call fails and the test is
 * skipped rather than failing the whole visual suite.
 */
(0, test_1.test)("dashboard de un ADMIN se ve consistente", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("admin@gamer.net.ar");
    await page.getByLabel(/contraseña/i).fill("admin1234");
    const loginResponse = page.waitForResponse((r) => r.url().includes("/auth/login"), { timeout: 10_000 });
    await page.getByRole("button", { name: /ingresar|iniciar/i }).click();
    let status;
    try {
        status = (await loginResponse).status();
    }
    catch {
        test_1.test.skip(true, "API no disponible — levantá el stack para la prueba del dashboard");
        return;
    }
    test_1.test.skip(status >= 400, `login devolvió ${status} — verificá el seed de la base`);
    await page.waitForURL(/\/dashboard/, { timeout: 10_000 });
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    await (0, test_1.expect)(page).toHaveScreenshot("dashboard-admin.png", { fullPage: true });
});

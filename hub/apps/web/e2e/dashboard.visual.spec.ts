import { test, expect } from "@playwright/test";

/**
 * Authenticated dashboard snapshot. Requires the API + DB running with the seed
 * users. If the API isn't reachable, the login call fails and the test is
 * skipped rather than failing the whole visual suite.
 */
test("dashboard de un ADMIN se ve consistente", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill("admin@gamer.net.ar");
  await page.getByLabel(/contraseña/i).fill("admin1234");

  const loginResponse = page.waitForResponse(
    (r) => r.url().includes("/auth/login"),
    { timeout: 10_000 },
  );
  await page.getByRole("button", { name: /ingresar|iniciar/i }).click();

  let status: number;
  try {
    status = (await loginResponse).status();
  } catch {
    test.skip(true, "API no disponible — levantá el stack para la prueba del dashboard");
    return;
  }
  test.skip(status >= 400, `login devolvió ${status} — verificá el seed de la base`);

  await page.waitForURL(/\/dashboard/, { timeout: 10_000 });
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot("dashboard-admin.png", { fullPage: true });
});

import { test, expect } from "@playwright/test";

// Public discovery flows — no authentication required.
test.describe("Discovery (no login)", () => {
  test("home shows hero and stats", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /ecosistema tecnológico/i })
    ).toBeVisible();
    await expect(page.getByText(/Empresas publicadas/i)).toBeVisible();
  });

  test("can browse empresas directory without login", async ({ page }) => {
    await page.goto("/empresas");
    await expect(page.getByRole("heading", { name: "Empresas" })).toBeVisible();
    await expect(page.getByText("DevRía")).toBeVisible();
    await expect(page.getByText("Data Litoral")).toBeVisible();
  });

  test("can open an empresa detail page", async ({ page }) => {
    await page.goto("/empresas/devria");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("heading", { name: "DevRía" })
    ).toBeVisible();
    await expect(page.getByText(/integrantes/i)).toBeVisible();
  });

  test("search filters the directory", async ({ page }) => {
    await page.goto("/empresas?q=IoT");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Río IoT")).toBeVisible();
    await expect(page.getByText("DevRía")).toHaveCount(0);
  });

  test("can view published ideas without login", async ({ page }) => {
    await page.goto("/ideas");
    await expect(
      page.getByRole("heading", { name: /Ideas publicadas/i })
    ).toBeVisible();
    await expect(page.getByText(/Ingresá para publicar/i)).toBeVisible();
  });
});

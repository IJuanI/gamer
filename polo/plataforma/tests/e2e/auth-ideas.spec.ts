import { test, expect } from "@playwright/test";

// Authenticated flows: register, login, post an idea, claim an idea.

test("register a new persona and reach panel", async ({ page }) => {
  // Unique email per run so the seeded DB stays usable across reruns.
  const email = `nuevo-${Date.now()}@polo.test`;
  await page.goto("/register");
  await page.getByLabel("Nombre").fill("Persona Nueva");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contraseña").fill("password123");
  await page.getByRole("button", { name: "Crear cuenta" }).click();

  await expect(page).toHaveURL(/\/panel/);
  await expect(page.getByText(/Hola, Persona Nueva/)).toBeVisible();
  // A brand-new account is a persona but belongs to no empresa.
  await expect(page.getByText(/No pertenecés a ninguna empresa/i)).toBeVisible();
});

test("login as persona and publish an idea", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("caro@polo.test");
  await page.getByLabel("Contraseña").fill("password123");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/panel/);

  await page.goto("/ideas/nueva");
  const title = `Idea de prueba ${Date.now()}`;
  await page.getByLabel("Título").fill(title);
  await page
    .getByLabel("Descripción")
    .fill("Una descripción suficientemente larga para pasar validación.");
  await page.getByRole("button", { name: "Publicar idea" }).click();

  await expect(page).toHaveURL(/\/ideas$/);
  await expect(page.getByText(title)).toBeVisible();
});

test("empresa member can claim an idea", async ({ page }) => {
  // Beto owns Río IoT and can claim ideas on its behalf.
  await page.goto("/login");
  await page.getByLabel("Email").fill("beto@polo.test");
  await page.getByLabel("Contraseña").fill("password123");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/panel/);

  await page.goto("/ideas");
  await page.getByText(/Sensor de humedad/i).click();
  // The claim form is visible because Beto belongs to an empresa.
  await expect(
    page.getByRole("heading", { name: /Tomar esta idea/i })
  ).toBeVisible();
  await page.getByRole("button", { name: "Tomar idea" }).click();

  await expect(page.getByText(/Río IoT/)).toBeVisible();
});

test("logged-in persona without empresa cannot claim", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("caro@polo.test");
  await page.getByLabel("Contraseña").fill("password123");
  await page.getByRole("button", { name: "Ingresar" }).click();

  await page.goto("/ideas");
  await page.getByText(/App para gestionar turnos/i).click();
  await expect(
    page.getByText(/Para tomar ideas necesitás pertenecer a una empresa/i)
  ).toBeVisible();
});

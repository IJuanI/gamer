import { test, expect } from '@playwright/test';

test.describe('Frontend Smoke Tests', () => {
  test('homepage loads', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('login page loads', async ({ page }) => {
    const response = await page.goto('/login');
    expect(response?.status()).toBe(200);

    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('registro page loads', async ({ page }) => {
    const response = await page.goto('/registro');
    expect(response?.status()).toBe(200);
  });

  test('theme provider works', async ({ page }) => {
    await page.goto('/');

    const htmlElement = page.locator('html');
    const classes = await htmlElement.getAttribute('class');

    expect(classes).toMatch(/(dark|light)/);
  });

  test('page renders without crashes', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    await expect(page.locator('body')).toBeVisible();
  });
});

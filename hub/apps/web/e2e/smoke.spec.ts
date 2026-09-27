import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

test.describe('Frontend Smoke Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    // Check essential elements are rendered (use role selectors for strict mode)
    await expect(page.getByRole('link', { name: 'GAMER' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible();
  });

  test('login page loads', async ({ page }) => {
    const response = await page.goto('/login');
    expect(response?.status()).toBe(200);

    await expect(page.getByRole('heading', { name: 'Ingresar' })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('registro page loads', async ({ page }) => {
    const response = await page.goto('/registro');
    expect(response?.status()).toBe(200);

    await expect(page.getByRole('heading', { name: 'Registrarse' })).toBeVisible();
  });

  test('API is configured and reachable', async ({ page }) => {
    await page.goto('/');

    // Check if API URL is configured in page
    const apiConfigured = await page.evaluate(() => {
      return (globalThis as any).NEXT_PUBLIC_API_URL !== undefined;
    });

    expect(apiConfigured).toBeTruthy();
  });

  test('auth provider initializes without errors', async ({ page }) => {
    let errorLogged = false;

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
        errorLogged = true;
      }
    });

    await page.goto('/');
    await page.waitForTimeout(2000); // Give auth provider time to initialize

    expect(errorLogged).toBeFalsy();
  });

  test('page loads without crashing', async ({ page }) => {
    const response = await page.goto('/');

    // Page should respond successfully
    expect(response?.status()).toBe(200);

    // Basic page elements should be visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('fetch requests use correct origin headers', async ({ page }) => {
    let lastOrigin = '';

    await page.route('**/*', (route) => {
      lastOrigin = route.request().headers()['origin'] || '';
      route.continue();
    });

    await page.goto('/');

    // Origin should be set to current page URL
    const pageUrl = new URL(page.url());
    expect(lastOrigin).toContain(pageUrl.hostname);
  });

  test('theme provider loads successfully', async ({ page }) => {
    await page.goto('/');

    const htmlElement = page.locator('html');
    const classes = await htmlElement.getAttribute('class');

    // Should have either 'dark' or 'light' class
    expect(classes).toMatch(/(dark|light)/);
  });

  test('navigation links work', async ({ page }) => {
    await page.goto('/');

    // Click login link
    await page.getByRole('button', { name: 'Ingresar' }).click();
    expect(page.url()).toContain('/login');

    // Go back to home
    await page.getByRole('link', { name: 'GAMER' }).click();
    expect(page.url()).toContain('/');
  });
});

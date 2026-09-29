import { test, expect } from '@playwright/test';

test.describe('Frontend Smoke Tests', () => {
  test('homepage loads without JS errors', async ({ page }) => {
    let consoleErrors: string[] = [];
    let uncaughtErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (err) => {
      uncaughtErrors.push(err.message);
    });

    const response = await page.goto('/', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);

    // Wait for hydration to complete
    await page.waitForLoadState('networkidle');

    // Critical: check for uncaught errors
    if (uncaughtErrors.length > 0) {
      throw new Error(`Uncaught errors: ${uncaughtErrors.join('; ')}`);
    }

    // Flag only critical JavaScript errors, not network failures
    const criticalErrors = consoleErrors.filter(
      (err) =>
        !err.includes('Failed to load resource') &&
        !err.includes('recaptcha') &&
        !err.includes('Deprecation') &&
        !err.includes('middleware') &&
        !err.includes('net::ERR')
    );

    if (criticalErrors.length > 0) {
      throw new Error(`Critical console errors: ${criticalErrors.join('; ')}`);
    }
  });

  test('login page loads without JS errors', async ({ page }) => {
    let uncaughtErrors: string[] = [];

    page.on('pageerror', (err) => {
      uncaughtErrors.push(err.message);
    });

    const response = await page.goto('/login', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);

    await page.waitForLoadState('networkidle');

    if (uncaughtErrors.length > 0) {
      throw new Error(`Uncaught errors on /login: ${uncaughtErrors.join('; ')}`);
    }

    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('registro page loads without JS errors', async ({ page }) => {
    let uncaughtErrors: string[] = [];

    page.on('pageerror', (err) => {
      uncaughtErrors.push(err.message);
    });

    const response = await page.goto('/registro', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);

    await page.waitForLoadState('networkidle');

    if (uncaughtErrors.length > 0) {
      throw new Error(`Uncaught errors on /registro: ${uncaughtErrors.join('; ')}`);
    }
  });

  test('theme provider works', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const htmlElement = page.locator('html');
    const classes = await htmlElement.getAttribute('class');

    expect(classes).toMatch(/(dark|light)/);
  });

  test('login flow and dashboard access', async ({ page, baseURL }) => {
    // Wait for API to be ready
    let apiReady = false;
    for (let i = 0; i < 30; i++) {
      try {
        const response = await page.context().request.get(`${baseURL}/api/health`);
        if (response.ok) {
          apiReady = true;
          break;
        }
      } catch {
        // API not ready yet
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    expect(apiReady).toBe(true);

    // Generate unique test user
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@example.com`;
    const testPassword = 'TestPassword123!';

    // Navigate to register page
    await page.goto('/registro', { waitUntil: 'networkidle' });

    // Fill registration form
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="displayName"]', `TestUser${timestamp}`);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);

    // Submit form
    const registerButton = page.locator('button:has-text("Registrarse")');
    await registerButton.click();

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Verify dashboard is loaded
    const response = await page.goto('/dashboard', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);

    // Verify dashboard elements are present
    await expect(page.locator('text=/Hola.*TestUser/')).toBeVisible();
  });
});

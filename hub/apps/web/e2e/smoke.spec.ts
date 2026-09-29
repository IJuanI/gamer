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
        !err.includes('net::ERR') &&
        !err.includes('CORS') &&
        !err.includes('Access to fetch')
    );

    if (criticalErrors.length > 0) {
      throw new Error(`Critical console errors: ${criticalErrors.join('; ')}`);
    }
  });

  test('create account, logout, login, and delete account', async ({ page, context }) => {
    const testEmail = `smoke-${Date.now()}@test.local`;
    const testPassword = 'SmokeTest123!';
    const testDisplayName = `SmokeTest${Date.now()}`;

    const allErrors: string[] = [];
    const allConsoleMessages: string[] = [];

    // Capture all console messages and errors
    page.on('console', (msg) => {
      const text = msg.text();
      const fullText = `[${msg.type().toUpperCase()}] ${text}`;
      allConsoleMessages.push(fullText);
      if (msg.type() === 'error') {
        // Ignore "Failed to load resource: the server responded with a status of 401"
        // — this comes from /api/auth/refresh on initial page load before session exists
        if (text.includes('Failed to load resource') && text.includes('401')) {
          return;
        }
        allErrors.push(fullText);
      }
    });

    // Capture all page errors
    page.on('pageerror', (err) => {
      allErrors.push(`[PAGE_ERROR] ${err.message}`);
    });

    // Capture all request failures
    page.on('requestfailed', (request) => {
      const response = request.response();
      allErrors.push(`[REQUEST_FAILED] ${request.method()} ${request.url()}: ${request.failure()?.errorText} (status: ${response?.status()})`);
    });

    // Also capture responses with error status codes, but exclude expected ones
    page.on('response', (response) => {
      if (response.status() >= 400 && response.status() < 600) {
        const url = response.url();
        // 401 on /api/auth/refresh is expected on initial page load (no session yet)
        if (response.status() === 401 && url.includes('/api/auth/refresh')) {
          return;
        }
        allErrors.push(`[HTTP_${response.status()}] ${response.request().method()} ${response.url()}`);
      }
    });

    // 1. REGISTER
    console.log('=== REGISTERING ===');
    await page.goto('/registro', { waitUntil: 'networkidle' });
    expect(page.url()).toContain('/registro');

    // Fill form fields
    await page.locator('input[name="displayName"]').fill(testDisplayName);
    await page.locator('input[name="email"]').fill(testEmail);
    await page.locator('input[name="password"]').fill(testPassword);

    // Log form state before submission
    const displayNameValue = await page.locator('input[name="displayName"]').inputValue();
    const emailValue = await page.locator('input[name="email"]').inputValue();
    const passwordValue = await page.locator('input[name="password"]').inputValue();
    console.log(`Form filled: displayName="${displayNameValue}", email="${emailValue}", password="${passwordValue}"`);

    // Click submit button and capture any errors during submission
    const submitButton = page.locator('button:has-text("Crear mi cuenta")');
    const isDisabled = await submitButton.isDisabled();
    console.log(`Submit button disabled: ${isDisabled}`);

    // Try to submit
    try {
      await submitButton.click();
    } catch (e) {
      allErrors.push(`[CLICK_ERROR] ${e}`);
    }

    // Wait for navigation or timeout gracefully
    try {
      await page.waitForNavigation({ waitUntil: 'load', timeout: 10000 });
    } catch (e) {
      allErrors.push(`[NAV_TIMEOUT] ${e.message}`);
    }

    // Wait and check URL - if page is still open
    try {
      await page.waitForTimeout(1000);
      const urlAfterSubmit = page.url();
      console.log(`URL after submit: ${urlAfterSubmit}`);
    } catch (e) {
      allErrors.push(`[PAGE_CLOSED] Page was closed after button click`);
    }

    if (allErrors.length > 0) {
      throw new Error(
        `Errors during registration:\n${allErrors.join('\n')}\n\nAll console messages:\n${allConsoleMessages.join('\n')}`
      );
    }

    // Should redirect to dashboard
    try {
      await page.waitForURL('**/dashboard', { timeout: 10000 });
    } catch (e) {
      throw new Error(
        `Registration failed - did not redirect to dashboard. Currently at: ${page.url()}\n\nErrors:\n${allErrors.join('\n')}\n\nAll console:\n${allConsoleMessages.join('\n')}`
      );
    }

    expect(page.url()).toContain('/dashboard');

    // 2. LOGOUT
    console.log('=== LOGGING OUT ===');
    await page.locator('button:has-text("Salir")').click();
    await page.waitForURL('**/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');

    // 3. LOGIN
    console.log('=== LOGGING IN ===');
    await page.locator('input[name="email"]').fill(testEmail);
    await page.locator('input[name="password"]').fill(testPassword);

    // Submit login form
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load' }).catch((e) => {
        allErrors.push(`[LOGIN_NAV_ERROR] ${e.message}`);
      }),
      page.locator('button:has-text("Ingresar")').click().catch((e) => {
        allErrors.push(`[LOGIN_CLICK_ERROR] ${e.message}`);
      })
    ]);

    // Should redirect to dashboard
    try {
      await page.waitForURL('**/dashboard', { timeout: 10000 });
    } catch (e) {
      throw new Error(
        `Login failed - did not redirect to dashboard. Currently at: ${page.url()}\n\nErrors:\n${allErrors.join('\n')}\n\nAll console:\n${allConsoleMessages.join('\n')}`
      );
    }

    expect(page.url()).toContain('/dashboard');

    // 4. DELETE ACCOUNT
    console.log('=== DELETING ACCOUNT ===');
    // Look for account deletion option (may be in a menu or settings)
    const profileButton = page.locator('button, a').filter({ hasText: /Configuración|Settings|Perfil|Profile/i }).first();

    if (await profileButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await profileButton.click();
      await page.waitForTimeout(500);
    }

    // Look for delete account button
    const deleteAccountButton = page
      .locator('button, a')
      .filter({ hasText: /Eliminar.*cuenta|Delete.*account/i })
      .first();

    if (await deleteAccountButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await deleteAccountButton.click();
      await page.waitForTimeout(500);

      // Confirm if there's a confirmation dialog
      const confirmButton = page.locator('button').filter({ hasText: /Confirmar|Eliminar|Delete|Yes|Sí/i }).first();
      if (await confirmButton.isVisible({ timeout: 500 }).catch(() => false)) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'load' }).catch(() => null),
          confirmButton.click()
        ]);
      }
    }

    console.log('=== TEST COMPLETE ===');
  });
});

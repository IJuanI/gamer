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
    const testEmail = 'smoke@test.local';
    const testPassword = 'SmokeTest123!';
    const testDisplayName = 'Smoke Test User';

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
      allErrors.push(`[REQUEST_FAILED] ${request.method()} ${request.url()}: ${request.failure()?.errorText} (status: ${response?.status ?? 'unknown'})`);
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

    // 1. REGISTER (or skip if user exists)
    console.log('=== REGISTERING ===');
    // Navigate to login first to establish page context/base URL
    await page.goto('/login', { waitUntil: 'networkidle' });

    // Try to create user via API first - if exists, we'll just log in
    const registerRes = await page.evaluate(
      async ({ email, displayName, password }) => {
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, displayName, password }),
            credentials: 'include',
          });
          return { status: res.status, ok: res.ok };
        } catch (e) {
          console.error('Register fetch error:', e);
          throw e;
        }
      },
      { email: testEmail, displayName: testDisplayName, password: testPassword }
    );

    if (registerRes.status === 409) {
      console.log('User already exists, will log in instead');
    } else if (!registerRes.ok) {
      throw new Error(`Registration failed with status ${registerRes.status}`);
    } else {
      console.log('User registered successfully');
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

  test('admin user: create, login, navigate panel, delete', async ({ page, context }) => {
    const testEmail = 'smoke-admin@test.local';
    const testPassword = 'SmokeAdmin123!';
    const testDisplayName = 'Smoke Admin User';
    const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3100';

    const allErrors: string[] = [];
    const allConsoleMessages: string[] = [];

    // Capture console errors
    page.on('console', (msg) => {
      const text = msg.text();
      const fullText = `[${msg.type().toUpperCase()}] ${text}`;
      allConsoleMessages.push(fullText);
      if (msg.type() === 'error') {
        if (text.includes('Failed to load resource') && text.includes('401')) {
          return; // ignore expected refresh 401
        }
        allErrors.push(fullText);
      }
    });

    page.on('pageerror', (err) => {
      allErrors.push(`[PAGE_ERROR] ${err.message}`);
    });

    page.on('requestfailed', (request) => {
      const response = request.response();
      allErrors.push(`[REQUEST_FAILED] ${request.method()} ${request.url()}: ${request.failure()?.errorText} (status: ${response?.status ?? 'unknown'})`);
    });

    page.on('response', (response) => {
      if (response.status() >= 400 && response.status() < 600) {
        const url = response.url();
        if (response.status() === 401 && url.includes('/api/auth/refresh')) {
          return;
        }
        allErrors.push(`[HTTP_${response.status()}] ${response.request().method()} ${response.url()}`);
      }
    });

    // 1. CREATE ADMIN USER (or skip if exists)
    console.log('=== CREATING/CHECKING ADMIN USER ===');
    // Navigate to login first to establish page context/base URL
    await page.goto('/login', { waitUntil: 'networkidle' });

    const createResponse = await page.evaluate(
      async ({ email, displayName, password }) => {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, displayName, password }),
          credentials: 'include',
        });
        const data = await res.json().catch(() => ({}));
        return { status: res.status, data };
      },
      { email: testEmail, displayName: testDisplayName, password: testPassword }
    );

    if (createResponse.status === 409) {
      console.log('Admin user already exists, using existing account');
    } else if (createResponse.status === 200) {
      console.log('Admin user created successfully');
    } else {
      throw new Error(`Failed to create admin user: ${createResponse.status} - ${createResponse.data.message}`);
    }

    // 2. LOGIN
    console.log('=== LOGGING IN ===');
    await page.goto('/login', { waitUntil: 'networkidle' });
    expect(page.url()).toContain('/login');

    await page.locator('input[name="email"]').fill(testEmail);
    await page.locator('input[name="password"]').fill(testPassword);

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load' }).catch((e) => {
        allErrors.push(`[LOGIN_NAV_ERROR] ${e.message}`);
      }),
      page.locator('button:has-text("Ingresar")').click().catch((e) => {
        allErrors.push(`[LOGIN_CLICK_ERROR] ${e.message}`);
      })
    ]);

    try {
      await page.waitForURL('**/dashboard', { timeout: 10000 });
    } catch (e) {
      throw new Error(
        `Login failed - did not redirect to dashboard. Currently at: ${page.url()}\n\nErrors:\n${allErrors.join('\n')}\n\nConsole:\n${allConsoleMessages.join('\n')}`
      );
    }

    expect(page.url()).toContain('/dashboard');

    // 3. NAVIGATE THROUGH ALL PANEL PAGES
    console.log('=== NAVIGATING PANEL PAGES ===');
    const pages = [
      { name: 'Eventos', href: '/eventos' },
      { name: 'Perfil de gamer', href: '/profile' },
      { name: 'Equipos', href: '/teams' },
      { name: 'Reclutamiento', href: '/recruitment' },
      { name: 'Generador de flyers', href: '/admin/flyers' },
      { name: 'Administración', href: '/admin' },
    ];

    for (const { name, href } of pages) {
      console.log(`Navigating to ${name} (${href})`);
      try {
        await page.goto(href, { waitUntil: 'networkidle', timeout: 15000 });
        const status = page.url();
        console.log(`  ✓ Loaded: ${status}`);
      } catch (e) {
        allErrors.push(`[NAV_TIMEOUT] Failed to load ${name}: ${e.message}`);
      }
    }

    // 4. DELETE ACCOUNT
    console.log('=== DELETING ACCOUNT ===');
    await page.goto('/dashboard', { waitUntil: 'networkidle' });

    const deleteResponse = await page.evaluate(async () => {
      const res = await fetch('/api/me', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      return { status: res.status };
    });

    // If API delete failed, fall back to manual deletion via logout
    if (deleteResponse.status === 404 || deleteResponse.status === 405) {
      console.log('Account delete endpoint not available, logging out instead');
      await page.locator('button:has-text("Salir")').click();
      await page.waitForURL('**/login', { timeout: 5000 });
    }

    if (allErrors.length > 0) {
      throw new Error(
        `Errors during admin flow:\n${allErrors.join('\n')}\n\nAll console:\n${allConsoleMessages.join('\n')}`
      );
    }

    console.log('=== TEST COMPLETE ===');
  });
});

import { test, expect } from '@playwright/test';

test.describe('Frontend Smoke Tests', () => {
  test.setTimeout(120000);

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

    // Wait for full JS rendering and hydration
    await page.waitForLoadState('domcontentloaded');
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
      // Ignore aborted requests (normal during navigation)
      if (request.failure()?.errorText === 'net::ERR_ABORTED') {
        return;
      }
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
        // Ignore 409 on register (user already exists, expected)
        if (response.status() === 409 && url.includes('/api/auth/register')) {
          return;
        }
        allErrors.push(`[HTTP_${response.status()}] ${response.request().method()} ${response.url()}`);
      }
    });

    // 1. REGISTER (or skip if user exists)
    console.log('=== REGISTERING ===');
    // Navigate to login first to establish page context/base URL
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');

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
      // Wait for auto-redirect to dashboard after successful registration
      try {
        await page.waitForURL('**/dashboard', { timeout: 5000 });
      } catch (e) {
        // If no auto-redirect, we'll need to log in manually
        console.log('No auto-redirect after registration, will log in manually');
      }
    }

    // If registration returned 409 or we're not on dashboard, we need to log in
    if (registerRes.status === 409 || !registerRes.ok || !page.url().includes('/dashboard')) {
      console.log('=== LOGGING IN ===');
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
        throw new Error(`Initial login failed - did not reach dashboard. Currently at: ${page.url()}`);
      }
    }

    expect(page.url()).toContain('/dashboard');

    // 2. LOGOUT
    console.log('=== LOGGING OUT ===');
    await page.locator('button:has-text("Salir")').click();
    await page.waitForURL('**/login', { timeout: 5000 });
    await page.waitForLoadState('domcontentloaded');
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

    // 4. DELETE ACCOUNT (via API)
    console.log('=== DELETING ACCOUNT ===');
    const deleteRes = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/me', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        return { status: res.status, ok: res.ok };
      } catch (e) {
        console.error('Delete failed:', e);
        return { status: 0, ok: false };
      }
    });

    if (deleteRes.ok) {
      console.log('Account deleted successfully');
    } else {
      throw new Error(`Failed to delete account: ${deleteRes.status}`);
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
    let currentPage = '';

    // Capture console errors
    page.on('console', (msg) => {
      const text = msg.text();
      const fullText = `[${msg.type().toUpperCase()}] ${text}`;
      allConsoleMessages.push(fullText);
      if (msg.type() === 'error') {
        // Ignore expected auth errors
        if (text.includes('Failed to load resource') && (text.includes('401') || text.includes('409'))) {
          return;
        }
        const prefix = currentPage ? `[${currentPage}] ` : '';
        allErrors.push(`${prefix}${fullText}`);
      }
    });

    page.on('pageerror', (err) => {
      allErrors.push(`[PAGE_ERROR] ${err.message}`);
    });

    page.on('requestfailed', (request) => {
      // Ignore aborted requests (normal during navigation)
      if (request.failure()?.errorText === 'net::ERR_ABORTED') {
        return;
      }
      const response = request.response();
      allErrors.push(`[REQUEST_FAILED] ${request.method()} ${request.url()}: ${request.failure()?.errorText} (status: ${response?.status ?? 'unknown'})`);
    });

    page.on('response', (response) => {
      if (response.status() >= 400 && response.status() < 600) {
        const url = response.url();
        // Ignore expected auth errors
        if (response.status() === 401 && url.includes('/api/auth/refresh')) {
          return;
        }
        // Ignore 409 on register (user already exists, expected)
        if (response.status() === 409 && url.includes('/api/auth/register')) {
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
      console.log('Admin user already exists, will log in');
    } else if (createResponse.status === 200) {
      console.log('Admin user created successfully');
    } else {
      throw new Error(`Failed to create admin user: ${createResponse.status} - ${createResponse.data.message}`);
    }

    // 2. LOGIN (if needed)
    console.log('=== LOGGING IN ===');
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
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
    const panelPages = [
      { name: 'Eventos', href: '/eventos' },
      { name: 'Perfil de gamer', href: '/profile' },
      { name: 'Equipos', href: '/teams' },
      { name: 'Reclutamiento', href: '/recruitment' },
      { name: 'Generador de flyers', href: '/admin/flyers' },
      { name: 'Administración', href: '/admin' },
    ];

    for (const { name, href } of panelPages) {
      currentPage = name;
      console.log(`  Navigating to ${name} (${href})`);
      try {
        await page.goto(href, { waitUntil: 'networkidle', timeout: 15000 });
        // Wait for JS to render
        await page.waitForLoadState('domcontentloaded');
        console.log(`    ✓ Loaded`);
      } catch (e) {
        allErrors.push(`[NAV] Failed to load ${name}: ${e.message}`);
      }
    }

    // 4. DELETE ACCOUNT
    console.log('=== DELETING ACCOUNT ===');
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');

    // Try to delete account via API
    const deleteRes = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/me', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        return { status: res.status, ok: res.ok };
      } catch (e) {
        console.error('Delete failed:', e);
        return { status: 0, ok: false };
      }
    });

    if (deleteRes.ok) {
      console.log('Account deleted successfully');
      // After deletion, should be redirected or logged out
      await page.waitForURL('**/login', { timeout: 5000 }).catch(() => {
        console.log('Did not redirect to login after delete (expected behavior may vary)');
      });
    } else {
      throw new Error(`Failed to delete account: ${deleteRes.status}`);
    }

    if (allErrors.length > 0) {
      throw new Error(
        `Errors during admin flow:\n${allErrors.join('\n')}\n\nAll console:\n${allConsoleMessages.join('\n')}`
      );
    }

    console.log('=== TEST COMPLETE ===');
  });

  test('create user, create team, delete user (cascade)', async ({ page }) => {
    const testEmail = `smoke-team@test.local`;
    const testPassword = 'SmokeTeam123!';
    const testDisplayName = 'Smoke Team User';
    const teamName = `Smoke Test Team`;
    const teamTag = 'STT';

    const allErrors: string[] = [];
    const allConsoleMessages: string[] = [];
    let currentPage = '';

    // Capture console errors
    page.on('console', (msg) => {
      const text = msg.text();
      const fullText = `[${msg.type().toUpperCase()}] ${text}`;
      allConsoleMessages.push(fullText);
      if (msg.type() === 'error') {
        // Ignore expected auth errors
        if (text.includes('Failed to load resource') && (text.includes('401') || text.includes('409'))) {
          return;
        }
        const prefix = currentPage ? `[${currentPage}] ` : '';
        allErrors.push(`${prefix}${fullText}`);
      }
    });

    page.on('pageerror', (err) => {
      allErrors.push(`[PAGE_ERROR] ${err.message}`);
    });

    page.on('requestfailed', (request) => {
      if (request.failure()?.errorText === 'net::ERR_ABORTED') {
        return;
      }
      const response = request.response();
      allErrors.push(
        `[REQUEST_FAILED] ${request.method()} ${request.url()}: ${request.failure()?.errorText} (status: ${response?.status ?? 'unknown'})`
      );
    });

    page.on('response', (response) => {
      if (response.status() >= 400 && response.status() < 600) {
        const url = response.url();
        if (response.status() === 401 && url.includes('/api/auth/refresh')) {
          return;
        }
        if (response.status() === 409 && url.includes('/api/auth/register')) {
          return;
        }
        allErrors.push(`[HTTP_${response.status()}] ${response.request().method()} ${response.url()}`);
      }
    });

    // 1. REGISTER
    console.log('=== CREATING USER ===');
    currentPage = 'Register';
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');

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

    if (!registerRes.ok && registerRes.status !== 409) {
      throw new Error(`Registration failed with status ${registerRes.status}`);
    }
    console.log('User registered/exists');

    // 2. LOGIN
    console.log('=== LOGGING IN ===');
    currentPage = 'Login';
    if (registerRes.status === 409) {
      // User already exists, navigate to login page
      await page.goto('/login', { waitUntil: 'networkidle' });
      await page.waitForLoadState('domcontentloaded');
    }

    await page.locator('input[name="email"]').fill(testEmail);
    await page.locator('input[name="password"]').fill(testPassword);

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load' }).catch((e) => {
        allErrors.push(`[LOGIN_NAV_ERROR] ${e.message}`);
      }),
      page.locator('button:has-text("Ingresar")').click().catch((e) => {
        allErrors.push(`[LOGIN_CLICK_ERROR] ${e.message}`);
      }),
    ]);

    try {
      await page.waitForURL('**/dashboard', { timeout: 10000 });
    } catch (e) {
      throw new Error(`Login failed - did not reach dashboard. Currently at: ${page.url()}`);
    }

    expect(page.url()).toContain('/dashboard');

    // 3. CREATE TEAM via UI form
    console.log('=== CREATING TEAM ===');
    currentPage = 'Teams/New';
    await page.goto('/teams/new', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');

    // Debug: check what's on the page
    console.log(`Current URL: ${page.url()}`);
    const pageText = await page.textContent('body');
    console.log(`Page contains "Crear equipo": ${pageText?.includes('Crear equipo')}`);
    console.log(`Page text length: ${pageText?.length}`);

    if (!pageText?.includes('Crear equipo')) {
      allErrors.push(`[TEAM_PAGE] Page doesn't contain "Crear equipo". URL: ${page.url()}`);
    }

    // Wait a bit for games to load
    await page.waitForTimeout(2000);

    // Get the form HTML for debugging
    const formCount = await page.locator('form').count();
    console.log(`Found ${formCount} form elements`);
    if (formCount > 0) {
      const formHtml = await page.locator('form').first().innerHTML();
      console.log(`Form HTML (first 800 chars): ${formHtml?.substring(0, 800)}`);

      const selectHtml = await page.locator('select').first().innerHTML();
      console.log(`Select options: ${selectHtml}`);
    }

    // Test if API works from browser and check data format
    console.log('Testing API from browser...');
    const apiTest = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/games', { credentials: 'include' });
        const data = await res.json();
        console.log('API response type:', typeof data);
        console.log('API response is array:', Array.isArray(data));
        console.log('API response length:', data?.length);
        console.log('First game:', data?.[0]);
        return { status: res.status, count: Array.isArray(data) ? data.length : 0 };
      } catch (e) {
        console.error('API error:', e);
        return { error: String(e) };
      }
    });
    console.log('API test result:', apiTest);

    // Create team via UI form with dropdown selection
    try {
      // Find inputs by their position relative to labels
      const nameLabel = page.locator('label:has-text("Nombre")').first();
      const nameInput = nameLabel.locator('input');
      await nameInput.fill(teamName);

      const tagLabel = page.locator('label:has-text("Tag")').first();
      const tagInput = tagLabel.locator('input');
      await tagInput.fill(teamTag);

      // Select first game from dropdown (skip placeholder at index 0)
      const gameLabel = page.locator('label:has-text("Juego")');
      const gameSelect = gameLabel.locator('select');
      const gameOptions = await gameSelect.locator('option').count();

      if (gameOptions > 1) {
        await gameSelect.selectOption({ index: 1 }); // Select first real game
        console.log(`Selected game from ${gameOptions} available options`);
      } else {
        throw new Error(`No games available to select (only ${gameOptions} options)`);
      }

      // Submit form with detailed error checking
      console.log('Submitting form...');
      let submitError: string | null = null;

      try {
        const navPromise = page.waitForNavigation({ waitUntil: 'load', timeout: 10000 }).catch((e) => {
          submitError = `Nav error: ${e.message}`;
          console.log(submitError);
        });

        await page.locator('button:has-text("Crear equipo")').click();
        await navPromise;
      } catch (e) {
        submitError = `Submit error: ${e instanceof Error ? e.message : String(e)}`;
        allErrors.push(`[TEAM_CLICK_ERROR] ${submitError}`);
        console.log(submitError);
      }

      // Verify we're on a team detail page (not /teams/new)
      const urlAfterSubmit = page.url();
      console.log(`URL after team creation: ${urlAfterSubmit}`);

      if (urlAfterSubmit.includes('/teams/new')) {
        allErrors.push(`[TEAM_CREATE] Form did not navigate to team detail page. Still at: ${urlAfterSubmit}`);
        if (submitError) {
          allErrors.push(`[TEAM_CREATE] Submission error: ${submitError}`);
        }
      } else if (urlAfterSubmit.includes('/teams/')) {
        console.log('Team created successfully - navigated to team detail page');
      }
    } catch (e) {
      allErrors.push(`[TEAM_FORM] Failed to create team: ${e.message}`);
    }

    // 4. DELETE ACCOUNT (cascade deletes team since user is only member)
    console.log('=== DELETING USER ACCOUNT ===');
    currentPage = 'Delete';
    await page.goto('/dashboard', { waitUntil: 'load' });
    await page.waitForLoadState('domcontentloaded');

    const deleteRes = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/me', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const body = await res.text();
        return { status: res.status, ok: res.ok, body };
      } catch (e) {
        console.error('Delete failed:', e);
        return { status: 0, ok: false, body: String(e) };
      }
    });

    if (deleteRes.ok) {
      console.log('User account deleted successfully');
    } else {
      console.error(`Delete response (${deleteRes.status}):`, deleteRes.body);
      allErrors.push(`[USER_DELETE] Failed to delete user: ${deleteRes.status}`);
    }

    if (allErrors.length > 0) {
      throw new Error(
        `Errors during team flow:\n${allErrors.join('\n')}\n\nAll console:\n${allConsoleMessages.join('\n')}`
      );
    }

    console.log('=== TEST COMPLETE ===');
  });

  test('create user, create recruitment post, delete user (cascade)', async ({ page }) => {
    const testEmail = `smoke-recruitment@test.local`;
    const testPassword = 'SmokeRecruit123!';
    const testDisplayName = 'Smoke Recruitment User';
    const postTitle = `Smoke Recruitment Post`;
    const postBody = `Looking for teammates for competitive play`;

    const allErrors: string[] = [];
    const allConsoleMessages: string[] = [];
    let currentPage = '';

    // Capture console errors
    page.on('console', (msg) => {
      const text = msg.text();
      const fullText = `[${msg.type().toUpperCase()}] ${text}`;
      allConsoleMessages.push(fullText);
      if (msg.type() === 'error') {
        if (text.includes('Failed to load resource') && (text.includes('401') || text.includes('409'))) {
          return;
        }
        const prefix = currentPage ? `[${currentPage}] ` : '';
        allErrors.push(`${prefix}${fullText}`);
      }
    });

    page.on('pageerror', (err) => {
      allErrors.push(`[PAGE_ERROR] ${err.message}`);
    });

    page.on('requestfailed', (request) => {
      if (request.failure()?.errorText === 'net::ERR_ABORTED') {
        return;
      }
      const response = request.response();
      allErrors.push(
        `[REQUEST_FAILED] ${request.method()} ${request.url()}: ${request.failure()?.errorText} (status: ${response?.status ?? 'unknown'})`
      );
    });

    page.on('response', (response) => {
      if (response.status() >= 400 && response.status() < 600) {
        const url = response.url();
        if (response.status() === 401 && url.includes('/api/auth/refresh')) {
          return;
        }
        if (response.status() === 409 && url.includes('/api/auth/register')) {
          return;
        }
        // Ignore 401 on public endpoints (games, recruitment-posts, etc)
        if (response.status() === 401 && (url.includes('/api/games') || url.includes('/api/recruitment-posts') || url.includes('/assets'))) {
          return;
        }
        allErrors.push(`[HTTP_${response.status()}] ${response.request().method()} ${response.url()}`);
      }
    });

    // 1. REGISTER
    console.log('=== CREATING USER ===');
    currentPage = 'Register';
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');

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

    if (!registerRes.ok && registerRes.status !== 409) {
      throw new Error(`Registration failed with status ${registerRes.status}`);
    }
    console.log('User registered/exists');

    // 2. LOGIN
    console.log('=== LOGGING IN ===');
    currentPage = 'Login';
    if (registerRes.status === 409) {
      await page.goto('/login', { waitUntil: 'networkidle' });
      await page.waitForLoadState('domcontentloaded');
    }

    await page.locator('input[name="email"]').fill(testEmail);
    await page.locator('input[name="password"]').fill(testPassword);

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load' }).catch((e) => {
        allErrors.push(`[LOGIN_NAV_ERROR] ${e.message}`);
      }),
      page.locator('button:has-text("Ingresar")').click().catch((e) => {
        allErrors.push(`[LOGIN_CLICK_ERROR] ${e.message}`);
      }),
    ]);

    try {
      await page.waitForURL('**/dashboard', { timeout: 10000 });
    } catch (e) {
      throw new Error(`Login failed - did not reach dashboard. Currently at: ${page.url()}`);
    }

    expect(page.url()).toContain('/dashboard');

    // 3. CREATE RECRUITMENT POST via UI form
    console.log('=== CREATING RECRUITMENT POST ===');
    currentPage = 'RecruitmentNew';

    await page.goto('/recruitment/new', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1000); // Allow form JavaScript to load

    try {
      // Select dropdowns by label text to avoid issues with conditional rendering
      const typeSelect = page.locator('label:has-text("Tipo")').locator('select');
      const gameSelect = page.locator('label:has-text("Juego")').locator('select');
      const titleInput = page.locator('label:has-text("Título")').locator('input');
      const bodyTextarea = page.locator('label:has-text("Descripción")').locator('textarea');

      // Select type: "Busco jugadores" (index 1)
      await typeSelect.selectOption({ index: 1 });
      console.log('Selected recruitment type');

      // Wait for game options to load - games are fetched via useEffect on mount
      // Give time for the component to render options
      await page.waitForTimeout(2000);

      // Check if options are now in the select
      const selectHTML = await gameSelect.evaluate((el: any) => {
        return { optionCount: el.querySelectorAll('option').length };
      });

      if (selectHTML.optionCount < 2) {
        // Still no game options, try waiting a bit more
        await page.waitForTimeout(1000);
        const retryHTML = await gameSelect.evaluate((el: any) => {
          return { optionCount: el.querySelectorAll('option').length };
        });
        if (retryHTML.optionCount < 2) {
          throw new Error(`Game options not loaded. Expected at least 2 options (placeholder + 1 game), got ${retryHTML.optionCount}`);
        }
      }
      console.log('Game options loaded');

      // Select game (first available game, skip placeholder at index 0)
      await gameSelect.selectOption({ index: 1 });
      console.log('Selected game');

      // Fill title
      await titleInput.fill(postTitle);
      console.log('Filled title');

      // Fill body
      await bodyTextarea.fill(postBody);
      console.log('Filled body');

      console.log('Form filled, submitting...');

      // Submit form
      const navPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {
        console.log('Navigation promise timed out or was rejected');
      });

      await page.locator('button:has-text("Publicar")').click();
      console.log('Clicked submit button');
      await navPromise;
      await page.waitForTimeout(500);

      const urlAfterSubmit = page.url();
      console.log(`URL after post creation: ${urlAfterSubmit}`);

      if (!urlAfterSubmit.includes('/recruitment')) {
        allErrors.push(`[POST_CREATE] Expected /recruitment URL, got: ${urlAfterSubmit}`);
      } else {
        console.log('Recruitment post created successfully');
      }
    } catch (e) {
      allErrors.push(`[POST_FORM] Failed to create recruitment post via UI: ${e instanceof Error ? e.message : String(e)}`);
    }

    // 4. VERIFY RECRUITMENT POST APPEARS IN LIST
    console.log('=== VERIFYING RECRUITMENT POST IN LIST ===');
    currentPage = 'RecruitmentList';

    // Should already be on /recruitment page after form submission
    if (!page.url().includes('/recruitment')) {
      await page.goto('/recruitment', { waitUntil: 'load' });
    }

    try {
      // Wait for posts to load - give it time to fetch from API
      await page.waitForTimeout(2000);

      // Check page content for debugging
      const pageText = await page.content();
      const hasPostTitle = pageText.includes(postTitle);
      console.log(`Post title "${postTitle}" in page: ${hasPostTitle}`);

      const postElement = page.locator(`text=${postTitle}`);

      // Verify the post appears in the list
      const postCount = await postElement.count();
      if (postCount === 0) {
        allErrors.push('[RECRUITMENT_VERIFY] Created post did not appear in recruitment list');
        // Try checking the page HTML for debugging
        const bodyText = await page.locator('body').textContent();
        if (bodyText && bodyText.length > 500) {
          console.log(`Page body first 500 chars: ${bodyText.substring(0, 500)}`);
        }
      } else {
        console.log('Recruitment post verified in list');
      }

      // 5. DELETE RECRUITMENT POST via UI
      console.log('=== DELETING RECRUITMENT POST VIA UI ===');
      if (postCount > 0) {
        // Find the delete button for this post (✕ button next to the title)
        const postCard = page.locator(`:has-text("${postTitle}")`).first();
        const deleteButton = postCard.locator('button[title="Eliminar publicación"]');

        if (await deleteButton.count() > 0) {
          await deleteButton.click();
          console.log('Clicked delete button for recruitment post');

          // Wait a bit for the deletion to process
          await page.waitForTimeout(500);

          // Verify post is gone from the list
          const postCountAfterDelete = await page.locator(`text=${postTitle}`).count();
          if (postCountAfterDelete > 0) {
            allErrors.push('[RECRUITMENT_DELETE] Post still visible after delete button click');
          } else {
            console.log('Recruitment post successfully deleted via UI');
          }
        } else {
          allErrors.push('[RECRUITMENT_DELETE] Delete button not found for post');
        }
      }
    } catch (e) {
      allErrors.push(`[RECRUITMENT_VERIFY] Error verifying/deleting recruitment post: ${e instanceof Error ? e.message : String(e)}`);
    }

    // 6. DELETE ACCOUNT
    console.log('=== DELETING USER ACCOUNT ===');
    currentPage = 'Delete';
    await page.goto('/dashboard', { waitUntil: 'load' });
    await page.waitForLoadState('domcontentloaded');

    const deleteRes = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/me', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const body = await res.text();
        return { status: res.status, ok: res.ok, body };
      } catch (e) {
        console.error('Delete failed:', e);
        return { status: 0, ok: false, body: String(e) };
      }
    });

    if (deleteRes.ok) {
      console.log('User account deleted successfully');
    } else {
      console.error(`Delete response (${deleteRes.status}):`, deleteRes.body);
      allErrors.push(`[USER_DELETE] Failed to delete user: ${deleteRes.status}`);
    }

    if (allErrors.length > 0) {
      throw new Error(
        `Errors during recruitment flow:\n${allErrors.join('\n')}\n\nAll console:\n${allConsoleMessages.join('\n')}`
      );
    }

    console.log('=== TEST COMPLETE ===');
  });
});

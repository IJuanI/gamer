import { test, expect } from "@playwright/test";

/** Functional tests for jam page parallax behavior. */

test("jam page: static boxes don't move with scroll", async ({ page }) => {
  await page.goto("http://localhost:3000/jam");
  await page.waitForLoadState("networkidle");

  // Get static box element (boxes have parallax = false)
  const staticBox = page
    .locator("div[style*='border']")
    .filter({ has: page.locator("text=") }) // Empty boxes without text
    .first();

  const initialBox = await staticBox.boundingBox();
  expect(initialBox).toBeTruthy();

  // Scroll down significantly
  await page.evaluate(() => window.scrollBy(0, 600));
  await page.waitForTimeout(200); // Let scroll settle

  const scrolledBox = await staticBox.boundingBox();
  expect(scrolledBox).toBeTruthy();

  // Static box should NOT have moved vertically (parallax offset should be near 0)
  const yMovement = Math.abs(scrolledBox!.y - initialBox!.y);
  expect(yMovement).toBeLessThan(50); // Allow minimal movement for render variance
});

test("jam page: parallax icons move less than scroll distance", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/jam");
  await page.waitForLoadState("networkidle");

  // Parallax container has transform: translateY(scrollY * -0.15px)
  const parallaxContainer = page.locator(
    "div[style*='translateY']"
  ).first();

  // Debug: check if element exists and has the transform
  const elementInfo = await parallaxContainer.evaluate((el) => ({
    classes: el.className,
    inlineStyle: el.getAttribute("style"),
    computed: window.getComputedStyle(el).transform,
    scrollY: window.scrollY,
  }));
  console.log("Before scroll:", elementInfo);

  // Get computed transform before scroll
  const transformBefore = await parallaxContainer.evaluate(
    (el) => window.getComputedStyle(el).transform
  );

  // Scroll 600px down
  const scrollAmount = 600;
  await page.evaluate((amount) => window.scrollBy(0, amount), scrollAmount);
  await page.waitForTimeout(500); // Wait longer for RAF

  // Debug: check scroll position and transform after scroll
  const afterScrollInfo = await parallaxContainer.evaluate((el) => ({
    inlineStyle: el.getAttribute("style"),
    computed: window.getComputedStyle(el).transform,
    scrollY: window.scrollY,
  }));
  console.log("After scroll:", afterScrollInfo);

  // Get computed transform after scroll
  const transformAfter = await parallaxContainer.evaluate(
    (el) => window.getComputedStyle(el).transform
  );

  // Extract Y values from matrix or translateY
  const parseMatrixY = (transform: string) => {
    // Format: matrix(a, b, c, d, tx, ty) - we want ty (last value)
    const matrixMatch = transform.match(/matrix\([^,]+,\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*([^)]+)\)/);
    if (matrixMatch) return parseFloat(matrixMatch[1]);

    // Fallback for translateY format
    const translateMatch = transform.match(/translateY?\(([^,)]+)/);
    if (translateMatch) return parseFloat(translateMatch[1]);

    return 0;
  };

  const yBeforeVal = parseMatrixY(transformBefore);
  const yAfterVal = parseMatrixY(transformAfter);

  const parallelaxMovement = Math.abs(yAfterVal - yBeforeVal);

  // With -0.15 factor: 600 * 0.15 = 90px parallax movement
  // Should move significantly LESS than 600px scroll
  expect(parallelaxMovement).toBeGreaterThan(50); // Verify parallax IS happening
  expect(parallelaxMovement).toBeLessThan(scrollAmount * 0.5); // But much less than scroll
});

test("jam page: static vs parallax movement ratio is correct", async ({
  page,
}) => {
  await page.goto("http://localhost:3000/jam");
  await page.waitForLoadState("networkidle");

  const parallaxContainer = page
    .locator("div[style*='translateY']")
    .first();

  // Initial state
  const initialTransform = await parallaxContainer.evaluate(
    (el) => window.getComputedStyle(el).transform
  );

  // Scroll 400px
  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(200);

  const scrolledTransform = await parallaxContainer.evaluate(
    (el) => window.getComputedStyle(el).transform
  );

  // Parse Y values from matrix or translateY
  const parseY = (transform: string) => {
    // Format: matrix(a, b, c, d, tx, ty) - we want ty (last value)
    const matrixMatch = transform.match(/matrix\([^,]+,\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*([^)]+)\)/);
    if (matrixMatch) return parseFloat(matrixMatch[1]);

    // Fallback for translateY format
    const translateMatch = transform.match(/translateY?\(([^,)]+)/);
    if (translateMatch) return parseFloat(translateMatch[1]);

    return 0;
  };

  const yBefore = parseY(initialTransform);
  const yAfter = parseY(scrolledTransform);
  const movement = Math.abs(yAfter - yBefore);

  // For 400px scroll with -0.15 factor: expect ~60px movement
  // Allow 30% variance for timing/render differences
  const expectedMovement = 400 * 0.15;
  const tolerance = expectedMovement * 0.3;

  expect(movement).toBeGreaterThan(expectedMovement - tolerance);
  expect(movement).toBeLessThan(expectedMovement + tolerance);
});

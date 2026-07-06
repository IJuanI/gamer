import { test, expect } from "@playwright/test";

test("this should fail", async ({ page }) => {
  expect(true).toBe(false);
});

import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("navbar has all main nav links", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav, .sticky").first();
    // Indexes is now a dropdown button, not a direct link
    await expect(nav.locator("button", { hasText: "Indexes" })).toBeVisible();
    await expect(nav.locator('a[href="/updates"]')).toBeVisible();
    await expect(nav.locator('a[href="/methodology"]')).toBeVisible();
    await expect(nav.locator('a[href="/research"]')).toBeVisible();
    await expect(nav.locator('a[href="/services"]')).toBeVisible();
    await expect(nav.locator('a[href="/about"]')).toBeVisible();
    await expect(nav.locator('a[href="/contact"]')).toBeVisible();
  });

  test("footer has index links including cities", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.locator('a[href="/countries"]')).toBeVisible();
    await expect(footer.locator('a[href="/fortune-500"]')).toBeVisible();
    await expect(footer.locator('a[href="/us-cities"]')).toBeVisible();
    await expect(footer.locator('a[href="/global-cities"]')).toBeVisible();
  });

  test("footer has tools section with assessment links", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.locator('a[href="/self-assessment"]')).toBeVisible();
    await expect(footer.locator('a[href="/prompting-suite-for-humans"]')).toBeVisible();
    await expect(footer.locator('a[href="/ai-evaluation-suite"]')).toBeVisible();
  });

  test("clicking nav link navigates correctly", async ({ page }) => {
    await page.goto("/");
    await page.locator('a[href="/methodology"]').first().click();
    await expect(page).toHaveURL(/methodology/);
    await expect(page.locator("h1")).toContainText(/[Bb]enchmark/);
  });
});

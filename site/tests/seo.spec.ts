import { test, expect } from "@playwright/test";

const pages = [
  { route: "/", titleContains: "Compassion Benchmark" },
  { route: "/about", titleContains: "About" },
  { route: "/fortune-500", titleContains: "Fortune 500" },
  { route: "/countries", titleContains: "Countries" },
  { route: "/methodology", titleContains: "Methodology" },
  { route: "/services", titleContains: "Services" },
  { route: "/purchase-research", titleContains: "Purchase Research" },
  { route: "/self-assessment", titleContains: "Self-Assessment" },
];

test.describe("SEO metadata", () => {
  for (const { route, titleContains } of pages) {
    test(`${route} has correct title containing "${titleContains}"`, async ({ page }) => {
      await page.goto(route);
      const title = await page.title();
      expect(title).toContain(titleContains);
    });
  }

  test("pages have meta description", async ({ page }) => {
    for (const route of ["/", "/fortune-500", "/methodology", "/services"]) {
      await page.goto(route);
      const desc = await page.locator('meta[name="description"]').getAttribute("content");
      expect(desc).toBeTruthy();
      expect(desc!.length).toBeGreaterThan(50);
    }
  });
});

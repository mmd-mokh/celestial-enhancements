import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Public routes to smoke-test for critical/serious a11y violations.
const ROUTES = ["/", "/pricing", "/consoles", "/how-it-works", "/faq", "/contact", "/blog"];

for (const path of ROUTES) {
  test(`a11y: ${path} has no critical/serious axe violations`, async ({ page }) => {
    await page.goto(path, { waitUntil: "networkidle" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious",
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
}
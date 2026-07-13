import { test, expect } from "@playwright/test";

const ROUTES = ["/", "/pricing", "/consoles", "/how-it-works", "/faq", "/contact", "/blog"];

for (const path of ROUTES) {
  test(`route ${path} loads with no console errors and has a title`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    const res = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(res?.ok(), `HTTP status for ${path}`).toBeTruthy();

    await expect(page).toHaveTitle(/.+/);
    // ignore benign hydration/DevTools noise
    const critical = errors.filter(
      (e) => !/Download the React DevTools|Warning:|favicon/i.test(e),
    );
    expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
  });
}

test("dark mode toggle updates <html> class", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const toggle = page.getByRole("button", { name: /theme|dark|light|تم|روشن|تاریک/i }).first();
  await toggle.waitFor({ state: "visible" });
  const before = await page.evaluate(() => document.documentElement.classList.contains("dark"));
  await toggle.click();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.classList.contains("dark")))
    .not.toBe(before);
});

test("sitemap.xml is served with xml content-type and includes /", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.ok()).toBe(true);
  expect(res.headers()["content-type"]).toMatch(/xml/);
  const body = await res.text();
  expect(body).toContain("<urlset");
  expect(body).toContain("<loc>/</loc>");
});

test("robots.txt is served", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.ok()).toBe(true);
});

import { describe, it, expect } from "vitest";
import { formatDateFa } from "@/lib/i18n";

/**
 * Regression test for the blog hydration mismatch: formatDateFa must be
 * timezone-stable so SSR (UTC) and CSR (any TZ) render the same Persian
 * calendar day.
 */
describe("formatDateFa", () => {
  it("renders the same day for a timestamp near UTC midnight regardless of process TZ", () => {
    const iso = "2026-07-11T22:30:00Z"; // 2026-07-12 02:00 in Asia/Tehran
    const originalTz = process.env.TZ;
    process.env.TZ = "UTC";
    const asUtc = formatDateFa(iso);
    process.env.TZ = "Asia/Tehran";
    const asTehran = formatDateFa(iso);
    process.env.TZ = originalTz;
    expect(asUtc).toBe(asTehran);
  });

  it("returns an em dash for nullish input", () => {
    expect(formatDateFa(null)).toBe("—");
    expect(formatDateFa(undefined)).toBe("—");
  });
});
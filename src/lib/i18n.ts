const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** Convert ASCII digits (0-9) in a string to Persian digits (۰-۹). */
export function toFaDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return "";
  return String(input).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

/** Format an ISO date (YYYY-MM-DD) or Date in fa-IR with Persian digits. */
export function formatDateFa(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  // Force UTC so SSR (server, UTC) and CSR (browser, user TZ) render the same
  // Persian calendar day and hydration matches.
  return d.toLocaleDateString("fa-IR", { timeZone: "UTC" });
}
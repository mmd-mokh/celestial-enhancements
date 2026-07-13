/**
 * Central SEO helpers. Keep the site's canonical origin in one place so
 * every route builds absolute URLs consistently for canonical, og:url,
 * og:image and JSON-LD.
 *
 * Set VITE_APP_URL (client) / APP_URL (server) to the deployed origin.
 */
const FALLBACK_SITE_URL =
  "https://id-preview--de632f54-da5d-4a46-a731-9abbaafa7bd0.lovable.app";

function resolveSiteUrl(): string {
  const fromVite =
    typeof import.meta !== "undefined"
      ? (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_APP_URL
      : undefined;
  const fromNode =
    typeof process !== "undefined" ? process.env?.APP_URL ?? process.env?.VITE_APP_URL : undefined;
  return (fromVite ?? fromNode ?? FALLBACK_SITE_URL).replace(/\/+$/, "");
}

export const SITE_URL = resolveSiteUrl();

/** Build an absolute URL from a site-relative path. */
export function absUrl(path: string): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
/**
 * Central SEO helpers. Keep the site's canonical origin in one place so
 * every route builds absolute URLs consistently for canonical, og:url,
 * og:image and JSON-LD.
 */
export const SITE_URL = "https://star-crafting-suite.lovable.app";

/** Build an absolute URL from a site-relative path. */
export function absUrl(path: string): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
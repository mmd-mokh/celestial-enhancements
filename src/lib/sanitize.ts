import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize admin-authored HTML (blog posts, message bodies) before rendering
 * with dangerouslySetInnerHTML. Blocks stored XSS from privileged accounts.
 */
export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return "";
  return DOMPurify.sanitize(input, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "script", "iframe", "object", "embed"],
    FORBID_ATTR: ["style", "onerror", "onload", "onclick"],
  });
}
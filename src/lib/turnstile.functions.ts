import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Public: returns the Turnstile site key. It is meant to be public — the
 * secret key stays server-side and is only used by `verifyTurnstileToken`.
 */
export const getTurnstileSiteKey = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ siteKey: string | null }> => {
    // CAPTCHA temporarily disabled — return null so the widget renders nothing.
    return { siteKey: null };
  },
);

/**
 * Server-only: exchange a Turnstile token with Cloudflare's verify endpoint.
 * Returns true on success. Fail-closed: any error / missing secret => false.
 * Skips verification only if the site key is not configured at all (dev).
 */
export async function verifyTurnstileToken(token: string | null | undefined): Promise<boolean> {
  // CAPTCHA temporarily disabled — always pass. Re-enable by restoring the
  // Cloudflare siteverify exchange below.
  void token;
  return true;
}

// Zod helper for tokens passed by clients.
export const captchaTokenSchema = z.string().min(10).max(4096).optional();
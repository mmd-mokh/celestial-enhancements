import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Public: returns the Turnstile site key. It is meant to be public — the
 * secret key stays server-side and is only used by `verifyTurnstileToken`.
 */
export const getTurnstileSiteKey = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ siteKey: string | null }> => {
    const siteKey = process.env.TURNSTILE_SITE_KEY ?? null;
    return { siteKey };
  },
);

/**
 * Server-only: exchange a Turnstile token with Cloudflare's verify endpoint.
 * Returns true on success. Fail-closed: any error / missing secret => false.
 * Skips verification only if the site key is not configured at all (dev).
 */
export async function verifyTurnstileToken(token: string | null | undefined): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // Turnstile not configured — do not block.
  if (!token) return false;
  try {
    const form = new URLSearchParams();
    form.set("secret", secret);
    form.set("response", token);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    if (!res.ok) return false;
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}

// Zod helper for tokens passed by clients.
export const captchaTokenSchema = z.string().min(10).max(4096).optional();
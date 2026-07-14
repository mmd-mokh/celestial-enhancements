import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyTurnstileToken } from "@/lib/turnstile.functions";

export type SubscribeResult =
  | { ok: true; already: boolean }
  | { ok: false; code: "captcha_required" | "rate_limited" | "unknown"; message: string };

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        email: z.string().trim().toLowerCase().email(),
        source: z.string().max(64).optional(),
        captchaToken: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<SubscribeResult> => {
    const captchaOk = await verifyTurnstileToken(data.captchaToken);
    if (!captchaOk) {
      return { ok: false, code: "captcha_required", message: "captcha_required" };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .insert({ email: data.email, source: data.source ?? "landing" });
    if (error) {
      if (error.code === "23505") return { ok: true, already: true };
      const raw = `${error.message ?? ""}`.toLowerCase();
      if (raw.includes("rate_limited") || (error as { code?: string }).code === "GM005") {
        return { ok: false, code: "rate_limited", message: "rate_limited" };
      }
      return { ok: false, code: "unknown", message: error.message ?? "unknown" };
    }
    return { ok: true, already: false };
  });
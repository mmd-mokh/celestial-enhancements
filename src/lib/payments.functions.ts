import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { BookingSchema } from "@/lib/booking-validation";
import { getPackagePriceToman } from "@/lib/pricing";

export type InitiatePaymentResult =
  | { ok: true; url: string }
  | { ok: false; code: string; message: string };

// Compute a stable absolute origin for the callback URL from the incoming
// request. In production this is the customer's current site host; in
// preview/dev it's the preview host. Never trust client-supplied origins.
function absoluteOrigin(): string {
  const req = getRequest();
  const url = new URL(req.url);
  const xfProto = req.headers.get("x-forwarded-proto");
  const xfHost = req.headers.get("x-forwarded-host");
  const proto = xfProto || url.protocol.replace(":", "");
  const host = xfHost || url.host;
  return `${proto}://${host}`;
}

export const initiatePayment = createServerFn({ method: "POST" })
  .validator((input) => BookingSchema.parse(input))
  .handler(async ({ data }): Promise<InitiatePaymentResult> => {
    const amount = getPackagePriceToman(data.packageType);
    if (!amount || amount <= 0) {
      return { ok: false, code: "invalid_package", message: "Unknown package" };
    }

    const { zpRequest } = await import("@/lib/zarinpal.server");
    const callbackUrl = `${absoluteOrigin()}/api/public/payments/zarinpal/callback`;
    const description = `رزرو ${data.consoleType} — پکیج ${data.packageType} (${data.startDate} تا ${data.endDate})`;

    const req = await zpRequest({
      amountToman: amount,
      description,
      callbackUrl,
      mobile: data.phone,
    });
    if (!req.ok) {
      console.error("[zarinpal] request failed", req);
      return { ok: false, code: "gateway_error", message: String(req.message) };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("payment_intents").insert({
      provider: "zarinpal",
      authority: req.authority,
      amount_toman: amount,
      status: "pending",
      booking_payload: data,
    });
    if (error) {
      console.error("[zarinpal] intent insert failed", error);
      return { ok: false, code: "intent_persist_failed", message: error.message };
    }

    return { ok: true, url: req.startPayUrl };
  });

// Small helper for the callback route (server-only). Keeps the RPC + intent
// update logic in one place so the route file stays thin.
export const finalizePaymentSchema = z.object({
  authority: z.string().min(5),
  status: z.string().min(1),
});
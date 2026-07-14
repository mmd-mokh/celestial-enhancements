import { createServerFn } from "@tanstack/react-start";
import { BookingSchema } from "@/lib/booking-validation";
import { z } from "zod";
import { verifyTurnstileToken } from "@/lib/turnstile.functions";

export type CreateBookingResult =
  | { ok: true; id: string; icalToken: string }
  | { ok: false; code: string; message: string };

// Map custom SQLSTATE codes raised by public.create_booking to stable tokens.
const SQLSTATE_TO_CODE: Record<string, string> = {
  GM001: "invalid_name",
  GM002: "invalid_phone",
  GM003: "invalid_dates",
  GM004: "past_date",
  GM005: "rate_limited",
  GM006: "console_unavailable",
  GM007: "no_availability",
  GM008: "not_authenticated",
  GM009: "forbidden",
  GM010: "already_cancelled_or_completed",
  GM011: "past_booking",
};

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    BookingSchema.extend({ captchaToken: z.string().optional() }).parse(input),
  )
  .handler(async ({ data }): Promise<CreateBookingResult> => {
    // Anonymous submissions must pass Turnstile. Signed-in users bypass.
    // (Auth context is not attached to this fn today — future improvement:
    // add requireSupabaseAuth-lite that only skips captcha when a session
    // is present. For now, always require the token when configured.)
    const captchaOk = await verifyTurnstileToken(data.captchaToken);
    if (!captchaOk) {
      return { ok: false, code: "captcha_required", message: "captcha_required" };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: newId, error } = await supabaseAdmin.rpc("create_booking", {
      _name: data.name,
      _phone: data.phone,
      _console_type: data.consoleType,
      _package_type: data.packageType,
      _start_date: data.startDate,
      _end_date: data.endDate,
      _notes: data.notes ?? undefined,
    });
    if (error) {
      // Prefer stable SQLSTATE (GM0xx). Fall back to message-token matching for
      // legacy deployments that predate the ERRCODE migration.
      const sqlState = (error as { code?: string }).code;
      let code = sqlState ? SQLSTATE_TO_CODE[sqlState] : undefined;
      if (!code) {
        const raw = `${error.message ?? ""} ${(error as { details?: string }).details ?? ""}`
          .toLowerCase();
        const known = Object.values(SQLSTATE_TO_CODE);
        code = known.find((c) => raw.includes(c)) ?? "unknown";
      }
      return { ok: false, code, message: error.message ?? "unknown" };
    }
    if (!newId) return { ok: false, code: "unknown", message: "empty_id" };
    const { signBookingId } = await import("@/lib/booking-token.server");
    return { ok: true, id: newId as string, icalToken: signBookingId(newId as string) };
  });

export type BookingSummary = {
  id: string;
  name: string;
  phone: string;
  consoleType: string;
  packageType: string;
  startDate: string;
  endDate: string;
  status: string;
  notes: string | null;
  createdAt: string;
};

export type GetBookingByTokenResult =
  | { ok: true; booking: BookingSummary }
  | { ok: false; code: "invalid_token" | "not_found" };

// Public route: verify HMAC token server-side, then read via service role.
// The token binds the caller to a specific booking id, so no session needed.
export const getBookingByToken = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), token: z.string().min(10) }).parse(input),
  )
  .handler(async ({ data }): Promise<GetBookingByTokenResult> => {
    const { verifyBookingToken } = await import("@/lib/booking-token.server");
    if (!verifyBookingToken(data.id, data.token)) return { ok: false, code: "invalid_token" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.rpc("get_booking_summary", {
      _booking_id: data.id,
    });
    if (error || !rows || rows.length === 0) return { ok: false, code: "not_found" };
    const row = rows[0] as Record<string, unknown>;
    return {
      ok: true,
      booking: {
        id: row.id as string,
        name: row.name as string,
        phone: row.phone as string,
        consoleType: row.console_type as string,
        packageType: row.package_type as string,
        startDate: row.start_date as string,
        endDate: row.end_date as string,
        status: row.status as string,
        notes: (row.notes as string | null) ?? null,
        createdAt: row.created_at as string,
      },
    };
  });
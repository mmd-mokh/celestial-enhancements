import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const CreateBookingInput = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(30),
  consoleType: z.string().min(1),
  packageType: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  notes: z.string().max(1000).optional(),
});

export type CreateBookingResult =
  | { ok: true; id: string }
  | { ok: false; code: string; message: string };

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((input) => CreateBookingInput.parse(input))
  .handler(async ({ data }): Promise<CreateBookingResult> => {
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
      const raw = `${error.message ?? ""} ${(error as { details?: string }).details ?? ""}`.toLowerCase();
      const codes = [
        "no_availability",
        "past_date",
        "rate_limited",
        "console_unavailable",
        "invalid_phone",
        "invalid_name",
        "invalid_dates",
      ];
      const code = codes.find((c) => raw.includes(c)) ?? "unknown";
      return { ok: false, code, message: error.message ?? "unknown" };
    }
    if (!newId) return { ok: false, code: "unknown", message: "empty_id" };
    return { ok: true, id: newId as string };
  });
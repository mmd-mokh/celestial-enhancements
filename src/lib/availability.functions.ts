import { createServerFn } from "@tanstack/react-start";
import { throwLogged } from "@/lib/server-errors";
import { z } from "zod";

export type ConsoleAvailabilityRow = {
  slug: string;
  name: string;
  capacity: number;
  booked: number;
  remaining: number;
};

export const getConsolesRemaining = createServerFn({ method: "GET" }).handler(
  async (): Promise<ConsoleAvailabilityRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("get_consoles_remaining");
    if (error) throwLogged("getConsolesRemaining", error, "Could not load availability.");
    return (data ?? []).map((r) => ({
      slug: r.slug,
      name: r.name,
      capacity: r.capacity ?? 0,
      booked: r.booked ?? 0,
      remaining: r.remaining ?? 0,
    }));
  },
);

export type ConsoleAvailabilityDay = { day: string; booked: number; capacity: number };

export const getConsoleAvailability = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        consoleSlug: z.string().min(1),
        from: z.string().min(1),
        to: z.string().min(1),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<ConsoleAvailabilityDay[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.rpc("get_console_availability", {
      _console_slug: data.consoleSlug,
      _from: data.from,
      _to: data.to,
    });
    if (error) throwLogged("getConsoleAvailability", error, "Could not load availability.");
    return (rows ?? []).map((r) => ({
      day: String(r.day),
      booked: r.booked ?? 0,
      capacity: r.capacity ?? 0,
    }));
  });
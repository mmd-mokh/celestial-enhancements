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

export type ConsoleWithRemainingRow = {
  slug: string;
  name: string;
  tagline: string | null;
  features: string[] | null;
  icon: string | null;
  accent_from: string | null;
  accent_to: string | null;
  sort_order: number | null;
  capacity: number;
  booked: number;
  remaining: number;
};

/**
 * Combined helper: consoles list + remaining availability in one round trip.
 * Halves the number of requests the booking dialog needs on open.
 */
export const getConsolesWithRemaining = createServerFn({ method: "GET" }).handler(
  async (): Promise<ConsoleWithRemainingRow[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("get_consoles_with_remaining");
    if (error)
      throwLogged("getConsolesWithRemaining", error, "Could not load consoles.");
    return (data ?? []).map((r: Record<string, unknown>) => ({
      slug: r.slug as string,
      name: r.name as string,
      tagline: (r.tagline as string | null) ?? null,
      features: (r.features as string[] | null) ?? null,
      icon: (r.icon as string | null) ?? null,
      accent_from: (r.accent_from as string | null) ?? null,
      accent_to: (r.accent_to as string | null) ?? null,
      sort_order: (r.sort_order as number | null) ?? null,
      capacity: (r.capacity as number | null) ?? 0,
      booked: (r.booked as number | null) ?? 0,
      remaining: (r.remaining as number | null) ?? 0,
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
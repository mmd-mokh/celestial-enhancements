import { createServerFn } from "@tanstack/react-start";
import { isLocalBackendUnavailableError, throwLogged, warnLocalFallback } from "@/lib/server-errors";
import { FALLBACK_CONSOLE_CAPACITY, FALLBACK_PUBLIC_CONSOLES } from "@/lib/console-content";
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
    try {
      const { getPublicSupabase } = await import("@/lib/public-supabase.server");
      const supabase = getPublicSupabase();
      const { data, error } = await supabase.rpc("get_consoles_remaining");
      if (error) throw error;
      const rows = data && data.length > 0 ? data : FALLBACK_PUBLIC_CONSOLES.map((consoleItem) => ({
        slug: consoleItem.slug,
        name: consoleItem.name,
        capacity: FALLBACK_CONSOLE_CAPACITY,
        booked: 0,
        remaining: FALLBACK_CONSOLE_CAPACITY,
      }));
      return rows.map((r) => ({
        slug: r.slug,
        name: r.name,
        capacity: r.capacity ?? 0,
        booked: r.booked ?? 0,
        remaining: r.remaining ?? 0,
      }));
    } catch (error) {
      if (isLocalBackendUnavailableError(error)) {
        warnLocalFallback("getConsolesRemaining", error);
        return FALLBACK_PUBLIC_CONSOLES.map((consoleItem) => ({
          slug: consoleItem.slug,
          name: consoleItem.name,
          capacity: FALLBACK_CONSOLE_CAPACITY,
          booked: 0,
          remaining: FALLBACK_CONSOLE_CAPACITY,
        }));
      }
      throwLogged("getConsolesRemaining", error, "Could not load availability.");
    }
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
    try {
      const { getPublicSupabase } = await import("@/lib/public-supabase.server");
      const supabase = getPublicSupabase();
      const { data, error } = await supabase.rpc("get_consoles_with_remaining");
      if (error) throw error;
      const rows = data && data.length > 0 ? data : FALLBACK_PUBLIC_CONSOLES.map((consoleItem) => ({
        ...consoleItem,
        capacity: FALLBACK_CONSOLE_CAPACITY,
        booked: 0,
        remaining: FALLBACK_CONSOLE_CAPACITY,
      }));
      return rows.map((r: Record<string, unknown>) => ({
        slug: r.slug as string,
        name: r.name as string,
        tagline: (r.tagline as string | null) ?? null,
        features: Array.isArray(r.features) ? (r.features as string[]) : null,
        icon: (r.icon as string | null) ?? null,
        accent_from: (r.accent_from as string | null) ?? null,
        accent_to: (r.accent_to as string | null) ?? null,
        sort_order: (r.sort_order as number | null) ?? null,
        capacity: (r.capacity as number | null) ?? 0,
        booked: (r.booked as number | null) ?? 0,
        remaining: (r.remaining as number | null) ?? 0,
      }));
    } catch (error) {
      if (isLocalBackendUnavailableError(error)) {
        warnLocalFallback("getConsolesWithRemaining", error);
        return FALLBACK_PUBLIC_CONSOLES.map((consoleItem) => ({
          ...consoleItem,
          capacity: FALLBACK_CONSOLE_CAPACITY,
          booked: 0,
          remaining: FALLBACK_CONSOLE_CAPACITY,
        }));
      }
      throwLogged("getConsolesWithRemaining", error, "Could not load consoles.");
    }
  },
);

export type ConsoleAvailabilityDay = { day: string; booked: number; capacity: number };

export const getConsoleAvailability = createServerFn({ method: "GET" })
  .validator((input) =>
    z
      .object({
        consoleSlug: z.string().min(1),
        from: z.string().min(1),
        to: z.string().min(1),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<ConsoleAvailabilityDay[]> => {
    try {
      const { getPublicSupabase } = await import("@/lib/public-supabase.server");
      const supabase = getPublicSupabase();
      const { data: rows, error } = await supabase.rpc("get_console_availability", {
        _console_slug: data.consoleSlug,
        _from: data.from,
        _to: data.to,
      });
      if (error) throw error;
      return (rows ?? []).map((r) => ({
        day: String(r.day),
        booked: r.booked ?? 0,
        capacity: r.capacity ?? 0,
      }));
    } catch (error) {
      if (isLocalBackendUnavailableError(error)) {
        warnLocalFallback("getConsoleAvailability", error);
        return [];
      }
      throwLogged("getConsoleAvailability", error, "Could not load availability.");
    }
  });
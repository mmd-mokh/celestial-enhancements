import { useQuery } from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import {
  getConsolesWithRemaining,
  getConsoleAvailability,
} from "@/lib/availability.functions";
import {
  FALLBACK_CONSOLES,
  type ConsoleAvailability,
  type ConsoleOpt,
} from "./constants";
import { startOfToday } from "./schema";

export function useConsoleOptions(enabled: boolean) {
  return useQuery({
    enabled,
    queryKey: ["booking", "console-options"],
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    queryFn: async () => {
      const rows = await getConsolesWithRemaining();
      const consoles: ConsoleOpt[] = rows.length
        ? rows.map((row) => ({
            value: row.slug,
            label: row.name,
            tagline:
              FALLBACK_CONSOLES.find((item) => item.value === row.slug)?.tagline ??
              "کنسول اختصاصی",
          }))
        : FALLBACK_CONSOLES;
      const remainingBySlug: Record<string, ConsoleAvailability> = {};
      for (const row of rows) {
        remainingBySlug[row.slug] = {
          capacity: row.capacity,
          booked: row.booked,
          remaining: row.remaining,
        };
      }
      return { consoles, remainingBySlug };
    },
  });
}

export function useConsoleAvailability(consoleSlug: string, enabled: boolean) {
  return useQuery({
    enabled: enabled && !!consoleSlug,
    queryKey: ["booking", "availability", consoleSlug],
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    queryFn: async () => {
      const today = startOfToday();
      const rows = await getConsoleAvailability({
        data: {
          consoleSlug,
          from: format(today, "yyyy-MM-dd"),
          to: format(addDays(today, 90), "yyyy-MM-dd"),
        },
      });
      const fullyBooked = new Set<string>();
      for (const row of rows) {
        if (row.capacity > 0 && row.booked >= row.capacity) fullyBooked.add(row.day);
      }
      return fullyBooked;
    },
  });
}
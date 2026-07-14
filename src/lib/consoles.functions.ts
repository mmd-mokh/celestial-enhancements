import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { isLocalBackendUnavailableError, throwLogged, warnLocalFallback } from "@/lib/server-errors";
import { FALLBACK_PUBLIC_CONSOLES } from "@/lib/console-content";

export type ConsoleRow = {
  slug: string;
  name: string;
  tagline: string | null;
  features: string[] | null;
  icon: string | null;
  accent_from: string | null;
  accent_to: string | null;
  sort_order: number | null;
};

export const getConsoles = createServerFn({ method: "GET" }).handler(
  async (): Promise<ConsoleRow[]> => {
    try {
      const { getPublicSupabase } = await import("@/lib/public-supabase.server");
      const supabase = getPublicSupabase();
      const { data, error } = await supabase
        .from("consoles")
        .select("slug,name,tagline,features,icon,accent_from,accent_to,sort_order")
        .eq("active", true)
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as ConsoleRow[];
    } catch (error) {
      if (isLocalBackendUnavailableError(error)) {
        warnLocalFallback("getConsoles", error);
        return FALLBACK_PUBLIC_CONSOLES;
      }
      throwLogged("getConsoles", error, "Could not load consoles.");
    }
  },
);

export const getConsoleBySlug = createServerFn({ method: "GET" })
  .validator((input) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<ConsoleRow | null> => {
    try {
      const { getPublicSupabase } = await import("@/lib/public-supabase.server");
      const supabase = getPublicSupabase();
      const { data: row, error } = await supabase
        .from("consoles")
        .select("slug,name,tagline,features,icon,accent_from,accent_to,sort_order")
        .eq("active", true)
        .eq("slug", data.slug)
        .maybeSingle();
      if (error) throw error;
      return (row ?? null) as ConsoleRow | null;
    } catch (error) {
      if (isLocalBackendUnavailableError(error)) {
        warnLocalFallback("getConsoleBySlug", error);
        return FALLBACK_PUBLIC_CONSOLES.find((consoleItem) => consoleItem.slug === data.slug) ?? null;
      }
      throwLogged("getConsoleBySlug", error, "Could not load console.");
    }
  });
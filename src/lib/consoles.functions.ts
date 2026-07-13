import { createServerFn } from "@tanstack/react-start";
import { throwLogged } from "@/lib/server-errors";

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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("consoles")
      .select("slug,name,tagline,features,icon,accent_from,accent_to,sort_order")
      .eq("active", true)
      .order("sort_order");
    if (error) throwLogged("getConsoles", error, "Could not load consoles.");
    return (data ?? []) as ConsoleRow[];
  },
);
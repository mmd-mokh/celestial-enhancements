import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { throwLogged } from "@/lib/server-errors";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Use the anon publishable client for public read-only content so RLS
// (Public can read published posts) is enforced instead of relying on
// service_role bypass.
function getPublicSupabase() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        // sb_* keys are opaque — send only apikey, not Authorization bearer.
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type PostSummary = {
  slug: string;
  title: string;
  excerpt: string | null;
  cover_url: string | null;
  published_at: string | null;
  tags: string[] | null;
};

export type PostDetail = PostSummary & { content: string };

export const listPublishedPosts = createServerFn({ method: "GET" }).handler(
  async (): Promise<PostSummary[]> => {
    const supabase = getPublicSupabase();
    const { data, error } = await supabase
      .from("posts")
      .select("slug,title,excerpt,cover_url,published_at,tags")
      .eq("published", true)
      .order("published_at", { ascending: false, nullsFirst: false });
    if (error) throwLogged("listPublishedPosts", error, "Could not load posts.");
    return (data ?? []) as PostSummary[];
  },
);

export const getPublishedPost = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<PostDetail | null> => {
    const supabase = getPublicSupabase();
    const { data: row, error } = await supabase
      .from("posts")
      .select("slug,title,excerpt,cover_url,content,tags,published_at")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throwLogged("getPublishedPost", error, "Could not load this post.");
    return (row ?? null) as PostDetail | null;
  });
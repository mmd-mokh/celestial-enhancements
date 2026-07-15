import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { isLocalBackendUnavailableError, throwLogged, warnLocalFallback } from "@/lib/server-errors";

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
    try {
      try { setResponseHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400"); } catch { /* no ctx */ }
      const { getPublicSupabase } = await import("@/lib/public-supabase.server");
      const supabase = getPublicSupabase();
      const { data, error } = await supabase
        .from("posts")
        .select("slug,title,excerpt,cover_url,published_at,tags")
        .eq("published", true)
        .order("published_at", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as PostSummary[];
    } catch (error) {
      if (isLocalBackendUnavailableError(error)) {
        warnLocalFallback("listPublishedPosts", error);
        return [];
      }
      throwLogged("listPublishedPosts", error, "Could not load posts.");
    }
  },
);

export const getPublishedPost = createServerFn({ method: "GET" })
  .validator((input) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }): Promise<PostDetail | null> => {
    try {
      try { setResponseHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=86400"); } catch { /* no ctx */ }
      const { getPublicSupabase } = await import("@/lib/public-supabase.server");
      const supabase = getPublicSupabase();
      const { data: row, error } = await supabase
        .from("posts")
        .select("slug,title,excerpt,cover_url,content,tags,published_at")
        .eq("slug", data.slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return (row ?? null) as PostDetail | null;
    } catch (error) {
      if (isLocalBackendUnavailableError(error)) {
        warnLocalFallback("getPublishedPost", error);
        return null;
      }
      throwLogged("getPublishedPost", error, "Could not load this post.");
    }
  });
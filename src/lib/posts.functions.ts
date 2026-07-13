import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { throwLogged } from "@/lib/server-errors";

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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("posts")
      .select("slug,title,excerpt,cover_url,content,tags,published_at")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throwLogged("getPublishedPost", error, "Could not load this post.");
    return (row ?? null) as PostDetail | null;
  });
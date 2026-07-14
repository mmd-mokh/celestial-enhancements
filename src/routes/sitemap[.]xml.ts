import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { CONSOLE_SLUGS } from "@/lib/console-content";
import { RENT_SLUGS } from "@/lib/rent-content";
import { SITE_URL } from "@/lib/seo";

const BASE_URL = SITE_URL;

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/consoles", changefreq: "weekly", priority: "0.9" },
          { path: "/pricing", changefreq: "weekly", priority: "0.9" },
          { path: "/how-it-works", changefreq: "monthly", priority: "0.7" },
          { path: "/faq", changefreq: "monthly", priority: "0.7" },
          { path: "/contact", changefreq: "yearly", priority: "0.6" },
          { path: "/blog", changefreq: "weekly", priority: "0.7" },
        ];

        for (const slug of CONSOLE_SLUGS) {
          entries.push({ path: `/consoles/${slug}`, changefreq: "monthly", priority: "0.8" });
        }
        for (const slug of RENT_SLUGS) {
          entries.push({ path: `/rent/${slug}`, changefreq: "monthly", priority: "0.7" });
        }

        let postsFailed = false;
        try {
          const url = process.env.SUPABASE_URL!;
          const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
          const supabasePublic = createClient<Database>(url, key, {
            auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
            global: {
              fetch: (input, init) => {
                const h = new Headers(init?.headers);
                if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
                  h.delete("Authorization");
                }
                h.set("apikey", key);
                return fetch(input, { ...init, headers: h });
              },
            },
          });
          const { data: posts } = await supabasePublic
            .from("posts")
            .select("slug, published_at, updated_at")
            .eq("published", true)
            .order("published_at", { ascending: false, nullsFirst: false });
          for (const p of posts ?? []) {
            const lastmod = p.updated_at ?? p.published_at ?? undefined;
            entries.push({
              path: `/blog/${p.slug}`,
              lastmod: lastmod ? new Date(lastmod).toISOString() : undefined,
              changefreq: "monthly",
              priority: "0.6",
            });
          }
        } catch (err) {
          // best-effort: omit blog post entries if the query fails, but log
          // so Server Logs still show the failure.
          console.error("[sitemap] failed to load posts", err);
          postsFailed = true;
        }

        const urls = entries
          .map((e) =>
            [
              `  <url>`,
              `    <loc>${BASE_URL}${e.path}</loc>`,
              e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
              e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
              e.priority ? `    <priority>${e.priority}</priority>` : null,
              `  </url>`,
            ]
              .filter(Boolean)
              .join("\n"),
          )
          .join("\n");

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            // If posts couldn't be loaded, don't let a partial sitemap get
            // cached for an hour — force a re-fetch on the next request.
            "Cache-Control": postsFailed
              ? "no-store"
              : "public, max-age=3600",
          },
        });
      },
    },
  },
});
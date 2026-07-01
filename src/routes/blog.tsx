import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "بلاگ گیمیو | راهنما و اخبار دنیای گیمینگ" },
      { name: "description", content: "مقالات و راهنماهای گیمیو درباره کنسول‌های بازی، بازی‌های روز، و ترفندهای گیمینگ." },
      { property: "og:title", content: "بلاگ گیمیو" },
      { property: "og:description", content: "مقالات و راهنماهای دنیای گیمینگ." },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "خانه", item: "/" },
          { "@type": "ListItem", position: 2, name: "بلاگ", item: "/blog" },
        ],
      }) },
    ],
  }),
  component: BlogLayout,
});

type Post = { slug: string; title: string; excerpt: string | null; cover_url: string | null; published_at: string | null; tags: string[] | null };

function BlogLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/blog") return <Outlet />;
  return <BlogIndex />;
}

function BlogIndex() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("posts")
        .select("slug,title,excerpt,cover_url,published_at,tags")
        .eq("published", true)
        .order("published_at", { ascending: false, nullsFirst: false });
      setPosts((data ?? []) as Post[]);
    })();
  }, []);
  return (
    <div dir="rtl" className="min-h-screen bg-background p-6" style={{ fontFamily: "Vazirmatn, sans-serif" }}>
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="text-center space-y-2 py-6">
          <h1 className="text-4xl font-bold">بلاگ گیمیو</h1>
          <p className="text-muted-foreground">راهنما، اخبار و ترفندهای دنیای گیمینگ</p>
        </header>
        {posts == null ? (
          <p className="text-center text-muted-foreground">در حال بارگذاری…</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">هنوز مطلبی منتشر نشده است.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {posts.map((p) => (
              <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="block hover:opacity-90 transition-opacity">
                <Card className="h-full overflow-hidden">
                  {p.cover_url && (
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img src={p.cover_url} alt={p.title} className="size-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <CardHeader><CardTitle className="text-lg">{p.title}</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {p.excerpt && <p className="text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>}
                    {p.published_at && <p className="text-xs text-muted-foreground">{new Date(p.published_at).toLocaleDateString("fa-IR")}</p>}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        <div className="text-center pt-6">
          <Link to="/" className="text-sm text-primary hover:underline">بازگشت به صفحه اصلی</Link>
        </div>
      </div>
    </div>
  );
}
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { blogListQueryOptions } from "@/lib/queries";
import { absUrl } from "@/lib/seo";
import { formatDateFa } from "@/lib/i18n";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "بلاگ گیمیو | راهنما و اخبار دنیای گیمینگ" },
      { name: "description", content: "مقالات و راهنماهای گیمیو درباره کنسول‌های بازی، بازی‌های روز، و ترفندهای گیمینگ." },
      { property: "og:title", content: "بلاگ گیمیو | راهنما و اخبار دنیای گیمینگ" },
      {
        property: "og:description",
        content:
          "راهنماها، مقایسه‌ها و ترفندهای اجاره کنسول PS5، Xbox و Nintendo Switch — همه چیزی که برای شروع لازم داری.",
      },
      { property: "og:url", content: absUrl("/blog") },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: absUrl("/blog") }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify({
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "خانه", item: absUrl("/") },
          { "@type": "ListItem", position: 2, name: "بلاگ", item: absUrl("/blog") },
        ],
      }) },
    ],
  }),
  component: BlogLayout,
  loader: ({ context }) => context.queryClient.ensureQueryData(blogListQueryOptions()),
  errorComponent: ({ error }) => (
    <div dir="rtl" className="min-h-dvh bg-background p-6 flex items-center justify-center" style={{ fontFamily: "Vazirmatn, sans-serif" }}>
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-2xl font-bold">خطا در بارگذاری بلاگ</h1>
        <p className="text-muted-foreground">{error.message || "لطفاً دوباره تلاش کنید."}</p>
        <Link to="/" className="text-sm text-primary hover:underline">بازگشت به صفحه اصلی</Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div dir="rtl" className="min-h-dvh bg-background p-6 flex items-center justify-center" style={{ fontFamily: "Vazirmatn, sans-serif" }}>
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">مطلبی پیدا نشد</h1>
        <Link to="/blog" className="text-sm text-primary hover:underline">بازگشت به بلاگ</Link>
      </div>
    </div>
  ),
});

function BlogLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/blog") return <Outlet />;
  return <BlogIndex />;
}

function BlogIndex() {
  const { data: posts } = useSuspenseQuery(blogListQueryOptions());
  return (
    <div dir="rtl" className="min-h-dvh bg-background p-6" style={{ fontFamily: "Vazirmatn, sans-serif" }}>
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="text-center space-y-2 py-6">
          <h1 className="text-4xl font-bold">بلاگ گیمیو</h1>
          <p className="text-muted-foreground">راهنما، اخبار و ترفندهای دنیای گیمینگ</p>
        </header>
        {posts.length === 0 ? (
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
                    {p.published_at && <p className="text-xs text-muted-foreground">{formatDateFa(p.published_at)}</p>}
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
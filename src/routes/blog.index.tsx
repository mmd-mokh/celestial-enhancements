import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { blogListQueryOptions } from "@/lib/queries";
import { absUrl } from "@/lib/seo";
import { formatDateFa } from "@/lib/i18n";

export const Route = createFileRoute("/blog/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(blogListQueryOptions()),
  head: ({ loaderData }) => {
    // Use the newest post's cover as the shared preview image when available.
    const cover = Array.isArray(loaderData)
      ? (loaderData as Array<{ cover_url: string | null }>).find((p) => p.cover_url)?.cover_url
      : undefined;
    return {
      meta: cover
        ? [
            { property: "og:image", content: absUrl(cover) },
            { name: "twitter:image", content: absUrl(cover) },
          ]
        : [],
    };
  },
  component: BlogIndex,
});

function BlogIndex() {
  const { data: posts } = useSuspenseQuery(blogListQueryOptions());
  return (
    <div
      dir="rtl"
      className="min-h-dvh bg-background p-6"
      style={{ fontFamily: "Vazirmatn, sans-serif" }}
    >
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
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="block hover:opacity-90 transition-opacity"
              >
                <Card className="h-full overflow-hidden">
                  {p.cover_url && (
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img
                        src={p.cover_url}
                        alt={p.title}
                        className="size-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{p.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {p.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>
                    )}
                    {p.published_at && (
                      <p className="text-xs text-muted-foreground">
                        {formatDateFa(p.published_at)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        <div className="text-center pt-6">
          <Link to="/" className="text-sm text-primary hover:underline">
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );
}
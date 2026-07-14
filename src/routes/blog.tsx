import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { absUrl } from "@/lib/seo";

/**
 * `/blog` layout route. Owns shared head metadata and renders `<Outlet />`
 * for both the index (`blog.index.tsx`) and detail (`blog.$slug.tsx`) routes.
 */
export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "بلاگ کنسولتو | راهنما و اخبار دنیای گیمینگ" },
      {
        name: "description",
        content:
          "مقالات و راهنماهای کنسولتو درباره کنسول‌های بازی، بازی‌های روز، و ترفندهای گیمینگ.",
      },
      { property: "og:title", content: "بلاگ کنسولتو | راهنما و اخبار دنیای گیمینگ" },
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
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "خانه", item: absUrl("/") },
            { "@type": "ListItem", position: 2, name: "بلاگ", item: absUrl("/blog") },
          ],
        }),
      },
    ],
  }),
  component: () => <Outlet />,
  errorComponent: ({ error }) => (
    <div
      dir="rtl"
      className="min-h-dvh bg-background p-6 flex items-center justify-center"
      style={{ fontFamily: "Vazirmatn, sans-serif" }}
    >
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-2xl font-bold">خطا در بارگذاری بلاگ</h1>
        <p className="text-muted-foreground">{error.message || "لطفاً دوباره تلاش کنید."}</p>
        <Link to="/" className="text-sm text-primary hover:underline">
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div
      dir="rtl"
      className="min-h-dvh bg-background p-6 flex items-center justify-center"
      style={{ fontFamily: "Vazirmatn, sans-serif" }}
    >
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">مطلبی پیدا نشد</h1>
        <Link to="/blog" className="text-sm text-primary hover:underline">
          بازگشت به بلاگ
        </Link>
      </div>
    </div>
  ),
});
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { consolesQueryOptions } from "@/lib/queries";
import { CONSOLE_CONTENT } from "@/lib/console-content";
import { absUrl } from "@/lib/seo";

export const Route = createFileRoute("/consoles/$slug")({
  loader: async ({ context, params }) => {
    const content = CONSOLE_CONTENT[params.slug];
    if (!content) throw notFound();
    await context.queryClient.ensureQueryData(consolesQueryOptions());
    return { content };
  },
  head: ({ loaderData, params }) => {
    const c = loaderData?.content;
    const url = absUrl(`/consoles/${params.slug}`);
    if (!c) {
      return {
        meta: [
          { title: "کنسول پیدا نشد | گیمیو" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    return {
      meta: [
        { title: c.seoTitle },
        { name: "description", content: c.seoDescription },
        { property: "og:title", content: c.seoTitle },
        { property: "og:description", content: c.seoDescription },
        { property: "og:url", content: url },
        { property: "og:type", content: "product" },
        { property: "og:image", content: absUrl("/assets/images/home/dashboard.png") },
        { name: "twitter:image", content: absUrl("/assets/images/home/dashboard.png") },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: c.hero.heading,
            description: c.seoDescription,
            category: "Video Game Console",
            brand: { "@type": "Organization", name: "گیمیو" },
            offers: {
              "@type": "Offer",
              price: c.priceIRR,
              priceCurrency: "IRR",
              availability: "https://schema.org/InStock",
              url,
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "خانه", item: absUrl("/") },
              { "@type": "ListItem", position: 2, name: "کنسول‌ها", item: absUrl("/consoles") },
              { "@type": "ListItem", position: 3, name: c.hero.heading, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: ConsoleDetailPage,
  notFoundComponent: () => (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">کنسول پیدا نشد</h1>
          <p className="text-gray-700 mb-6">این کنسول در حال حاضر موجود نیست.</p>
          <Link to="/consoles" className="text-primary hover:underline">
            مشاهده همه کنسول‌ها
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  ),
});

function ConsoleDetailPage() {
  const { slug } = Route.useParams();
  const content = CONSOLE_CONTENT[slug]!;
  const { data: consoles } = useSuspenseQuery(consolesQueryOptions());
  const dbRow = consoles.find((c) => c.slug === slug);

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-white" dir="rtl">
        <section className="px-4 md:px-8 lg:px-16 py-16 bg-gradient-to-br from-primary-50 to-white">
          <div className="max-w-4xl mx-auto text-center flex flex-col gap-4">
            <nav aria-label="مسیر" className="text-sm text-gray-700">
              <Link to="/" className="hover:text-primary">خانه</Link>
              <span className="mx-2">/</span>
              <Link to="/consoles" className="hover:text-primary">کنسول‌ها</Link>
            </nav>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              {content.hero.heading}
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
              {content.hero.subheading}
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="text-3xl font-bold text-primary">{content.price.from}</span>
              <span className="text-gray-700">{content.price.period}</span>
            </div>
            <div className="mt-6 flex justify-center gap-4 flex-wrap">
              <Link
                to="/pricing"
                className="btn btn-enhanced text-lg px-8 py-4 shadow-lg"
              >
                رزرو کن
              </Link>
              <Link
                to="/consoles"
                className="btn-secondary-enhanced rounded-full border-2 border-primary bg-transparent px-6 py-3 text-base font-semibold text-primary"
              >
                سایر کنسول‌ها
              </Link>
            </div>
          </div>
        </section>

        <section className="px-4 md:px-8 lg:px-16 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              مشخصات فنی
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.specs.map((s) => (
                <div key={s.label} className="bg-gray-50 rounded-lg p-5 flex justify-between gap-4">
                  <span className="font-semibold text-gray-900">{s.label}</span>
                  <span className="text-gray-700 text-left">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 md:px-8 lg:px-16 py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              بازی‌های محبوب
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {content.popularGames.map((g) => (
                <li key={g} className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm">
                  <i className="bi bi-controller text-primary text-xl" />
                  <span className="text-gray-900 font-medium">{g}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {dbRow?.features && dbRow.features.length > 0 && (
          <section className="px-4 md:px-8 lg:px-16 py-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                چرا این کنسول را از گیمیو اجاره کنی؟
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dbRow.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-5">
                    <i className="bi bi-check-circle-fill text-primary mt-1" />
                    <span className="text-gray-700">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section className="px-4 md:px-8 lg:px-16 py-16 bg-gradient-to-br from-primary to-primary/80 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              همین حالا {content.hero.heading.replace("اجاره ", "")} را رزرو کن
            </h2>
            <p className="text-lg mb-8 opacity-90">
              پکیج مناسب را انتخاب کن، در کمتر از ۳۰ دقیقه با تو تماس می‌گیریم و تحویل رایگان در تهران انجام می‌شود.
            </p>
            <Link
              to="/pricing"
              className="inline-block rounded-full bg-white text-primary text-lg px-8 py-4 font-bold shadow-lg"
            >
              مشاهده پکیج‌ها
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
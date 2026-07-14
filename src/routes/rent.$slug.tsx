import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { RENT_CONTENT } from "@/lib/rent-content";
import { PACKAGES } from "@/components/PricingCards";
import { absUrl } from "@/lib/seo";
import { RouteErrorFallback } from "@/components/RouteBoundaries";

export const Route = createFileRoute("/rent/$slug")({
  loader: ({ params }) => {
    const content = RENT_CONTENT[params.slug];
    if (!content) throw notFound();
    return { content };
  },
  head: ({ loaderData, params }) => {
    const c = loaderData?.content;
    const url = absUrl(`/rent/${params.slug}`);
    if (!c) {
      return {
        meta: [
          { title: "پیدا نشد | گیمیو" },
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
        { property: "og:type", content: "website" },
        // No landing-specific image — omit rather than share a generic
        // dashboard graphic that misrepresents this page.
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "خانه", item: absUrl("/") },
              { "@type": "ListItem", position: 2, name: c.hero.heading, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: RentPage,
  errorComponent: ({ error, reset }) => (
    <RouteErrorFallback error={error} reset={reset} boundary="rent_slug" />
  ),
  notFoundComponent: () => (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">پیدا نشد</h1>
          <Link to="/consoles" className="text-primary hover:underline">
            مشاهده کنسول‌ها
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  ),
});

function RentPage() {
  const { slug } = Route.useParams();
  const c = RENT_CONTENT[slug]!;
  const pkg = PACKAGES.find((p) => p.slug === c.suggestedPackage);

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-white" dir="rtl">
        <section className="px-4 md:px-8 lg:px-16 py-16 bg-gradient-to-br from-primary-50 to-white">
          <div className="max-w-3xl mx-auto text-center flex flex-col gap-4">
            <p className="text-primary font-semibold">{c.hero.eyebrow}</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              {c.hero.heading}
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed">{c.hero.subheading}</p>
            <div className="mt-6 flex justify-center gap-4 flex-wrap">
              <Link
                to="/pricing"
                className="btn btn-enhanced text-lg px-8 py-4 shadow-lg"
              >
                {c.ctaLabel}
              </Link>
              <Link
                to="/consoles"
                className="btn-secondary-enhanced rounded-full border-2 border-primary bg-transparent px-6 py-3 text-base font-semibold text-primary"
              >
                مشاهده کنسول‌ها
              </Link>
            </div>
          </div>
        </section>

        <section className="px-4 md:px-8 lg:px-16 py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
              چرا گیمیو برای این مناسبت؟
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {c.benefits.map((b) => (
                <li key={b.title} className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <i className={`bi ${b.icon} text-2xl`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{b.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{b.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {pkg && (
          <section className="px-4 md:px-8 lg:px-16 py-16 bg-gray-50">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                پکیج پیشنهادی: {pkg.name}
              </h2>
              <p className="text-gray-700 mb-6">{pkg.description}</p>
              <div className="text-5xl font-bold text-primary mb-2">{pkg.price}</div>
              <div className="text-gray-700 mb-6">{pkg.unit}</div>
              <Link
                to="/pricing"
                className="inline-block btn btn-enhanced text-lg px-8 py-4 shadow-lg"
              >
                {c.ctaLabel}
              </Link>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
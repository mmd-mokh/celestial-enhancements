import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ConsoleList } from "@/components/ConsoleCards";
import { consolesQueryOptions } from "@/lib/queries";

export const Route = createFileRoute("/consoles")({
  head: () => ({
    meta: [
      { title: "اجاره کنسول PS5، Xbox و Nintendo Switch | گیمیو" },
      {
        name: "description",
        content:
          "کنسول‌های موجود برای اجاره در گیمیو: PlayStation 5، Xbox Series X، و Nintendo Switch. همه با دو دسته و کابل‌های اصلی، تحویل درب منزل در تهران.",
      },
      { property: "og:title", content: "کنسول‌های موجود در گیمیو" },
      {
        property: "og:description",
        content: "PS5، Xbox Series X، و Nintendo Switch — اجاره روزانه تا ماهانه.",
      },
      { property: "og:url", content: "/consoles" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/consoles" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "کنسول‌های قابل اجاره",
          itemListElement: [
            { "@type": "Product", name: "PlayStation 5", position: 1 },
            { "@type": "Product", name: "Xbox Series X", position: 2 },
            { "@type": "Product", name: "Nintendo Switch", position: 3 },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "خانه", item: "/" },
            { "@type": "ListItem", position: 2, name: "کنسول‌ها", item: "/consoles" },
          ],
        }),
      },
    ],
  }),
  component: ConsolesPage,
  loader: ({ context }) => context.queryClient.ensureQueryData(consolesQueryOptions()),
});

function ConsolesPage() {
  const { data: items } = useSuspenseQuery(consolesQueryOptions());
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-white">
        <section id="consoles" className="px-4 md:px-8 lg:px-16 py-16">
          <div className="max-w-7xl mx-auto flex flex-col gap-4 text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              کنسول‌های موجود برای اجاره
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              PS5، Xbox Series X، و Nintendo Switch — با دو دسته و همه لوازم اصلی.
            </p>
          </div>
          <div
            className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            role="list"
            aria-label="کنسول‌های موجود"
          >
            <ConsoleList items={items} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
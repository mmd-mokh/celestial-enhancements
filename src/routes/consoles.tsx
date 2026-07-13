import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ConsoleList, type ConsoleRow } from "@/components/ConsoleCards";
import { supabase } from "@/integrations/supabase/client";

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
});

function ConsolesPage() {
  const [items, setItems] = useState<ConsoleRow[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("consoles")
        .select("slug,name,tagline,features,icon,accent_from,accent_to,sort_order")
        .eq("active", true)
        .order("sort_order");
      if (!cancelled && data) setItems(data as ConsoleRow[]);
    })();
    return () => { cancelled = true; };
  }, []);
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
            {items ? <ConsoleList items={items} /> : <p className="text-center text-gray-500">در حال بارگذاری…</p>}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
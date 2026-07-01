import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/LandingPage";

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
    ],
  }),
  component: () => <LandingPage scrollTo="consoles" />,
});
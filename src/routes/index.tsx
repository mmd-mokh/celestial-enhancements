import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:image", content: "/assets/images/home/dashboard.png" },
      { name: "twitter:image", content: "/assets/images/home/dashboard.png" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "گیمیو",
          url: "/",
          inLanguage: "fa-IR",
          potentialAction: {
            "@type": "SearchAction",
            target: "/consoles?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
  }),
  component: () => <LandingPage />,
});
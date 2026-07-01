import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/LandingPage";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "چطور کنسول اجاره کنیم؟ راهنمای ۴ مرحله‌ای | گیمیو" },
      {
        name: "description",
        content:
          "اجاره کنسول در گیمیو در ۴ مرحله ساده: انتخاب کنسول، انتخاب پکیج، ثبت درخواست، و تحویل درب منزل. کمتر از ۳۰ دقیقه پاسخگویی.",
      },
      { property: "og:title", content: "راهنمای اجاره کنسول در گیمیو" },
      {
        property: "og:description",
        content: "چهار مرحله ساده تا تجربه گیمینگ در خانه.",
      },
      { property: "og:url", content: "/how-it-works" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/how-it-works" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "خانه", item: "/" },
            { "@type": "ListItem", position: 2, name: "چطور کار می‌کند", item: "/how-it-works" },
          ],
        }),
      },
    ],
  }),
  component: () => <LandingPage scrollTo="how-it-works" />,
});
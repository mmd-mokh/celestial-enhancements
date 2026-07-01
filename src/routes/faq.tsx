import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/LandingPage";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "سوالات متداول اجاره کنسول | گیمیو" },
      {
        name: "description",
        content:
          "پاسخ به سوالات پرتکرار درباره اجاره کنسول، بیمه، ارسال، شارژ اکانت، و شرایط بازگرداندن کنسول در گیمیو.",
      },
      { property: "og:title", content: "سوالات متداول گیمیو" },
      {
        property: "og:description",
        content: "همه چیزی که قبل از اجاره کنسول لازم دارید بدانید.",
      },
      { property: "og:url", content: "/faq" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "چطور کنسول را اجاره کنم؟",
              acceptedAnswer: {
                "@type": "Answer",
                text: "کافی است روی «رزرو کن» بزنید، کنسول و پکیج را انتخاب کنید و اطلاعات تماس را وارد کنید. تیم گیمیو در کمتر از ۳۰ دقیقه با شما تماس می‌گیرد.",
              },
            },
            {
              "@type": "Question",
              name: "آیا کنسول‌ها بیمه دارند؟",
              acceptedAnswer: {
                "@type": "Answer",
                text: "بله، همه کنسول‌ها بیمه هستند و در صورت خرابی غیرعمدی، هزینه‌ای از شما دریافت نمی‌شود.",
              },
            },
            {
              "@type": "Question",
              name: "ارسال و تحویل چگونه انجام می‌شود؟",
              acceptedAnswer: {
                "@type": "Answer",
                text: "ارسال در تهران رایگان است و کمتر از ۲ ساعت پس از تایید سفارش انجام می‌شود.",
              },
            },
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
            { "@type": "ListItem", position: 2, name: "سوالات متداول", item: "/faq" },
          ],
        }),
      },
    ],
  }),
  component: () => <LandingPage scrollTo="faq" />,
});
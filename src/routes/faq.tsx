import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FaqList } from "@/components/FaqAccordion";
import { absUrl } from "@/lib/seo";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "سوالات متداول اجاره کنسول | کنسولتو" },
      {
        name: "description",
        content:
          "پاسخ به سوالات پرتکرار درباره اجاره کنسول، بیمه، ارسال، شارژ اکانت، و شرایط بازگرداندن کنسول در کنسولتو.",
      },
      { property: "og:title", content: "سوالات متداول کنسولتو" },
      {
        property: "og:description",
        content: "همه چیزی که قبل از اجاره کنسول لازم دارید بدانید.",
      },
      { property: "og:url", content: absUrl("/faq") },
      { property: "og:type", content: "website" },
      { property: "og:image", content: absUrl("/assets/images/home/dashboard.png") },
      { name: "twitter:image", content: absUrl("/assets/images/home/dashboard.png") },
    ],
    links: [{ rel: "canonical", href: absUrl("/faq") }],
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
                text: "کافی است روی «رزرو کن» بزنید، کنسول و پکیج را انتخاب کنید و اطلاعات تماس را وارد کنید. تیم کنسولتو در کمتر از ۳۰ دقیقه با شما تماس می‌گیرد.",
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
            { "@type": "ListItem", position: 1, name: "خانه", item: absUrl("/") },
            { "@type": "ListItem", position: 2, name: "سوالات متداول", item: absUrl("/faq") },
          ],
        }),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-white">
        <section id="faq" className="px-4 md:px-8 lg:px-16 py-16">
          <div className="max-w-4xl mx-auto flex flex-col gap-4 text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              سوالات متداول
            </h1>
            <p className="text-lg text-gray-700">
              هر چیزی که قبل از اجاره کنسول لازم داری بدونی.
            </p>
          </div>
          <h2 className="max-w-4xl mx-auto text-2xl md:text-3xl font-bold text-gray-900 text-center mb-6">
            پرسش‌های پرتکرار
          </h2>
          <div className="max-w-4xl mx-auto w-full">
            <FaqList />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
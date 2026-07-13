import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MousePointerClick, PackageCheck, Truck, Gamepad2 } from "lucide-react";

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
  component: HowItWorksPage,
});

const STEPS = [
  { Icon: MousePointerClick, title: "۱. انتخاب کنسول و پکیج", body: "کنسول موردعلاقه‌ات را انتخاب کن و پکیج مناسب (روزانه، آخر هفته، هفتگی یا ماهانه) را برگزین." },
  { Icon: PackageCheck, title: "۲. ثبت درخواست", body: "فرم رزرو را در کمتر از ۳ دقیقه پر کن. تیم گیمیو در کمتر از ۳۰ دقیقه با تو تماس می‌گیرد." },
  { Icon: Truck, title: "۳. تحویل درب منزل", body: "کنسول تست‌شده به همراه دو دسته و لوازم اصلی، رایگان درب منزل شما در تهران تحویل داده می‌شود." },
  { Icon: Gamepad2, title: "۴. بازی کن و لذت ببر", body: "کافی است روشن کنی و بازی کنی. پشتیبانی ۲۴/۷ گیمیو در تمام مدت اجاره کنارت است." },
];

function HowItWorksPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-white">
        <section id="how-it-works" className="px-4 md:px-8 lg:px-16 py-16">
          <div className="max-w-4xl mx-auto flex flex-col gap-4 text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              چطور کنسول اجاره کنیم؟
            </h1>
            <p className="text-lg text-gray-700">در ۴ مرحله ساده تا تجربه گیمینگ در خانه.</p>
          </div>
          <ol className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {STEPS.map(({ Icon, title, body }) => (
              <li key={title} className="flex gap-4 bg-white rounded-xl shadow-md p-6 items-start">
                <div className="shrink-0 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-2 text-right">
                  <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                  <p className="text-gray-700 leading-relaxed">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
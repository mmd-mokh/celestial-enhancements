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
      <main className="tw-min-h-screen tw-bg-white">
        <section id="how-it-works" className="tw-px-4 md:tw-px-8 lg:tw-px-16 tw-py-16">
          <div className="tw-max-w-4xl tw-mx-auto tw-flex tw-flex-col tw-gap-4 tw-text-center tw-mb-12">
            <h1 className="tw-text-4xl md:tw-text-5xl tw-font-extrabold tw-text-gray-900">
              چطور کنسول اجاره کنیم؟
            </h1>
            <p className="tw-text-lg tw-text-gray-700">در ۴ مرحله ساده تا تجربه گیمینگ در خانه.</p>
          </div>
          <ol className="tw-max-w-4xl tw-mx-auto tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-6">
            {STEPS.map(({ Icon, title, body }) => (
              <li key={title} className="tw-flex tw-gap-4 tw-bg-white tw-rounded-xl tw-shadow-md tw-p-6 tw-items-start">
                <div className="tw-shrink-0 tw-h-12 tw-w-12 tw-rounded-full tw-bg-primary/10 tw-flex tw-items-center tw-justify-center tw-text-primary">
                  <Icon className="tw-h-6 tw-w-6" aria-hidden="true" />
                </div>
                <div className="tw-flex tw-flex-col tw-gap-2 tw-text-right">
                  <h2 className="tw-text-xl tw-font-bold tw-text-gray-900">{title}</h2>
                  <p className="tw-text-gray-700 tw-leading-relaxed">{body}</p>
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
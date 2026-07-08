import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PricingList } from "@/components/PricingCards";
import { BookingDialog } from "@/components/BookingDialog";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "قیمت اجاره کنسول بازی | پکیج‌های روزانه تا ماهانه | گیمیو" },
      {
        name: "description",
        content:
          "تعرفه اجاره کنسول در گیمیو: پکیج روزانه، آخر هفته، هفتگی و ماهانه. بدون هزینه پنهان، شامل بیمه و ارسال رایگان در تهران.",
      },
      { property: "og:title", content: "قیمت اجاره کنسول در گیمیو" },
      {
        property: "og:description",
        content: "پکیج‌های منعطف روزانه، آخر هفته، هفتگی و ماهانه — بدون هزینه پنهان.",
      },
      { property: "og:url", content: "/pricing" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/pricing" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "خانه", item: "/" },
            { "@type": "ListItem", position: 2, name: "قیمت‌ها", item: "/pricing" },
          ],
        }),
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const [open, setOpen] = useState(false);
  const [pkg, setPkg] = useState<string | undefined>();
  return (
    <>
      <SiteHeader />
      <main className="tw-min-h-screen tw-bg-white">
        <section id="pricing" className="tw-px-4 md:tw-px-8 lg:tw-px-16 tw-py-16">
          <div className="tw-max-w-7xl tw-mx-auto tw-flex tw-flex-col tw-gap-4 tw-text-center tw-mb-10">
            <h1 className="tw-text-4xl md:tw-text-5xl tw-font-extrabold tw-text-gray-900">
              پکیج‌های اجاره کنسول
            </h1>
            <p className="tw-text-lg tw-text-gray-700 tw-max-w-2xl tw-mx-auto">
              روزانه، آخر هفته، هفتگی و ماهانه — بدون هزینه پنهان، شامل بیمه و ارسال رایگان در تهران.
            </p>
          </div>
          <div className="pricing-grid tw-max-w-7xl tw-mx-auto tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-6 tw-items-stretch">
            <PricingList
              onReserve={(slug) => {
                setPkg(slug);
                setOpen(true);
              }}
            />
          </div>
        </section>
      </main>
      <SiteFooter />
      <BookingDialog open={open} onOpenChange={setOpen} defaultPackage={pkg} />
      <Toaster richColors position="top-center" dir="rtl" />
    </>
  );
}
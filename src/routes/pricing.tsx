import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PricingList } from "@/components/PricingCards";
import { Toaster } from "@/components/ui/sonner";

const BookingDialog = lazy(() =>
  import("@/components/BookingDialog").then((m) => ({ default: m.BookingDialog })),
);

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
      <main className="min-h-screen bg-white">
        <section id="pricing" className="px-4 md:px-8 lg:px-16 py-16">
          <div className="max-w-7xl mx-auto flex flex-col gap-4 text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              پکیج‌های اجاره کنسول
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              روزانه، آخر هفته، هفتگی و ماهانه — بدون هزینه پنهان، شامل بیمه و ارسال رایگان در تهران.
            </p>
          </div>
          <div className="pricing-grid max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
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
      {open && (
        <Suspense fallback={null}>
          <BookingDialog open={open} onOpenChange={setOpen} defaultPackage={pkg} />
        </Suspense>
      )}
      <Toaster richColors position="top-center" dir="rtl" />
    </>
  );
}
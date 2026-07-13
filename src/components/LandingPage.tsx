import { lazy, Suspense, useEffect, useState } from "react";
import heroBody from "../hero-body.html?raw";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  ConsolesSection,
  WhySection,
  HowItWorksSection,
  TestimonialsSection,
  PricingSection,
  FaqSection,
  FinalCtaSection,
  NewsletterSection,
} from "@/components/LandingSections";
import { Toaster } from "@/components/ui/sonner";

const BookingDialog = lazy(() =>
  import("@/components/BookingDialog").then((m) => ({ default: m.BookingDialog })),
);

type Props = {
  /** Optional section id to smoothly scroll into view after mount (e.g. "pricing"). */
  scrollTo?: string;
};

export function LandingPage({ scrollTo }: Props) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [defaultPackage, setDefaultPackage] = useState<string | undefined>();

  useEffect(() => {
    const s = document.createElement("script");
    let appended = false;
    if (!document.querySelector('script[data-gamio="1"]')) {
      s.src = "/gamio.js";
      s.defer = true;
      s.dataset.gamio = "1";
      document.body.appendChild(s);
      appended = true;
    }
    return () => {
      if (appended) s.remove();
    };
  }, []);

  // Deep-link scroll for per-section SEO routes.
  useEffect(() => {
    if (!scrollTo) return;
    const id = setTimeout(() => {
      const el = document.getElementById(scrollTo);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
    return () => clearTimeout(id);
  }, [scrollTo]);

  const openReserve = (slug?: string) => {
    setDefaultPackage(slug);
    setBookingOpen(true);
  };

  return (
    <>
      <SiteHeader />
      <div
        className="tw-flex tw-flex-col tw-bg-white"
        dangerouslySetInnerHTML={{ __html: heroBody }}
      />
      <ConsolesSection />
      <WhySection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection onReserve={openReserve} />
      <FaqSection />
      <FinalCtaSection />
      <NewsletterSection />
      <SiteFooter />
      {bookingOpen && (
        <Suspense fallback={null}>
          <BookingDialog
            open={bookingOpen}
            onOpenChange={setBookingOpen}
            defaultPackage={defaultPackage}
          />
        </Suspense>
      )}
      <Toaster richColors position="top-center" dir="rtl" />
    </>
  );
}
import { lazy, Suspense, useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { HeroSection } from "@/components/HeroSection";
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
} from "@/components/sections";
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
      <HeroSection />
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
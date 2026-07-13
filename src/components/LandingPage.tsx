import { lazy, Suspense, useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Toaster } from "@/components/ui/sonner";
import { HeroSection } from "@/components/landing/HeroSection";
import { ConsolesSection } from "@/components/landing/ConsolesSection";
import { WhyUsSection } from "@/components/landing/WhyUsSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { NewsletterSection } from "@/components/landing/NewsletterSection";

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

  const openBooking = (slug?: string) => {
    setDefaultPackage(slug);
    setBookingOpen(true);
  };

  return (
    <>
      <SiteHeader />
      <main role="main" id="main" className="tw-flex tw-min-h-[100dvh] tw-flex-col tw-bg-white">
        <HeroSection />
        <ConsolesSection />
        <WhyUsSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection onReserve={openBooking} />
        <FaqSection />
        <CtaSection />
        <NewsletterSection />
      </main>
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
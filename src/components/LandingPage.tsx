import { lazy, Suspense, useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { HeroSection } from "@/components/HeroSection";
import { SiteFooter } from "@/components/SiteFooter";
// Above-the-fold sections stay eager for fast first paint + SSR HTML.
import {
  ConsolesSection,
  WhySection,
  HowItWorksSection,
  PricingSection,
} from "@/components/sections";

// Below-the-fold sections lazy-load to shrink the initial JS bundle.
const TestimonialsSection = lazy(() =>
  import("@/components/sections/TestimonialsSection").then((m) => ({
    default: m.TestimonialsSection,
  })),
);
const FaqSection = lazy(() =>
  import("@/components/sections/FaqSection").then((m) => ({ default: m.FaqSection })),
);
const FinalCtaSection = lazy(() =>
  import("@/components/sections/FinalCtaSection").then((m) => ({
    default: m.FinalCtaSection,
  })),
);
const NewsletterSection = lazy(() =>
  import("@/components/sections/NewsletterSection").then((m) => ({
    default: m.NewsletterSection,
  })),
);
const Toaster = lazy(() =>
  import("@/components/ui/sonner").then((m) => ({ default: m.Toaster })),
);

const BookingDialog = lazy(() =>
  import("@/components/BookingDialog").then((m) => ({ default: m.BookingDialog })),
);

const SectionFallback = () => <div style={{ minHeight: 400 }} aria-hidden />;

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

  // Defer the toast portal until the browser is idle so it does not
  // compete with above-the-fold rendering.
  const [showToaster, setShowToaster] = useState(false);
  useEffect(() => {
    type IdleFn = (cb: () => void) => number;
    const w = window as unknown as {
      requestIdleCallback?: IdleFn;
    };
    const schedule = w.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    const id = schedule(() => setShowToaster(true));
    return () => {
      if ("cancelIdleCallback" in window) {
        (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(id);
      } else {
        window.clearTimeout(id);
      }
    };
  }, []);

  return (
    <>
      <SiteHeader />
      <HeroSection />
      <ConsolesSection />
      <WhySection />
      <HowItWorksSection />
      <PricingSection onReserve={openReserve} />
      <Suspense fallback={<SectionFallback />}>
        <TestimonialsSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <FaqSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <FinalCtaSection />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <NewsletterSection />
      </Suspense>
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
      {showToaster && (
        <Suspense fallback={null}>
          <Toaster richColors position="top-center" dir="rtl" />
        </Suspense>
      )}
    </>
  );
}
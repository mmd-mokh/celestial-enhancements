import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { HeroSection } from "@/components/HeroSection";
import { ConsolesSection } from "@/components/sections/ConsolesSection";

// Only the hero + console cards stay in the initial client bundle. Everything
// lower on the page is loaded when it approaches the viewport.
const WhySection = lazy(() =>
  import("@/components/sections/WhySection").then((m) => ({ default: m.WhySection })),
);
const HowItWorksSection = lazy(() =>
  import("@/components/sections/HowItWorksSection").then((m) => ({
    default: m.HowItWorksSection,
  })),
);
const PricingSection = lazy(() =>
  import("@/components/sections/PricingSection").then((m) => ({
    default: m.PricingSection,
  })),
);
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
const SiteFooter = lazy(() =>
  import("@/components/SiteFooter").then((m) => ({ default: m.SiteFooter })),
);
const Toaster = lazy(() =>
  import("@/components/ui/sonner").then((m) => ({ default: m.Toaster })),
);

const BookingDialog = lazy(() =>
  import("@/components/BookingDialog").then((m) => ({ default: m.BookingDialog })),
);

function SectionFallback({ id, minHeight }: { id?: string; minHeight: number }) {
  return <div id={id} style={{ minHeight }} aria-hidden />;
}

function LazyOnVisible({
  id,
  minHeight = 480,
  children,
}: {
  id?: string;
  minHeight?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin: "700px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);

  if (!visible) return <SectionFallback id={id} minHeight={minHeight} />;

  return (
    <Suspense fallback={<SectionFallback id={id} minHeight={minHeight} />}>
      {children}
    </Suspense>
  );
}

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
      const anyWin = window as unknown as {
        cancelIdleCallback?: (id: number) => void;
      };
      if (anyWin.cancelIdleCallback) anyWin.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, []);

  return (
    <>
      <SiteHeader />
      <HeroSection />
      <ConsolesSection />
      <LazyOnVisible id="why-choose" minHeight={780}>
        <WhySection />
      </LazyOnVisible>
      <LazyOnVisible id="how-it-works" minHeight={560}>
        <HowItWorksSection />
      </LazyOnVisible>
      <LazyOnVisible id="pricing" minHeight={720}>
        <PricingSection onReserve={openReserve} />
      </LazyOnVisible>
      <LazyOnVisible id="testimonials" minHeight={620}>
        <TestimonialsSection />
      </LazyOnVisible>
      <LazyOnVisible id="faq" minHeight={620}>
        <FaqSection />
      </LazyOnVisible>
      <LazyOnVisible minHeight={420}>
        <FinalCtaSection />
      </LazyOnVisible>
      <LazyOnVisible minHeight={360}>
        <NewsletterSection />
      </LazyOnVisible>
      <LazyOnVisible minHeight={560}>
        <SiteFooter />
      </LazyOnVisible>
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
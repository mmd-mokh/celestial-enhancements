import { lazy, Suspense, useEffect, useState } from "react";
import gamioBody from "../gamio-body.html?raw";
import { PricingCards } from "@/components/PricingCards";
import { ConsoleCards } from "@/components/ConsoleCards";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FaqAccordion } from "@/components/FaqAccordion";
import { NewsletterForm } from "@/components/NewsletterForm";
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

    const pkgMap: Record<string, string> = {
      "روزانه": "daily",
      "آخر هفته": "weekend",
      "هفتگی": "weekly",
      "ماهانه": "monthly",
    };

    function onClick(ev: MouseEvent) {
      const target = ev.target as HTMLElement | null;
      if (!target) return;
      const btn = target.closest<HTMLElement>("a, button");
      if (!btn) return;
      const text = (btn.textContent || "").trim();
      if (text !== "رزرو کن") return;
      ev.preventDefault();
      const card = btn.closest<HTMLElement>(".pricing-card-enhanced, [data-package]");
      let pkg: string | undefined;
      if (card) {
        const slug = card.getAttribute("data-package");
        if (slug) pkg = slug;
        else {
          const heading = card.querySelector("h3, h4, .pricing-card-title");
          const label = heading?.textContent?.trim();
          if (label && pkgMap[label]) pkg = pkgMap[label];
        }
      }
      setDefaultPackage(pkg);
      setBookingOpen(true);
    }
    document.addEventListener("click", onClick);
    return () => {
      if (appended) s.remove();
      document.removeEventListener("click", onClick);
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

  return (
    <>
      <SiteHeader />
      <div
        className="tw-flex tw-min-h-[100dvh] tw-flex-col tw-bg-white"
        dangerouslySetInnerHTML={{ __html: gamioBody }}
      />
      <PricingCards
        onReserve={(slug) => {
          setDefaultPackage(slug);
          setBookingOpen(true);
        }}
      />
      <ConsoleCards />
      <FaqAccordion />
      <NewsletterForm />
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
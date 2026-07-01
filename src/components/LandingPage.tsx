import { useEffect, useState } from "react";
import gamioBody from "../gamio-body.html?raw";
import { BookingDialog } from "@/components/BookingDialog";
import { Toaster } from "@/components/ui/sonner";

type Props = {
  /** Optional section id to smoothly scroll into view after mount (e.g. "pricing"). */
  scrollTo?: string;
};

export function LandingPage({ scrollTo }: Props) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [defaultPackage, setDefaultPackage] = useState<string | undefined>();

  useEffect(() => {
    const s = document.createElement("script");
    s.src = "/gamio.js";
    s.defer = true;
    s.dataset.gamio = "1";
    document.body.appendChild(s);

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
        const heading = card.querySelector("h3, h4, .pricing-card-title");
        const label = heading?.textContent?.trim();
        if (label && pkgMap[label]) pkg = pkgMap[label];
      }
      setDefaultPackage(pkg);
      setBookingOpen(true);
    }
    document.addEventListener("click", onClick);
    return () => {
      s.remove();
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
      <div
        className="tw-flex tw-min-h-[100vh] tw-flex-col tw-bg-white"
        dangerouslySetInnerHTML={{ __html: gamioBody }}
      />
      <BookingDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        defaultPackage={defaultPackage}
      />
      <Toaster richColors position="top-center" dir="rtl" />
    </>
  );
}
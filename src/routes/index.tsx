import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import gamioBody from "../gamio-body.html?raw";
import { BookingDialog } from "@/components/BookingDialog";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [defaultPackage, setDefaultPackage] = useState<string | undefined>();

  useEffect(() => {
    const s = document.createElement("script");
    s.src = "/gamio.js";
    s.defer = true;
    s.dataset.gamio = "1";
    document.body.appendChild(s);

    // Package label -> value used by the DB
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
      // "رزرو کن" = "Reserve" on pricing cards. The nav CTA reads
      // "همین الان رزرو کن" and should keep scrolling to #pricing.
      if (text !== "رزرو کن") return;
      ev.preventDefault();

      // Find the enclosing pricing card and read its title as the package.
      const card = btn.closest<HTMLElement>(
        ".pricing-card-enhanced, [data-package]",
      );
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

import { lazy, Suspense, useState } from "react";
import { BsIcon } from "@/components/BsIcon";

const BookingDialog = lazy(() =>
  import("@/components/BookingDialog").then((m) => ({ default: m.BookingDialog })),
);

/**
 * Landing hero — big headline, dual CTAs, trust-badge chips, and the
 * decorative RGB mesh gradient behind the fold.
 */
export function HeroSection() {
  const [bookingOpen, setBookingOpen] = useState(false);
  return (
    <>
      <div className="mesh-gradient-container" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`mesh-orb mesh-orb-${i + 1}`} />
        ))}
      </div>

      <section
        role="region"
        aria-labelledby="hero-heading"
        id="hero"
        className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden px-6 py-16 md:px-12 lg:px-20 max-md:mt-[50px] bg-background"
      >
        <div className="hero-fade-in flex h-full min-h-[100dvh] w-full flex-col place-content-center gap-6 p-[5%] max-xl:place-items-center">
          <div className="flex flex-col place-content-center items-center">
            <h1
              id="hero-heading"
              className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight sm:leading-snug md:leading-tight"
            >
              <span className="block">تجربه PS و Xbox از امشب،</span>
              <span className="block text-primary">بدون پرداخت میلیون‌ها تومان</span>
            </h1>

            <div className="mt-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 dark:bg-primary-500/15 px-4 py-2 text-sm font-semibold text-primary-700 dark:text-primary-200 border border-primary-200 dark:border-primary-400/40">
                <BsIcon name="bi-star-fill" className="text-primary-600" size={16} />
                کنسولتو = دنیای گیمینگ بدون محدودیت مالی
              </span>
            </div>

            <p className="mt-6 max-w-full sm:max-w-[500px] md:max-w-[650px] mx-auto px-4 text-center text-base sm:text-lg leading-relaxed text-foreground/85">
              اجاره کنسول‌های نسل جدید با چند کلیک. انعطاف کامل، بازی‌های
              انحصاری، و تحویل سریع به درب منزل.
            </p>

            <div className="mt-8 flex place-items-center gap-4 p-2 max-md:w-full max-md:flex-col">
              <button
                type="button"
                onClick={() => setBookingOpen(true)}
                className="btn-premium min-h-12 whitespace-nowrap text-lg max-md:w-full"
              >
                همین الان رزرو کن
              </button>
              <a
                className="btn-ghost-outline min-h-12 whitespace-nowrap text-base max-md:w-full"
                href="#pricing"
              >
                <span className="inline-flex items-center gap-1">
                  <BsIcon name="bi-tag-fill" size={16} aria-hidden />
                  مشاهده تعرفه‌ها
                </span>
              </a>
            </div>

            <div
              className="hero-trust-badges"
              role="list"
              aria-label="مزایای سریع"
            >
              <span className="hero-trust-badge" role="listitem">
                <BsIcon name="bi-truck" size={18} aria-hidden />
                <span>تحویل رایگان در تهران</span>
              </span>
              <span className="hero-trust-badge" role="listitem">
                <BsIcon name="bi-shield-check" size={18} aria-hidden />
                <span>بدون نیاز به ضمانت</span>
              </span>
              <span className="hero-trust-badge" role="listitem">
                <BsIcon name="bi-headset" size={18} aria-hidden />
                <span>پشتیبانی ۲۴/۷</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {bookingOpen && (
        <Suspense fallback={null}>
          <BookingDialog open={bookingOpen} onOpenChange={setBookingOpen} />
        </Suspense>
      )}

      <section
        role="region"
        aria-labelledby="trust-badges-heading"
        id="trust-badges"
        className="relative flex w-full flex-col place-content-center place-items-center px-6 py-12 md:px-12 lg:px-20 bg-gray-50"
      >
        <h2 id="trust-badges-heading" className="sr-only">
          آمار و اعتماد
        </h2>
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-8 text-center">
            <p className="text-lg font-semibold text-gray-800 mb-2">
              مورد اعتماد هزاران گیمر ایرانی
            </p>
            <p className="text-sm text-gray-700">آمار واقعی از عملکرد ما</p>
          </div>
          <div className="flex w-full place-content-center gap-8 md:gap-12 flex-wrap">
            {[
              { icon: "bi-people-fill", value: "+۵۰۰۰", label: "اجاره موفق" },
              { icon: "bi-star-fill", value: "۹۸٪", label: "رضایت مشتریان" },
              { icon: "bi-headset", value: "۲۴/۷", label: "پشتیبانی" },
            ].map((m) => (
              <div
                key={m.label}
                className="flex flex-col items-center gap-3 p-4 min-w-[140px] trust-badge"
              >
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <BsIcon name={m.icon} size={28} className="text-primary icon-standard" />
                </div>
                <div className="text-4xl font-bold text-primary">
                  {m.value}
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
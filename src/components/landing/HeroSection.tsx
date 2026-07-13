import { motion } from "framer-motion";

/** Hero + trust-badges (formerly #hero + #trust-badges in gamio-body.html). */
export function HeroSection() {
  return (
    <>
      <section
        role="region"
        aria-labelledby="hero-heading"
        className="tw-relative tw-flex tw-min-h-[100vh] tw-w-full tw-flex-col tw-overflow-hidden tw-px-6 tw-py-16 md:tw-px-12 lg:tw-px-20 max-md:tw-mt-[50px] tw-bg-white"
        id="hero"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="tw-flex tw-h-full tw-min-h-[100vh] tw-w-full tw-flex-col tw-place-content-center tw-gap-6 tw-p-[5%] max-xl:tw-place-items-center"
        >
          <div className="tw-flex tw-flex-col tw-place-content-center tw-items-center">
            <h1
              id="hero-heading"
              className="tw-text-center tw-text-3xl sm:tw-text-4xl md:tw-text-5xl lg:tw-text-6xl tw-font-bold tw-leading-tight sm:tw-leading-snug md:tw-leading-tight"
            >
              <span className="tw-block">تجربه PS و Xbox از امشب،</span>
              <span className="tw-block">بدون پرداخت میلیون‌ها تومان</span>
            </h1>

            <div className="tw-mt-6 tw-flex tw-justify-center">
              <span className="tw-inline-flex tw-items-center tw-gap-2 tw-rounded-full tw-bg-primary-100 tw-px-4 tw-py-2 tw-text-sm tw-font-semibold tw-text-primary-700 tw-border tw-border-primary-200">
                <i className="bi bi-star-fill tw-text-primary-600" aria-hidden="true" />
                گیمیو = دنیای گیمینگ بدون محدودیت مالی
              </span>
            </div>

            <p className="tw-mt-6 tw-max-w-full sm:tw-max-w-[500px] md:tw-max-w-[650px] tw-mx-auto tw-px-4 tw-text-center tw-text-base sm:tw-text-lg tw-leading-relaxed tw-text-gray-700">
              اجاره کنسول‌های نسل جدید با چند کلیک. انعطاف کامل، بازی‌های انحصاری، و تحویل سریع به درب منزل.
            </p>

            <div className="tw-mt-8 tw-flex tw-place-items-center tw-gap-4 tw-overflow-hidden tw-p-2 max-md:tw-flex-col">
              <a
                className="btn btn-enhanced tw-whitespace-nowrap tw-text-lg tw-px-8 tw-py-4 tw-shadow-lg"
                href="#pricing"
              >
                همین الان رزرو کن
              </a>
              <a
                className="btn-secondary-enhanced tw-whitespace-nowrap tw-rounded-full tw-border-2 tw-border-primary tw-bg-transparent tw-px-6 tw-py-3 tw-text-base tw-font-semibold tw-text-primary"
                href="#pricing"
              >
                <span>
                  <i className="bi bi-tag-fill" aria-hidden="true" />
                  {" "}مشاهده تعرفه‌ها
                </span>
              </a>
            </div>

            <div className="hero-trust-badges" role="list" aria-label="مزایای سریع">
              <span className="hero-trust-badge" role="listitem">
                <i className="bi bi-truck" aria-hidden="true" />
                <span>تحویل رایگان در تهران</span>
              </span>
              <span className="hero-trust-badge" role="listitem">
                <i className="bi bi-shield-check" aria-hidden="true" />
                <span>بدون نیاز به ضمانت</span>
              </span>
              <span className="hero-trust-badge" role="listitem">
                <i className="bi bi-headset" aria-hidden="true" />
                <span>پشتیبانی ۲۴/۷</span>
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      <TrustStats />
    </>
  );
}

function TrustStats() {
  const items = [
    { icon: "bi-people-fill", value: "+۵۰۰۰", label: "اجاره موفق" },
    { icon: "bi-star-fill", value: "۹۸٪", label: "رضایت مشتریان" },
    { icon: "bi-headset", value: "۲۴/۷", label: "پشتیبانی" },
  ];
  return (
    <section
      role="region"
      aria-labelledby="trust-badges-heading"
      className="tw-relative tw-flex tw-w-full tw-flex-col tw-place-content-center tw-place-items-center tw-px-6 tw-py-12 md:tw-px-12 lg:tw-px-20 tw-bg-gray-50"
      id="trust-badges"
    >
      <h2 id="trust-badges-heading" className="tw-sr-only">آمار و اعتماد</h2>
      <div className="tw-max-w-7xl tw-mx-auto tw-w-full">
        <div className="tw-mb-8 tw-text-center">
          <p className="tw-text-lg tw-font-semibold tw-text-gray-800 tw-mb-2">
            مورد اعتماد هزاران گیمر ایرانی
          </p>
          <p className="tw-text-sm tw-text-gray-700">آمار واقعی از عملکرد ما</p>
        </div>
        <div className="tw-flex tw-w-full tw-place-content-center tw-gap-8 md:tw-gap-12 tw-flex-wrap">
          {items.map((s) => (
            <div
              key={s.label}
              className="tw-flex tw-flex-col tw-items-center tw-gap-3 tw-p-4 tw-min-w-[140px] trust-badge"
            >
              <div className="tw-w-12 tw-h-12 tw-rounded-full tw-bg-primary-100 tw-flex tw-items-center tw-justify-center">
                <i className={`bi ${s.icon} tw-text-2xl tw-text-primary icon-standard`} />
              </div>
              <div className="tw-text-4xl tw-font-bold tw-text-primary">{s.value}</div>
              <div className="tw-text-sm tw-font-medium tw-text-gray-700">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
/** Final gradient CTA band (formerly #final-cta). */
export function CtaSection() {
  return (
    <section
      role="region"
      aria-labelledby="final-cta-heading"
      className="tw-flex tw-w-full tw-flex-col tw-place-content-center tw-place-items-center tw-gap-6 tw-px-6 tw-py-20 md:tw-px-12 lg:tw-px-20 tw-text-white"
      style={{ backgroundImage: "linear-gradient(to right, #9333ea, #2563eb)" }}
    >
      <div className="tw-max-w-7xl tw-mx-auto tw-w-full tw-flex tw-flex-col tw-items-center tw-gap-6">
        <h2
          id="final-cta-heading"
          className="tw-text-4xl md:tw-text-5xl tw-font-bold tw-text-center"
        >
          آماده‌ای دنیای گیمینگ رو بدون محدودیت تجربه کنی؟
        </h2>
        <p className="tw-text-lg md:tw-text-xl tw-text-center tw-max-w-3xl tw-leading-relaxed">
          هزاران گیمر ایرانی الان دارن با گیمیو، بهترین کنسول‌های دنیا رو بدون نگرانی مالی تجربه می‌کنن. نوبت توئه که به این جمع بپیوندی. دیگه وقتشه که محدودیت‌های مالی جلوی لذت بازی‌کردنت رو نگیره. همین الان شروع کن!
        </p>
        <a
          href="#pricing"
          className="btn-secondary-enhanced tw-inline-block tw-rounded-full tw-bg-white tw-text-primary tw-text-lg md:tw-text-xl tw-px-8 tw-py-4 tw-font-bold tw-shadow-lg"
        >
          الان کنسولت رو رزرو کن
        </a>
        <div className="tw-flex tw-flex-wrap tw-justify-center tw-gap-6 md:tw-gap-8 tw-mt-6 tw-text-sm md:tw-text-base">
          <div className="tw-flex tw-items-center tw-gap-2">
            <i className="bi bi-check-circle-fill" />
            <span>بیش از ۵۰۰۰ اجاره موفق</span>
          </div>
          <div className="tw-flex tw-items-center tw-gap-2">
            <i className="bi bi-check-circle-fill" />
            <span>رضایت ۹۸٪ مشتریان</span>
          </div>
          <div className="tw-flex tw-items-center tw-gap-2">
            <i className="bi bi-check-circle-fill" />
            <span>پشتیبانی ۲۴/۷</span>
          </div>
        </div>
      </div>
    </section>
  );
}
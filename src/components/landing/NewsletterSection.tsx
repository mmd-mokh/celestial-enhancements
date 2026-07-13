import { NewsletterForm } from "@/components/NewsletterForm";

/** Newsletter signup section (formerly the last section in gamio-body.html). */
export function NewsletterSection() {
  return (
    <section
      role="region"
      aria-labelledby="newsletter-heading"
      className="tw-flex tw-w-full tw-flex-col tw-place-content-center tw-place-items-center tw-px-6 tw-py-16 md:tw-px-12 lg:tw-px-20 tw-bg-white"
    >
      <div className="tw-max-w-7xl tw-mx-auto tw-w-full">
        <div className="tw-flex tw-w-full tw-flex-col tw-place-content-center tw-place-items-center tw-gap-3">
          <h2
            id="newsletter-heading"
            className="tw-text-2xl md:tw-text-3xl tw-text-primary tw-font-bold tw-text-center"
          >
            عضویت در خبرنامه
          </h2>
          <p className="tw-text-base md:tw-text-lg tw-text-center tw-text-gray-700 tw-max-w-2xl">
            از جدیدترین کنسول‌ها، تخفیف‌های ویژه، و اخبار دنیای گیمینگ باخبر شو!
          </p>
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
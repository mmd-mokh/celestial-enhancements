import { FaqList } from "@/components/FaqAccordion";

/** FAQ section (formerly #faq). */
export function FaqSection() {
  return (
    <section
      role="region"
      aria-labelledby="faq-heading"
      className="tw-flex tw-w-full tw-flex-col tw-place-items-center tw-px-6 tw-py-16 md:tw-px-12 lg:tw-px-20 tw-bg-gray-50"
      id="faq"
    >
      <div className="tw-max-w-7xl tw-mx-auto tw-w-full">
        <div className="tw-flex tw-flex-col tw-gap-3 tw-text-center tw-mb-12">
          <h3 className="tw-text-xl tw-text-primary tw-font-semibold">
            پاسخ سوالاتی که ممکنه داشته باشی
          </h3>
          <h2 id="faq-heading" className="tw-text-2xl md:tw-text-4xl tw-font-bold">
            سوالات متداول
          </h2>
        </div>

        <div className="tw-max-w-4xl tw-mx-auto tw-w-full tw-flex tw-flex-col tw-gap-4">
          <FaqList />
        </div>

        <div className="tw-mt-12 tw-text-center">
          <p className="tw-text-gray-700 tw-mb-4">سوال دیگه‌ای داری؟</p>
          <a
            href="/contact"
            className="btn-secondary-enhanced tw-inline-block tw-rounded-full tw-border-2 tw-border-primary tw-bg-transparent tw-px-6 tw-py-3 tw-text-base tw-font-semibold tw-text-primary"
          >
            با پشتیبانی تماس بگیر
          </a>
        </div>
      </div>
    </section>
  );
}
import { PricingList } from "@/components/PricingCards";

/** Pricing section (formerly #pricing). */
export function PricingSection({ onReserve }: { onReserve: (slug: string) => void }) {
  return (
    <section
      role="region"
      aria-labelledby="pricing-heading"
      className="tw-flex tw-w-full tw-flex-col tw-place-items-center tw-px-6 tw-py-16 md:tw-px-12 lg:tw-px-20 tw-bg-white"
      id="pricing"
    >
      <div className="tw-max-w-7xl tw-mx-auto tw-w-full">
        <div className="tw-flex tw-flex-col tw-gap-3 tw-text-center tw-mb-8">
          <h3 className="tw-text-xl tw-text-primary tw-font-semibold">بدون هزینه پنهان</h3>
          <h2 id="pricing-heading" className="tw-text-2xl md:tw-text-4xl tw-font-bold">
            پکیج‌های اجاره منعطف برای هر نیازی
          </h2>
          <p className="tw-text-gray-700 tw-mt-4 tw-max-w-[700px] tw-mx-auto tw-leading-relaxed">
            قیمت‌گذاری شفاف، بدون هزینه پنهان. هر پکیجی که انتخاب کنی، شامل کنسول کامل با تمام لوازم جانبی، پشتیبانی ۲۴/۷، و ضمانت کیفیت می‌شه. هرچه مدت اجاره بیشتر، صرفه‌جویی بیشتر.
          </p>
        </div>

        <div className="pricing-grid tw-mt-10 tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-6">
          <PricingList onReserve={onReserve} />
        </div>
      </div>
    </section>
  );
}
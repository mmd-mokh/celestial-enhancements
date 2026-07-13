import { motion } from "framer-motion";
import { PACKAGES } from "@/components/PricingCards";
import { cn } from "@/lib/utils";
import { SectionHeading, SectionShell } from "./primitives";

type Pkg = (typeof PACKAGES)[number];

function PricingCard({
  pkg,
  index,
  onReserve,
}: {
  pkg: Pkg;
  index: number;
  onReserve: (slug: string) => void;
}) {
  const featured = !!pkg.popular;
  return (
    <motion.div
      data-package={pkg.slug}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className={cn(
        "pricing-card-enhanced flex flex-col place-items-center gap-4 rounded-xl p-4 md:p-6 lg:p-8 bg-white",
        featured
          ? "pricing-card-featured shadow-2xl bg-gradient-to-br from-primary-50 to-white border-[3px] border-primary relative lg:scale-105"
          : "shadow-lg",
      )}
    >
      {featured && (
        <>
          <span className="pricing-card-accent-stripe" aria-hidden="true" />
          <span className="pricing-card-featured-glow" aria-hidden="true" />
        </>
      )}
      <i className={`bi ${pkg.icon} text-primary text-5xl icon-standard`} />
      <h4 className="text-2xl font-bold text-gray-800">{pkg.name}</h4>
      <p className="text-center text-gray-700 text-sm">{pkg.description}</p>
      <div className="text-center my-2">
        <div
          className={cn(
            "font-bold text-primary",
            featured ? "pricing-featured-price text-6xl" : "text-5xl",
          )}
        >
          {pkg.price}
        </div>
        <div className="text-gray-700 text-base mt-1">{pkg.unit}</div>
        {pkg.badge && (
          <div className="inline-block text-xs text-white bg-green-600 px-3 py-1 rounded-full font-semibold mt-3">
            {pkg.badge}
          </div>
        )}
      </div>
      <hr className="w-full border-gray-200" />
      <ul className="flex flex-col gap-3 text-right w-full text-sm">
        {pkg.features.map((f, k) => (
          <li key={k} className="flex items-start gap-2">
            <i className="bi bi-check-circle-fill text-primary mt-1 text-base" />
            <span className="text-gray-700">{f}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onReserve(pkg.slug)}
        className="btn btn-enhanced mt-4 !w-full"
      >
        رزرو کن
      </button>
    </motion.div>
  );
}

export function PricingSection({ onReserve }: { onReserve: (slug: string) => void }) {
  return (
    <SectionShell id="pricing" ariaLabelledBy="pricing-heading">
      <SectionHeading
        className="mb-8"
        eyebrow="بدون هزینه پنهان"
        title="پکیج‌های اجاره منعطف برای هر نیازی"
        titleId="pricing-heading"
        description="قیمت‌گذاری شفاف، بدون هزینه پنهان. هر پکیجی که انتخاب کنی، شامل کنسول کامل با تمام لوازم جانبی، پشتیبانی ۲۴/۷، و ضمانت کیفیت می‌شه. هرچه مدت اجاره بیشتر، صرفه‌جویی بیشتر."
      />
      <div className="pricing-grid mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PACKAGES.map((p, i) => (
          <PricingCard key={p.slug} pkg={p} index={i} onReserve={onReserve} />
        ))}
      </div>
    </SectionShell>
  );
}
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type Pkg = {
  slug: string;
  name: string;
  description: string;
  price: string;
  unit: string;
  features: string[];
  badge?: string;
  popular?: boolean;
  icon: string;
};

// Original static package content from the ported landing page.
export const PACKAGES: Pkg[] = [
  {
    slug: "daily",
    name: "اجاره روزانه",
    description: "برای تست سریع یا مهمونی یک‌شبه",
    price: "۲۵۰,۰۰۰",
    unit: "تومان/روز",
    features: [
      "کنسول اورجینال و تست‌شده",
      "دو دسته بازی (کنترلر)",
      "تمام کابل‌ها و لوازم",
      "پشتیبانی ۲۴/۷",
    ],
    icon: "bi-joystick",
  },
  {
    slug: "weekend",
    name: "اجاره آخر هفته",
    description: "بهترین گزینه برای تعطیلات پرهیجان",
    price: "۶۵۰,۰۰۰",
    unit: "تومان/آخر هفته",
    features: [
      "۳ روز بازی بدون وقفه",
      "تحویل و بازگشت رایگان",
      "بیمه کامل دستگاه",
      "امکان تمدید آسان",
    ],
    badge: "۱۳٪ صرفه‌جویی",
    popular: true,
    icon: "bi-trophy-fill",
  },
  {
    slug: "weekly",
    name: "اجاره هفتگی",
    description: "یک هفته کامل، تجربه کامل",
    price: "۱,۴۰۰,۰۰۰",
    unit: "تومان/هفته",
    features: [
      "۷ روز فرصت کامل",
      "بهترین ارزش در مقابل قیمت",
      "تخفیف ویژه نسبت به روزانه",
      "پشتیبانی اختصاصی",
    ],
    badge: "۲۰٪ صرفه‌جویی",
    icon: "bi-clock-history",
  },
  {
    slug: "monthly",
    name: "اجاره ماهانه",
    description: "برای گیمرهای حرفه‌ای و علاقه‌مندان جدی",
    price: "۴,۵۰۰,۰۰۰",
    unit: "تومان/ماه",
    features: [
      "یک ماه کامل با کنسول",
      "بیشترین صرفه‌جویی",
      "انعطاف کامل در تمدید",
      "پشتیبانی اختصاصی",
    ],
    badge: "۴۰٪ صرفه‌جویی",
    icon: "bi-calendar-week",
  },
];

type Props = {
  onReserve: (slug: string) => void;
};

/**
 * Hydrates the `.pricing-grid` container in the ported HTML with the
 * original static pricing cards (styled + animated).
 */
export function PricingCards({ onReserve }: Props) {
  const [mount, setMount] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let tries = 0;
    const find = () => {
      const el = document.querySelector<HTMLElement>(".pricing-grid");
      if (el) {
        el.innerHTML = "";
        setMount(el);
        return;
      }
      if (tries++ < 20) setTimeout(find, 100);
    };
    find();
  }, []);

  if (!mount) return null;

  return createPortal(<PricingList onReserve={onReserve} />, mount);
}

/** Standalone renderer of the pricing cards (no portal). Used by dedicated /pricing page. */
export function PricingList({ onReserve }: Props) {
  return (
    <>
      {PACKAGES.map((p, i) => {
        const featured = !!p.popular;
        return (
          <motion.div
            key={p.slug}
            data-package={p.slug}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className={cn(
              "pricing-card-enhanced tw-flex tw-flex-col tw-place-items-center tw-gap-4 tw-rounded-xl tw-p-4 md:tw-p-6 lg:tw-p-8 tw-bg-white",
              featured
                ? "pricing-card-featured tw-shadow-2xl tw-bg-gradient-to-br tw-from-primary-50 tw-to-white tw-border-[3px] tw-border-primary tw-relative lg:tw-scale-105"
                : "tw-shadow-lg",
            )}
          >
            {featured && (
              <>
                <span className="pricing-card-accent-stripe" aria-hidden="true" />
                <span className="pricing-card-featured-glow" aria-hidden="true" />
              </>
            )}
            <i className={`bi ${p.icon} tw-text-primary tw-text-5xl icon-standard`} />
            <h4 className="tw-text-2xl tw-font-bold tw-text-gray-800">{p.name}</h4>
            <p className="tw-text-center tw-text-gray-700 tw-text-sm">{p.description}</p>
            <div className="tw-text-center tw-my-2">
              <div
                className={cn(
                  "tw-font-bold tw-text-primary",
                  featured ? "pricing-featured-price tw-text-6xl" : "tw-text-5xl",
                )}
              >
                {p.price}
              </div>
              <div className="tw-text-gray-700 tw-text-base tw-mt-1">{p.unit}</div>
              {p.badge && (
                <div className="tw-inline-block tw-text-xs tw-text-white tw-bg-green-600 tw-px-3 tw-py-1 tw-rounded-full tw-font-semibold tw-mt-3">
                  {p.badge}
                </div>
              )}
            </div>
            <hr className="tw-w-full tw-border-gray-200" />
            <ul className="tw-flex tw-flex-col tw-gap-3 tw-text-right tw-w-full tw-text-sm">
              {p.features.map((f, k) => (
                <li key={k} className="tw-flex tw-items-start tw-gap-2">
                  <i className="bi bi-check-circle-fill tw-text-primary tw-mt-1 tw-text-base" />
                  <span className="tw-text-gray-700">{f}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => onReserve(p.slug)}
              className="btn btn-enhanced tw-mt-4 !tw-w-full"
            >
              رزرو کن
            </button>
          </motion.div>
        );
      })}
    </>
  );
}
import { cn } from "@/lib/utils";
import { BsIcon } from "@/components/BsIcon";
import { FadeInUp } from "@/components/sections/primitives";

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

/** Standalone renderer of the pricing cards. Used by /pricing and landing. */
export function PricingList({ onReserve }: Props) {
  return (
    <>
      {PACKAGES.map((p, i) => {
        const featured = !!p.popular;
        return (
          <FadeInUp
            key={p.slug}
            data-package={p.slug}
            index={i}
            className={cn(
              "pricing-card-enhanced flex flex-col place-items-center gap-4 rounded-xl p-4 md:p-6 lg:p-8 bg-white transition-transform duration-200 hover:-translate-y-2",
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
            <BsIcon name={p.icon} size={48} className="text-primary icon-standard" />
            <h4 className="text-2xl font-bold text-gray-800">{p.name}</h4>
            <p className="text-center text-gray-700 text-sm">{p.description}</p>
            <div className="text-center my-2">
              <div
                className={cn(
                  "font-bold text-primary",
                  featured ? "pricing-featured-price text-6xl" : "text-5xl",
                )}
              >
                {p.price}
              </div>
              <div className="text-gray-700 text-base mt-1">{p.unit}</div>
              {p.badge && (
                <div className="inline-block text-xs text-white bg-green-600 px-3 py-1 rounded-full font-semibold mt-3">
                  {p.badge}
                </div>
              )}
            </div>
            <hr className="w-full border-gray-200" />
            <ul className="flex flex-col gap-3 text-right w-full text-sm">
              {p.features.map((f, k) => (
                <li key={k} className="flex items-start gap-2">
                  <BsIcon name="bi-check-circle-fill" size={16} className="text-primary mt-1" />
                  <span className="text-gray-700">{f}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => onReserve(p.slug)}
              className="btn btn-enhanced mt-4 !w-full"
            >
              رزرو کن
            </button>
          </FadeInUp>
        );
      })}
    </>
  );
}
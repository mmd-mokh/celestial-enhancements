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
              "surface-card flex flex-col place-items-center gap-4 p-4 md:p-6 lg:p-8",
              featured
                ? "pricing-card-featured relative border-2 border-primary shadow-[0_20px_60px_-20px_color-mix(in_oklab,var(--color-primary)_45%,transparent)] lg:scale-105"
                : "",
            )}
          >
            {featured && (
              <>
                <span className="pricing-card-accent-stripe" aria-hidden="true" />
                <span className="pricing-card-featured-glow" aria-hidden="true" />
              </>
            )}
            <BsIcon name={p.icon} size={48} className="text-primary icon-standard" />
            <h4 className="text-2xl font-bold text-foreground">{p.name}</h4>
            <p className="text-center text-muted-foreground text-sm">{p.description}</p>
            <div className="text-center my-2">
              <div
                className={cn(
                  "font-bold text-primary tabular-nums",
                  featured ? "pricing-featured-price text-6xl" : "text-5xl",
                )}
              >
                {p.price}
              </div>
              <div className="text-muted-foreground text-base mt-1">{p.unit}</div>
              {p.badge && (
                <div className="inline-block text-xs text-white bg-emerald-600 px-3 py-1 rounded-full font-semibold mt-3 shadow-sm">
                  {p.badge}
                </div>
              )}
            </div>
            <hr className="w-full border-border" />
            <ul className="flex flex-col gap-3 text-right w-full text-sm">
              {p.features.map((f, k) => (
                <li key={k} className="flex items-start gap-2">
                  <BsIcon name="bi-check-circle-fill" size={16} className="text-primary mt-1" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => onReserve(p.slug)}
              className="btn-premium mt-4 w-full min-h-11"
            >
              رزرو کن
            </button>
          </FadeInUp>
        );
      })}
    </>
  );
}
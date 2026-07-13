import { motion } from "framer-motion";

type Props = {
  onReserve?: () => void;
};

const badges = [
  { icon: "bi-truck", label: "تحویل رایگان در تهران" },
  { icon: "bi-shield-check", label: "بدون نیاز به ضمانت" },
  { icon: "bi-headset", label: "پشتیبانی ۲۴/۷" },
];

export function Hero({ onReserve }: Props) {
  return (
    <section
      id="hero"
      role="region"
      aria-labelledby="hero-heading"
      dir="rtl"
      className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-background px-6 py-16 max-md:mt-[50px] md:px-12 lg:px-20"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col place-content-center items-center gap-6 py-[5%]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <h1
            id="hero-heading"
            className="text-center text-3xl font-bold leading-tight text-foreground sm:text-4xl sm:leading-snug md:text-5xl md:leading-tight lg:text-6xl"
          >
            <span className="block">تجربه PS و Xbox از امشب،</span>
            <span className="block">بدون پرداخت میلیون‌ها تومان</span>
          </h1>

          <div className="mt-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <i className="bi bi-star-fill" aria-hidden="true" />
              گیمیو = دنیای گیمینگ بدون محدودیت مالی
            </span>
          </div>

          <p className="mt-6 mx-auto max-w-full px-4 text-center text-base leading-relaxed text-muted-foreground sm:max-w-[500px] sm:text-lg md:max-w-[650px]">
            اجاره کنسول‌های نسل جدید با چند کلیک. انعطاف کامل، بازی‌های انحصاری،
            و تحویل سریع به درب منزل.
          </p>

          <div className="mt-8 flex place-items-center gap-4 overflow-hidden p-2 max-md:flex-col">
            <button
              type="button"
              onClick={onReserve}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/40"
            >
              همین الان رزرو کن
            </button>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 border-primary bg-transparent px-6 py-3 text-base font-semibold text-primary transition hover:bg-primary/10"
            >
              <i className="bi bi-tag-fill" aria-hidden="true" />
              مشاهده تعرفه‌ها
            </a>
          </div>

          <ul
            className="mt-8 flex flex-wrap justify-center gap-3"
            role="list"
            aria-label="مزایای سریع"
          >
            {badges.map((b) => (
              <li
                key={b.label}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-card-foreground"
              >
                <i className={`bi ${b.icon} text-primary`} aria-hidden="true" />
                <span>{b.label}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

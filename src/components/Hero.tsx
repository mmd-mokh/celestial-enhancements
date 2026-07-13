import { Star, Truck, ShieldCheck, Headset, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onReserve: () => void;
};

export function Hero({ onReserve }: Props) {
  return (
    <section
      id="hero"
      role="region"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[100vh] w-full flex-col overflow-hidden bg-background px-6 py-16 max-md:mt-[50px] md:px-12 lg:px-20"
    >
      <div className="flex h-full min-h-[100vh] w-full flex-col place-content-center gap-6 p-[5%] max-xl:place-items-center">
        <div className="flex flex-col place-content-center items-center">
          <h1
            id="hero-heading"
            className="text-center text-3xl font-bold leading-tight sm:text-4xl sm:leading-snug md:text-5xl md:leading-tight lg:text-6xl"
          >
            <span className="block">تجربه PS و Xbox از امشب،</span>
            <span className="block">بدون پرداخت میلیون‌ها تومان</span>
          </h1>

          <div className="mt-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <Star className="h-4 w-4 fill-primary" aria-hidden="true" />
              گیمیو = دنیای گیمینگ بدون محدودیت مالی
            </span>
          </div>

          <p className="mx-auto mt-6 max-w-full px-4 text-center text-base leading-relaxed text-muted-foreground sm:max-w-[500px] sm:text-lg md:max-w-[650px]">
            اجاره کنسول‌های نسل جدید با چند کلیک. انعطاف کامل، بازی‌های
            انحصاری، و تحویل سریع به درب منزل.
          </p>

          <div className="mt-8 flex place-items-center gap-4 overflow-hidden p-2 max-md:flex-col">
            <Button
              size="lg"
              onClick={onReserve}
              className="whitespace-nowrap rounded-full px-8 py-6 text-lg shadow-lg"
            >
              همین الان رزرو کن
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="whitespace-nowrap rounded-full border-2 border-primary bg-transparent px-6 py-3 text-base font-semibold text-primary"
            >
              <a href="#pricing">
                <Tag className="ms-2 h-4 w-4" aria-hidden="true" />
                مشاهده تعرفه‌ها
              </a>
            </Button>
          </div>

          <ul
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
            aria-label="مزایای سریع"
          >
            <li className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm text-foreground/80 backdrop-blur">
              <Truck className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>تحویل رایگان در تهران</span>
            </li>
            <li className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm text-foreground/80 backdrop-blur">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>بدون نیاز به ضمانت</span>
            </li>
            <li className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm text-foreground/80 backdrop-blur">
              <Headset className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>پشتیبانی ۲۴/۷</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
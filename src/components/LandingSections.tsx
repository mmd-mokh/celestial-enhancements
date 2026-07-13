import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PACKAGES } from "@/components/PricingCards";
import { FaqList } from "@/components/FaqAccordion";
import { ConsoleList, type ConsoleRow } from "@/components/ConsoleCards";
import { NewsletterFormStandalone } from "@/components/NewsletterForm";
import { cn } from "@/lib/utils";

const HIDDEN_CONSOLES = new Set(["ps4", "xbox-series-s", "xbox-one"]);

/* -------------------------------- Consoles -------------------------------- */

export function ConsolesSection() {
  const [items, setItems] = useState<ConsoleRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("consoles")
        .select("slug,name,tagline,features,icon,accent_from,accent_to,sort_order")
        .eq("active", true)
        .order("sort_order");
      if (!cancelled && data) {
        setItems((data as ConsoleRow[]).filter((r) => !HIDDEN_CONSOLES.has(r.slug)));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      role="region"
      aria-labelledby="consoles-heading"
      id="consoles"
      className="relative flex w-full flex-col place-content-center place-items-center px-6 py-16 md:px-12 lg:px-20 bg-white"
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="mx-auto flex max-w-[850px] flex-col gap-5 text-center">
          <h2
            id="consoles-heading"
            className="mt-10 text-center text-4xl font-bold max-lg:text-2xl"
          >
            <span className="text-primary">کنسول‌های نسل جدید</span> در دسترست
          </h2>
          <div className="text-center text-gray-700 text-lg leading-relaxed">
            دسترسی فوری به قدرتمندترین کنسول‌های بازی دنیا.{" "}
            <strong>PlayStation 5</strong> با گرافیک خیره‌کننده و بازی‌های انحصاری
            مثل God of War و Spider-Man. <strong>Xbox Series X</strong> با Game
            Pass نامحدود و قدرت پردازشی بی‌نظیر. <strong>Nintendo Switch</strong>{" "}
            برای بازی‌های خانوادگی و سرگرمی همه‌جا. هر کدوم رو که انتخاب کنی، دنیای
            جدیدی از هیجان و ماجراجویی در انتظارته.
          </div>
          <a
            href="#pricing"
            className="btn-secondary-enhanced mx-auto mt-4 inline-block rounded-full border-2 border-primary bg-transparent px-6 py-3 text-base font-semibold text-primary"
          >
            همین الان کنسول موردعلاقه‌ات رو انتخاب کن
          </a>
        </div>

        <div
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
          role="list"
          aria-label="کنسول‌های موجود"
        >
          {items && <ConsoleList items={items} />}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Why us --------------------------------- */

const BENEFITS: Array<{ icon: string; title: string; body: string }> = [
  {
    icon: "bi-piggy-bank-fill",
    title: "تجربه کن، نخر - پول‌ات رو ذخیره کن",
    body:
      "چرا ۳۰ میلیون تومان برای PS5 بدی وقتی می‌تونی با کسری از این مبلغ، هر ماه کنسول جدیدی رو تجربه کنی؟ با گیمیو، بودجه‌ات رو برای بازی‌های بیشتر و تجربه‌های متنوع‌تر نگه دار.",
  },
  {
    icon: "bi-shuffle",
    title: "امروز PS5، فردا Xbox - تو تصمیم می‌گیری",
    body:
      "دیگه نیازی نیست خودت رو به یک کنسول محدود کنی. هر هفته می‌تونی کنسول عوض کنی، بازی‌های انحصاری همه پلتفرم‌ها رو تجربه کنی، و همیشه با جدیدترین تکنولوژی گیمینگ همراه باشی.",
  },
  {
    icon: "bi-shield-check",
    title: "فراموش کن نگهداری، آپدیت، و تعمیر",
    body:
      "ما مراقب همه چیز هستیم. کنسول‌های تمیز و کاملاً تست‌شده، پشتیبانی ۲۴/۷، و اگر مشکلی پیش اومد فوراً جایگزین می‌کنیم. تو فقط بازی کن و لذت ببر.",
  },
  {
    icon: "bi-people-fill",
    title: "مهمونی، دورهمی، تعطیلات - همیشه آماده",
    body:
      "جشن تولد داری؟ دوستات میان خونه؟ تعطیلات نوروز؟ با اجاره کنسول از گیمیو، هر جمع‌ای رو به یه تجربه فراموش‌نشدنی تبدیل کن. سرگرمی حرفه‌ای برای همه سنین.",
  },
  {
    icon: "bi-check-circle-fill",
    title: "مطمئن شو قبل از اینکه سرمایه‌گذاری کنی",
    body:
      "نمی‌دونی PS5 بگیری یا Xbox؟ نینتندو سوییچ واقعاً برات مناسبه؟ با اجاره از گیمیو، اول امتحان کن، بعد تصمیم بگیر. ریسک صفر، اطمینان صد درصد.",
  },
  {
    icon: "bi-truck",
    title: "رزرو آنلاین، تحویل درب منزل، بازگشت بدون دردسر",
    body:
      "کافیه آنلاین رزرو کنی، ما کنسول رو با تمام لوازم جانبی تحویل می‌دیم. وقتی تموم شد، راحت پس می‌دی. هیچ پیچیدگی، هیچ استرسی، فقط بازی و لذت.",
  },
];

export function WhySection() {
  return (
    <section
      role="region"
      aria-labelledby="why-choose-heading"
      id="why-choose"
      className="relative flex w-full flex-col place-content-center place-items-center px-6 py-16 md:px-12 lg:px-20 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="mt-8 flex flex-col place-items-center gap-5">
          <div className="mt-5 flex flex-col gap-3 text-center">
            <h3 className="text-xl text-primary font-semibold">
              دسترسی به دنیای گیمینگ حرفه‌ای
            </h3>
            <h2
              id="why-choose-heading"
              className="text-2xl md:text-4xl font-bold"
            >
              چرا گیمیو بهترین انتخابه؟
            </h2>
          </div>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
                className="card-standard flex flex-col gap-4 text-center"
              >
                <i className={`bi ${b.icon} text-5xl text-primary icon-standard`} />
                <h4 className="text-lg md:text-xl font-bold">{b.title}</h4>
                <p className="text-gray-700 leading-relaxed">{b.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ How it works ------------------------------ */

const STEPS: Array<{ n: string; title: string; body: string }> = [
  {
    n: "۱",
    title: "کنسول و بازه زمانی رو انتخاب کن",
    body:
      "از بین PS5، Xbox Series X، یا Nintendo Switch انتخاب کن. بازه اجاره رو مشخص کن: روزانه، آخر هفته، هفتگی، یا ماهانه. قیمت رو ببین و ادامه بده.",
  },
  {
    n: "۲",
    title: "رزرو آنلاین رو تکمیل کن",
    body:
      "فرم ساده رو پر کن، تاریخ تحویل رو انتخاب کن، و پرداخت امن رو انجام بده. کمتر از ۳ دقیقه طول می‌کشه. تأییدیه فوری دریافت می‌کنی.",
  },
  {
    n: "۳",
    title: "کنسول رو تحویل بگیر و شروع کن",
    body:
      "کنسول با تمام لوازم (دسته‌ها، کابل‌ها، و راهنما) به درب منزلت می‌رسه. همه چی آماده و تست‌شده‌ست. فقط وصل کن و بازی رو شروع کن.",
  },
  {
    n: "۴",
    title: "لذت ببر و راحت پس بده",
    body:
      "تا آخر مدت اجاره، بازی کن و از کنسول نهایت استفاده رو ببر. وقتی تموم شد، با یه تماس ساده یا درخواست آنلاین، کنسول رو پس بده. ما می‌آیم و تحویل می‌گیریم.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative flex w-full flex-col place-content-center place-items-center px-6 py-16 md:px-12 lg:px-20 bg-white"
    >
      <div className="max-w-7xl mx-auto w-full flex flex-col place-items-center gap-8">
        <div className="flex flex-col gap-3 text-center">
          <h3 className="text-xl text-primary font-semibold">
            از رزرو آنلاین تا تحویل درب منزل - همه چی سریع و راحت
          </h3>
          <h2 className="text-2xl md:text-4xl font-bold">
            اجاره کنسول در ۴ قدم ساده
          </h2>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          {STEPS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              className="flex flex-col items-center text-center gap-4"
            >
              <div className="step-number w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                {s.n}
              </div>
              <h4 className="text-lg md:text-xl font-bold">{s.title}</h4>
              <p className="text-gray-700 leading-relaxed">{s.body}</p>
            </motion.div>
          ))}
        </div>
        <a
          href="#pricing"
          className="btn-secondary-enhanced mt-8 inline-block rounded-full border-2 border-primary bg-transparent px-6 py-3 text-base font-semibold text-primary"
        >
          همین الان شروع کن
        </a>
      </div>
    </section>
  );
}

/* ------------------------------ Testimonials ------------------------------ */

const TESTIMONIALS: Array<{
  name: string;
  meta: string;
  img: string;
  quote: string;
}> = [
  {
    name: "امیرحسین",
    meta: "دانشجوی کامپیوتر، ۲۲ سال",
    img: "/assets/images/people/man.jpg",
    quote:
      "واقعاً عالی بود! با بودجه محدود دانشجویی نمی‌تونستم PS5 بخرم، ولی با گیمیو تونستم برای آخر هفته با دوستام اجاره کنم. کنسول تمیز و سالم بود، تحویل سر وقت، و قیمتش خیلی منطقی. حتماً دوباره استفاده می‌کنم. ممنون گیمیو!",
  },
  {
    name: "سارا",
    meta: "مادر دو فرزند، ۳۵ سال",
    img: "/assets/images/people/women.jpg",
    quote:
      "برای تولد پسرم Nintendo Switch اجاره کردم. بچه‌ها عاشقش شدن! خیلی راحت بود، از سایت رزرو کردم و همون روز آوردن. پشتیبانی‌شون هم فوق‌العاده بود و بهم کمک کردن تا نصب کنم. یه تجربه خانوادگی فوق‌العاده بود. قطعاً برای مناسبت‌های بعدی هم استفاده می‌کنیم.",
  },
  {
    name: "پوریا",
    meta: "گیمر حرفه‌ای، ۲۸ سال",
    img: "/assets/images/people/man2.jpg",
    quote:
      "من قبل از خرید Xbox Series X می‌خواستم ببینم واقعاً ارزشش رو داره یا نه. یه هفته از گیمیو اجاره کردم و تمام بازی‌های Game Pass رو تست کردم. کیفیت کنسول عالی بود، انگار نو بود. الان مطمئنم که می‌خوام بخرمش. ممنون که این امکان رو دادین. خدمات حرفه‌ای و قابل اعتماد.",
  },
];

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="flex w-full flex-col place-items-center px-6 py-16 md:px-12 lg:px-20 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-3 text-center mb-8">
          <h3 className="text-xl text-primary font-semibold">
            تجربه واقعی مشتریان ما
          </h3>
          <h2 className="text-2xl md:text-4xl font-bold">
            گیمرها درباره گیمیو چی می‌گن؟
          </h2>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              className="testimonial-enhanced flex flex-col rounded-lg p-6 shadow-lg bg-white"
            >
              <i className="bi bi-chat-quote-fill testimonial-quote" aria-hidden="true" />
              <div className="flex place-items-center gap-3">
                <div className="testimonial-avatar h-[50px] w-[50px] overflow-hidden rounded-full border-[2px] border-solid border-primary">
                  <img
                    src={t.img}
                    className="h-full w-full object-cover"
                    alt={t.name}
                    width={50}
                    height={50}
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="font-bold">{t.name}</div>
                  <div className="text-gray-700 text-sm">{t.meta}</div>
                </div>
              </div>
              <p className="mt-4 text-gray-700 leading-relaxed">{t.quote}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------- Pricing -------------------------------- */

export function PricingSection({ onReserve }: { onReserve: (slug: string) => void }) {
  return (
    <section
      role="region"
      aria-labelledby="pricing-heading"
      id="pricing"
      className="flex w-full flex-col place-items-center px-6 py-16 md:px-12 lg:px-20 bg-white"
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-3 text-center mb-8">
          <h3 className="text-xl text-primary font-semibold">
            بدون هزینه پنهان
          </h3>
          <h2 id="pricing-heading" className="text-2xl md:text-4xl font-bold">
            پکیج‌های اجاره منعطف برای هر نیازی
          </h2>
          <p className="text-gray-700 mt-4 max-w-[700px] mx-auto leading-relaxed">
            قیمت‌گذاری شفاف، بدون هزینه پنهان. هر پکیجی که انتخاب کنی، شامل کنسول
            کامل با تمام لوازم جانبی، پشتیبانی ۲۴/۷، و ضمانت کیفیت می‌شه. هرچه مدت
            اجاره بیشتر، صرفه‌جویی بیشتر.
          </p>
        </div>
        <div className="pricing-grid mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <i className={`bi ${p.icon} text-primary text-5xl icon-standard`} />
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
                      <i className="bi bi-check-circle-fill text-primary mt-1 text-base" />
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
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------- FAQ ---------------------------------- */

export function FaqSection() {
  return (
    <section
      role="region"
      aria-labelledby="faq-heading"
      id="faq"
      className="flex w-full flex-col place-items-center px-6 py-16 md:px-12 lg:px-20 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-3 text-center mb-12">
          <h3 className="text-xl text-primary font-semibold">
            پاسخ سوالاتی که ممکنه داشته باشی
          </h3>
          <h2 id="faq-heading" className="text-2xl md:text-4xl font-bold">
            سوالات متداول
          </h2>
        </div>
        <div className="max-w-4xl mx-auto w-full">
          <FaqList />
        </div>
        <div className="mt-12 text-center">
          <p className="text-gray-700 mb-4">سوال دیگه‌ای داری؟</p>
          <a
            href="/contact"
            className="btn-secondary-enhanced inline-block rounded-full border-2 border-primary bg-transparent px-6 py-3 text-base font-semibold text-primary"
          >
            با پشتیبانی تماس بگیر
          </a>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Final CTA ------------------------------ */

export function FinalCtaSection() {
  return (
    <section
      role="region"
      aria-labelledby="final-cta-heading"
      className="flex w-full flex-col place-content-center place-items-center gap-6 px-6 py-20 md:px-12 lg:px-20 text-white"
      style={{ backgroundImage: "linear-gradient(to right, #9333ea, #2563eb)" }}
    >
      <div className="max-w-7xl mx-auto w-full flex flex-col items-center gap-6">
        <h2
          id="final-cta-heading"
          className="text-4xl md:text-5xl font-bold text-center"
        >
          آماده‌ای دنیای گیمینگ رو بدون محدودیت تجربه کنی؟
        </h2>
        <p className="text-lg md:text-xl text-center max-w-3xl leading-relaxed">
          هزاران گیمر ایرانی الان دارن با گیمیو، بهترین کنسول‌های دنیا رو بدون
          نگرانی مالی تجربه می‌کنن. نوبت توئه که به این جمع بپیوندی. دیگه وقتشه که
          محدودیت‌های مالی جلوی لذت بازی‌کردنت رو نگیره. همین الان شروع کن!
        </p>
        <a
          href="#pricing"
          className="btn-secondary-enhanced inline-block rounded-full bg-white text-primary text-lg md:text-xl px-8 py-4 font-bold shadow-lg"
        >
          الان کنسولت رو رزرو کن
        </a>
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 mt-6 text-sm md:text-base">
          <div className="flex items-center gap-2">
            <i className="bi bi-check-circle-fill" />
            <span>بیش از ۵۰۰۰ اجاره موفق</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="bi bi-check-circle-fill" />
            <span>رضایت ۹۸٪ مشتریان</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="bi bi-check-circle-fill" />
            <span>پشتیبانی ۲۴/۷</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Newsletter ------------------------------ */

export function NewsletterSection() {
  return (
    <section
      role="region"
      aria-labelledby="newsletter-heading"
      className="flex w-full flex-col place-content-center place-items-center px-6 py-16 md:px-12 lg:px-20 bg-white"
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex w-full flex-col place-content-center place-items-center gap-3">
          <h2
            id="newsletter-heading"
            className="text-2xl md:text-3xl text-primary font-bold text-center"
          >
            عضویت در خبرنامه
          </h2>
          <p className="text-base md:text-lg text-center text-gray-700 max-w-2xl">
            از جدیدترین کنسول‌ها، تخفیف‌های ویژه، و اخبار دنیای گیمینگ باخبر شو!
          </p>
          <NewsletterFormStandalone />
        </div>
      </div>
    </section>
  );
}
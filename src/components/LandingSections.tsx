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
      className="tw-relative tw-flex tw-w-full tw-flex-col tw-place-content-center tw-place-items-center tw-px-6 tw-py-16 md:tw-px-12 lg:tw-px-20 tw-bg-white"
    >
      <div className="tw-max-w-7xl tw-mx-auto tw-w-full">
        <div className="tw-mx-auto tw-flex tw-max-w-[850px] tw-flex-col tw-gap-5 tw-text-center">
          <h2
            id="consoles-heading"
            className="tw-mt-10 tw-text-center tw-text-4xl tw-font-bold max-lg:tw-text-2xl"
          >
            <span className="tw-text-primary">کنسول‌های نسل جدید</span> در دسترست
          </h2>
          <div className="tw-text-center tw-text-gray-700 tw-text-lg tw-leading-relaxed">
            دسترسی فوری به قدرتمندترین کنسول‌های بازی دنیا.{" "}
            <strong>PlayStation 5</strong> با گرافیک خیره‌کننده و بازی‌های انحصاری
            مثل God of War و Spider-Man. <strong>Xbox Series X</strong> با Game
            Pass نامحدود و قدرت پردازشی بی‌نظیر. <strong>Nintendo Switch</strong>{" "}
            برای بازی‌های خانوادگی و سرگرمی همه‌جا. هر کدوم رو که انتخاب کنی، دنیای
            جدیدی از هیجان و ماجراجویی در انتظارته.
          </div>
          <a
            href="#pricing"
            className="btn-secondary-enhanced tw-mx-auto tw-mt-4 tw-inline-block tw-rounded-full tw-border-2 tw-border-primary tw-bg-transparent tw-px-6 tw-py-3 tw-text-base tw-font-semibold tw-text-primary"
          >
            همین الان کنسول موردعلاقه‌ات رو انتخاب کن
          </a>
        </div>

        <div
          className="tw-mt-12 tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6 tw-w-full"
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
      className="tw-relative tw-flex tw-w-full tw-flex-col tw-place-content-center tw-place-items-center tw-px-6 tw-py-16 md:tw-px-12 lg:tw-px-20 tw-bg-gray-50"
    >
      <div className="tw-max-w-7xl tw-mx-auto tw-w-full">
        <div className="tw-mt-8 tw-flex tw-flex-col tw-place-items-center tw-gap-5">
          <div className="tw-mt-5 tw-flex tw-flex-col tw-gap-3 tw-text-center">
            <h3 className="tw-text-xl tw-text-primary tw-font-semibold">
              دسترسی به دنیای گیمینگ حرفه‌ای
            </h3>
            <h2
              id="why-choose-heading"
              className="tw-text-2xl md:tw-text-4xl tw-font-bold"
            >
              چرا گیمیو بهترین انتخابه؟
            </h2>
          </div>
          <div className="tw-mt-8 tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6 tw-w-full">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
                className="card-standard tw-flex tw-flex-col tw-gap-4 tw-text-center"
              >
                <i className={`bi ${b.icon} tw-text-5xl tw-text-primary icon-standard`} />
                <h4 className="tw-text-lg md:tw-text-xl tw-font-bold">{b.title}</h4>
                <p className="tw-text-gray-700 tw-leading-relaxed">{b.body}</p>
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
      className="tw-relative tw-flex tw-w-full tw-flex-col tw-place-content-center tw-place-items-center tw-px-6 tw-py-16 md:tw-px-12 lg:tw-px-20 tw-bg-white"
    >
      <div className="tw-max-w-7xl tw-mx-auto tw-w-full tw-flex tw-flex-col tw-place-items-center tw-gap-8">
        <div className="tw-flex tw-flex-col tw-gap-3 tw-text-center">
          <h3 className="tw-text-xl tw-text-primary tw-font-semibold">
            از رزرو آنلاین تا تحویل درب منزل - همه چی سریع و راحت
          </h3>
          <h2 className="tw-text-2xl md:tw-text-4xl tw-font-bold">
            اجاره کنسول در ۴ قدم ساده
          </h2>
        </div>
        <div className="tw-mt-8 tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-8 tw-w-full">
          {STEPS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              className="tw-flex tw-flex-col tw-items-center tw-text-center tw-gap-4"
            >
              <div className="step-number tw-w-16 tw-h-16 tw-rounded-full tw-bg-primary tw-flex tw-items-center tw-justify-center tw-text-white tw-text-2xl tw-font-bold">
                {s.n}
              </div>
              <h4 className="tw-text-lg md:tw-text-xl tw-font-bold">{s.title}</h4>
              <p className="tw-text-gray-700 tw-leading-relaxed">{s.body}</p>
            </motion.div>
          ))}
        </div>
        <a
          href="#pricing"
          className="btn-secondary-enhanced tw-mt-8 tw-inline-block tw-rounded-full tw-border-2 tw-border-primary tw-bg-transparent tw-px-6 tw-py-3 tw-text-base tw-font-semibold tw-text-primary"
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
      className="tw-flex tw-w-full tw-flex-col tw-place-items-center tw-px-6 tw-py-16 md:tw-px-12 lg:tw-px-20 tw-bg-gray-50"
    >
      <div className="tw-max-w-7xl tw-mx-auto tw-w-full">
        <div className="tw-flex tw-flex-col tw-gap-3 tw-text-center tw-mb-8">
          <h3 className="tw-text-xl tw-text-primary tw-font-semibold">
            تجربه واقعی مشتریان ما
          </h3>
          <h2 className="tw-text-2xl md:tw-text-4xl tw-font-bold">
            گیمرها درباره گیمیو چی می‌گن؟
          </h2>
        </div>
        <div className="tw-mt-8 tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6 tw-w-full">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              className="testimonial-enhanced tw-flex tw-flex-col tw-rounded-lg tw-p-6 tw-shadow-lg tw-bg-white"
            >
              <i className="bi bi-chat-quote-fill testimonial-quote" aria-hidden="true" />
              <div className="tw-flex tw-place-items-center tw-gap-3">
                <div className="testimonial-avatar tw-h-[50px] tw-w-[50px] tw-overflow-hidden tw-rounded-full tw-border-[2px] tw-border-solid tw-border-primary">
                  <img
                    src={t.img}
                    className="tw-h-full tw-w-full tw-object-cover"
                    alt={t.name}
                    width={50}
                    height={50}
                    loading="lazy"
                  />
                </div>
                <div className="tw-flex tw-flex-col tw-gap-1">
                  <div className="tw-font-bold">{t.name}</div>
                  <div className="tw-text-gray-700 tw-text-sm">{t.meta}</div>
                </div>
              </div>
              <p className="tw-mt-4 tw-text-gray-700 tw-leading-relaxed">{t.quote}</p>
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
      className="tw-flex tw-w-full tw-flex-col tw-place-items-center tw-px-6 tw-py-16 md:tw-px-12 lg:tw-px-20 tw-bg-white"
    >
      <div className="tw-max-w-7xl tw-mx-auto tw-w-full">
        <div className="tw-flex tw-flex-col tw-gap-3 tw-text-center tw-mb-8">
          <h3 className="tw-text-xl tw-text-primary tw-font-semibold">
            بدون هزینه پنهان
          </h3>
          <h2 id="pricing-heading" className="tw-text-2xl md:tw-text-4xl tw-font-bold">
            پکیج‌های اجاره منعطف برای هر نیازی
          </h2>
          <p className="tw-text-gray-700 tw-mt-4 tw-max-w-[700px] tw-mx-auto tw-leading-relaxed">
            قیمت‌گذاری شفاف، بدون هزینه پنهان. هر پکیجی که انتخاب کنی، شامل کنسول
            کامل با تمام لوازم جانبی، پشتیبانی ۲۴/۷، و ضمانت کیفیت می‌شه. هرچه مدت
            اجاره بیشتر، صرفه‌جویی بیشتر.
          </p>
        </div>
        <div className="pricing-grid tw-mt-10 tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-6">
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
      className="tw-flex tw-w-full tw-flex-col tw-place-items-center tw-px-6 tw-py-16 md:tw-px-12 lg:tw-px-20 tw-bg-gray-50"
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
        <div className="tw-max-w-4xl tw-mx-auto tw-w-full">
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

/* ------------------------------ Final CTA ------------------------------ */

export function FinalCtaSection() {
  return (
    <section
      role="region"
      aria-labelledby="final-cta-heading"
      className="tw-flex tw-w-full tw-flex-col tw-place-content-center tw-place-items-center tw-gap-6 tw-px-6 tw-py-20 md:tw-px-12 lg:tw-px-20 tw-text-white"
      style={{ backgroundImage: "linear-gradient(to right, #9333ea, #2563eb)" }}
    >
      <div className="tw-max-w-7xl tw-mx-auto tw-w-full tw-flex tw-flex-col tw-items-center tw-gap-6">
        <h2
          id="final-cta-heading"
          className="tw-text-4xl md:tw-text-5xl tw-font-bold tw-text-center"
        >
          آماده‌ای دنیای گیمینگ رو بدون محدودیت تجربه کنی؟
        </h2>
        <p className="tw-text-lg md:tw-text-xl tw-text-center tw-max-w-3xl tw-leading-relaxed">
          هزاران گیمر ایرانی الان دارن با گیمیو، بهترین کنسول‌های دنیا رو بدون
          نگرانی مالی تجربه می‌کنن. نوبت توئه که به این جمع بپیوندی. دیگه وقتشه که
          محدودیت‌های مالی جلوی لذت بازی‌کردنت رو نگیره. همین الان شروع کن!
        </p>
        <a
          href="#pricing"
          className="btn-secondary-enhanced tw-inline-block tw-rounded-full tw-bg-white tw-text-primary tw-text-lg md:tw-text-xl tw-px-8 tw-py-4 tw-font-bold tw-shadow-lg"
        >
          الان کنسولت رو رزرو کن
        </a>
        <div className="tw-flex tw-flex-wrap tw-justify-center tw-gap-6 md:tw-gap-8 tw-mt-6 tw-text-sm md:tw-text-base">
          <div className="tw-flex tw-items-center tw-gap-2">
            <i className="bi bi-check-circle-fill" />
            <span>بیش از ۵۰۰۰ اجاره موفق</span>
          </div>
          <div className="tw-flex tw-items-center tw-gap-2">
            <i className="bi bi-check-circle-fill" />
            <span>رضایت ۹۸٪ مشتریان</span>
          </div>
          <div className="tw-flex tw-items-center tw-gap-2">
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
          <NewsletterFormStandalone />
        </div>
      </div>
    </section>
  );
}
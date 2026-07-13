const TESTIMONIALS = [
  {
    img: "/assets/images/people/man.jpg",
    name: "امیرحسین",
    role: "دانشجوی کامپیوتر، ۲۲ سال",
    body: "واقعاً عالی بود! با بودجه محدود دانشجویی نمی‌تونستم PS5 بخرم، ولی با گیمیو تونستم برای آخر هفته با دوستام اجاره کنم. کنسول تمیز و سالم بود، تحویل سر وقت، و قیمتش خیلی منطقی. حتماً دوباره استفاده می‌کنم. ممنون گیمیو!",
  },
  {
    img: "/assets/images/people/women.jpg",
    name: "سارا",
    role: "مادر دو فرزند، ۳۵ سال",
    body: "برای تولد پسرم Nintendo Switch اجاره کردم. بچه‌ها عاشقش شدن! خیلی راحت بود، از سایت رزرو کردم و همون روز آوردن. پشتیبانی‌شون هم فوق‌العاده بود و بهم کمک کردن تا نصب کنم. یه تجربه خانوادگی فوق‌العاده بود. قطعاً برای مناسبت‌های بعدی هم استفاده می‌کنیم.",
  },
  {
    img: "/assets/images/people/man2.jpg",
    name: "پوریا",
    role: "گیمر حرفه‌ای، ۲۸ سال",
    body: "من قبل از خرید Xbox Series X می‌خواستم ببینم واقعاً ارزشش رو داره یا نه. یه هفته از گیمیو اجاره کردم و تمام بازی‌های Game Pass رو تست کردم. کیفیت کنسول عالی بود، انگار نو بود. الان مطمئنم که می‌خوام بخرمش. ممنون که این امکان رو دادین. خدمات حرفه‌ای و قابل اعتماد.",
  },
];

/** Testimonials section (formerly #testimonials). */
export function TestimonialsSection() {
  return (
    <section
      className="tw-flex tw-w-full tw-flex-col tw-place-items-center tw-px-6 tw-py-16 md:tw-px-12 lg:tw-px-20 tw-bg-gray-50"
      id="testimonials"
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
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
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
                  <div className="tw-text-gray-700 tw-text-sm">{t.role}</div>
                </div>
              </div>
              <p className="tw-mt-4 tw-text-gray-700 tw-leading-relaxed">{t.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
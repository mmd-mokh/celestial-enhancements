import { SectionHeading, SectionShell, FadeInUp } from "./primitives";

type Testimonial = { name: string; meta: string; img: string; quote: string };

const TESTIMONIALS: Testimonial[] = [
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

function TestimonialCard({ name, meta, img, quote, index }: Testimonial & { index: number }) {
  return (
    <FadeInUp
      index={index}
      className="testimonial-enhanced flex flex-col rounded-lg p-6 shadow-lg bg-white"
    >
      <i className="bi bi-chat-quote-fill testimonial-quote" aria-hidden="true" />
      <div className="flex place-items-center gap-3">
        <div className="testimonial-avatar h-[50px] w-[50px] overflow-hidden rounded-full border-[2px] border-solid border-primary">
          <img
            src={img}
            className="h-full w-full object-cover"
            alt={name}
            width={50}
            height={50}
            loading="lazy"
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="font-bold">{name}</div>
          <div className="text-gray-700 text-sm">{meta}</div>
        </div>
      </div>
      <p className="mt-4 text-gray-700 leading-relaxed">{quote}</p>
    </FadeInUp>
  );
}

export function TestimonialsSection() {
  return (
    <SectionShell id="testimonials" bg="gray">
      <SectionHeading
        className="mb-8"
        eyebrow="تجربه واقعی مشتریان ما"
        title="گیمرها درباره گیمیو چی می‌گن؟"
      />
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {TESTIMONIALS.map((t, i) => (
          <TestimonialCard key={t.name} {...t} index={i} />
        ))}
      </div>
    </SectionShell>
  );
}
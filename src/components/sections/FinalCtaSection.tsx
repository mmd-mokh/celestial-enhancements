const CTA_STATS = [
  "بیش از ۵۰۰۰ اجاره موفق",
  "رضایت ۹۸٪ مشتریان",
  "پشتیبانی ۲۴/۷",
];

export function FinalCtaSection() {
  return (
    <section
      role="region"
      aria-labelledby="final-cta-heading"
      className="flex w-full flex-col place-content-center place-items-center gap-6 px-6 py-20 md:px-12 lg:px-20 text-white"
      style={{ backgroundImage: "linear-gradient(to right, #9333ea, #6b21a8)" }}
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
          {CTA_STATS.map((label) => (
            <div key={label} className="flex items-center gap-2">
              <i className="bi bi-check-circle-fill" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
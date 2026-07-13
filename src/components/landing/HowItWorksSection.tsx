const STEPS = [
  {
    n: "۱",
    title: "کنسول و بازه زمانی رو انتخاب کن",
    body: "از بین PS5، Xbox Series X، یا Nintendo Switch انتخاب کن. بازه اجاره رو مشخص کن: روزانه، آخر هفته، هفتگی، یا ماهانه. قیمت رو ببین و ادامه بده.",
  },
  {
    n: "۲",
    title: "رزرو آنلاین رو تکمیل کن",
    body: "فرم ساده رو پر کن، تاریخ تحویل رو انتخاب کن، و پرداخت امن رو انجام بده. کمتر از ۳ دقیقه طول می‌کشه. تأییدیه فوری دریافت می‌کنی.",
  },
  {
    n: "۳",
    title: "کنسول رو تحویل بگیر و شروع کن",
    body: "کنسول با تمام لوازم (دسته‌ها، کابل‌ها، و راهنما) به درب منزلت می‌رسه. همه چی آماده و تست‌شده‌ست. فقط وصل کن و بازی رو شروع کن.",
  },
  {
    n: "۴",
    title: "لذت ببر و راحت پس بده",
    body: "تا آخر مدت اجاره، بازی کن و از کنسول نهایت استفاده رو ببر. وقتی تموم شد، با یه تماس ساده یا درخواست آنلاین، کنسول رو پس بده. ما می‌آیم و تحویل می‌گیریم.",
  },
];

/** "How it works" section (formerly #how-it-works). */
export function HowItWorksSection() {
  return (
    <section
      role="region"
      aria-labelledby="how-it-works-heading"
      className="tw-relative tw-flex tw-w-full tw-flex-col tw-place-content-center tw-place-items-center tw-px-6 tw-py-16 md:tw-px-12 lg:tw-px-20 tw-bg-white"
      id="how-it-works"
    >
      <div className="tw-max-w-7xl tw-mx-auto tw-w-full tw-flex tw-flex-col tw-place-items-center tw-gap-8">
        <div className="tw-flex tw-flex-col tw-gap-3 tw-text-center">
          <h3 className="tw-text-xl tw-text-primary tw-font-semibold">
            از رزرو آنلاین تا تحویل درب منزل - همه چی سریع و راحت
          </h3>
          <h2 id="how-it-works-heading" className="tw-text-2xl md:tw-text-4xl tw-font-bold">
            اجاره کنسول در ۴ قدم ساده
          </h2>
        </div>

        <div className="tw-mt-8 tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-8 tw-w-full">
          {STEPS.map((s) => (
            <div key={s.n} className="tw-flex tw-flex-col tw-items-center tw-text-center tw-gap-4">
              <div className="step-number tw-w-16 tw-h-16 tw-rounded-full tw-bg-primary tw-flex tw-items-center tw-justify-center tw-text-white tw-text-2xl tw-font-bold">
                {s.n}
              </div>
              <h4 className="tw-text-lg md:tw-text-xl tw-font-bold">{s.title}</h4>
              <p className="tw-text-gray-700 tw-leading-relaxed">{s.body}</p>
            </div>
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
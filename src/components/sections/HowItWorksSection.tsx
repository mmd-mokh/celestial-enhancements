import { SectionHeading, SectionShell, FadeInUp } from "./primitives";

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

function StepCard({
  n,
  title,
  body,
  index,
}: {
  n: string;
  title: string;
  body: string;
  index: number;
}) {
  return (
    <FadeInUp index={index} className="flex flex-col items-center text-center gap-4">
      <div className="step-number w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
        {n}
      </div>
      <h4 className="text-lg md:text-xl font-bold">{title}</h4>
      <p className="text-gray-700 leading-relaxed">{body}</p>
    </FadeInUp>
  );
}

export function HowItWorksSection() {
  return (
    <SectionShell
      id="how-it-works"
      innerClassName="flex flex-col place-items-center gap-8"
    >
      <SectionHeading
        eyebrow="از رزرو آنلاین تا تحویل درب منزل - همه چی سریع و راحت"
        title="اجاره کنسول در ۴ قدم ساده"
      />
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
        {STEPS.map((s, i) => (
          <StepCard key={s.n} {...s} index={i} />
        ))}
      </div>
      <a
        href="#pricing"
        className="btn-secondary-enhanced mt-8 inline-block rounded-full border-2 border-primary bg-transparent px-6 py-3 text-base font-semibold text-primary"
      >
        همین الان شروع کن
      </a>
    </SectionShell>
  );
}
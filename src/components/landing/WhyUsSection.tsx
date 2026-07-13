const BENEFITS = [
  {
    icon: "bi-piggy-bank-fill",
    title: "تجربه کن، نخر - پول‌ات رو ذخیره کن",
    body: "چرا ۳۰ میلیون تومان برای PS5 بدی وقتی می‌تونی با کسری از این مبلغ، هر ماه کنسول جدیدی رو تجربه کنی؟ با گیمیو، بودجه‌ات رو برای بازی‌های بیشتر و تجربه‌های متنوع‌تر نگه دار.",
  },
  {
    icon: "bi-shuffle",
    title: "امروز PS5، فردا Xbox - تو تصمیم می‌گیری",
    body: "دیگه نیازی نیست خودت رو به یک کنسول محدود کنی. هر هفته می‌تونی کنسول عوض کنی، بازی‌های انحصاری همه پلتفرم‌ها رو تجربه کنی، و همیشه با جدیدترین تکنولوژی گیمینگ همراه باشی.",
  },
  {
    icon: "bi-shield-check",
    title: "فراموش کن نگهداری، آپدیت، و تعمیر",
    body: "ما مراقب همه چیز هستیم. کنسول‌های تمیز و کاملاً تست‌شده، پشتیبانی ۲۴/۷، و اگر مشکلی پیش اومد فوراً جایگزین می‌کنیم. تو فقط بازی کن و لذت ببر.",
  },
  {
    icon: "bi-people-fill",
    title: "مهمونی، دورهمی، تعطیلات - همیشه آماده",
    body: "جشن تولد داری؟ دوستات میان خونه؟ تعطیلات نوروز؟ با اجاره کنسول از گیمیو، هر جمع‌ای رو به یه تجربه فراموش‌نشدنی تبدیل کن. سرگرمی حرفه‌ای برای همه سنین.",
  },
  {
    icon: "bi-check-circle-fill",
    title: "مطمئن شو قبل از اینکه سرمایه‌گذاری کنی",
    body: "نمی‌دونی PS5 بگیری یا Xbox؟ نینتندو سوییچ واقعاً برات مناسبه؟ با اجاره از گیمیو، اول امتحان کن، بعد تصمیم بگیر. ریسک صفر، اطمینان صد درصد.",
  },
  {
    icon: "bi-truck",
    title: "رزرو آنلاین، تحویل درب منزل، بازگشت بدون دردسر",
    body: "کافیه آنلاین رزرو کنی، ما کنسول رو با تمام لوازم جانبی تحویل می‌دیم. وقتی تموم شد، راحت پس می‌دی. هیچ پیچیدگی، هیچ استرسی، فقط بازی و لذت.",
  },
];

/** "Why Choose Gamio" section (formerly #why-choose). */
export function WhyUsSection() {
  return (
    <section
      role="region"
      aria-labelledby="why-choose-heading"
      className="tw-relative tw-flex tw-w-full tw-flex-col tw-place-content-center tw-place-items-center tw-px-6 tw-py-16 md:tw-px-12 lg:tw-px-20 tw-bg-gray-50"
      id="why-choose"
    >
      <div className="tw-max-w-7xl tw-mx-auto tw-w-full">
        <div className="tw-mt-8 tw-flex tw-flex-col tw-place-items-center tw-gap-5">
          <div className="tw-mt-5 tw-flex tw-flex-col tw-gap-3 tw-text-center">
            <h3 className="tw-text-xl tw-text-primary tw-font-semibold">
              دسترسی به دنیای گیمینگ حرفه‌ای
            </h3>
            <h2 id="why-choose-heading" className="tw-text-2xl md:tw-text-4xl tw-font-bold">
              چرا گیمیو بهترین انتخابه؟
            </h2>
          </div>
          <div className="tw-mt-8 tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 tw-gap-6 tw-w-full">
            {BENEFITS.map((b) => (
              <div key={b.title} className="card-standard tw-flex tw-flex-col tw-gap-4 tw-text-center">
                <i className={`bi ${b.icon} tw-text-5xl tw-text-primary icon-standard`} />
                <h4 className="tw-text-lg md:tw-text-xl tw-font-bold">{b.title}</h4>
                <p className="tw-text-gray-700 tw-leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
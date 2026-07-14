import { SectionHeading, SectionShell, FadeInUp } from "./primitives";
import { BsIcon } from "@/components/BsIcon";

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

function BenefitCard({
  icon,
  title,
  body,
  index,
}: {
  icon: string;
  title: string;
  body: string;
  index: number;
}) {
  return (
    <FadeInUp
      index={index}
      step={0.06}
      className="card-standard flex flex-col gap-4 text-center"
    >
      <BsIcon name={icon} size={48} className="text-primary icon-standard" />
      <h4 className="text-lg md:text-xl font-bold">{title}</h4>
      <p className="text-gray-700 leading-relaxed">{body}</p>
    </FadeInUp>
  );
}

export function WhySection() {
  return (
    <SectionShell id="why-choose" ariaLabelledBy="why-choose-heading" bg="gray">
      <div className="mt-8 flex flex-col place-items-center gap-5">
        <SectionHeading
          className="mt-5"
          eyebrow="دسترسی به دنیای گیمینگ حرفه‌ای"
          title="چرا گیمیو بهترین انتخابه؟"
          titleId="why-choose-heading"
        />
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {BENEFITS.map((b, i) => (
            <BenefitCard key={b.title} {...b} index={i} />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
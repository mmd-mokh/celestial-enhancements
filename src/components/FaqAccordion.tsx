import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "چطور می‌تونم کنسول رزرو کنم؟",
    a: "خیلی سادست! از صفحه اصلی سایت، کنسول موردنظرت رو انتخاب کن، بازه زمانی رو مشخص کن، و فرم رزرو رو پر کن. بعد از پرداخت آنلاین، تأییدیه فوری دریافت می‌کنی. کل فرآیند کمتر از ۳ دقیقه طول می‌کشه.",
  },
  {
    q: "چه روش‌های پرداختی قبول می‌کنید؟",
    a: "تمام کارت‌های بانکی عضو شتاب، پرداخت اینترنتی، و کیف پول‌های دیجیتال رو قبول می‌کنیم. پرداخت کاملاً امن و از طریق درگاه بانکی معتبر انجام می‌شه. همچنین امکان پرداخت در محل هم وجود داره.",
  },
  {
    q: "کنسول چطور تحویل داده می‌شه؟",
    a: "در تهران و حومه، تحویل درب منزل رایگانه و توسط پیک ما انجام می‌شه. برای شهرستان‌ها، از طریق پست پیشتاز یا باربری معتبر ارسال می‌کنیم (هزینه ارسال جداگانه محاسبه می‌شه). زمان تحویل رو خودت انتخاب می‌کنی.",
  },
  {
    q: "اگه کنسول خراب بشه یا مشکلی پیش بیاد چی؟",
    a: "نگران نباش! تمام کنسول‌ها قبل از تحویل کاملاً تست می‌شن و بیمه دارن. اگه مشکل فنی پیش اومد که خطای شما نباشه، فوراً جایگزین می‌کنیم یا تعمیر می‌کنیم بدون هیچ هزینه اضافی. پشتیبانی ۲۴/۷ ما همیشه در دسترسه.",
  },
  {
    q: "آیا باید ودیعه یا سپرده بذارم؟",
    a: "بله، برای اطمینان از بازگشت سالم کنسول، یک مبلغ ودیعه قابل برگشت دریافت می‌کنیم که بعد از تحویل کنسول در شرایط سالم، کاملاً بهت برمی‌گردونیم. مبلغ ودیعه بسته به نوع کنسول متفاوته و در زمان رزرو بهت اطلاع داده می‌شه.",
  },
  {
    q: "می‌تونم مدت اجاره رو تمدید کنم؟",
    a: "قطعاً! اگه می‌خوای بیشتر از کنسول استفاده کنی، کافیه قبل از پایان مدت اجاره، از طریق سایت یا تماس با پشتیبانی، درخواست تمدید بدی. اگه کنسول رزرو بعدی نداشته باشه، راحت تمدید می‌شه.",
  },
  {
    q: "بازی‌ها هم همراه کنسول میاد؟",
    a: "کنسول‌ها با چند بازی پیش‌نصب و دمو میان، ولی برای بازی‌های خاص، می‌تونی از پکیج‌های اضافه ما استفاده کنی یا بازی‌های دیجیتال رو از استور خودت دانلود کنی. همچنین امکان اجاره دیسک بازی‌های فیزیکی هم وجود داره.",
  },
  {
    q: "اگه زودتر از موعد کنسول رو پس بدم، پول برمی‌گرده؟",
    a: "متأسفانه برای بازگشت زودتر، استرداد وجه نداریم، ولی می‌تونی کنسول رو نگه داری تا آخر مدت اجاره. البته اگه شرایط خاصی داری، با پشتیبانی تماس بگیر تا بهترین راه‌حل رو پیدا کنیم.",
  },
  {
    q: "پشتیبانی شما چطوریه؟",
    a: "تیم پشتیبانی ما ۲۴ ساعته، ۷ روز هفته در دسترسه. از طریق تلفن، واتساپ، تلگرام، یا چت آنلاین سایت می‌تونی باهامون در تماس باشی. سعی می‌کنیم در کمترین زمان ممکن به سوالات و مشکلات پاسخ بدیم.",
  },
  {
    q: "در چه شهرهایی خدمات ارائه می‌دید؟",
    a: "در حال حاضر خدمات کامل ما (تحویل درب منزل رایگان) در تهران و کرج فعاله. برای سایر شهرهای بزرگ مثل اصفهان، مشهد، شیراز، و تبریز هم ارسال داریم ولی با هزینه پست. داریم به شهرهای بیشتری گسترش می‌دیم!",
  },
];

/**
 * Replaces the static `<details>` FAQ list in the ported HTML blob with a
 * shadcn Accordion. Uses the same container div (`.tw-max-w-4xl.tw-mx-auto`
 * inside `#faq`) so the surrounding layout stays intact.
 */
export function FaqAccordion() {
  const [mount, setMount] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let tries = 0;
    const find = () => {
      const faq = document.getElementById("faq");
      if (faq) {
        const list = faq.querySelector<HTMLElement>(
          ".tw-max-w-4xl.tw-mx-auto.tw-w-full",
        );
        if (list) {
          list.innerHTML = "";
          setMount(list);
          return;
        }
      }
      if (tries++ < 20) setTimeout(find, 100);
    };
    find();
  }, []);

  if (!mount) return null;

  return createPortal(
    <Accordion type="single" collapsible className="tw-flex tw-flex-col tw-gap-4">
      {FAQS.map((item, i) => (
        <AccordionItem
          key={i}
          value={`item-${i}`}
          className="tw-bg-white tw-rounded-lg tw-shadow-md tw-border tw-border-transparent data-[state=open]:tw-border-primary/30"
        >
          <AccordionTrigger className="tw-px-6 tw-py-5 tw-font-bold tw-text-lg tw-text-gray-800 hover:tw-text-primary tw-text-right">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="tw-px-6 tw-pb-5 tw-text-gray-700 tw-leading-relaxed">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>,
    mount,
  );
}
import { Instagram, Send, Twitter, Youtube, MapPin, Phone, Mail, Info } from "lucide-react";

const QUICK_LINKS = [
  { href: "#consoles", label: "کنسول‌های موجود" },
  { href: "#pricing", label: "پکیج‌های اجاره" },
  { href: "#how-it-works", label: "چطور کار می‌کنه؟" },
  { href: "#faq", label: "سوالات متداول" },
  { href: "/contact", label: "تماس با ما" },
  { href: "/blog", label: "وبلاگ" },
];

const LEGAL_LINKS = [
  { href: "#", label: "شرایط استفاده" },
  { href: "#", label: "حریم خصوصی" },
  { href: "#", label: "قوانین اجاره" },
  { href: "#", label: "سیاست بازگشت" },
];

const SOCIALS = [
  { href: "https://instagram.com/gamio.ir", label: "اینستاگرام", Icon: Instagram },
  { href: "https://t.me/gamioofficial", label: "تلگرام", Icon: Send },
  { href: "https://twitter.com/gamio_ir", label: "توییتر", Icon: Twitter },
  { href: "https://youtube.com/@gamioiran", label: "یوتیوب", Icon: Youtube },
];

export function SiteFooter() {
  return (
    <>
      <footer
        role="contentinfo"
        className="flex w-full px-6 py-16 md:px-12 lg:px-20 text-black bg-gray-50"
      >
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <img
              src="/assets/logo/logo1.png"
              alt="گیمیو - اجاره کنسول بازی"
              className="max-w-[120px]"
              width={120}
              height={120}
              loading="lazy"
            />
            <p className="text-gray-700 leading-relaxed text-sm">
              گیمیو اولین و بزرگ‌ترین سرویس اجاره کنسول بازی در ایرانه. ما با هدف
              دموکراتیک‌کردن دسترسی به دنیای گیمینگ، امکان اجاره کنسول‌های نسل جدید
              رو با قیمت مناسب و کیفیت بالا فراهم کردیم.
            </p>
            <div className="flex flex-col gap-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>تهران، ایران</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span dir="ltr" className="placeholder-text">۰۲۱-XXXX-XXXX</span>
                <span className="placeholder-tag" title="این اطلاعات نمونه است">
                  <Info className="h-3 w-3" aria-hidden="true" />
                  <span>نمونه</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span dir="ltr" className="placeholder-text">info@gamio.ir</span>
                <span className="placeholder-tag" title="این اطلاعات نمونه است">
                  <Info className="h-3 w-3" aria-hidden="true" />
                  <span>نمونه</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-xl font-bold">دسترسی سریع</h4>
            <div className="flex flex-col gap-3 text-sm">
              {QUICK_LINKS.map((l) => (
                <a key={l.label} href={l.href} className="footer-link link-enhanced">
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-xl font-bold">قوانین و مقررات</h4>
            <div className="flex flex-col gap-3 text-sm">
              {LEGAL_LINKS.map((l) => (
                <a key={l.label} href={l.href} className="footer-link link-enhanced">
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-xl font-bold flex items-center gap-2">
              <span>ما را دنبال کنید</span>
              <span className="placeholder-tag" title="این لینک‌ها نمونه هستند">
                <Info className="h-3 w-3" aria-hidden="true" />
                <span>نمونه</span>
              </span>
            </h4>
            <div className="flex flex-col gap-3 text-sm">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  className="footer-link link-enhanced flex items-center gap-2"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5 icon-standard" />
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <div className="w-full bg-gray-800 text-white text-center py-4 text-sm">
        <p>© ۱۴۰۳ گیمیو. تمامی حقوق محفوظ است.</p>
        <p className="mt-1 text-gray-400">طراحی و توسعه با ❤️ برای گیمرهای ایرانی</p>
      </div>
    </>
  );
}
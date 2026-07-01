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
        className="tw-flex tw-w-full tw-px-6 tw-py-16 md:tw-px-12 lg:tw-px-20 tw-text-black tw-bg-gray-50"
      >
        <div className="tw-max-w-7xl tw-mx-auto tw-w-full tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-4 tw-gap-8">
          <div className="tw-flex tw-flex-col tw-gap-4">
            <img
              src="/assets/logo/logo1.png"
              alt="گیمیو - اجاره کنسول بازی"
              className="tw-max-w-[120px]"
              width={120}
              height={120}
              loading="lazy"
            />
            <p className="tw-text-gray-700 tw-leading-relaxed tw-text-sm">
              گیمیو اولین و بزرگ‌ترین سرویس اجاره کنسول بازی در ایرانه. ما با هدف
              دموکراتیک‌کردن دسترسی به دنیای گیمینگ، امکان اجاره کنسول‌های نسل جدید
              رو با قیمت مناسب و کیفیت بالا فراهم کردیم.
            </p>
            <div className="tw-flex tw-flex-col tw-gap-2 tw-text-sm tw-text-gray-700">
              <div className="tw-flex tw-items-center tw-gap-2">
                <MapPin className="tw-h-4 tw-w-4 tw-text-primary" />
                <span>تهران، ایران</span>
              </div>
              <div className="tw-flex tw-items-center tw-gap-2">
                <Phone className="tw-h-4 tw-w-4 tw-text-primary" />
                <span dir="ltr" className="placeholder-text">۰۲۱-XXXX-XXXX</span>
                <span className="placeholder-tag" title="این اطلاعات نمونه است">
                  <Info className="tw-h-3 tw-w-3" aria-hidden="true" />
                  <span>نمونه</span>
                </span>
              </div>
              <div className="tw-flex tw-items-center tw-gap-2">
                <Mail className="tw-h-4 tw-w-4 tw-text-primary" />
                <span dir="ltr" className="placeholder-text">info@gamio.ir</span>
                <span className="placeholder-tag" title="این اطلاعات نمونه است">
                  <Info className="tw-h-3 tw-w-3" aria-hidden="true" />
                  <span>نمونه</span>
                </span>
              </div>
            </div>
          </div>

          <div className="tw-flex tw-flex-col tw-gap-4">
            <h4 className="tw-text-xl tw-font-bold">دسترسی سریع</h4>
            <div className="tw-flex tw-flex-col tw-gap-3 tw-text-sm">
              {QUICK_LINKS.map((l) => (
                <a key={l.label} href={l.href} className="footer-link link-enhanced">
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          <div className="tw-flex tw-flex-col tw-gap-4">
            <h4 className="tw-text-xl tw-font-bold">قوانین و مقررات</h4>
            <div className="tw-flex tw-flex-col tw-gap-3 tw-text-sm">
              {LEGAL_LINKS.map((l) => (
                <a key={l.label} href={l.href} className="footer-link link-enhanced">
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          <div className="tw-flex tw-flex-col tw-gap-4">
            <h4 className="tw-text-xl tw-font-bold tw-flex tw-items-center tw-gap-2">
              <span>ما را دنبال کنید</span>
              <span className="placeholder-tag" title="این لینک‌ها نمونه هستند">
                <Info className="tw-h-3 tw-w-3" aria-hidden="true" />
                <span>نمونه</span>
              </span>
            </h4>
            <div className="tw-flex tw-flex-col tw-gap-3 tw-text-sm">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  className="footer-link link-enhanced tw-flex tw-items-center tw-gap-2"
                  aria-label={label}
                >
                  <Icon className="tw-h-5 tw-w-5 icon-standard" />
                  <span>{label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <div className="tw-w-full tw-bg-gray-800 tw-text-white tw-text-center tw-py-4 tw-text-sm">
        <p>© ۱۴۰۳ گیمیو. تمامی حقوق محفوظ است.</p>
        <p className="tw-mt-1 tw-text-gray-400">طراحی و توسعه با ❤️ برای گیمرهای ایرانی</p>
      </div>
    </>
  );
}
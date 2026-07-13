import { NewsletterFormStandalone } from "@/components/NewsletterForm";
import { SectionShell } from "./primitives";

export function NewsletterSection() {
  return (
    <SectionShell ariaLabelledBy="newsletter-heading">
      <div className="flex w-full flex-col place-content-center place-items-center gap-3">
        <h2
          id="newsletter-heading"
          className="text-2xl md:text-3xl text-primary font-bold text-center"
        >
          عضویت در خبرنامه
        </h2>
        <p className="text-base md:text-lg text-center text-gray-700 max-w-2xl">
          از جدیدترین کنسول‌ها، تخفیف‌های ویژه، و اخبار دنیای گیمینگ باخبر شو!
        </p>
        <NewsletterFormStandalone />
      </div>
    </SectionShell>
  );
}
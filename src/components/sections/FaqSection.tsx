import { FaqList } from "@/components/FaqAccordion";
import { SectionHeading, SectionShell } from "./primitives";

export function FaqSection() {
  return (
    <SectionShell id="faq" ariaLabelledBy="faq-heading" bg="gray">
      <SectionHeading
        className="mb-12"
        eyebrow="پاسخ سوالاتی که ممکنه داشته باشی"
        title="سوالات متداول"
        titleId="faq-heading"
      />
      <div className="max-w-4xl mx-auto w-full">
        <FaqList />
      </div>
      <div className="mt-12 text-center">
        <p className="text-gray-700 mb-4">سوال دیگه‌ای داری؟</p>
        <a
          href="/contact"
          className="btn-secondary-enhanced inline-block rounded-full border-2 border-primary bg-transparent px-6 py-3 text-base font-semibold text-primary"
        >
          با پشتیبانی تماس بگیر
        </a>
      </div>
    </SectionShell>
  );
}
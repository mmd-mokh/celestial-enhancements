import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ConsoleList, type ConsoleRow } from "@/components/ConsoleCards";

const HIDDEN = new Set(["ps4", "xbox-series-s", "xbox-one"]);

/** Consoles section (formerly #consoles in gamio-body.html). */
export function ConsolesSection() {
  const [items, setItems] = useState<ConsoleRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("consoles")
        .select("slug,name,tagline,features,icon,accent_from,accent_to,sort_order")
        .eq("active", true)
        .order("sort_order");
      if (!cancelled && data) {
        setItems((data as ConsoleRow[]).filter((r) => !HIDDEN.has(r.slug)));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      role="region"
      aria-labelledby="consoles-heading"
      className="tw-relative tw-flex tw-w-full tw-flex-col tw-place-content-center tw-place-items-center tw-px-6 tw-py-16 md:tw-px-12 lg:tw-px-20 tw-bg-white"
      id="consoles"
    >
      <div className="tw-max-w-7xl tw-mx-auto tw-w-full">
        <div className="tw-mx-auto tw-flex tw-max-w-[850px] tw-flex-col tw-gap-5 tw-text-center">
          <h2
            id="consoles-heading"
            className="tw-mt-10 tw-text-center tw-text-4xl tw-font-bold max-lg:tw-text-2xl"
          >
            <span className="tw-text-primary">کنسول‌های نسل جدید</span>{" "}
            در دسترست
          </h2>

          <div className="tw-text-center tw-text-gray-700 tw-text-lg tw-leading-relaxed">
            دسترسی فوری به قدرتمندترین کنسول‌های بازی دنیا.{" "}
            <strong>PlayStation 5</strong> با گرافیک خیره‌کننده و بازی‌های انحصاری مثل God of War و Spider-Man.{" "}
            <strong>Xbox Series X</strong> با Game Pass نامحدود و قدرت پردازشی بی‌نظیر.{" "}
            <strong>Nintendo Switch</strong> برای بازی‌های خانوادگی و سرگرمی همه‌جا. هر کدوم رو که انتخاب کنی، دنیای جدیدی از هیجان و ماجراجویی در انتظارته.
          </div>

          <a
            href="#pricing"
            className="btn-secondary-enhanced tw-mx-auto tw-mt-4 tw-inline-block tw-rounded-full tw-border-2 tw-border-primary tw-bg-transparent tw-px-6 tw-py-3 tw-text-base tw-font-semibold tw-text-primary"
          >
            همین الان کنسول موردعلاقه‌ات رو انتخاب کن
          </a>
        </div>

        <div
          className="tw-mt-12 tw-grid tw-grid-cols-1 md:tw-grid-cols-3 tw-gap-6 tw-w-full"
          role="list"
          aria-label="کنسول‌های موجود"
        >
          {items && <ConsoleList items={items} />}
        </div>
      </div>
    </section>
  );
}
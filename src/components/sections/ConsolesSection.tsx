import { useQuery } from "@tanstack/react-query";
import { ConsoleList } from "@/components/ConsoleCards";
import { consolesQueryOptions } from "@/lib/queries";
import { SectionShell } from "./primitives";

const HIDDEN_CONSOLES = new Set(["ps4", "xbox-series-s", "xbox-one"]);

export function ConsolesSection() {
  const { data } = useQuery(consolesQueryOptions());
  const items = data?.filter((r) => !HIDDEN_CONSOLES.has(r.slug));

  return (
    <SectionShell id="consoles" ariaLabelledBy="consoles-heading">
      <div className="mx-auto flex max-w-[850px] flex-col gap-5 text-center">
        <h2
          id="consoles-heading"
          className="mt-10 text-center text-4xl font-bold max-lg:text-2xl"
        >
          <span className="text-primary">کنسول‌های نسل جدید</span> در دسترست
        </h2>
        <div className="text-center text-gray-700 text-lg leading-relaxed">
          دسترسی فوری به قدرتمندترین کنسول‌های بازی دنیا.{" "}
          <strong>PlayStation 5</strong> با گرافیک خیره‌کننده و بازی‌های انحصاری
          مثل God of War و Spider-Man. <strong>Xbox Series X</strong> با Game
          Pass نامحدود و قدرت پردازشی بی‌نظیر. <strong>Nintendo Switch</strong>{" "}
          برای بازی‌های خانوادگی و سرگرمی همه‌جا. هر کدوم رو که انتخاب کنی، دنیای
          جدیدی از هیجان و ماجراجویی در انتظارته.
        </div>
        <a
          href="#pricing"
          className="btn-secondary-enhanced mx-auto mt-4 inline-block rounded-full border-2 border-primary bg-transparent px-6 py-3 text-base font-semibold text-primary"
        >
          همین الان کنسول موردعلاقه‌ات رو انتخاب کن
        </a>
      </div>

      <div
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
        role="list"
        aria-label="کنسول‌های موجود"
      >
        {items && <ConsoleList items={items} />}
      </div>
    </SectionShell>
  );
}
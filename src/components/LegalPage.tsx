import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export type LegalSection = {
  id: string;
  title: string;
  body: ReactNode;
};

export function LegalPage({
  title,
  intro,
  updated,
  sections,
}: {
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-white">
        <section className="px-4 md:px-8 lg:px-16 py-16">
          <div className="max-w-4xl mx-auto flex flex-col gap-4 text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">{title}</h1>
            <p className="text-lg text-gray-700 leading-relaxed">{intro}</p>
            <p className="text-sm text-gray-500">آخرین بروزرسانی: {updated}</p>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-[220px_1fr] gap-8">
            <aside className="hidden md:block">
              <nav
                aria-label="فهرست مطالب"
                className="sticky top-24 rounded-2xl border border-gray-200 p-4 bg-gray-50"
              >
                <h2 className="text-sm font-bold text-gray-900 mb-3">فهرست مطالب</h2>
                <ol className="flex flex-col gap-2 text-sm text-gray-700 list-decimal pr-4">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="hover:text-primary transition-colors">
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>

            <article className="flex flex-col gap-10 text-gray-800 leading-8">
              {sections.map((s, i) => (
                <section key={s.id} id={s.id} className="scroll-mt-24">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    {i + 1}. {s.title}
                  </h2>
                  <div className="prose-legal flex flex-col gap-3 text-base">{s.body}</div>
                </section>
              ))}
            </article>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
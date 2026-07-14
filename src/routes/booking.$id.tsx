import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { queryOptions } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getBookingByToken } from "@/lib/bookings.functions";
import { toFaDigits } from "@/lib/i18n";
import { formatDateFa } from "@/lib/i18n";

const searchSchema = z.object({ t: z.string().min(10) });

const bookingQueryOptions = (id: string, token: string) =>
  queryOptions({
    queryKey: ["booking-status", id, token],
    queryFn: () => getBookingByToken({ data: { id, token } }),
    staleTime: 30 * 1000,
  });

export const Route = createFileRoute("/booking/$id")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ t: search.t }),
  loader: async ({ context, params, deps }) => {
    const res = await context.queryClient.ensureQueryData(
      bookingQueryOptions(params.id, deps.t),
    );
    if (!res.ok) throw notFound();
    return {};
  },
  head: () => ({
    meta: [
      { title: "وضعیت رزرو | گیمیو" },
      { name: "description", content: "مشاهدهٔ وضعیت رزرو کنسول در گیمیو." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  errorComponent: ({ error }) => (
    <div dir="rtl" className="min-h-dvh flex items-center justify-center p-6 text-center">
      <div>
        <p className="text-muted-foreground mb-4">{(error as Error).message}</p>
        <Link to="/" className="text-primary hover:underline">بازگشت به خانه</Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div dir="rtl" className="min-h-dvh flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-3xl font-bold mb-2">رزرو پیدا نشد</h1>
        <p className="text-muted-foreground mb-4">لینک نامعتبر یا منقضی شده است.</p>
        <Link to="/" className="text-primary hover:underline">بازگشت به خانه</Link>
      </div>
    </div>
  ),
  component: BookingStatusPage,
});

const STATUS_FA: Record<string, string> = {
  pending: "در انتظار تأیید",
  confirmed: "تأیید شده",
  cancelled: "لغو شده",
  completed: "به پایان رسیده",
};

function BookingStatusPage() {
  const { id } = Route.useParams();
  const { t } = Route.useSearch();
  const { data } = useSuspenseQuery(bookingQueryOptions(id, t));
  if (!data.ok) return null;
  const b = data.booking;
  return (
    <div dir="rtl" className="min-h-dvh bg-background" style={{ fontFamily: "Vazirmatn, sans-serif" }}>
      <main className="mx-auto max-w-2xl px-6 py-10 space-y-6">
        <nav className="text-sm">
          <Link to="/" className="text-muted-foreground hover:text-foreground">خانه</Link>
        </nav>
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">وضعیت رزرو</h1>
          <p className="text-sm text-muted-foreground">
            کد پیگیری: <span dir="ltr" className="font-mono">{b.id}</span>
          </p>
        </header>

        <section className="rounded-xl border border-border bg-card p-5 space-y-3">
          <Row label="وضعیت" value={STATUS_FA[b.status] ?? b.status} highlight />
          <Row label="نام" value={b.name} />
          <Row label="شماره تماس" value={toFaDigits(b.phone)} />
          <Row label="کنسول" value={b.consoleType} />
          <Row label="پکیج" value={b.packageType} />
          <Row label="تاریخ شروع" value={formatDateFa(b.startDate)} />
          <Row label="تاریخ پایان" value={formatDateFa(b.endDate)} />
          {b.notes && <Row label="یادداشت" value={b.notes} />}
        </section>

        <a
          href={`/api/public/booking-ical/${b.id}?t=${t}`}
          download
          className="inline-block rounded-md border border-border px-4 py-2 text-sm hover:bg-accent"
        >
          افزودن به تقویم (ics)
        </a>
      </main>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-2 last:border-b-0 last:pb-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={highlight ? "font-semibold text-primary" : "text-sm font-medium"}>{value}</dd>
    </div>
  );
}
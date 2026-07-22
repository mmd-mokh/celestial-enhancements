import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { XCircle } from "lucide-react";

const searchSchema = z.object({
  reason: z.string().optional(),
  ref: z.string().optional(),
});

const REASON_FA: Record<string, string> = {
  cancelled: "پرداخت توسط شما لغو شد.",
  user_cancelled: "پرداخت توسط شما لغو شد.",
  missing_authority: "اطلاعات پرداخت ناقص است.",
  unknown_authority: "این تراکنش پیدا نشد.",
  booking_create_failed:
    "پرداخت انجام شد ولی ثبت رزرو با خطا مواجه شد. لطفاً با پشتیبانی تماس بگیرید.",
};

export const Route = createFileRoute("/payment/failed")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "پرداخت ناموفق | کنسولتو" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "نتیجهٔ پرداخت ناموفق بود." },
    ],
  }),
  component: PaymentFailedPage,
});

function PaymentFailedPage() {
  const { reason, ref } = Route.useSearch();
  const key = reason ?? "";
  const msg =
    REASON_FA[key] ??
    (key.startsWith("verify_")
      ? "تأیید تراکنش نزد درگاه ناموفق بود."
      : "پرداخت ناموفق بود. لطفاً دوباره تلاش کنید.");
  return (
    <div
      dir="rtl"
      className="min-h-dvh flex items-center justify-center p-6"
      style={{ fontFamily: "Vazirmatn, sans-serif" }}
    >
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center space-y-4 shadow-lg">
        <XCircle className="mx-auto h-14 w-14 text-destructive" aria-hidden="true" />
        <h1 className="text-2xl font-bold">پرداخت ناموفق</h1>
        <p className="text-muted-foreground text-sm leading-6">{msg}</p>
        {ref && (
          <div className="rounded-md border border-border bg-muted p-3 text-xs">
            <div className="text-muted-foreground mb-1">کد پیگیری تراکنش</div>
            <div dir="ltr" className="font-mono break-all">{ref}</div>
          </div>
        )}
        <div className="flex flex-col gap-2 pt-2">
          <Link
            to="/"
            className="rounded-md bg-primary text-primary-foreground py-2 text-sm font-semibold hover:opacity-90"
          >
            بازگشت و تلاش دوباره
          </Link>
          <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">
            تماس با پشتیبانی
          </Link>
        </div>
      </div>
    </div>
  );
}
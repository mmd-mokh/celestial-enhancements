import { CalendarPlus, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";

export function SuccessView({
  reservationId,
  icalToken,
  onClose,
}: {
  reservationId: string;
  icalToken: string | null;
  onClose: () => void;
}) {
  return (
    <div className="space-y-5 px-5 py-8 text-center sm:px-8">
      <CheckCircle2 className="mx-auto h-14 w-14 text-primary" aria-hidden="true" />
      <div className="space-y-2">
        <DialogTitle className="text-center text-2xl">درخواست شما ثبت شد</DialogTitle>
        <DialogDescription className="text-center">
          تیم کنسولتو در کمتر از ۳۰ دقیقه برای هماهنگی نهایی تماس می‌گیرد.
        </DialogDescription>
      </div>

      <div className="rounded-md border border-border bg-muted p-3 text-sm">
        <div className="mb-1 text-xs text-muted-foreground">کد پیگیری</div>
        <div dir="ltr" className="break-all font-mono text-xs text-foreground">
          {reservationId}
        </div>
      </div>

      {icalToken && (
        <>
          <Button asChild variant="outline" className="w-full">
            <a href={`/api/public/booking-ical/${reservationId}?t=${icalToken}`} download>
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              افزودن به تقویم
            </a>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <a href={`/booking/${reservationId}?t=${icalToken}`}>
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              مشاهده وضعیت رزرو
            </a>
          </Button>
        </>
      )}
      <Button className="w-full" onClick={onClose}>
        بستن
      </Button>
    </div>
  );
}
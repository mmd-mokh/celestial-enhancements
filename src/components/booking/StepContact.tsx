import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SummaryRow } from "./OptionButton";
import { formatDisplayDate } from "./StepDate";
import { toAsciiDigits, type BookingFormValues } from "./schema";

export function StepContact({
  form,
  selectedConsoleLabel,
  selectedPackageLabel,
  selectedDate,
  endDate,
}: {
  form: UseFormReturn<BookingFormValues>;
  selectedConsoleLabel: string;
  selectedPackageLabel: string;
  selectedDate: Date | undefined;
  endDate: Date | null;
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="booking-name">نام و نام خانوادگی</Label>
        <Input
          id="booking-name"
          {...form.register("name")}
          autoComplete="name"
          placeholder="مثلاً علی رضایی"
          aria-invalid={!!form.formState.errors.name}
          className="bg-background"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="booking-phone">شماره تماس</Label>
        <Input
          id="booking-phone"
          {...form.register("phone", {
            onChange: (event) => {
              event.target.value = toAsciiDigits(event.target.value);
            },
          })}
          autoComplete="tel"
          dir="ltr"
          inputMode="tel"
          placeholder="09121234567"
          aria-invalid={!!form.formState.errors.phone}
          className="bg-background text-left"
        />
        {form.formState.errors.phone && (
          <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="booking-notes">توضیحات (اختیاری)</Label>
        <Textarea
          id="booking-notes"
          {...form.register("notes")}
          placeholder="آدرس تحویل، زمان مناسب تماس یا بازی‌های مورد علاقه..."
          rows={3}
          className="bg-background"
        />
        {form.formState.errors.notes && (
          <p className="text-sm text-destructive">{form.formState.errors.notes.message}</p>
        )}
      </div>

      <dl className="grid gap-2 rounded-md border border-border bg-muted p-3 text-sm">
        <SummaryRow label="کنسول" value={selectedConsoleLabel} />
        <SummaryRow label="پکیج" value={selectedPackageLabel} />
        {selectedDate && endDate && (
          <SummaryRow
            label="تاریخ"
            value={`${formatDisplayDate(selectedDate)} تا ${formatDisplayDate(endDate)}`}
          />
        )}
      </dl>
    </div>
  );
}
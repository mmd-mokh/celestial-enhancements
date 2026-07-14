import { addDays, differenceInCalendarDays, format } from "date-fns";
import { faIR as dayPickerFaIR, getDateLib as getPersianDateLib } from "react-day-picker/persian";
import { CalendarCheck2, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { toFaDigits } from "@/lib/i18n";
import { startOfToday } from "./schema";

const PERSIAN_DATE_LIB = getPersianDateLib({ locale: dayPickerFaIR });

export function formatDisplayDate(date: Date) {
  return PERSIAN_DATE_LIB.format(date, "yyyy/MM/dd");
}

export function StepDate({
  packageDays,
  loading,
  fullyBooked,
  selectedDate,
  onSelect,
  errorMessage,
}: {
  packageDays: number;
  loading: boolean;
  fullyBooked: Set<string>;
  selectedDate: Date | undefined;
  onSelect: (date: Date) => void;
  errorMessage?: string;
}) {
  const endDate = selectedDate ? addDays(selectedDate, packageDays - 1) : null;

  const isDayDisabled = (date: Date) => {
    const today = startOfToday();
    const latestStart = addDays(today, 91 - packageDays);
    if (date < today || date > latestStart) return true;
    for (let index = 0; index < packageDays; index++) {
      if (fullyBooked.has(format(addDays(date, index), "yyyy-MM-dd"))) return true;
    }
    return false;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
        <CalendarCheck2 className="h-4 w-4 text-primary" aria-hidden="true" />
        <span>مدت رزرو: {toFaDigits(packageDays)} روز</span>
        {loading && (
          <span className="inline-flex items-center gap-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            بررسی موجودی
          </span>
        )}
      </div>

      <div className="flex justify-center overflow-x-auto pb-1">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) onSelect(date);
          }}
          disabled={isDayDisabled}
          startMonth={startOfToday()}
          endMonth={addDays(startOfToday(), 90)}
          locale={dayPickerFaIR}
          dateLib={PERSIAN_DATE_LIB}
          numerals="arabext"
          formatters={{
            formatCaption: (month) => PERSIAN_DATE_LIB.format(month, "LLLL yyyy"),
            formatDay: (day) => PERSIAN_DATE_LIB.format(day, "d"),
            formatWeekdayName: (day) => PERSIAN_DATE_LIB.format(day, "EEEEEE"),
          }}
          modifiers={
            selectedDate && endDate
              ? {
                  pkgStart: selectedDate,
                  pkgEnd: endDate,
                  pkgMiddle: { after: selectedDate, before: endDate },
                }
              : undefined
          }
          modifiersClassNames={{
            pkgStart: "bg-primary text-primary-foreground rounded-md",
            pkgEnd: "bg-primary text-primary-foreground rounded-md",
            pkgMiddle: "bg-primary/30 text-foreground rounded-md",
          }}
          className="rounded-md border border-border bg-card text-card-foreground"
        />
      </div>

      {selectedDate && endDate && (
        <div className="rounded-md border border-border bg-card p-3 text-center text-sm text-card-foreground">
          از <span className="font-semibold">{formatDisplayDate(selectedDate)}</span>
          {" تا "}
          <span className="font-semibold">{formatDisplayDate(endDate)}</span>
          {" — "}
          {toFaDigits(differenceInCalendarDays(endDate, selectedDate) + 1)} روز
        </div>
      )}

      {errorMessage && (
        <p className="text-center text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
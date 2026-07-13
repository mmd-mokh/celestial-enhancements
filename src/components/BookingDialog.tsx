import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import { faIR as dayPickerFaIR, getDateLib as getPersianDateLib } from "react-day-picker/persian";
import {
  CalendarCheck2,
  CalendarDays,
  CalendarPlus,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Loader2,
  MonitorPlay,
  PackageCheck,
  Sparkles,
  Tv,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toFaDigits } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { PACKAGES } from "@/components/PricingCards";

const PERSIAN_DATE_LIB = getPersianDateLib({ locale: dayPickerFaIR });

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPackage?: string;
  defaultConsole?: string;
};

type ConsoleOpt = { value: string; label: string; tagline: string };
type PackageOpt = { value: string; label: string; desc: string; hours: number };

const FALLBACK_CONSOLES: ConsoleOpt[] = [
  { value: "ps5", label: "PlayStation 5", tagline: "نسل جدید سونی" },
  { value: "xbox", label: "Xbox Series X", tagline: "قدرت مایکروسافت" },
  { value: "switch", label: "Nintendo Switch", tagline: "بازی همه‌جا" },
];

const PACKAGE_HOURS: Record<string, number> = {
  daily: 24,
  weekend: 72,
  weekly: 168,
  monthly: 720,
};

// Sync with the landing page PricingCards.PACKAGES so the dialog always
// shows the same list, names, and durations as the main website.
const FALLBACK_PACKAGES: PackageOpt[] = PACKAGES.map((p) => ({
  value: p.slug,
  label: p.name,
  desc: p.description,
  hours: PACKAGE_HOURS[p.slug] ?? 24,
}));

const CONSOLE_ICON: Record<string, typeof Gamepad2> = {
  ps5: Gamepad2,
  xbox: MonitorPlay,
  switch: Tv,
};

const PACKAGE_BADGE: Record<string, string> = {
  monthly: "بهترین قیمت",
  weekend: "پرطرفدار",
};

const steps = [
  { label: "کنسول", Icon: Gamepad2 },
  { label: "پکیج", Icon: PackageCheck },
  { label: "تاریخ", Icon: CalendarDays },
  { label: "تماس", Icon: UserRound },
] as const;

const schema = z.object({
  consoleType: z.string().min(1, "کنسول را انتخاب کنید"),
  packageType: z.string().min(1, "پکیج را انتخاب کنید"),
  startDate: z.date({ message: "تاریخ شروع را انتخاب کنید" }),
  name: z
    .string()
    .trim()
    .min(2, "نام باید حداقل ۲ حرف باشد")
    .max(120, "نام بیش از حد طولانی است"),
  phone: z
    .string()
    .trim()
    .min(6, "شماره تماس معتبر نیست")
    .max(30, "شماره تماس بیش از حد طولانی است")
    .regex(/^[0-9+\-\s()]+$/, "فقط عدد و علامت‌های + - مجاز است"),
  notes: z.string().max(1000, "توضیحات بیش از حد طولانی است").optional(),
});

type FormValues = z.infer<typeof schema>;

function toAsciiDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function formatDisplayDate(date: Date) {
  return PERSIAN_DATE_LIB.format(date, "yyyy/MM/dd");
}

export function BookingDialog({
  open,
  onOpenChange,
  defaultPackage,
  defaultConsole,
}: Props) {
  const [step, setStep] = useState(0);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [consoles, setConsoles] = useState<ConsoleOpt[]>(FALLBACK_CONSOLES);
  const [packages] = useState<PackageOpt[]>(FALLBACK_PACKAGES);
  const [fullyBooked, setFullyBooked] = useState<Set<string>>(new Set());
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      consoleType: defaultConsole ?? "ps5",
      packageType: defaultPackage ?? "weekend",
      startDate: undefined as unknown as Date,
      name: "",
      phone: "",
      notes: "",
    },
  });

  const values = form.watch();

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      const [consoleResult] = await Promise.all([
        supabase.from("consoles").select("slug,name").eq("active", true).order("sort_order"),
      ]);

      if (cancelled) return;

      if (consoleResult.data?.length) {
        setConsoles(
          consoleResult.data.map((row) => ({
            value: row.slug,
            label: row.name,
            tagline:
              FALLBACK_CONSOLES.find((item) => item.value === row.slug)?.tagline ?? "کنسول اختصاصی",
          })),
        );
      }
    }

    loadOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setReservationId(null);
    setFullyBooked(new Set());
    form.reset({
      consoleType: defaultConsole ?? "ps5",
      packageType: defaultPackage ?? "weekend",
      startDate: undefined as unknown as Date,
      name: "",
      phone: "",
      notes: "",
    });
  }, [defaultConsole, defaultPackage, form, open]);

  const selectedPackage = useMemo(
    () => packages.find((item) => item.value === values.packageType) ?? packages[0],
    [packages, values.packageType],
  );

  const packageDays = Math.max(1, Math.ceil((selectedPackage?.hours ?? 24) / 24));

  // Bug fix: when the user changes console or package after picking a date,
  // the previously selected startDate may now overlap unavailable days or
  // exceed the allowed window. Clear it so the user re-picks in step 2.
  useEffect(() => {
    if (!open) return;
    if (values.startDate) {
      form.setValue("startDate", undefined as unknown as Date, { shouldValidate: false });
      form.clearErrors("startDate");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.consoleType, values.packageType]);

  useEffect(() => {
    if (!open || step !== 2 || !values.consoleType) return;
    let cancelled = false;
    const today = startOfToday();

    setFullyBooked(new Set());
    setLoadingAvailability(true);

    supabase
      .rpc("get_console_availability", {
        _console_slug: values.consoleType,
        _from: format(today, "yyyy-MM-dd"),
        _to: format(addDays(today, 90), "yyyy-MM-dd"),
      })
      .then(({ data, error }) => {
        if (cancelled) return;
        setLoadingAvailability(false);

        if (error || !data) {
          toast.error("موجودی تقویم دریافت نشد؛ لطفاً دوباره تلاش کنید.");
          return;
        }

        const unavailable = new Set<string>();
        for (const row of data) {
          if (row.capacity > 0 && row.booked >= row.capacity) unavailable.add(row.day);
        }
        setFullyBooked(unavailable);
      });

    return () => {
      cancelled = true;
    };
  }, [open, step, values.consoleType]);

  const isDayDisabled = (date: Date) => {
    const today = startOfToday();
    const latestStart = addDays(today, 91 - packageDays);

    if (date < today || date > latestStart) return true;

    for (let index = 0; index < packageDays; index++) {
      if (fullyBooked.has(format(addDays(date, index), "yyyy-MM-dd"))) return true;
    }

    return false;
  };

  const goNext = async () => {
    const fields: Array<Array<keyof FormValues>> = [
      ["consoleType"],
      ["packageType"],
      ["startDate"],
      ["name", "phone", "notes"],
    ];

    const valid = await form.trigger(fields[step]);
    if (!valid) return;

    if (step < steps.length - 1) {
      setStep((current) => current + 1);
      return;
    }

    // Bug fix: on final submit, re-validate every step. Without this, if a
    // prior-step field became invalid (e.g. startDate cleared after changing
    // package), handleSubmit silently no-ops and the user sees nothing.
    const allValid = await form.trigger();
    if (!allValid) {
      const errs = form.formState.errors;
      if (errs.consoleType) setStep(0);
      else if (errs.packageType) setStep(1);
      else if (errs.startDate) {
        setStep(2);
        toast.error("لطفاً تاریخ شروع را انتخاب کنید.");
      }
      return;
    }

    await form.handleSubmit(onSubmit)();
  };

  const onSubmit = async (data: FormValues) => {
    const start = data.startDate;
    const end = addDays(start, packageDays - 1);

    const { data: newId, error } = await supabase.rpc("create_booking", {
      _name: data.name.trim(),
      _phone: toAsciiDigits(data.phone).trim(),
      _console_type: data.consoleType,
      _package_type: data.packageType,
      _start_date: format(start, "yyyy-MM-dd"),
      _end_date: format(end, "yyyy-MM-dd"),
      _notes: data.notes?.trim() || undefined,
    });

    if (error) {
      const message = (error.message || "").toLowerCase();
      const details = ((error as { details?: string }).details || "").toLowerCase();
      const combined = `${message} ${details}`;
      if (combined.includes("no_availability")) {
        toast.error("این کنسول در تاریخ انتخابی رزرو شده. لطفاً تاریخ دیگری انتخاب کنید.");
        setStep(2);
      } else if (combined.includes("past_date")) {
        toast.error("تاریخ شروع نمی‌تواند در گذشته باشد.");
        setStep(2);
      } else if (combined.includes("rate_limited")) {
        toast.error("تعداد رزروهای اخیر شما زیاد است. لطفاً یک ساعت دیگر تلاش کنید.");
      } else if (combined.includes("console_unavailable")) {
        toast.error("این کنسول در حال حاضر در دسترس نیست.");
        setStep(0);
      } else if (combined.includes("invalid_phone")) {
        toast.error("شماره تماس معتبر نیست.");
        setStep(3);
      } else if (combined.includes("invalid_name")) {
        toast.error("نام وارد شده معتبر نیست.");
        setStep(3);
      } else {
        toast.error("ارسال ناموفق بود. لطفاً دوباره تلاش کنید.");
      }
      return;
    }

    // Bug fix: only show success screen when we actually received a booking id.
    if (!newId) {
      toast.error("پاسخ نامعتبر از سرور. لطفاً دوباره تلاش کنید.");
      return;
    }
    setReservationId(newId);
    toast.success("درخواست رزرو ثبت شد!");
  };

  const close = () => {
    onOpenChange(false);
    window.setTimeout(() => {
      setStep(0);
      setReservationId(null);
      form.reset();
    }, 180);
  };

  const selectedConsole = consoles.find((item) => item.value === values.consoleType);
  const selectedDate = values.startDate;
  const endDate = selectedDate ? addDays(selectedDate, packageDays - 1) : null;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? onOpenChange(true) : close())}>
      <DialogContent
        dir="rtl"
        className="max-h-[92dvh] overflow-y-auto border-border bg-popover p-0 text-popover-foreground shadow-2xl sm:max-w-2xl"
      >
        {reservationId !== null ? (
          <div className="space-y-5 px-5 py-8 text-center sm:px-8">
            <CheckCircle2 className="mx-auto h-14 w-14 text-primary" aria-hidden="true" />
            <div className="space-y-2">
              <DialogTitle className="text-center text-2xl">درخواست شما ثبت شد</DialogTitle>
              <DialogDescription className="text-center">
                تیم گیمیو در کمتر از ۳۰ دقیقه برای هماهنگی نهایی تماس می‌گیرد.
              </DialogDescription>
            </div>

            {reservationId && (
              <div className="rounded-md border border-border bg-muted p-3 text-sm">
                <div className="mb-1 text-xs text-muted-foreground">کد پیگیری</div>
                <div dir="ltr" className="break-all font-mono text-xs text-foreground">
                  {reservationId}
                </div>
              </div>
            )}

            {reservationId && (
              <Button asChild variant="outline" className="w-full">
                <a href={`/api/public/booking-ical/${reservationId}`} download>
                  <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                  افزودن به تقویم
                </a>
              </Button>
            )}
            <Button className="w-full" onClick={close}>
              بستن
            </Button>
          </div>
        ) : (
          <>
            <div className="border-b border-border bg-gradient-to-b from-card to-card/60 px-5 pb-5 pt-6 text-card-foreground sm:px-7">
              <DialogHeader className="space-y-2 text-right">
                <div className="flex items-center justify-between gap-3">
                  <DialogTitle className="text-right text-xl sm:text-2xl">رزرو کنسول</DialogTitle>
                  <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    گام {toFaDigits(step + 1)} از {toFaDigits(steps.length)}
                  </span>
                </div>
                <DialogDescription className="text-right text-sm">
                  {steps[step].label} را مشخص کنید؛ ثبت نهایی در مرحله آخر انجام می‌شود.
                </DialogDescription>
              </DialogHeader>

              <ol className="relative mt-5 flex items-center justify-between" aria-label="مراحل رزرو">
                <div className="absolute inset-x-4 top-4 z-0 h-0.5 rounded-full bg-border" aria-hidden="true" />
                <div
                  className="absolute right-4 top-4 z-0 h-0.5 rounded-full bg-primary transition-all duration-500"
                  style={{ width: `calc((100% - 2rem) * ${step / (steps.length - 1)})` }}
                  aria-hidden="true"
                />
                {steps.map(({ label, Icon }, index) => {
                  const active = index === step;
                  const done = index < step;
                  return (
                    <li key={label} className="relative z-10 flex flex-col items-center gap-1.5">
                      <span
                        className={cn(
                          "grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-semibold transition-all",
                          done && "border-primary bg-primary text-primary-foreground",
                          active && "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/40 scale-110",
                          !active && !done && "border-border bg-background text-muted-foreground",
                        )}
                      >
                        {done ? (
                          <Check className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        )}
                      </span>
                      <span
                        className={cn(
                          "text-[11px] font-medium transition-colors",
                          active || done ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {label}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                goNext();
              }}
              className="space-y-5 px-5 py-5 sm:px-7"
            >
              {step === 0 && (
                <div className="grid gap-3 sm:grid-cols-3">
                  {consoles.map((consoleItem) => {
                    const Icon = CONSOLE_ICON[consoleItem.value] ?? Gamepad2;
                    const selected = values.consoleType === consoleItem.value;
                    return (
                      <OptionButton
                        key={consoleItem.value}
                        selected={selected}
                        onClick={() =>
                          form.setValue("consoleType", consoleItem.value, { shouldValidate: true })
                        }
                      >
                        <span
                          className={cn(
                            "grid h-12 w-12 place-items-center rounded-full transition-colors",
                            selected
                              ? "bg-primary-foreground text-primary ring-2 ring-primary border border-primary"
                              : "bg-primary/10 text-primary",
                          )}
                        >
                          <Icon className="h-6 w-6" aria-hidden="true" />
                        </span>
                        <span className="font-semibold">{consoleItem.label}</span>
                        <span className="text-xs text-muted-foreground">{consoleItem.tagline}</span>
                      </OptionButton>
                    );
                  })}
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {packages.map((packageItem) => {
                    const badge = PACKAGE_BADGE[packageItem.value];
                    const days = Math.max(1, Math.ceil(packageItem.hours / 24));
                    return (
                      <OptionButton
                        key={packageItem.value}
                        selected={values.packageType === packageItem.value}
                        onClick={() =>
                          form.setValue("packageType", packageItem.value, { shouldValidate: true })
                        }
                      >
                        {badge && (
                          <span className={cn(
                            "absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                            values.packageType === packageItem.value
                              ? "bg-primary-foreground text-primary border border-primary"
                              : "bg-primary/15 text-primary",
                          )}>
                            <Sparkles className="h-3 w-3" aria-hidden="true" />
                            {badge}
                          </span>
                        )}
                        <span className="text-base font-semibold">{packageItem.label}</span>
                        <span className="text-sm text-muted-foreground">{packageItem.desc}</span>
                        <span className="text-[11px] text-muted-foreground/80">
                          {toFaDigits(days)} روز
                        </span>
                      </OptionButton>
                    );
                  })}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
                    <CalendarCheck2 className="h-4 w-4 text-primary" aria-hidden="true" />
                    <span>مدت رزرو: {toFaDigits(packageDays)} روز</span>
                    {loadingAvailability && (
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
                        if (date) form.setValue("startDate", date, { shouldValidate: true });
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

                  {form.formState.errors.startDate && (
                    <p className="text-center text-sm text-destructive">
                      {form.formState.errors.startDate.message as string}
                    </p>
                  )}
                </div>
              )}

              {step === 3 && (
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
                    <SummaryRow label="کنسول" value={selectedConsole?.label ?? "—"} />
                    <SummaryRow label="پکیج" value={selectedPackage?.label ?? "—"} />
                    {selectedDate && endDate && (
                      <SummaryRow
                        label="تاریخ"
                        value={`${formatDisplayDate(selectedDate)} تا ${formatDisplayDate(endDate)}`}
                      />
                    )}
                  </dl>
                </div>
              )}

              <div className="sticky bottom-0 -mx-5 -mb-5 space-y-3 border-t border-border bg-popover/95 px-5 py-4 backdrop-blur sm:-mx-7 sm:-mb-5 sm:px-7">
                {(selectedConsole || selectedPackage) && step > 0 && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {selectedConsole && (
                      <span className="inline-flex items-center gap-1">
                        <Gamepad2 className="h-3 w-3 text-primary" aria-hidden="true" />
                        {selectedConsole.label}
                      </span>
                    )}
                    {selectedPackage && step > 1 && (
                      <>
                        <span aria-hidden="true">•</span>
                        <span className="inline-flex items-center gap-1">
                          <PackageCheck className="h-3 w-3 text-primary" aria-hidden="true" />
                          {selectedPackage.label}
                        </span>
                      </>
                    )}
                    {selectedDate && step > 2 && (
                      <>
                        <span aria-hidden="true">•</span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3 w-3 text-primary" aria-hidden="true" />
                          {formatDisplayDate(selectedDate)}
                        </span>
                      </>
                    )}
                  </div>
                )}
              <DialogFooter className="flex-col-reverse gap-2 sm:flex-row-reverse sm:justify-between sm:space-x-0">
                <Button
                  type="submit"
                  disabled={
                    form.formState.isSubmitting ||
                    (step === 2 && (!selectedDate || loadingAvailability))
                  }
                  size="lg"
                  className="w-full font-semibold sm:w-auto sm:min-w-40"
                >
                  {step === steps.length - 1 ? (
                    form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        در حال ارسال
                      </>
                    ) : (
                      "ثبت درخواست"
                    )
                  ) : (
                    <>
                      بعدی
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </>
                  )}
                </Button>

                {step > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep((current) => current - 1)}
                    disabled={form.formState.isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    قبلی
                  </Button>
                )}
              </DialogFooter>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function OptionButton({
  children,
  onClick,
  selected,
}: {
  children: ReactNode;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group relative flex min-h-28 flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border p-4 text-center transition-all duration-200",
        selected
          ? "border-primary bg-primary-foreground text-primary shadow-lg shadow-primary/30 ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02] [&_.text-muted-foreground]:text-primary/80 [&_.text-muted-foreground\\/80]:text-primary/70"
          : "border-border bg-card text-card-foreground hover:-translate-y-0.5 hover:border-primary/60 hover:bg-accent hover:shadow-sm",
      )}
    >
      {selected && (
        <span
          className="absolute top-2 right-2 grid h-5 w-5 place-items-center rounded-full bg-primary-foreground text-primary border border-primary shadow"
          aria-hidden="true"
        >
          <Check className="h-3 w-3" />
        </span>
      )}
      {children}
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-left font-medium text-foreground">{value}</dd>
    </div>
  );
}
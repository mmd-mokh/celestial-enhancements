import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import { format as formatJalali } from "date-fns-jalali";
import { faIR as jalaliFaIR } from "date-fns-jalali/locale/fa-IR";
import { faIR as dayPickerFaIR, getDateLib as getPersianDateLib } from "react-day-picker/persian";
import {
  CalendarCheck2,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Loader2,
  PackageCheck,
  UserRound,
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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPackage?: string;
  defaultConsole?: string;
};

type ConsoleOpt = { value: string; label: string; icon: string };
type PackageOpt = { value: string; label: string; desc: string; hours: number };

const FALLBACK_CONSOLES: ConsoleOpt[] = [
  { value: "ps5", label: "PlayStation 5", icon: "bi-playstation" },
  { value: "xbox", label: "Xbox Series X", icon: "bi-xbox" },
  { value: "switch", label: "Nintendo Switch", icon: "bi-nintendo-switch" },
];

const FALLBACK_PACKAGES: PackageOpt[] = [
  { value: "daily", label: "روزانه", desc: "۲۴ ساعت", hours: 24 },
  { value: "weekend", label: "آخر هفته", desc: "پنجشنبه تا شنبه", hours: 72 },
  { value: "weekly", label: "هفتگی", desc: "۷ روز کامل", hours: 168 },
  { value: "monthly", label: "ماهانه", desc: "۳۰ روز، بهترین قیمت", hours: 720 },
];

const ICON_MAP: Record<string, string> = {
  ps5: "bi-playstation",
  xbox: "bi-xbox",
  switch: "bi-nintendo-switch",
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
    .transform(toAsciiDigits)
    .pipe(
      z
        .string()
        .min(6, "شماره تماس معتبر نیست")
        .max(30, "شماره تماس بیش از حد طولانی است")
        .regex(/^[0-9+\-\s()]+$/, "فقط عدد و علامت‌های + - مجاز است"),
    ),
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

export function BookingDialog({
  open,
  onOpenChange,
  defaultPackage,
  defaultConsole,
}: Props) {
  const [step, setStep] = useState(0);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [consoles, setConsoles] = useState<ConsoleOpt[]>(FALLBACK_CONSOLES);
  const [packages, setPackages] = useState<PackageOpt[]>(FALLBACK_PACKAGES);
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
      const [consoleResult, packageResult] = await Promise.all([
        supabase.from("consoles").select("slug,name").eq("active", true).order("sort_order"),
        supabase
          .from("packages")
          .select("slug,name,description,duration_hours")
          .eq("active", true)
          .order("sort_order"),
      ]);

      if (cancelled) return;

      if (consoleResult.data?.length) {
        setConsoles(
          consoleResult.data.map((row) => ({
            value: row.slug,
            label: row.name,
            icon: ICON_MAP[row.slug] ?? "bi-joystick",
          })),
        );
      }

      if (packageResult.data?.length) {
        setPackages(
          packageResult.data.map((row) => ({
            value: row.slug,
            label: row.name,
            desc: row.description ?? `${toFaDigits(row.duration_hours ?? 24)} ساعت`,
            hours: Number(row.duration_hours ?? 24),
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

    form.handleSubmit(onSubmit)();
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
      if (message.includes("no_availability")) {
        toast.error("این کنسول در تاریخ انتخابی رزرو شده. لطفاً تاریخ دیگری انتخاب کنید.");
        setStep(2);
      } else if (message.includes("past_date")) {
        toast.error("تاریخ شروع نمی‌تواند در گذشته باشد.");
        setStep(2);
      } else if (message.includes("rate_limited")) {
        toast.error("تعداد رزروهای اخیر شما زیاد است. لطفاً یک ساعت دیگر تلاش کنید.");
      } else {
        toast.error("ارسال ناموفق بود. لطفاً دوباره تلاش کنید.");
      }
      return;
    }

    setReservationId(newId ?? "");
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
            <div className="border-b border-border bg-card px-5 py-5 text-card-foreground sm:px-7">
              <DialogHeader className="space-y-3 text-right">
                <DialogTitle className="text-right text-2xl">رزرو کنسول</DialogTitle>
                <DialogDescription className="text-right">
                  {steps[step].label} را مشخص کنید؛ ثبت نهایی در مرحله آخر انجام می‌شود.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-5 grid grid-cols-4 gap-2" aria-label="مراحل رزرو">
                {steps.map(({ label, Icon }, index) => {
                  const active = index === step;
                  const done = index < step;
                  return (
                    <div
                      key={label}
                      className={cn(
                        "flex min-w-0 flex-col items-center gap-2 rounded-md border px-2 py-2 text-center text-xs transition-colors",
                        active || done
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{label}</span>
                    </div>
                  );
                })}
              </div>
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
                  {consoles.map((consoleItem) => (
                    <OptionButton
                      key={consoleItem.value}
                      selected={values.consoleType === consoleItem.value}
                      onClick={() =>
                        form.setValue("consoleType", consoleItem.value, { shouldValidate: true })
                      }
                    >
                      <i className={`bi ${consoleItem.icon} text-3xl text-primary`} aria-hidden="true" />
                      <span className="font-semibold">{consoleItem.label}</span>
                    </OptionButton>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {packages.map((packageItem) => (
                    <OptionButton
                      key={packageItem.value}
                      selected={values.packageType === packageItem.value}
                      onClick={() =>
                        form.setValue("packageType", packageItem.value, { shouldValidate: true })
                      }
                    >
                      <span className="text-base font-semibold">{packageItem.label}</span>
                      <span className="text-sm text-muted-foreground">{packageItem.desc}</span>
                    </OptionButton>
                  ))}
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
                      dateLib={getPersianDateLib({ locale: dayPickerFaIR })}
                      numerals="arabext"
                      formatters={{
                        formatCaption: (month) => toFaDigits(formatJalali(month, "LLLL yyyy", { locale: jalaliFaIR })),
                        formatDay: (day) => toFaDigits(formatJalali(day, "d", { locale: jalaliFaIR })),
                        formatWeekdayName: (day) => formatJalali(day, "EEEEEE", { locale: jalaliFaIR }),
                      }}
                      className="rounded-md border border-border bg-card text-card-foreground"
                    />
                  </div>

                  {selectedDate && endDate && (
                    <div className="rounded-md border border-border bg-card p-3 text-center text-sm text-card-foreground">
                      از <span className="font-semibold">{toFaDigits(format(selectedDate, "yyyy/MM/dd"))}</span>
                      {" تا "}
                      <span className="font-semibold">{toFaDigits(format(endDate, "yyyy/MM/dd"))}</span>
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
                        value={`${toFaDigits(format(selectedDate, "yyyy/MM/dd"))} تا ${toFaDigits(format(endDate, "yyyy/MM/dd"))}`}
                      />
                    )}
                  </dl>
                </div>
              )}

              <DialogFooter className="flex-col-reverse gap-2 sm:flex-row-reverse sm:justify-between sm:space-x-0">
                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full sm:w-auto">
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
                    variant="outline"
                    onClick={() => setStep((current) => current - 1)}
                    disabled={form.formState.isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    قبلی
                  </Button>
                )}
              </DialogFooter>
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
      className={cn(
        "flex min-h-28 flex-col items-center justify-center gap-2 rounded-md border p-4 text-center transition-colors",
        selected
          ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/25"
          : "border-border bg-card text-card-foreground hover:border-primary hover:bg-accent",
      )}
    >
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
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format } from "date-fns";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Loader2,
  PackageCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toFaDigits } from "@/lib/i18n";
import { createBooking } from "@/lib/bookings.functions";
import { trackEvent } from "@/lib/analytics";
import { reportLovableError } from "@/lib/lovable-error-reporting";

import {
  FALLBACK_CONSOLES,
  FALLBACK_PACKAGES,
  STEPS,
} from "./booking/constants";
import {
  bookingFormSchema,
  toAsciiDigits,
  type BookingFormValues,
} from "./booking/schema";
import { useConsoleOptions, useConsoleAvailability } from "./booking/hooks";
import { StepIndicator } from "./booking/StepIndicator";
import { StepConsole } from "./booking/StepConsole";
import { StepPackage } from "./booking/StepPackage";
import { StepDate, formatDisplayDate } from "./booking/StepDate";
import { StepContact } from "./booking/StepContact";
import { SuccessView } from "./booking/SuccessView";
import { TurnstileWidget } from "@/components/TurnstileWidget";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPackage?: string;
  defaultConsole?: string;
};

export function BookingDialog({
  open,
  onOpenChange,
  defaultPackage,
  defaultConsole,
}: Props) {
  const [step, setStep] = useState(0);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [icalToken, setIcalToken] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const optionsQuery = useConsoleOptions(open);
  const consoles = optionsQuery.data?.consoles ?? FALLBACK_CONSOLES;
  const remainingBySlug = optionsQuery.data?.remainingBySlug ?? {};
  const packages = FALLBACK_PACKAGES;

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
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
    if (!open) return;
    setStep(0);
    setReservationId(null);
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

  const availabilityQuery = useConsoleAvailability(
    values.consoleType,
    open && step === 2,
  );
  const fullyBooked = availabilityQuery.data ?? new Set<string>();
  const loadingAvailability = availabilityQuery.isFetching;

  useEffect(() => {
    if (availabilityQuery.isError) {
      toast.error("موجودی تقویم دریافت نشد؛ لطفاً دوباره تلاش کنید.");
    }
  }, [availabilityQuery.isError]);

  const goNext = async () => {
    const fields: Array<Array<keyof BookingFormValues>> = [
      ["consoleType"],
      ["packageType"],
      ["startDate"],
      ["name", "phone", "notes"],
    ];

    const valid = await form.trigger(fields[step]);
    if (!valid) return;

    if (step < STEPS.length - 1) {
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

  const onSubmit = async (data: BookingFormValues) => {
    const start = data.startDate;
    const end = addDays(start, packageDays - 1);

    let result;
    try {
      result = await createBooking({
        data: {
          name: data.name.trim(),
          phone: toAsciiDigits(data.phone).trim(),
          consoleType: data.consoleType,
          packageType: data.packageType,
          startDate: format(start, "yyyy-MM-dd"),
          endDate: format(end, "yyyy-MM-dd"),
          notes: data.notes?.trim() || undefined,
          captchaToken: captchaToken ?? undefined,
        },
      });
    } catch (err) {
      console.error("[BookingDialog] createBooking failed", err);
      reportLovableError(err instanceof Error ? err : new Error(String(err)), {
        boundary: "booking_dialog_submit",
      });
      toast.error("ارسال ناموفق بود. لطفاً دوباره تلاش کنید.");
      return;
    }

    if (!result.ok) {
      const code = result.code;
      if (code === "captcha_required") {
        toast.error("لطفاً کپچا را تأیید کنید.");
      } else if (code === "no_availability") {
        toast.error("این کنسول در تاریخ انتخابی رزرو شده. لطفاً تاریخ دیگری انتخاب کنید.");
        setStep(2);
      } else if (code === "past_date") {
        toast.error("تاریخ شروع نمی‌تواند در گذشته باشد.");
        setStep(2);
      } else if (code === "rate_limited") {
        toast.error("تعداد رزروهای اخیر شما زیاد است. لطفاً یک ساعت دیگر تلاش کنید.");
      } else if (code === "console_unavailable") {
        toast.error("این کنسول در حال حاضر در دسترس نیست.");
        setStep(0);
      } else if (code === "invalid_phone") {
        toast.error("شماره تماس معتبر نیست.");
        setStep(3);
      } else if (code === "invalid_name") {
        toast.error("نام وارد شده معتبر نیست.");
        setStep(3);
      } else {
        toast.error("ارسال ناموفق بود. لطفاً دوباره تلاش کنید.");
      }
      return;
    }

    setReservationId(result.id);
    setIcalToken(result.icalToken);
    toast.success("درخواست رزرو ثبت شد!");
    trackEvent("booking_submit", {
      console_type: data.consoleType,
      package_type: data.packageType,
      days: packageDays,
    });
  };

  const close = () => {
    onOpenChange(false);
    window.setTimeout(() => {
      setStep(0);
      setReservationId(null);
      setIcalToken(null);
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
          <SuccessView reservationId={reservationId} icalToken={icalToken} onClose={close} />
        ) : (
          <>
            <div className="border-b border-border bg-gradient-to-b from-card to-card/60 px-5 pb-5 pt-6 text-card-foreground sm:px-7">
              <DialogHeader className="space-y-2 text-right">
                <div className="flex items-center justify-between gap-3">
                  <DialogTitle className="text-right text-xl sm:text-2xl">رزرو کنسول</DialogTitle>
                  <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    گام {toFaDigits(step + 1)} از {toFaDigits(STEPS.length)}
                  </span>
                </div>
                <DialogDescription className="text-right text-sm">
                  {STEPS[step].label} را مشخص کنید؛ ثبت نهایی در مرحله آخر انجام می‌شود.
                </DialogDescription>
              </DialogHeader>
              <StepIndicator step={step} />
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                goNext();
              }}
              className="space-y-5 px-5 py-5 sm:px-7"
            >
              {step === 0 && (
                <StepConsole
                  consoles={consoles}
                  value={values.consoleType}
                  remainingBySlug={remainingBySlug}
                  onSelect={(slug) =>
                    form.setValue("consoleType", slug, { shouldValidate: true })
                  }
                />
              )}

              {step === 1 && (
                <StepPackage
                  packages={packages}
                  value={values.packageType}
                  onSelect={(slug) =>
                    form.setValue("packageType", slug, { shouldValidate: true })
                  }
                />
              )}

              {step === 2 && (
                <StepDate
                  packageDays={packageDays}
                  loading={loadingAvailability}
                  fullyBooked={fullyBooked}
                  selectedDate={selectedDate}
                  onSelect={(date) =>
                    form.setValue("startDate", date, { shouldValidate: true })
                  }
                  errorMessage={form.formState.errors.startDate?.message as string | undefined}
                />
              )}

              {step === 3 && (
                <>
                  <StepContact
                    form={form}
                    selectedConsoleLabel={selectedConsole?.label ?? "—"}
                    selectedPackageLabel={selectedPackage?.label ?? "—"}
                    selectedDate={selectedDate}
                    endDate={endDate}
                  />
                  <div className="mt-2 flex justify-center">
                    <TurnstileWidget onToken={setCaptchaToken} />
                  </div>
                </>
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
                  {step === STEPS.length - 1 ? (
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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPackage?: string;
  defaultConsole?: string;
};

const CONSOLES = [
  { value: "ps5", label: "PlayStation 5", icon: "bi-playstation" },
  { value: "xbox", label: "Xbox Series X", icon: "bi-xbox" },
  { value: "switch", label: "Nintendo Switch", icon: "bi-nintendo-switch" },
];

const PACKAGES = [
  { value: "daily", label: "روزانه", desc: "۲۴ ساعت" },
  { value: "weekend", label: "آخر هفته", desc: "پنجشنبه تا شنبه" },
  { value: "weekly", label: "هفتگی", desc: "۷ روز کامل" },
  { value: "monthly", label: "ماهانه", desc: "۳۰ روز، بهترین قیمت" },
];

const schema = z.object({
  consoleType: z.string().min(1, "کنسول را انتخاب کنید"),
  packageType: z.string().min(1, "پکیج را انتخاب کنید"),
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
    .regex(/^[0-9+\-\s()]+$/, "فقط عدد و + - مجاز است"),
  notes: z.string().max(1000, "توضیحات بیش از حد طولانی است").optional(),
});

type FormValues = z.infer<typeof schema>;

const STEP_LABELS = ["کنسول", "پکیج", "اطلاعات تماس"];

export function BookingDialog({
  open,
  onOpenChange,
  defaultPackage,
  defaultConsole,
}: Props) {
  const [step, setStep] = useState(0);
  const [reservationId, setReservationId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      consoleType: defaultConsole ?? "ps5",
      packageType: defaultPackage ?? "weekend",
      name: "",
      phone: "",
      notes: "",
    },
  });

  // Sync incoming defaults when reopened from a different pricing card.
  useEffect(() => {
    if (!open) return;
    setStep(0);
    setReservationId(null);
    form.reset({
      consoleType: defaultConsole ?? form.getValues("consoleType") ?? "ps5",
      packageType: defaultPackage ?? form.getValues("packageType") ?? "weekend",
      name: form.getValues("name") ?? "",
      phone: form.getValues("phone") ?? "",
      notes: form.getValues("notes") ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultConsole, defaultPackage]);

  const values = form.watch();

  const goNext = async () => {
    const fields: (keyof FormValues)[][] = [["consoleType"], ["packageType"], ["name", "phone", "notes"]];
    const ok = await form.trigger(fields[step]);
    if (!ok) return;
    if (step < 2) setStep(step + 1);
    else form.handleSubmit(onSubmit)();
  };

  const onSubmit = async (data: FormValues) => {
    const { data: inserted, error } = await supabase
      .from("bookings")
      .insert({
        name: data.name.trim(),
        phone: data.phone.trim(),
        console_type: data.consoleType,
        package_type: data.packageType,
        notes: data.notes?.trim() || null,
      })
      .select("id")
      .single();
    if (error) {
      console.error(error);
      toast.error("ارسال ناموفق بود. لطفاً دوباره تلاش کنید.");
      return;
    }
    setReservationId(inserted?.id ?? "");
    toast.success("درخواست رزرو ثبت شد!");
  };

  const close = () => {
    onOpenChange(false);
    // reset after close animation
    setTimeout(() => {
      setStep(0);
      setReservationId(null);
      form.reset();
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(o) : close())}>
      <DialogContent dir="rtl" className="sm:max-w-lg">
        {reservationId !== null ? (
          <div className="py-6 text-center space-y-4">
            <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
            <DialogTitle className="text-center text-xl">درخواست شما ثبت شد</DialogTitle>
            <DialogDescription className="text-center">
              تیم گیمیو در کمتر از ۳۰ دقیقه باهات تماس می‌گیره.
            </DialogDescription>
            {reservationId && (
              <div className="rounded-md bg-muted p-3 text-sm">
                <div className="text-muted-foreground text-xs mb-1">کد پیگیری</div>
                <div dir="ltr" className="font-mono text-xs break-all">{reservationId}</div>
              </div>
            )}
            <Button className="w-full" onClick={close}>بستن</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-right">رزرو کنسول</DialogTitle>
              <DialogDescription className="text-right">
                مرحله {step + 1} از ۳ — {STEP_LABELS[step]}
              </DialogDescription>
            </DialogHeader>

            {/* Stepper */}
            <div className="flex gap-2 mb-2">
              {STEP_LABELS.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    i <= step ? "bg-primary" : "bg-muted",
                  )}
                />
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                goNext();
              }}
              className="space-y-4"
            >
              {step === 0 && (
                <div className="grid grid-cols-1 gap-2">
                  {CONSOLES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => form.setValue("consoleType", c.value, { shouldValidate: true })}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-4 text-right transition-all hover:border-primary",
                        values.consoleType === c.value
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-input",
                      )}
                    >
                      <i className={`bi ${c.icon} text-2xl text-primary`} />
                      <span className="font-medium">{c.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-2 gap-2">
                  {PACKAGES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => form.setValue("packageType", p.value, { shouldValidate: true })}
                      className={cn(
                        "rounded-lg border p-4 text-right transition-all hover:border-primary",
                        values.packageType === p.value
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-input",
                      )}
                    >
                      <div className="font-semibold">{p.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{p.desc}</div>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="booking-name">نام و نام خانوادگی</Label>
                    <Input
                      id="booking-name"
                      {...form.register("name")}
                      placeholder="مثلاً علی رضایی"
                      autoComplete="name"
                      aria-invalid={!!form.formState.errors.name}
                    />
                    {form.formState.errors.name && (
                      <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="booking-phone">شماره تماس</Label>
                    <Input
                      id="booking-phone"
                      {...form.register("phone")}
                      placeholder="09121234567"
                      inputMode="tel"
                      autoComplete="tel"
                      dir="ltr"
                      aria-invalid={!!form.formState.errors.phone}
                    />
                    {form.formState.errors.phone && (
                      <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="booking-notes">توضیحات (اختیاری)</Label>
                    <Textarea
                      id="booking-notes"
                      {...form.register("notes")}
                      placeholder="آدرس تحویل، تاریخ شروع، بازی‌های مورد علاقه..."
                      rows={3}
                    />
                    {form.formState.errors.notes && (
                      <p className="text-xs text-destructive">{form.formState.errors.notes.message}</p>
                    )}
                  </div>

                  <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>کنسول:</span>
                      <span className="font-medium text-foreground">
                        {CONSOLES.find((c) => c.value === values.consoleType)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>پکیج:</span>
                      <span className="font-medium text-foreground">
                        {PACKAGES.find((p) => p.value === values.packageType)?.label}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="flex-row-reverse gap-2 sm:justify-between">
                <Button type="submit" disabled={form.formState.isSubmitting} className="flex-1">
                  {step === 2
                    ? form.formState.isSubmitting
                      ? "در حال ارسال..."
                      : "ثبت درخواست"
                    : (
                      <>
                        بعدی
                        <ChevronLeft className="h-4 w-4" />
                      </>
                    )}
                </Button>
                {step > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    disabled={form.formState.isSubmitting}
                  >
                    <ChevronRight className="h-4 w-4" />
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
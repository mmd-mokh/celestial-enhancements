import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/lib/newsletter.functions";
import { TurnstileWidget } from "@/components/TurnstileWidget";

const schema = z.object({
  email: z
    .string({ required_error: "لطفاً ایمیل رو وارد کنید" })
    .email("ایمیل معتبر نیست"),
});
type Values = z.infer<typeof schema>;

/**
 * Replaces the static newsletter <form> in the ported blob with a
 * validated react-hook-form + zod version. Mounts into the existing
 * form element so surrounding copy/labels are preserved.
 */
export function NewsletterFormStandalone() {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(v: Values) {
    const res = await subscribeNewsletter({
      data: {
        email: v.email.trim().toLowerCase(),
        source: "landing",
        captchaToken: captchaToken ?? undefined,
      },
    }).catch(() => null);
    if (!res || !res.ok) {
      if (res && res.code === "captcha_required") {
        toast.error("لطفاً کپچا را تأیید کنید.");
      } else if (res && res.code === "rate_limited") {
        toast.error("تعداد تلاش‌ها زیاد است. کمی بعد امتحان کنید.");
      } else {
        toast.error("ثبت انجام نشد. لطفاً دوباره امتحان کن.");
      }
      return;
    }
    if (res.already) {
      toast.success("قبلاً عضو شده‌ای — ممنونیم!");
      reset();
      return;
    }
    toast.success("ثبت شد! به‌زودی از ما خبر می‌شنوی.");
    reset();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col w-full max-w-md gap-4 mt-6"
      noValidate
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="newsletter-email"
          className="text-sm font-semibold text-gray-700 text-right"
        >
          آدرس ایمیل شما
        </label>
        <Input
          id="newsletter-email"
          type="email"
          placeholder="example@email.com"
          aria-invalid={!!errors.email}
          {...register("email")}
          className="h-12 text-base"
          dir="ltr"
        />
        {errors.email && (
          <span
            role="alert"
            aria-live="polite"
            className="text-xs text-red-600 text-right"
          >
            {errors.email.message}
          </span>
        )}
      </div>
      <div className="flex justify-center">
        <TurnstileWidget onToken={setCaptchaToken} />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-secondary-enhanced w-full h-12 px-6 rounded-full border-2 border-primary bg-transparent font-semibold text-primary flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        عضویت در خبرنامه
      </button>
      <p className="text-xs text-gray-700 text-center leading-relaxed">
        با عضویت در خبرنامه، شما{" "}
        <a href="#" className="text-primary underline hover:text-primary-700">
          شرایط و قوانین
        </a>{" "}
        و{" "}
        <a href="#" className="text-primary underline hover:text-primary-700">
          حریم خصوصی
        </a>{" "}
        ما را می‌پذیرید.
      </p>
    </form>
  );
}

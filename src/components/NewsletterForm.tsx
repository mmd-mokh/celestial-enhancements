import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
export function NewsletterForm() {
  const [mount, setMount] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let tries = 0;
    const find = () => {
      const el = document.getElementById("newsletter-form");
      if (el && el.parentNode) {
        // Avoid <form> nested in <form> hydration error: replace the ported
        // <form id="newsletter-form"> with a plain <div> mount point.
        const div = document.createElement("div");
        div.id = "newsletter-form-mount";
        div.className = el.className;
        el.parentNode.replaceChild(div, el);
        setMount(div);
        return;
      }
      if (tries++ < 20) setTimeout(find, 100);
    };
    find();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  if (!mount) return null;

  async function onSubmit(_v: Values) {
    // No backend endpoint yet — treat as a success toast, wire to Cloud later.
    await new Promise((r) => setTimeout(r, 500));
    toast.success("ثبت شد! به‌زودی از ما خبر می‌شنوی.");
    reset();
  }

  return createPortal(
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="tw-flex tw-flex-col tw-w-full tw-max-w-md tw-gap-4 tw-mt-6"
      noValidate
    >
      <div className="tw-flex tw-flex-col tw-gap-2">
        <label
          htmlFor="newsletter-email"
          className="tw-text-sm tw-font-semibold tw-text-gray-700 tw-text-right"
        >
          آدرس ایمیل شما
        </label>
        <Input
          id="newsletter-email"
          type="email"
          placeholder="example@email.com"
          aria-invalid={!!errors.email}
          {...register("email")}
          className="tw-h-12 tw-text-base"
          dir="ltr"
        />
        {errors.email && (
          <span role="alert" aria-live="polite" className="tw-text-xs tw-text-red-600 tw-text-right">
            {errors.email.message}
          </span>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-secondary-enhanced tw-w-full tw-h-12 tw-px-6 tw-rounded-full tw-border-2 tw-border-primary tw-bg-transparent tw-font-semibold tw-text-primary tw-flex tw-items-center tw-justify-center tw-gap-2 disabled:tw-opacity-60"
      >
        {isSubmitting && <Loader2 className="tw-h-4 tw-w-4 tw-animate-spin" />}
        عضویت در خبرنامه
      </button>
      <p className="tw-text-xs tw-text-gray-700 tw-text-center tw-leading-relaxed">
        با عضویت در خبرنامه، شما{" "}
        <a href="#" className="tw-text-primary tw-underline hover:tw-text-primary-700">
          شرایط و قوانین
        </a>{" "}
        و{" "}
        <a href="#" className="tw-text-primary tw-underline hover:tw-text-primary-700">
          حریم خصوصی
        </a>{" "}
        ما را می‌پذیرید.
      </p>
    </form>,
    mount,
  );
}
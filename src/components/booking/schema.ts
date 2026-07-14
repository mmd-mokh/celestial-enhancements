import { z } from "zod";

export const bookingFormSchema = z.object({
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

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export function toAsciiDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

export function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
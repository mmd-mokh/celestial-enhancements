import { createFileRoute } from "@tanstack/react-router";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { absUrl } from "@/lib/seo";

const schema = z.object({
  name: z.string().trim().min(1, "نام الزامی است").max(120),
  email: z.string().trim().email("ایمیل معتبر وارد کنید"),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(5, "پیام حداقل ۵ کاراکتر").max(5000),
});
type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تماس با ما | کنسولتو" },
      {
        name: "description",
        content:
          "با تیم پشتیبانی کنسولتو در تماس باشید. سوال، پیشنهاد یا مشکل خود درباره اجاره کنسول را برای ما ارسال کنید.",
      },
      { property: "og:title", content: "تماس با کنسولتو" },
      {
        property: "og:description",
        content: "فرم تماس، شماره پشتیبانی و راه‌های ارتباط با کنسولتو.",
      },
      { property: "og:url", content: absUrl("/contact") },
      { property: "og:type", content: "website" },
      { property: "og:image", content: absUrl("/assets/images/home/dashboard.png") },
      { name: "twitter:image", content: absUrl("/assets/images/home/dashboard.png") },
    ],
    links: [{ rel: "canonical", href: absUrl("/contact") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "خانه", item: absUrl("/") },
            { "@type": "ListItem", position: 2, name: "تماس با ما", item: absUrl("/contact") },
          ],
        }),
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const subjectId = useId();
  const messageId = useId();
  const nameErrId = `${nameId}-err`;
  const emailErrId = `${emailId}-err`;
  const messageErrId = `${messageId}-err`;
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" },
  });

  const onSubmit = async (v: FormValues) => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { error } = await supabase.from("contact_messages").insert({
      name: v.name,
      email: v.email,
      phone: v.phone || null,
      subject: v.subject || null,
      message: v.message,
    });
    if (error) {
      toast.error("ارسال پیام با خطا مواجه شد: " + error.message);
      return;
    }
    setSent(true);
    form.reset();
  };

  return (
    <div dir="rtl" className="min-h-dvh bg-background p-4 md:p-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">تماس با ما</h1>
          <p className="text-muted-foreground">
            سوال یا پیشنهادی دارید؟ خوشحال می‌شویم بشنویم.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>فرم تماس</CardTitle>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-4 text-center py-6">
                <div className="text-5xl">✅</div>
                <h2 className="text-xl font-semibold">پیام شما ارسال شد</h2>
                <p className="text-muted-foreground text-sm">
                  در اسرع وقت با شما در تماس خواهیم بود.
                </p>
                <Button variant="outline" onClick={() => setSent(false)}>
                  ارسال پیام دیگر
                </Button>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label htmlFor={nameId} className="text-sm font-medium">نام و نام خانوادگی *</label>
                    <Input
                      id={nameId}
                      {...form.register("name")}
                      placeholder="مثلا رضا احمدی"
                      aria-invalid={!!form.formState.errors.name}
                      aria-describedby={form.formState.errors.name ? nameErrId : undefined}
                    />
                    {form.formState.errors.name && (
                      <p id={nameErrId} className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label htmlFor={emailId} className="text-sm font-medium">ایمیل *</label>
                    <Input
                      id={emailId}
                      dir="ltr"
                      type="email"
                      {...form.register("email")}
                      placeholder="you@example.com"
                      aria-invalid={!!form.formState.errors.email}
                      aria-describedby={form.formState.errors.email ? emailErrId : undefined}
                    />
                    {form.formState.errors.email && (
                      <p id={emailErrId} className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label htmlFor={phoneId} className="text-sm font-medium">تلفن</label>
                    <Input id={phoneId} dir="ltr" {...form.register("phone")} placeholder="09xxxxxxxxx" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor={subjectId} className="text-sm font-medium">موضوع</label>
                    <Input id={subjectId} {...form.register("subject")} placeholder="موضوع پیام" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor={messageId} className="text-sm font-medium">پیام *</label>
                  <Textarea
                    id={messageId}
                    rows={6}
                    {...form.register("message")}
                    placeholder="پیام خود را اینجا بنویسید…"
                    aria-invalid={!!form.formState.errors.message}
                    aria-describedby={form.formState.errors.message ? messageErrId : undefined}
                  />
                  {form.formState.errors.message && (
                    <p id={messageErrId} className="text-xs text-destructive">{form.formState.errors.message.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "در حال ارسال…" : "ارسال پیام"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster richColors position="top-center" dir="rtl" />
    </div>
  );
}
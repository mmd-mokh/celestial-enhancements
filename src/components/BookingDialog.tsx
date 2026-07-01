import { useState, type FormEvent } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultPackage?: string;
  defaultConsole?: string;
};

const CONSOLES = [
  { value: "ps5", label: "PlayStation 5" },
  { value: "xbox", label: "Xbox Series X" },
  { value: "switch", label: "Nintendo Switch" },
];

const PACKAGES = [
  { value: "daily", label: "روزانه" },
  { value: "weekend", label: "آخر هفته" },
  { value: "weekly", label: "هفتگی" },
  { value: "monthly", label: "ماهانه" },
];

export function BookingDialog({
  open,
  onOpenChange,
  defaultPackage,
  defaultConsole,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consoleType, setConsoleType] = useState(defaultConsole ?? "ps5");
  const [packageType, setPackageType] = useState(defaultPackage ?? "weekend");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("لطفاً نام خود را وارد کنید");
      return;
    }
    if (phone.trim().length < 6) {
      toast.error("لطفاً شماره تماس معتبر وارد کنید");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      name: name.trim(),
      phone: phone.trim(),
      console_type: consoleType,
      package_type: packageType,
      notes: notes.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      console.error(error);
      toast.error("ارسال ناموفق بود. لطفاً دوباره تلاش کنید.");
      return;
    }
    toast.success("درخواست رزرو ثبت شد! به‌زودی با شما تماس می‌گیریم.");
    setName("");
    setPhone("");
    setNotes("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-right">رزرو کنسول</DialogTitle>
          <DialogDescription className="text-right">
            فرم زیر رو پر کن، تیم گیمیو در کمتر از ۳۰ دقیقه باهات تماس می‌گیره.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="booking-name">نام و نام خانوادگی</Label>
            <Input
              id="booking-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً علی رضایی"
              autoComplete="name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking-phone">شماره تماس</Label>
            <Input
              id="booking-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="۰۹۱۲۱۲۳۴۵۶۷"
              inputMode="tel"
              autoComplete="tel"
              required
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>کنسول</Label>
              <Select value={consoleType} onValueChange={setConsoleType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONSOLES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>پکیج</Label>
              <Select value={packageType} onValueChange={setPackageType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PACKAGES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking-notes">توضیحات (اختیاری)</Label>
            <Textarea
              id="booking-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="آدرس تحویل، تاریخ شروع، بازی‌های مورد علاقه..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "در حال ارسال..." : "ثبت درخواست رزرو"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import { motion, AnimatePresence } from "framer-motion";
import type { DateRange } from "react-day-picker";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/_authenticated/my-bookings")({
  head: () => ({ meta: [{ title: "رزروهای من | گیمیو" }, { name: "robots", content: "noindex" }] }),
  component: MyBookingsPage,
});

type Booking = {
  id: string;
  name: string;
  phone: string;
  console_type: string | null;
  package_type: string | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  status: string;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  new: "جدید",
  pending: "در انتظار",
  contacted: "در تماس",
  confirmed: "تایید شده",
  completed: "تکمیل شده",
  cancelled: "لغو شده",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  new: "secondary",
  pending: "secondary",
  contacted: "outline",
  confirmed: "default",
  completed: "default",
  cancelled: "destructive",
};

const CONSOLE_LABEL: Record<string, string> = {
  ps5: "PlayStation 5",
  xbox: "Xbox Series X",
  switch: "Nintendo Switch",
};

function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [rescheduleFor, setRescheduleFor] = useState<Booking | null>(null);
  const [range, setRange] = useState<DateRange | undefined>();
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data: u } = await supabase.auth.getUser();
    setEmail(u.user?.email ?? "");
    const { data, error } = await supabase
      .from("bookings")
      .select("id, name, phone, console_type, package_type, start_date, end_date, notes, status, created_at")
      .order("created_at", { ascending: false });
    if (error) toast.error("خطا در بارگذاری رزروها");
    else setBookings(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  async function confirmCancel() {
    if (!cancelId) return;
    setBusy(true);
    const { error } = await supabase.rpc("cancel_booking", { _booking_id: cancelId });
    setBusy(false);
    if (error) { toast.error("امکان لغو وجود ندارد"); return; }
    toast.success("رزرو لغو شد");
    setCancelId(null);
    load();
  }

  async function submitReschedule() {
    if (!rescheduleFor || !range?.from || !range?.to) { toast.error("تاریخ جدید را انتخاب کنید"); return; }
    setBusy(true);
    const { error } = await supabase.rpc("reschedule_booking", {
      _booking_id: rescheduleFor.id,
      _start_date: range.from.toISOString().slice(0, 10),
      _end_date: range.to.toISOString().slice(0, 10),
    });
    setBusy(false);
    if (error) {
      const msg = error.message.includes("no_availability") ? "ظرفیت این بازه پر است" : "تغییر تاریخ ممکن نشد";
      toast.error(msg); return;
    }
    toast.success("تاریخ رزرو تغییر کرد");
    setRescheduleFor(null); setRange(undefined);
    load();
  }

  function canManage(b: Booking) {
    if (b.status === "cancelled" || b.status === "completed") return false;
    if (b.start_date && b.start_date < new Date().toISOString().slice(0, 10)) return false;
    return true;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background p-6" style={{ fontFamily: "Vazirmatn, sans-serif" }}>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">رزروهای من</h1>
            <p className="text-sm text-muted-foreground mt-1">{email}</p>
          </div>
          <div className="flex gap-2">
            <ThemeToggle />
            <Button asChild variant="outline"><Link to="/">بازگشت به سایت</Link></Button>
            <Button variant="ghost" onClick={signOut}>خروج</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>لیست رزروها ({bookings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">در حال بارگذاری...</p>
            ) : bookings.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <p className="text-muted-foreground">هنوز رزروی ثبت نکرده‌اید.</p>
                <Button asChild><Link to="/pricing">مشاهده پکیج‌ها</Link></Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">کنسول</TableHead>
                      <TableHead className="text-right">پکیج</TableHead>
                      <TableHead className="text-right">بازه رزرو</TableHead>
                      <TableHead className="text-right">وضعیت</TableHead>
                      <TableHead className="text-right">ثبت</TableHead>
                      <TableHead className="text-right">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence initial={false}>
                    {bookings.map((b) => (
                      <motion.tr key={b.id}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="border-b transition-colors hover:bg-muted/50">
                        <TableCell>{CONSOLE_LABEL[b.console_type ?? ""] ?? b.console_type ?? "—"}</TableCell>
                        <TableCell>{b.package_type ?? "—"}</TableCell>
                        <TableCell className="text-sm">
                          {b.start_date && b.end_date ? `${b.start_date} تا ${b.end_date}` : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={STATUS_VARIANT[b.status] ?? "secondary"}>
                            {STATUS_LABEL[b.status] ?? b.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(b.created_at).toLocaleDateString("fa-IR")}
                        </TableCell>
                        <TableCell>
                          {canManage(b) ? (
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => { setRescheduleFor(b); setRange(b.start_date && b.end_date ? { from: new Date(b.start_date), to: new Date(b.end_date) } : undefined); }}>تغییر تاریخ</Button>
                              <Button size="sm" variant="destructive" onClick={() => setCancelId(b.id)}>لغو</Button>
                            </div>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                      </motion.tr>
                    ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!cancelId} onOpenChange={(o) => !o && setCancelId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>لغو رزرو</AlertDialogTitle>
            <AlertDialogDescription>آیا از لغو این رزرو مطمئن هستید؟ این عملیات قابل بازگشت نیست.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction disabled={busy} onClick={confirmCancel}>تایید لغو</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!rescheduleFor} onOpenChange={(o) => { if (!o) { setRescheduleFor(null); setRange(undefined); } }}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle>تغییر تاریخ رزرو</DialogTitle>
            <DialogDescription>بازه‌ی جدید را انتخاب کنید.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Calendar mode="range" selected={range} onSelect={setRange} disabled={{ before: new Date() }} numberOfMonths={1} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRescheduleFor(null)}>انصراف</Button>
            <Button disabled={busy || !range?.from || !range?.to} onClick={submitReschedule}>ذخیره</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
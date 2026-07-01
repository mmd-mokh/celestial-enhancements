import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      setEmail(u.user?.email ?? "");
      const { data, error } = await supabase
        .from("bookings")
        .select("id, name, phone, console_type, package_type, start_date, end_date, notes, status, created_at")
        .order("created_at", { ascending: false });
      if (error) toast.error("خطا در بارگذاری رزروها");
      else setBookings(data ?? []);
      setLoading(false);
    })();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((b) => (
                      <TableRow key={b.id}>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
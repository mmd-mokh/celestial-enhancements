import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "پنل مدیریت | گیمیو" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

type Booking = {
  id: string;
  name: string;
  phone: string;
  console_type: string | null;
  package_type: string | null;
  notes: string | null;
  status: string;
  created_at: string;
};

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
};

const MSG_STATUSES = ["new", "read", "replied"];
const MSG_STATUS_LABEL: Record<string, string> = {
  new: "جدید",
  read: "خوانده شده",
  replied: "پاسخ داده شده",
};

const STATUSES = ["new", "contacted", "confirmed", "completed", "cancelled"];
const STATUS_LABEL: Record<string, string> = {
  new: "جدید",
  contacted: "در تماس",
  confirmed: "تایید شده",
  completed: "تکمیل شده",
  cancelled: "لغو شده",
};

function AdminPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>("");
  const [rows, setRows] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setEmail(u.user.email ?? "");
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id);
      const admin = !!roles?.some((r) => r.role === "admin");
      setIsAdmin(admin);
      if (admin) await load();
      setLoading(false);
    })();
  }, []);

  const load = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return toast.error(error.message);
    setRows((data ?? []) as Booking[]);
    const { data: msgs, error: mErr } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (mErr) return toast.error(mErr.message);
    setMessages((msgs ?? []) as ContactMessage[]);
  };

  const updateMsgStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    setMessages((m) => m.map((x) => (x.id === id ? { ...x, status } : x)));
  };

  const removeMsg = async (id: string) => {
    if (!confirm("حذف این پیام؟")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setMessages((m) => m.filter((x) => x.id !== id));
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    setRows((r) => r.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  const remove = async (id: string) => {
    if (!confirm("حذف این رزرو؟")) return;
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setRows((r) => r.filter((b) => b.id !== id));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const exportCsv = () => {
    if (rows.length === 0) return;
    const headers = ["id", "created_at", "name", "phone", "console_type", "package_type", "status", "notes"];
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => escape((r as Record<string, unknown>)[h])).join(",")),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div dir="rtl" className="min-h-screen flex items-center justify-center">در حال بارگذاری…</div>;
  }

  if (!isAdmin) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader><CardTitle>دسترسی ندارید</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              حساب <span className="font-mono">{email}</span> دسترسی مدیریت ندارد. لطفاً از یک مدیر بخواهید نقش <code>admin</code> را برای شناسه کاربری شما در جدول <code>user_roles</code> اضافه کند.
            </p>
            <Button variant="outline" onClick={signOut}>خروج</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">پنل مدیریت رزروها</h1>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={load}>بروزرسانی</Button>
            <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>خروجی CSV</Button>
            <Button variant="outline" onClick={signOut}>خروج</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {STATUSES.map((s) => (
            <Card key={s}>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">{STATUS_LABEL[s]}</div>
                <div className="text-2xl font-bold">{rows.filter((r) => r.status === s).length}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle>رزروها ({rows.length})</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">تاریخ</TableHead>
                  <TableHead className="text-right">نام</TableHead>
                  <TableHead className="text-right">تلفن</TableHead>
                  <TableHead className="text-right">کنسول</TableHead>
                  <TableHead className="text-right">پکیج</TableHead>
                  <TableHead className="text-right">یادداشت</TableHead>
                  <TableHead className="text-right">وضعیت</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="whitespace-nowrap text-xs">{new Date(b.created_at).toLocaleString("fa-IR")}</TableCell>
                    <TableCell>{b.name}</TableCell>
                    <TableCell dir="ltr" className="font-mono text-xs">{b.phone}</TableCell>
                    <TableCell>{b.console_type ?? "—"}</TableCell>
                    <TableCell>{b.package_type ?? "—"}</TableCell>
                    <TableCell className="max-w-xs truncate">{b.notes ?? "—"}</TableCell>
                    <TableCell>
                      <Select value={b.status} onValueChange={(v) => updateStatus(b.id, v)}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button variant="destructive" size="sm" onClick={() => remove(b.id)}>حذف</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">رزروی ثبت نشده است</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>راهنمای تعیین مدیر</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>برای تبدیل یک کاربر به مدیر، این کوئری را در بک‌اند اجرا کنید:</p>
            <pre dir="ltr" className="bg-muted p-3 rounded text-xs overflow-x-auto">{`INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'you@example.com';`}</pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
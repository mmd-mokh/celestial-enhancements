import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/catalog")({
  head: () => ({ meta: [{ title: "کاتالوگ | گیمیو" }, { name: "robots", content: "noindex" }] }),
  component: CatalogPage,
});

type ConsoleRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  hourly_rate: number | null;
  sort_order: number;
  active: boolean;
  tagline: string | null;
  features: string[];
  icon: string | null;
  accent_from: string | null;
  accent_to: string | null;
};

type PackageRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  duration_hours: number | null;
  price: number;
  features: string[];
  badge: string | null;
  popular: boolean;
  sort_order: number;
  active: boolean;
};

function CatalogPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [consoles, setConsoles] = useState<ConsoleRow[]>([]);
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingConsole, setEditingConsole] = useState<Partial<ConsoleRow> | null>(null);
  const [editingPackage, setEditingPackage] = useState<Partial<PackageRow> | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
      const admin = !!roles?.some((r) => r.role === "admin");
      setIsAdmin(admin);
      if (admin) await load();
      setLoading(false);
    })();
  }, []);

  const load = async () => {
    const [c, p] = await Promise.all([
      supabase.from("consoles").select("*").order("sort_order"),
      supabase.from("packages").select("*").order("sort_order"),
    ]);
    if (c.error) return toast.error(c.error.message);
    if (p.error) return toast.error(p.error.message);
    setConsoles((c.data ?? []) as ConsoleRow[]);
    setConsoles(
      ((c.data ?? []) as any[]).map((r) => ({
        ...r,
        features: Array.isArray(r.features) ? r.features : [],
      })) as ConsoleRow[],
    );
    setPackages(
      ((p.data ?? []) as any[]).map((r) => ({
        ...r,
        features: Array.isArray(r.features) ? r.features : [],
      })),
    );
  };

  const saveConsole = async (row: Partial<ConsoleRow>) => {
    const payload = {
      slug: (row.slug ?? "").trim(),
      name: (row.name ?? "").trim(),
      description: row.description ?? null,
      image_url: row.image_url ?? null,
      hourly_rate: row.hourly_rate ?? null,
      sort_order: row.sort_order ?? 0,
      active: row.active ?? true,
    };
    if (!payload.slug || !payload.name) return toast.error("اسلاگ و نام لازم است");
    const query = row.id
      ? supabase.from("consoles").update(payload).eq("id", row.id)
      : supabase.from("consoles").insert(payload);
    const { error } = await query;
    if (error) return toast.error(error.message);
    toast.success("ذخیره شد");
    setEditingConsole(null);
    await load();
  };

  const savePackage = async (row: Partial<PackageRow>) => {
    const payload = {
      slug: (row.slug ?? "").trim(),
      name: (row.name ?? "").trim(),
      description: row.description ?? null,
      duration_hours: row.duration_hours ?? null,
      price: row.price ?? 0,
      features: row.features ?? [],
      badge: row.badge ?? null,
      popular: row.popular ?? false,
      sort_order: row.sort_order ?? 0,
      active: row.active ?? true,
    };
    if (!payload.slug || !payload.name) return toast.error("اسلاگ و نام لازم است");
    const query = row.id
      ? supabase.from("packages").update(payload).eq("id", row.id)
      : supabase.from("packages").insert(payload);
    const { error } = await query;
    if (error) return toast.error(error.message);
    toast.success("ذخیره شد");
    setEditingPackage(null);
    await load();
  };

  const removeConsole = async (id: string) => {
    if (!confirm("حذف این کنسول؟")) return;
    const { error } = await supabase.from("consoles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setConsoles((r) => r.filter((x) => x.id !== id));
  };

  const removePackage = async (id: string) => {
    if (!confirm("حذف این پکیج؟")) return;
    const { error } = await supabase.from("packages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setPackages((r) => r.filter((x) => x.id !== id));
  };

  if (loading) {
    return <div dir="rtl" className="min-h-screen flex items-center justify-center">در حال بارگذاری…</div>;
  }
  if (!isAdmin) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader><CardTitle>دسترسی ندارید</CardTitle></CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate({ to: "/admin" })}>بازگشت</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">مدیریت کاتالوگ</h1>
            <p className="text-sm text-muted-foreground">کنسول‌ها و پکیج‌های قابل رزرو</p>
          </div>
          <Button asChild variant="outline"><Link to="/admin">بازگشت به پنل</Link></Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>کنسول‌ها ({consoles.length})</CardTitle>
            <Button size="sm" onClick={() => setEditingConsole({ sort_order: consoles.length + 1, active: true })}>افزودن کنسول</Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">ترتیب</TableHead>
                  <TableHead className="text-right">اسلاگ</TableHead>
                  <TableHead className="text-right">نام</TableHead>
                  <TableHead className="text-right">نرخ ساعتی</TableHead>
                  <TableHead className="text-right">فعال</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consoles.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.sort_order}</TableCell>
                    <TableCell dir="ltr" className="font-mono text-xs">{c.slug}</TableCell>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.hourly_rate?.toLocaleString("fa-IR") ?? "—"}</TableCell>
                    <TableCell>{c.active ? "✓" : "—"}</TableCell>
                    <TableCell className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => setEditingConsole(c)}>ویرایش</Button>
                      <Button size="sm" variant="destructive" onClick={() => removeConsole(c.id)}>حذف</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>پکیج‌ها ({packages.length})</CardTitle>
            <Button size="sm" onClick={() => setEditingPackage({ sort_order: packages.length + 1, active: true, features: [] })}>افزودن پکیج</Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">ترتیب</TableHead>
                  <TableHead className="text-right">اسلاگ</TableHead>
                  <TableHead className="text-right">نام</TableHead>
                  <TableHead className="text-right">ساعت</TableHead>
                  <TableHead className="text-right">قیمت</TableHead>
                  <TableHead className="text-right">محبوب</TableHead>
                  <TableHead className="text-right">فعال</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.sort_order}</TableCell>
                    <TableCell dir="ltr" className="font-mono text-xs">{p.slug}</TableCell>
                    <TableCell>{p.name}{p.badge && <span className="mr-2 text-xs text-primary">({p.badge})</span>}</TableCell>
                    <TableCell>{p.duration_hours ?? "—"}</TableCell>
                    <TableCell>{Number(p.price).toLocaleString("fa-IR")}</TableCell>
                    <TableCell>{p.popular ? "★" : "—"}</TableCell>
                    <TableCell>{p.active ? "✓" : "—"}</TableCell>
                    <TableCell className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => setEditingPackage(p)}>ویرایش</Button>
                      <Button size="sm" variant="destructive" onClick={() => removePackage(p.id)}>حذف</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Console editor */}
      <Dialog open={!!editingConsole} onOpenChange={(o) => !o && setEditingConsole(null)}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>{editingConsole?.id ? "ویرایش کنسول" : "کنسول جدید"}</DialogTitle></DialogHeader>
          {editingConsole && (
            <div className="space-y-3">
              <div><Label>اسلاگ (انگلیسی)</Label><Input dir="ltr" value={editingConsole.slug ?? ""} onChange={(e) => setEditingConsole({ ...editingConsole, slug: e.target.value })} /></div>
              <div><Label>نام</Label><Input value={editingConsole.name ?? ""} onChange={(e) => setEditingConsole({ ...editingConsole, name: e.target.value })} /></div>
              <div><Label>توضیحات</Label><Textarea rows={2} value={editingConsole.description ?? ""} onChange={(e) => setEditingConsole({ ...editingConsole, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>نرخ ساعتی (تومان)</Label><Input type="number" value={editingConsole.hourly_rate ?? ""} onChange={(e) => setEditingConsole({ ...editingConsole, hourly_rate: e.target.value ? Number(e.target.value) : null })} /></div>
                <div><Label>ترتیب</Label><Input type="number" value={editingConsole.sort_order ?? 0} onChange={(e) => setEditingConsole({ ...editingConsole, sort_order: Number(e.target.value) })} /></div>
              </div>
              <div><Label>لینک تصویر</Label><Input dir="ltr" value={editingConsole.image_url ?? ""} onChange={(e) => setEditingConsole({ ...editingConsole, image_url: e.target.value })} /></div>
              <div className="flex items-center gap-2"><Switch checked={editingConsole.active ?? true} onCheckedChange={(v) => setEditingConsole({ ...editingConsole, active: v })} /><Label>فعال</Label></div>
            </div>
          )}
          <DialogFooter className="flex-row-reverse gap-2">
            <Button onClick={() => editingConsole && saveConsole(editingConsole)}>ذخیره</Button>
            <Button variant="outline" onClick={() => setEditingConsole(null)}>انصراف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Package editor */}
      <Dialog open={!!editingPackage} onOpenChange={(o) => !o && setEditingPackage(null)}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader><DialogTitle>{editingPackage?.id ? "ویرایش پکیج" : "پکیج جدید"}</DialogTitle></DialogHeader>
          {editingPackage && (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto">
              <div><Label>اسلاگ (انگلیسی)</Label><Input dir="ltr" value={editingPackage.slug ?? ""} onChange={(e) => setEditingPackage({ ...editingPackage, slug: e.target.value })} /></div>
              <div><Label>نام</Label><Input value={editingPackage.name ?? ""} onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })} /></div>
              <div><Label>توضیحات</Label><Textarea rows={2} value={editingPackage.description ?? ""} onChange={(e) => setEditingPackage({ ...editingPackage, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>مدت (ساعت)</Label><Input type="number" step="0.5" value={editingPackage.duration_hours ?? ""} onChange={(e) => setEditingPackage({ ...editingPackage, duration_hours: e.target.value ? Number(e.target.value) : null })} /></div>
                <div><Label>قیمت (تومان)</Label><Input type="number" value={editingPackage.price ?? 0} onChange={(e) => setEditingPackage({ ...editingPackage, price: Number(e.target.value) })} /></div>
              </div>
              <div><Label>ویژگی‌ها (هر خط یک مورد)</Label><Textarea rows={4} value={(editingPackage.features ?? []).join("\n")} onChange={(e) => setEditingPackage({ ...editingPackage, features: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>نشان (badge)</Label><Input value={editingPackage.badge ?? ""} onChange={(e) => setEditingPackage({ ...editingPackage, badge: e.target.value })} /></div>
                <div><Label>ترتیب</Label><Input type="number" value={editingPackage.sort_order ?? 0} onChange={(e) => setEditingPackage({ ...editingPackage, sort_order: Number(e.target.value) })} /></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"><Switch checked={editingPackage.popular ?? false} onCheckedChange={(v) => setEditingPackage({ ...editingPackage, popular: v })} /><Label>محبوب</Label></div>
                <div className="flex items-center gap-2"><Switch checked={editingPackage.active ?? true} onCheckedChange={(v) => setEditingPackage({ ...editingPackage, active: v })} /><Label>فعال</Label></div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-row-reverse gap-2">
            <Button onClick={() => editingPackage && savePackage(editingPackage)}>ذخیره</Button>
            <Button variant="outline" onClick={() => setEditingPackage(null)}>انصراف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
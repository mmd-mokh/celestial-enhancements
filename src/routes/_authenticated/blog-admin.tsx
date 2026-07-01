import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/blog-admin")({
  head: () => ({ meta: [{ title: "مدیریت بلاگ | گیمیو" }, { name: "robots", content: "noindex" }] }),
  component: BlogAdmin,
});

type Post = {
  id: string; slug: string; title: string; excerpt: string | null;
  cover_url: string | null; content: string; tags: string[] | null;
  published: boolean; published_at: string | null;
};

const EMPTY: Post = { id: "", slug: "", title: "", excerpt: "", cover_url: "", content: "", tags: [], published: false, published_at: null };

function BlogAdmin() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setPosts((data ?? []) as Post[]);
  }
  useEffect(() => { load(); }, []);

  function startNew() { setEditing({ ...EMPTY }); setTagsInput(""); }
  function edit(p: Post) { setEditing({ ...p, excerpt: p.excerpt ?? "", cover_url: p.cover_url ?? "" }); setTagsInput((p.tags ?? []).join(", ")); }

  async function save() {
    if (!editing) return;
    if (!editing.slug || !editing.title) { toast.error("عنوان و شناسه الزامی است"); return; }
    setBusy(true);
    const payload = {
      slug: editing.slug.trim(),
      title: editing.title.trim(),
      excerpt: editing.excerpt || null,
      cover_url: editing.cover_url || null,
      content: editing.content,
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      published: editing.published,
      published_at: editing.published && !editing.published_at ? new Date().toISOString() : editing.published_at,
    };
    const q = editing.id
      ? supabase.from("posts").update(payload).eq("id", editing.id)
      : supabase.from("posts").insert(payload);
    const { error } = await q;
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("ذخیره شد");
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("این مطلب حذف شود؟")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  return (
    <div dir="rtl" className="min-h-dvh bg-background p-6" style={{ fontFamily: "Vazirmatn, sans-serif" }}>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">مدیریت بلاگ</h1>
          <div className="flex gap-2">
            <Button onClick={startNew}>+ مطلب جدید</Button>
            <Button asChild variant="outline"><Link to="/admin">پنل مدیریت</Link></Button>
          </div>
        </div>

        {editing && (
          <Card>
            <CardHeader><CardTitle>{editing.id ? "ویرایش مطلب" : "مطلب جدید"}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><Label>عنوان</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><Label>شناسه URL (slug)</Label><Input dir="ltr" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="my-post-slug" /></div>
              <div><Label>خلاصه</Label><Textarea rows={2} value={editing.excerpt ?? ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} /></div>
              <div><Label>لینک تصویر کاور</Label><Input dir="ltr" value={editing.cover_url ?? ""} onChange={(e) => setEditing({ ...editing, cover_url: e.target.value })} placeholder="https://…" /></div>
              <div><Label>برچسب‌ها (با کاما جدا کنید)</Label><Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="PS5, راهنما" /></div>
              <div><Label>متن مطلب</Label><Textarea rows={12} value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} placeholder="می‌توانید از خطوط خالی برای پاراگراف جدید استفاده کنید." /></div>
              <div className="flex items-center gap-2"><Switch checked={editing.published} onCheckedChange={(v) => setEditing({ ...editing, published: v })} /><Label>منتشر شود</Label></div>
              <div className="flex gap-2">
                <Button onClick={save} disabled={busy}>ذخیره</Button>
                <Button variant="ghost" onClick={() => setEditing(null)}>انصراف</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>مطالب ({posts.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {posts.length === 0 && <p className="text-muted-foreground text-sm">مطلبی وجود ندارد.</p>}
            {posts.map((p) => (
              <div key={p.id} className="flex items-center justify-between border rounded-md p-3">
                <div>
                  <div className="font-medium">{p.title} {p.published ? <span className="text-xs text-green-600">(منتشر شده)</span> : <span className="text-xs text-muted-foreground">(پیش‌نویس)</span>}</div>
                  <div className="text-xs text-muted-foreground" dir="ltr">/blog/{p.slug}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => edit(p)}>ویرایش</Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(p.id)}>حذف</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
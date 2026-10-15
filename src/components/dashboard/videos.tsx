"use client";

import { useState, useRef, type DragEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Plus, Trash2, Pencil, Video, Star, Eye, EyeOff, Upload,
  Youtube, Link2, X, Film, Check, Cloud, FileVideo
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { apiGet, apiPost, apiPatch, apiDelete, formatDate } from "@/lib/api";
import { toast } from "sonner";
import { FileUpload } from "@/components/shared/file-upload";

const CATEGORIES = [
  { value: "promo", label: "ترويجي" },
  { value: "logistics", label: "لوجستيات" },
  { value: "tutorial", label: "شرح" },
  { value: "testimonial", label: "رأي عميل" },
  { value: "other", label: "أخرى" },
];

const TEMPLATE_VIDEOS = [
  { title: "Redline — رحلة شحنة", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", description: "وثائقي قصير يوثّق رحلة شحنة من المخزن حتى باب العميل", category: "promo" },
  { title: "شبكة الفروع في 27 محافظة", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", description: "جولة في فروع ومستودعات Redline عبر كل محافظات مصر", category: "logistics" },
];

export function DashboardVideos() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState<any>({
    title: "", description: "", url: "", thumbnail: "",
    category: "promo", featured: false, active: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["videos-admin"],
    queryFn: () => apiGet<any>("/api/videos?all=1"),
  });
  const videos = data?.videos ?? [];

  const thumbOptions = [
    "/images/hero-truck.png", "/images/warehouse.png", "/images/operations.png",
    "/images/courier.png", "/images/fleet.png",
  ];

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "", url: "", thumbnail: thumbOptions[0],
      category: "promo", featured: false, active: true });
    setModalOpen(true);
  };

  const openEdit = (v: any) => {
    setEditing(v);
    setForm({ ...v });
    setModalOpen(true);
  };

  const normalizeUrl = (url: string) => {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
    const ytShorts = url.match(/youtube\.com\/shorts\/([\w-]+)/);
    if (ytShorts) return `https://www.youtube.com/embed/${ytShorts[1]}`;
    return url;
  };

  const save = async () => {
    if (!form.title || !form.url) { toast.error("العنوان والرابط مطلوبان"); return; }
    setSaving(true);
    try {
      const payload = { ...form, url: normalizeUrl(form.url) };
      if (editing) {
        await apiPatch(`/api/videos/${editing.id}`, payload);
        toast.success("تم تحديث الفيديو");
      } else {
        await apiPost("/api/videos", payload);
        toast.success("تم رفع الفيديو");
      }
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: ["videos-admin"] });
      qc.invalidateQueries({ queryKey: ["site-videos"] });
      qc.invalidateQueries({ queryKey: ["site-stats"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch (e: any) {
      toast.error(e.message || "خطأ");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("حذف هذا الفيديو؟")) return;
    try {
      await apiDelete(`/api/videos/${id}`);
      toast.success("تم الحذف");
      qc.invalidateQueries({ queryKey: ["videos-admin"] });
      qc.invalidateQueries({ queryKey: ["site-videos"] });
    } catch (e: any) { toast.error(e.message); }
  };

  const toggleFeatured = async (v: any) => {
    try {
      await apiPatch(`/api/videos/${v.id}`, { featured: !v.featured });
      toast.success(!v.featured ? "تم التمييز كفيديو مميز" : "تم إلغاء التمييز");
      qc.invalidateQueries({ queryKey: ["videos-admin"] });
      qc.invalidateQueries({ queryKey: ["site-videos"] });
    } catch (e: any) { toast.error(e.message); }
  };

  const toggleActive = async (v: any) => {
    try {
      await apiPatch(`/api/videos/${v.id}`, { active: !v.active });
      qc.invalidateQueries({ queryKey: ["videos-admin"] });
      qc.invalidateQueries({ queryKey: ["site-videos"] });
    } catch (e: any) { toast.error(e.message); }
  };

  // Drag-drop handling: we accept a text/URL drop into the URL field
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const text = e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("text/uri-list") || "";
    const url = text.trim();
    if (url) {
      setForm((f: any) => ({ ...f, url, title: f.title || "فيديو جديد" }));
      toast.success("تم إضافة الرابط — أكمل البيانات وارفع");
    } else {
      toast.error("اسحب رابط فيديو صحيح");
    }
  };

  const applyTemplate = (t: typeof TEMPLATE_VIDEOS[0]) => {
    setForm({ title: t.title, description: t.description, url: t.url, thumbnail: thumbOptions[Math.floor(Math.random() * thumbOptions.length)], category: t.category, featured: false, active: true });
    setEditing(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Header card */}
      <Card className="p-5 bg-gradient-to-l from-primary/10 to-red-700/5 border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-lg shadow-primary/25">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">قسم رفع الفيديوهات</h3>
              <p className="text-sm text-muted-foreground">ارفع وأدر الفيديوهات التي تظهر في معرض الموقع</p>
            </div>
          </div>
          <Button onClick={openCreate} className="bg-gradient-to-r from-primary to-red-700 text-white gap-2 shrink-0">
            <Upload className="w-4 h-4" /> رفع فيديو جديد
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { v: videos.length, l: "إجمالي الفيديوهات", c: "text-gradient-red" },
          { v: videos.filter((v: any) => v.active).length, l: "منشورة", c: "text-emerald-600" },
          { v: videos.filter((v: any) => v.featured).length, l: "مميزة", c: "text-amber-600" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="p-4 text-center">
              <div className={`text-2xl font-black ${s.c} tabular-nums`}>{s.v}</div>
              <div className="text-xs text-muted-foreground">{s.l}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Drag-drop hint when empty */}
      {videos.length === 0 && !isLoading && (
        <Card
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`p-12 border-2 border-dashed text-center transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border"}`}
        >
          <Cloud className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="font-bold">اسحب رابط فيديو هنا لرفعه</p>
          <p className="text-sm text-muted-foreground mt-1">أو استخدم زر "رفع فيديو جديد"</p>
        </Card>
      )}

      {/* Videos grid */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : videos.length === 0 ? null : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v: any) => (
            <motion.div
              key={v.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ y: -4 }}
            >
              <Card className={`overflow-hidden hover:shadow-xl transition-all ${v.featured ? "ring-2 ring-amber-400" : ""}`}>
                <div className="relative aspect-video bg-muted group cursor-pointer" onClick={() => openEdit(v)}>
                  {v.thumbnail ? (
                    <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Film className="w-10 h-10 text-muted-foreground/40" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                      <Pencil className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  {v.featured && (
                    <Badge className="absolute top-2 right-2 bg-amber-500 text-white gap-1">
                      <Star className="w-3 h-3 fill-white" /> مميز
                    </Badge>
                  )}
                  {!v.active && (
                    <Badge className="absolute top-2 left-2 bg-zinc-800 text-white gap-1">
                      <EyeOff className="w-3 h-3" /> مخفي
                    </Badge>
                  )}
                  <div className="absolute bottom-2 right-2">
                    <span className="px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold backdrop-blur-sm">
                      {CATEGORIES.find((c) => c.value === v.category)?.label || v.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-sm line-clamp-1">{v.title}</h4>
                  {v.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{v.description}</p>}
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Link2 className="w-3 h-3" /> {formatDate(v.createdAt)}</span>
                    <span className="flex items-center gap-1 truncate max-w-[140px]" dir="ltr">
                      <Youtube className="w-3 h-3" /> {v.url.replace("https://www.youtube.com/embed/", "yt/")}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-1.5">
                    <Button variant="outline" size="sm" className="h-8 flex-1 gap-1" onClick={() => openEdit(v)}>
                      <Pencil className="w-3.5 h-3.5" /> تعديل
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => toggleFeatured(v)} title="تمييز">
                      <Star className={`w-3.5 h-3.5 ${v.featured ? "fill-amber-400 text-amber-500" : ""}`} />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => toggleActive(v)} title="إظهار/إخفاء">
                      {v.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-rose-600 hover:text-rose-700" onClick={() => remove(v.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              {editing ? "تعديل الفيديو" : "رفع فيديو جديد"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Drag-drop URL field */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`space-y-1 rounded-xl border-2 border-dashed p-3 transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <Label className="text-xs flex items-center gap-1.5">
                <FileVideo className="w-3.5 h-3.5 text-primary" /> رابط الفيديو (YouTube/Vimeo) * — اسحب الرابط هنا
              </Label>
              <div className="relative">
                <Youtube className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="h-10 pr-9"
                  dir="ltr"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">يتم تحويل روابط YouTube (watch/youtu.be/shorts/embed) تلقائياً للصيغة المضمنة</p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">عنوان الفيديو *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="مثال: Redline — قصة شحن" className="h-10" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">الوصف</Label>
              <Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="وصف مختصر للفيديو..." />
            </div>

            <FileUpload
              label="صورة الغلاف (Thumbnail) — ارفع من جهازك"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              currentUrl={form.thumbnail}
              onUploaded={(url) => setForm({ ...form, thumbnail: url })}
              type="image"
            />

            <div className="space-y-2">
              <Label className="text-xs">أو اختر صورة من المعرض:</Label>
              <div className="grid grid-cols-5 gap-2">
                {thumbOptions.map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm({ ...form, thumbnail: t })}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${form.thumbnail === t ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-border"}`}
                  >
                    <img src={t} alt={t} className="w-full h-full object-cover" />
                    {form.thumbnail === t && (
                      <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <Input
                value={form.thumbnail || ""}
                onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                placeholder="رابط صورة مخصص (اختياري)"
                className="h-9 text-xs"
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">التصنيف</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-4 pb-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Switch checked={!!form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" /> مميز</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Switch checked={!!form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                  <span>منشور</span>
                </label>
              </div>
            </div>

            {/* Quick templates */}
            {!editing && (
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Plus className="w-3.5 h-3.5 text-primary" /> قوالب جاهزة:</p>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_VIDEOS.map((t, i) => (
                    <button key={i} onClick={() => applyTemplate(t)} className="px-3 py-1.5 text-xs rounded-lg border border-border bg-card hover:border-primary/40 hover:text-primary transition-colors text-right">
                      {t.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Preview */}
            {form.url && (
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="aspect-video bg-muted">
                  <iframe src={normalizeUrl(form.url)} className="w-full h-full" title="preview" />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button onClick={save} disabled={saving} className="flex-1 bg-gradient-to-r from-primary to-red-700 text-white gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {editing ? "حفظ التعديلات" : "رفع الفيديو"}
              </Button>
              <Button variant="outline" onClick={() => setModalOpen(false)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

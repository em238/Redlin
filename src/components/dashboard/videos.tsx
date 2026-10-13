"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Plus, Trash2, Pencil, Video, Star, Eye, EyeOff, Upload,
  Youtube, Link2, X, Film, Check
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

const CATEGORIES = [
  { value: "promo", label: "ترويجي" },
  { value: "logistics", label: "لوجستيات" },
  { value: "tutorial", label: "شرح" },
  { value: "testimonial", label: "رأي عميل" },
  { value: "other", label: "أخرى" },
];

export function DashboardVideos() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    title: "", description: "", url: "", thumbnail: "",
    category: "promo", featured: false, active: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["videos-admin"],
    queryFn: () => apiGet<any>("/api/videos?all=1"),
  });
  const videos = data?.videos ?? [];

  // thumbnail suggestions
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

  // Convert various video URLs to embeddable form
  const normalizeUrl = (url: string) => {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
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

  return (
    <div className="space-y-5">
      {/* Header card */}
      <Card className="p-5 bg-gradient-to-l from-primary/10 to-red-700/5 border-primary/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-lg shadow-primary/25">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">قسم رفع الفيديوهات</h3>
              <p className="text-sm text-muted-foreground">ارفع وأدر الفيديوهات التي تظهر في معرض الموقع</p>
            </div>
          </div>
          <Button onClick={openCreate} className="bg-gradient-to-r from-primary to-red-700 text-white gap-2">
            <Upload className="w-4 h-4" /> رفع فيديو جديد
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-black text-gradient-red">{videos.length}</div>
          <div className="text-xs text-muted-foreground">إجمالي الفيديوهات</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-black text-emerald-600">{videos.filter((v: any) => v.active).length}</div>
          <div className="text-xs text-muted-foreground">منشورة</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-black text-amber-600">{videos.filter((v: any) => v.featured).length}</div>
          <div className="text-xs text-muted-foreground">مميزة</div>
        </Card>
      </div>

      {/* Videos grid */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : videos.length === 0 ? (
        <Card className="flex flex-col items-center py-16 text-muted-foreground">
          <Film className="w-12 h-12 mb-3 opacity-40" />
          <p>لا توجد فيديوهات بعد — ابدأ برفع أول فيديو</p>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v: any) => (
            <motion.div
              key={v.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className={`overflow-hidden hover:shadow-xl transition-all ${v.featured ? "ring-2 ring-amber-400" : ""}`}>
                <div className="relative aspect-video bg-muted">
                  {v.thumbnail ? (
                    <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Film className="w-10 h-10 text-muted-foreground/40" /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
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
                  <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
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
                      <Youtube className="w-3 h-3" /> {v.url.replace("https://www.youtube.com/embed/", "youtube/")}
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
            <div className="space-y-1">
              <Label className="text-xs">عنوان الفيديو *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="مثال: Redline — قصة شحن" className="h-10" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">رابط الفيديو (YouTube/Vimeo) *</Label>
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
              <p className="text-[11px] text-muted-foreground">يتم تحويل روابط YouTube تلقائياً للصيغة المضمنة</p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">الوصف</Label>
              <Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="وصف مختصر للفيديو..." />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">صورة الغلاف (Thumbnail)</Label>
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
              <p className="text-[11px] text-muted-foreground">اختر صورة من المعرض أو أدخل رابط صورة مخصص</p>
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

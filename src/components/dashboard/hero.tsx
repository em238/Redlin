"use client";

import { useState, useEffect, type DragEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Plus, Trash2, ImageIcon, Upload, Eye, EyeOff,
  Check, MoveUp, MoveDown, Pencil, Save, Type,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { toast } from "sonner";
import { FileUpload } from "@/components/shared/file-upload";
import { useDashboardT } from "@/lib/i18n";

const IMAGE_OPTIONS = [
  "/images/hero-truck.png", "/images/fleet.png", "/images/warehouse.png",
  "/images/operations.png", "/images/courier.png",
  "/images/partner-1.png", "/images/partner-2.png", "/images/partner-3.png",
];

type HeroImage = {
  id: string;
  url: string;
  title?: string | null;
  titleAr?: string;
  titleEn?: string;
  order: number;
  active: boolean;
  createdAt: string;
};

const emptyForm = { url: "", title: "", titleAr: "", titleEn: "", order: 0, active: true };

export function DashboardHero() {
  const { isAr } = useDashboardT();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HeroImage | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState<any>({ ...emptyForm });

  const L = (ar: string, en: string) => (isAr ? ar : en);

  const { data, isLoading } = useQuery({
    queryKey: ["hero-images-admin"],
    queryFn: () => apiGet<{ images: HeroImage[] }>("/api/hero-images?all=1"),
  });
  const images = data?.images ?? [];

  const sortedImages = [...images].sort((a, b) => a.order - b.order);

  const openCreate = () => {
    setEditing(null);
    setForm({ url: "", title: "", titleAr: "", titleEn: "", order: images.length, active: true });
    setModalOpen(true);
  };

  const openChange = (img: HeroImage) => {
    setEditing(img);
    setForm({
      url: img.url,
      title: img.title || "",
      titleAr: img.titleAr || "",
      titleEn: img.titleEn || "",
      order: img.order,
      active: img.active,
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.url) { toast.error(L("الرابط مطلوب", "URL is required")); return; }
    setSaving(true);
    try {
      if (editing) {
        await apiPatch(`/api/hero-images/${editing.id}`, {
          url: form.url,
          title: form.title || null,
          titleAr: form.titleAr || "",
          titleEn: form.titleEn || "",
          order: form.order,
          active: form.active,
        });
        toast.success(L("تم تحديث الصورة", "Image updated"));
      } else {
        await apiPost("/api/hero-images", {
          url: form.url,
          title: form.title || null,
          titleAr: form.titleAr || "",
          titleEn: form.titleEn || "",
          order: form.order,
          active: form.active,
        });
        toast.success(L("تمت إضافة الصورة", "Image added"));
      }
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: ["hero-images-admin"] });
      qc.invalidateQueries({ queryKey: ["hero-images"] });
      qc.invalidateQueries({ queryKey: ["site-data"] });
    } catch (e: any) {
      toast.error(e.message || L("خطأ", "Error"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm(L("حذف هذه الصورة من الهيدر؟", "Delete this hero image?"))) return;
    try {
      await apiDelete(`/api/hero-images/${id}`);
      toast.success(L("تم الحذف", "Deleted"));
      qc.invalidateQueries({ queryKey: ["hero-images-admin"] });
      qc.invalidateQueries({ queryKey: ["hero-images"] });
      qc.invalidateQueries({ queryKey: ["site-data"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const toggleActive = async (img: HeroImage) => {
    try {
      await apiPatch(`/api/hero-images/${img.id}`, { active: !img.active });
      qc.invalidateQueries({ queryKey: ["hero-images-admin"] });
      qc.invalidateQueries({ queryKey: ["hero-images"] });
      qc.invalidateQueries({ queryKey: ["site-data"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const reorder = async (img: HeroImage, direction: "up" | "down") => {
    const idx = sortedImages.findIndex((s) => s.id === img.id);
    if (idx === -1) return;
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === sortedImages.length - 1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const swap = sortedImages[swapIdx];
    try {
      await Promise.all([
        apiPatch(`/api/hero-images/${img.id}`, { order: swap.order }),
        apiPatch(`/api/hero-images/${swap.id}`, { order: img.order }),
      ]);
      qc.invalidateQueries({ queryKey: ["hero-images-admin"] });
      qc.invalidateQueries({ queryKey: ["hero-images"] });
      toast.success(L("تم إعادة الترتيب", "Reordered"));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const text = e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("text/uri-list") || "";
    const url = text.trim();
    if (url) {
      setForm((f: any) => ({ ...f, url }));
      toast.success(L("تم إضافة الرابط", "URL added"));
    }
  };

  // Extract filename from a URL for the per-card "filename" display
  const filenameFromUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) {
      try {
        const u = new URL(url);
        const parts = u.pathname.split("/").filter(Boolean);
        return parts[parts.length - 1] || url;
      } catch {
        return url;
      }
    }
    const parts = url.split("/").filter(Boolean);
    return parts[parts.length - 1] || url;
  };

  return (
    <div className="space-y-5">
      {/* Section Context Banner */}
      <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 mb-4">
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          📍 {L("مكان الظهور: ", "Appears at: ")}{L("أول شاشة يراها الزائر (الصور الدوارة + شريط المزايا)", "First screen visitors see (carousel + features ticker)")}
        </span>
        <a href="/#home" target="_blank" className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1">
          {L("عرض في الموقع", "Preview on Site")} ↗
        </a>
      </div>

      {/* === Hero Text & CTA Settings === */}
      <HeroTextSettings />

      {/* Header */}
      <Card className="p-5 bg-gradient-to-l from-primary/10 to-red-700/5 border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-lg shadow-primary/25">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{L("صور الهيدر (Carousel)", "Hero Images (Carousel)")}</h3>
              <p className="text-sm text-muted-foreground">
                {L("الصور الظاهرة في الـ slider بأعلى الموقع — تتبدّل تلقائياً", "Images shown in the slider at the top of the site — they rotate automatically")}
              </p>
            </div>
          </div>
          <Button onClick={openCreate} className="bg-gradient-to-r from-primary to-red-700 text-white gap-2 shrink-0">
            <Plus className="w-4 h-4" /> {L("إضافة صورة", "Add image")}
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { v: images.length, l: L("إجمالي الصور", "Total images"), c: "text-gradient-red" },
          { v: images.filter((i) => i.active).length, l: L("منشورة", "Published"), c: "text-emerald-600" },
          { v: images.filter((i) => !i.active).length, l: L("مخفية", "Hidden"), c: "text-zinc-500" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="p-4 text-center">
              <div className={`text-2xl font-black ${s.c} tabular-nums`}>{s.v}</div>
              <div className="text-xs text-muted-foreground">{s.l}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {images.length === 0 && !isLoading && (
        <Card className="p-12 border-2 border-dashed text-center border-border">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="font-bold">{L("لا توجد صور في الهيدر بعد", "No hero images yet")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {L("اضغط \"إضافة صورة\" لبدء بناء الـ carousel", "Click \"Add image\" to start building the carousel")}
          </p>
        </Card>
      )}

      {/* Images grid */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {sortedImages.map((img, i) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -4 }}
              >
                <Card className={`overflow-hidden hover:shadow-xl transition-all ${!img.active ? "opacity-60" : ""}`}>
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-muted group">
                    <img src={img.url} alt={img.title || "hero"} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded bg-black/60 text-white text-xs font-bold backdrop-blur-sm">
                        #{i + 1}
                      </span>
                      {i === 0 && (
                        <span className="px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold">
                          {L("الأولى", "First")}
                        </span>
                      )}
                    </div>
                    {!img.active && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-zinc-800 text-white text-[10px] font-bold flex items-center gap-1">
                        <EyeOff className="w-3 h-3" /> {L("مخفي", "Hidden")}
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    {/* Titles — show both AR + EN if present, fallback to legacy title */}
                    <div className="space-y-1">
                      {(img.titleAr || img.titleEn) ? (
                        <>
                          {img.titleAr && (
                            <div className="font-bold text-sm truncate flex items-center gap-1.5" dir="rtl">
                              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold shrink-0">AR</span>
                              <span className="truncate">{img.titleAr}</span>
                            </div>
                          )}
                          {img.titleEn && (
                            <div className="font-bold text-sm truncate flex items-center gap-1.5" dir="ltr">
                              <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold shrink-0">EN</span>
                              <span className="truncate">{img.titleEn}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="font-bold text-sm truncate">
                          {img.title || L("بدون عنوان", "Untitled")}
                        </div>
                      )}
                    </div>
                    {/* Filename */}
                    <div className="text-xs text-muted-foreground font-mono truncate" dir="ltr" title={img.url}>
                      {filenameFromUrl(img.url)}
                    </div>

                    {/* Buttons */}
                    <div className="pt-1 flex gap-1.5 flex-wrap">
                      <Button variant="outline" size="icon" className="h-8 w-8" disabled={i === 0}
                        onClick={() => reorder(img, "up")} title={L("تحريك لأعلى", "Move up")}>
                        <MoveUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8" disabled={i === sortedImages.length - 1}
                        onClick={() => reorder(img, "down")} title={L("تحريك لأسفل", "Move down")}>
                        <MoveDown className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => toggleActive(img)}
                        title={L("إظهار/إخفاء", "Show/Hide")}>
                        {img.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 flex-1 gap-1" onClick={() => openChange(img)}>
                        <Pencil className="w-3.5 h-3.5" /> {L("تعديل", "Change")}
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-rose-600 hover:text-rose-700"
                        onClick={() => remove(img.id)} title={L("حذف", "Remove")}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              {editing ? L("تعديل صورة الهيدر", "Edit hero image") : L("إضافة صورة للهيدر", "Add hero image")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Drag-drop URL */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`space-y-1 rounded-xl border-2 border-dashed p-3 transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <Label className="text-xs flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-primary" />
                {L("رابط الصورة — اسحب رابط صورة هنا", "Image URL — drag an image URL here")}
              </Label>
              <Input
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="/images/hero-truck.png أو https://..."
                className="h-10"
                dir="ltr"
              />
            </div>

            {/* Preview */}
            {form.url && (
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="relative aspect-video bg-muted">
                  <img src={form.url} alt="preview" className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }} />
                </div>
              </div>
            )}

            {/* Upload from desktop */}
            <FileUpload
              label={L("ارفع صورة من جهازك", "Upload an image from your device")}
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              currentUrl={form.url}
              onUploaded={(url) => setForm({ ...form, url })}
              type="image"
            />

            {/* Quick select from existing images */}
            <div className="space-y-2">
              <Label className="text-xs">{L("أو اختر صورة من المعرض:", "Or pick an image from the gallery:")}</Label>
              <div className="grid grid-cols-4 gap-2">
                {IMAGE_OPTIONS.map((url) => (
                  <button
                    key={url}
                    onClick={() => setForm({ ...form, url })}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${form.url === url ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-border"}`}
                  >
                    <img src={url} alt={url} className="w-full h-full object-cover" />
                    {form.url === url && (
                      <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Bilingual titles AR | EN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">AR</span>
                  {L("العنوان (عربي)", "Title (Arabic)")}
                </Label>
                <Input
                  value={form.titleAr || ""}
                  onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                  placeholder={L("مثال: شاحنة Redline على الطريق السريع", "Example: Redline truck on the highway")}
                  dir="rtl"
                  className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold">EN</span>
                  {L("العنوان (إنجليزي)", "Title (English)")}
                </Label>
                <Input
                  value={form.titleEn || ""}
                  onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                  placeholder="Redline truck on the highway"
                  dir="ltr"
                  className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>

            {/* Legacy title (kept for backward compat / fallback) */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                {L("عنوان قديم (احتياطي)", "Legacy title (fallback)")}
              </Label>
              <Input
                value={form.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={L("يُستخدم فقط إذا كانت الحقول الثنائية فارغة", "Used only if bilingual fields are empty")}
                className="h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{L("الترتيب", "Order")}</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  className="h-10"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Switch checked={!!form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                  <span>{L("منشورة", "Published")}</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={save} disabled={saving} className="flex-1 bg-gradient-to-r from-primary to-red-700 text-white gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {editing ? L("حفظ التعديلات", "Save changes") : L("إضافة الصورة", "Add image")}
              </Button>
              <Button variant="outline" onClick={() => setModalOpen(false)}>{L("إلغاء", "Cancel")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// === Hero Text & CTA Settings Component ===
function HeroTextSettings() {
  const { isAr } = useDashboardT();
  const L = (ar: string, en: string) => (isAr ? ar : en);
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data } = useQuery({
    queryKey: ["hero-content"],
    queryFn: () => apiGet<any>("/api/hero-content"),
  });

  const [form, setForm] = useState<any>({
    badgeAr: "", badgeEn: "",
    titleAr: "", titleEn: "",
    subtitleAr: "", subtitleEn: "",
    cta1TextAr: "اطلب شحن الآن", cta1TextEn: "Order Shipment Now", cta1Link: "#contact",
    cta2TextAr: "خدماتنا", cta2TextEn: "Our Services", cta2Link: "#services",
    feature1Ar: "توصيل نفس اليوم في القاهرة الكبرى", feature1En: "Same-day delivery in Greater Cairo",
    feature2Ar: "ضمان كامل على كل شحنة", feature2En: "Full guarantee on every shipment",
    feature3Ar: "27 محافظة بتغطية كاملة", feature3En: "Full coverage across 27 governorates",
  });

  // Sync form when data loads
  useEffect(() => {
    if (data?.id) {
      setForm({
        badgeAr: data.badgeAr ?? "", badgeEn: data.badgeEn ?? "",
        titleAr: data.titleAr ?? "", titleEn: data.titleEn ?? "",
        subtitleAr: data.subtitleAr ?? "", subtitleEn: data.subtitleEn ?? "",
        cta1TextAr: data.cta1TextAr ?? "اطلب شحن الآن", cta1TextEn: data.cta1TextEn ?? "Order Shipment Now", cta1Link: data.cta1Link ?? "#contact",
        cta2TextAr: data.cta2TextAr ?? "خدماتنا", cta2TextEn: data.cta2TextEn ?? "Our Services", cta2Link: data.cta2Link ?? "#services",
        feature1Ar: data.feature1Ar ?? "", feature1En: data.feature1En ?? "",
        feature2Ar: data.feature2Ar ?? "", feature2En: data.feature2En ?? "",
        feature3Ar: data.feature3Ar ?? "", feature3En: data.feature3En ?? "",
      });
    }
  }, [data]);

  const save = async () => {
    setSaving(true);
    try {
      await apiPost("/api/hero-content", form);
      toast.success(L("تم حفظ التغييرات", "Changes saved"));
      qc.invalidateQueries({ queryKey: ["hero-content"] });
    } catch (e: any) {
      toast.error(e.message || L("خطأ", "Error"));
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string, val: string) => setForm((f: any) => ({ ...f, [key]: val }));

  const DualField = ({ labelAr, labelEn, fieldAr, fieldEn, area = false }: any) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label className="text-xs flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-[10px] font-bold dark:bg-red-950/50 dark:text-red-400">AR</span>
          {labelAr}
        </Label>
        {area ? (
          <Textarea value={form[fieldAr] ?? ""} onChange={(e) => set(fieldAr, e.target.value)} dir="rtl" rows={2} className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white" />
        ) : (
          <Input value={form[fieldAr] ?? ""} onChange={(e) => set(fieldAr, e.target.value)} dir="rtl" className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white" />
        )}
      </div>
      <div className="space-y-1">
        <Label className="text-xs flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold">EN</span>
          {labelEn}
        </Label>
        {area ? (
          <Textarea value={form[fieldEn] ?? ""} onChange={(e) => set(fieldEn, e.target.value)} dir="ltr" rows={2} className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white" />
        ) : (
          <Input value={form[fieldEn] ?? ""} onChange={(e) => set(fieldEn, e.target.value)} dir="ltr" className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white" />
        )}
      </div>
    </div>
  );

  return (
    <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
            <Type className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{L("إعدادات نصوص وعناوين الهيرو", "Hero Text & CTA Settings")}</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{L("تحكم في كل النصوص الظاهرة في الهيرو", "Control all hero texts")}</p>
          </div>
        </div>
        <Button onClick={save} disabled={saving} size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1.5 shrink-0">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {L("حفظ التغييرات", "Save Changes")}
        </Button>
      </div>

      <div className="space-y-4">
        {/* Badge */}
        <DualField labelAr="الشارة / الـ Badge" labelEn="Badge / Tag" fieldAr="badgeAr" fieldEn="badgeEn" />

        {/* Title */}
        <DualField labelAr="العنوان الرئيسي" labelEn="Main Heading" fieldAr="titleAr" fieldEn="titleEn" />

        {/* Subtitle */}
        <DualField labelAr="الوصف" labelEn="Subtitle" fieldAr="subtitleAr" fieldEn="subtitleEn" area />

        {/* CTA Buttons */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-3">{L("أزرار الإجراء (CTA)", "CTA Buttons")}</p>
          <DualField labelAr="زر ١ - نص" labelEn="Button 1 - Text" fieldAr="cta1TextAr" fieldEn="cta1TextEn" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <div className="space-y-1">
              <Label className="text-xs text-slate-600 dark:text-slate-300">{L("زر ١ - رابط", "Button 1 - Link")}</Label>
              <Input value={form.cta1Link ?? ""} onChange={(e) => set("cta1Link", e.target.value)} dir="ltr" className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-600 dark:text-slate-300">{L("زر ٢ - رابط", "Button 2 - Link")}</Label>
              <Input value={form.cta2Link ?? ""} onChange={(e) => set("cta2Link", e.target.value)} dir="ltr" className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white" />
            </div>
          </div>
          <div className="mt-2"><DualField labelAr="زر ٢ - نص" labelEn="Button 2 - Text" fieldAr="cta2TextAr" fieldEn="cta2TextEn" /></div>
        </div>

        {/* Features */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-3">{L("المزايا / الـ Badges", "Key Highlights / Badges")}</p>
          <DualField labelAr="ميزة ١" labelEn="Feature 1" fieldAr="feature1Ar" fieldEn="feature1En" />
          <div className="mt-3"><DualField labelAr="ميزة ٢" labelEn="Feature 2" fieldAr="feature2Ar" fieldEn="feature2En" /></div>
          <div className="mt-3"><DualField labelAr="ميزة ٣" labelEn="Feature 3" fieldAr="feature3Ar" fieldEn="feature3En" /></div>
        </div>
      </div>
    </Card>
  );
}

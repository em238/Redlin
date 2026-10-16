"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Plus, Trash2, Pencil, Video, Star, Eye, EyeOff, Upload,
  Link2, X, Film, Check, FileVideo
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
import { SectionContentEditor } from "@/components/shared/section-content-editor";
import { useDashboardT } from "@/lib/i18n";

// Title/description suggestion templates (the actual video file is now
// uploaded directly from desktop — no external URLs anymore).
const TEMPLATE_VIDEOS = [
  { title: "Redline — رحلة شحنة", description: "وثائقي قصير يوثّق رحلة شحنة من المخزن حتى باب العميل", category: "promo" },
  { title: "شبكة الفروع في 27 محافظة", description: "جولة في فروع ومستودعات Redline عبر كل محافظات مصر", category: "logistics" },
];

export function DashboardVideos() {
  const { t, isAr } = useDashboardT();
  const L = (ar: string, en: string) => (isAr ? ar : en);
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    title: "", titleAr: "",
    description: "", descriptionAr: "",
    url: "", thumbnail: "",
    category: "promo", featured: false, active: true,
  });

  const CATEGORIES = [
    { value: "promo", label: t("d.videos.cat.promo") },
    { value: "logistics", label: t("d.videos.cat.logistics") },
    { value: "tutorial", label: t("d.videos.cat.tutorial") },
    { value: "testimonial", label: t("d.videos.cat.testimonial") },
    { value: "other", label: t("d.videos.cat.other") },
  ];

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
    setForm({
      title: "", titleAr: "",
      description: "", descriptionAr: "",
      url: "", thumbnail: thumbOptions[0],
      category: "promo", featured: false, active: true,
    });
    setModalOpen(true);
  };

  const openEdit = (v: any) => {
    setEditing(v);
    setForm({ ...v });
    setModalOpen(true);
  };

  const normalizeUrl = (url: string) => {
    // Backward-compat: if an existing DB row has a YouTube URL, still normalize
    // it. New rows will have /uploads/... paths that pass through unchanged.
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
    const ytShorts = url.match(/youtube\.com\/shorts\/([\w-]+)/);
    if (ytShorts) return `https://www.youtube.com/embed/${ytShorts[1]}`;
    return url;
  };

  const save = async () => {
    if (!form.title || !form.url) { toast.error(t("d.videos.toastMissing")); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        titleAr: form.titleAr || "",
        descriptionAr: form.descriptionAr || "",
        url: normalizeUrl(form.url),
      };
      if (editing) {
        await apiPatch(`/api/videos/${editing.id}`, payload);
        toast.success(t("d.videos.toastUpdated"));
      } else {
        await apiPost("/api/videos", payload);
        toast.success(t("d.videos.toastCreated"));
      }
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: ["videos-admin"] });
      qc.invalidateQueries({ queryKey: ["site-videos"] });
      qc.invalidateQueries({ queryKey: ["site-stats"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch (e: any) {
      toast.error(e.message || t("d.videos.toastError"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm(t("d.videos.confirmDelete"))) return;
    try {
      await apiDelete(`/api/videos/${id}`);
      toast.success(t("d.videos.toastDeleted"));
      qc.invalidateQueries({ queryKey: ["videos-admin"] });
      qc.invalidateQueries({ queryKey: ["site-videos"] });
    } catch (e: any) { toast.error(e.message); }
  };

  const toggleFeatured = async (v: any) => {
    try {
      await apiPatch(`/api/videos/${v.id}`, { featured: !v.featured });
      toast.success(!v.featured ? t("d.videos.toastFeaturedOn") : t("d.videos.toastFeaturedOff"));
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

  // (drag-and-drop for files is handled inside <FileUpload> now — no external URLs accepted)

  const applyTemplate = (tp: typeof TEMPLATE_VIDEOS[0]) => {
    setForm({
      title: tp.title, titleAr: "",
      description: tp.description, descriptionAr: "",
      url: "", thumbnail: thumbOptions[Math.floor(Math.random() * thumbOptions.length)],
      category: tp.category, featured: false, active: true,
    });
    setEditing(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-5">
      <SectionContentEditor section="videos" />
      {/* Section Context Banner */}
      <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 mb-4">
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          📍 {L("مكان الظهور: ", "Appears at: ")}{L("معرض الفيديوهات", "Video Gallery section")}
        </span>
        <a href="/#videos" target="_blank" className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1">
          {L("عرض في الموقع", "Preview on Site")} ↗
        </a>
      </div>

      {/* Header card */}
      <Card className="p-5 bg-gradient-to-l from-primary/10 to-red-700/5 border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-lg shadow-primary/25">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{t("d.videos.headerTitle")}</h3>
              <p className="text-sm text-muted-foreground">{t("d.videos.headerSub")}</p>
            </div>
          </div>
          <Button onClick={openCreate} className="bg-gradient-to-r from-primary to-red-700 text-white gap-2 shrink-0">
            <Upload className="w-4 h-4" /> {t("d.videos.uploadNew")}
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { v: videos.length, l: t("d.videos.stats.total"), c: "text-gradient-red" },
          { v: videos.filter((v: any) => v.active).length, l: t("d.videos.stats.active"), c: "text-emerald-600" },
          { v: videos.filter((v: any) => v.featured).length, l: t("d.videos.stats.featured"), c: "text-amber-600" },
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
        <Card className="p-12 border-2 border-dashed text-center transition-colors border-border">
          <FileVideo className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="font-bold">{t("d.videos.emptyTitle")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("d.videos.emptySub")}</p>
          <Button onClick={openCreate} className="mt-4 bg-gradient-to-r from-primary to-red-700 text-white gap-2">
            <Upload className="w-4 h-4" /> {t("d.videos.uploadNew")}
          </Button>
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
                      <Star className="w-3 h-3 fill-white" /> {t("d.videos.featured")}
                    </Badge>
                  )}
                  {!v.active && (
                    <Badge className="absolute top-2 left-2 bg-zinc-800 text-white gap-1">
                      <EyeOff className="w-3 h-3" /> {t("d.videos.hidden")}
                    </Badge>
                  )}
                  <div className="absolute bottom-2 right-2">
                    <span className="px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold backdrop-blur-sm">
                      {CATEGORIES.find((c) => c.value === v.category)?.label || v.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm line-clamp-1 flex items-center gap-1.5">
                      {v.titleAr && (
                        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold shrink-0">AR</span>
                      )}
                      <span className="truncate">{v.title}</span>
                    </h4>
                    {v.titleAr && (
                      <p className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1.5" dir="rtl">
                        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold shrink-0">AR</span>
                        <span className="truncate">{v.titleAr}</span>
                      </p>
                    )}
                  </div>
                  <div className="space-y-1 mt-1">
                    {v.descriptionAr && (
                      <p className="text-xs text-muted-foreground line-clamp-2 flex items-start gap-1.5" dir="rtl">
                        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold shrink-0 mt-0.5">AR</span>
                        <span>{v.descriptionAr}</span>
                      </p>
                    )}
                    {v.description && <p className="text-xs text-muted-foreground line-clamp-2">{v.description}</p>}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Link2 className="w-3 h-3" /> {formatDate(v.createdAt)}</span>
                    <span className="flex items-center gap-1 truncate max-w-[140px]" dir="ltr">
                      <FileVideo className="w-3 h-3" /> {v.url.split("/").pop() || v.url}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-1.5">
                    <Button variant="outline" size="sm" className="h-8 flex-1 gap-1" onClick={() => openEdit(v)}>
                      <Pencil className="w-3.5 h-3.5" /> {t("d.videos.edit")}
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => toggleFeatured(v)} title={t("d.videos.featured")}>
                      <Star className={`w-3.5 h-3.5 ${v.featured ? "fill-amber-400 text-amber-500" : ""}`} />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => toggleActive(v)} title={t("d.videos.hidden")}>
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
              {editing ? t("d.videos.modal.edit") : t("d.videos.modal.create")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Direct video file upload from desktop (no external URLs accepted) */}
            <FileUpload
              label={L("ارفع ملف الفيديو من جهازك (.mp4 / .webm)", "Upload the video file from your device (.mp4 / .webm)")}
              accept="video/mp4,video/webm"
              currentUrl={form.url}
              onUploaded={(url) => setForm({ ...form, url })}
              type="video"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold">EN</span>
                  {L("العنوان (إنجليزي)", "Title (English)")}
                </Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t("d.videos.modal.titlePlaceholder")} className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700" dir="ltr" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">AR</span>
                  {L("العنوان (عربي)", "Title (Arabic)")}
                </Label>
                <Input value={form.titleAr || ""} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} placeholder={L("أدخل العنوان بالعربية", "Enter title in Arabic")} className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700" dir="rtl" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold">EN</span>
                  {L("الوصف (إنجليزي)", "Description (English)")}
                </Label>
                <Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder={t("d.videos.modal.descPlaceholder")} className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700" dir="ltr" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">AR</span>
                  {L("الوصف (عربي)", "Description (Arabic)")}
                </Label>
                <Textarea value={form.descriptionAr || ""} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} rows={3} placeholder={L("أدخل الوصف بالعربية", "Enter description in Arabic")} className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700" dir="rtl" />
              </div>
            </div>

            <FileUpload
              label={t("d.videos.modal.thumbLabel")}
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              currentUrl={form.thumbnail}
              onUploaded={(url) => setForm({ ...form, thumbnail: url })}
              type="image"
            />

            <div className="space-y-2">
              <Label className="text-xs">{t("d.videos.modal.galleryLabel")}</Label>
              <div className="grid grid-cols-5 gap-2">
                {thumbOptions.map((tp) => (
                  <button
                    key={tp}
                    onClick={() => setForm({ ...form, thumbnail: tp })}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${form.thumbnail === tp ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-border"}`}
                  >
                    <img src={tp} alt={tp} className="w-full h-full object-cover" />
                    {form.thumbnail === tp && (
                      <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{t("d.videos.modal.category")}</Label>
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
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500" /> {t("d.videos.modal.featured")}</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Switch checked={!!form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                  <span>{t("d.videos.modal.published")}</span>
                </label>
              </div>
            </div>

            {/* Quick templates */}
            {!editing && (
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Plus className="w-3.5 h-3.5 text-primary" /> {t("d.videos.modal.templates")}</p>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_VIDEOS.map((tp, i) => (
                    <button key={i} onClick={() => applyTemplate(tp)} className="px-3 py-1.5 text-xs rounded-lg border border-border bg-card hover:border-primary/40 hover:text-primary transition-colors text-right">
                      {tp.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Preview handled inside <FileUpload> — no separate iframe preview needed */}

            <div className="flex gap-2 pt-2">
              <Button onClick={save} disabled={saving} className="flex-1 bg-gradient-to-r from-primary to-red-700 text-white gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {editing ? t("d.videos.modal.saveEdit") : t("d.videos.modal.saveCreate")}
              </Button>
              <Button variant="outline" onClick={() => setModalOpen(false)}>{t("d.videos.modal.cancel")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

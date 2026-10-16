"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Plus, Trash2, Boxes, Eye, EyeOff, Pencil, Upload,
  Truck, Zap, Rocket, Package, Banknote, RotateCcw, Star, Sparkles, ShieldCheck,
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

type Service = {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  descriptionEn: string;
  ctaTextAr: string;
  ctaTextEn: string;
  icon: string;
  multiplier: number;
  active: boolean;
  createdAt: string;
};

const LUCIDE_ICONS: Record<string, any> = {
  truck: Truck, zap: Zap, rocket: Rocket, package: Package,
  banknote: Banknote, "rotate-ccw": RotateCcw, star: Star,
  sparkles: Sparkles, "shield-check": ShieldCheck, boxes: Boxes,
};

const ICON_CHOICES = Object.keys(LUCIDE_ICONS);

const isImageUrl = (v: string) =>
  typeof v === "string" && (v.startsWith("/") || v.startsWith("http://") || v.startsWith("https://"));

const emptyForm = {
  name: "", nameAr: "",
  description: "", descriptionAr: "", descriptionEn: "",
  ctaTextAr: "اطلب الخدمة", ctaTextEn: "Request Service",
  icon: "truck", multiplier: 1.0, active: true,
};

export function DashboardServices() {
  const { isAr } = useDashboardT();
  const qc = useQueryClient();
  const L = (ar: string, en: string) => (isAr ? ar : en);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({ ...emptyForm });

  const { data, isLoading } = useQuery({
    queryKey: ["services-admin"],
    queryFn: () => apiGet<{ services: Service[] }>("/api/services?all=1"),
  });
  const services = data?.services ?? [];

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({
      name: s.name, nameAr: s.nameAr,
      description: s.description,
      descriptionAr: s.descriptionAr || "",
      descriptionEn: s.descriptionEn || "",
      ctaTextAr: s.ctaTextAr || "اطلب الخدمة",
      ctaTextEn: s.ctaTextEn || "Request Service",
      icon: s.icon || "truck", multiplier: s.multiplier ?? 1.0, active: s.active,
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name || !form.nameAr) {
      toast.error(L("الاسم بالعربي والإنجليزي مطلوب", "Both Arabic and English names are required"));
      return;
    }
    if (!form.description) {
      toast.error(L("الوصف مطلوب", "Description is required"));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        nameAr: form.nameAr,
        description: form.description,
        descriptionAr: form.descriptionAr || "",
        descriptionEn: form.descriptionEn || "",
        ctaTextAr: form.ctaTextAr || "اطلب الخدمة",
        ctaTextEn: form.ctaTextEn || "Request Service",
        icon: form.icon || "truck",
        multiplier: Number(form.multiplier) || 1.0,
        active: !!form.active,
      };
      if (editing) {
        await apiPatch(`/api/services/${editing.id}`, payload);
        toast.success(L("تم تحديث الخدمة", "Service updated"));
      } else {
        await apiPost("/api/services", payload);
        toast.success(L("تمت إضافة الخدمة", "Service added"));
      }
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: ["services-admin"] });
      qc.invalidateQueries({ queryKey: ["services"] });
    } catch (e: any) {
      toast.error(e.message || L("خطأ", "Error"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm(L("حذف هذه الخدمة؟", "Delete this service?"))) return;
    try {
      await apiDelete(`/api/services/${id}`);
      toast.success(L("تم الحذف", "Deleted"));
      qc.invalidateQueries({ queryKey: ["services-admin"] });
      qc.invalidateQueries({ queryKey: ["services"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const toggleActive = async (s: Service) => {
    try {
      await apiPatch(`/api/services/${s.id}`, { active: !s.active });
      qc.invalidateQueries({ queryKey: ["services-admin"] });
      qc.invalidateQueries({ queryKey: ["services"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const renderIcon = (s: Service, className: string) => {
    if (isImageUrl(s.icon)) {
      return <img src={s.icon} alt={s.name} className="w-6 h-6 object-contain" />;
    }
    const Icon = LUCIDE_ICONS[s.icon] || Boxes;
    return <Icon className={className} />;
  };

  return (
    <div className="space-y-5">
      {/* Section Context Banner */}
      <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 mb-4">
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          📍 {L("مكان الظهور: ", "Appears at: ")}{L("قسم خدماتنا على الصفحة الرئيسية", "Services section on the homepage")}
        </span>
        <a href="/#services" target="_blank" className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1">
          {L("عرض في الموقع", "Preview on Site")} ↗
        </a>
      </div>

      {/* Header */}
      <Card className="p-5 bg-gradient-to-l from-primary/10 to-red-700/5 border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-lg shadow-primary/25">
              <Boxes className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{L("خدماتنا", "Our Services")}</h3>
              <p className="text-sm text-muted-foreground">
                {L("أضف وعدّل وحذف الخدمات المعروضة بالموقع", "Add, edit, and delete the services displayed on the site")}
              </p>
            </div>
          </div>
          <Button onClick={openCreate} className="bg-gradient-to-r from-primary to-red-700 text-white gap-2 shrink-0">
            <Plus className="w-4 h-4" /> {L("إضافة خدمة", "Add service")}
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { v: services.length, l: L("إجمالي الخدمات", "Total services"), c: "text-gradient-red" },
          { v: services.filter((s) => s.active).length, l: L("نشطة", "Active"), c: "text-emerald-600" },
          { v: services.filter((s) => !s.active).length, l: L("مخفية", "Hidden"), c: "text-zinc-500" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="p-4 text-center">
              <div className={`text-2xl font-black ${s.c} tabular-nums`}>{s.v}</div>
              <div className="text-xs text-muted-foreground">{s.l}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Services grid */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : services.length === 0 ? (
        <Card className="p-12 border-2 border-dashed text-center border-border">
          <Boxes className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="font-bold">{L("لا توجد خدمات بعد", "No services yet")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {L("اضغط \"إضافة خدمة\" لإضافة أول خدمة", "Click \"Add service\" to add the first one")}
          </p>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {services.map((s) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -4 }}
              >
                <Card className={`p-5 h-full hover:shadow-xl transition-all ${!s.active ? "opacity-60" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 via-primary/8 to-amber-500/10 flex items-center justify-center shrink-0">
                      {renderIcon(s, "w-6 h-6 text-primary")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm" dir="rtl">{s.nameAr}</div>
                      <div className="text-xs text-muted-foreground" dir="ltr">{s.name}</div>
                    </div>
                    {!s.active && (
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-white text-[10px] font-bold flex items-center gap-1 shrink-0">
                        <EyeOff className="w-3 h-3" /> {L("مخفي", "Hidden")}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {s.descriptionAr || s.descriptionEn ? (
                      <>
                        {s.descriptionAr && (
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex items-start gap-1.5" dir="rtl">
                            <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold shrink-0 mt-0.5">AR</span>
                            <span>{s.descriptionAr}</span>
                          </p>
                        )}
                        {s.descriptionEn && (
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex items-start gap-1.5" dir="ltr">
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold shrink-0 mt-0.5">EN</span>
                            <span>{s.descriptionEn}</span>
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{s.description}</p>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {s.ctaTextAr && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold" dir="rtl">
                        <span className="px-1 rounded bg-primary/15 text-[8px]">AR</span>
                        {s.ctaTextAr}
                      </span>
                    )}
                    {s.ctaTextEn && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 text-[10px] font-semibold" dir="ltr">
                        <span className="px-1 rounded bg-blue-500/15 text-[8px]">EN</span>
                        {s.ctaTextEn}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span dir="ltr">×{s.multiplier ?? 1}</span>
                    <span className="font-mono truncate" dir="ltr">icon: {s.icon}</span>
                  </div>

                  <div className="flex gap-1.5 mt-3 pt-3 border-t border-border/40">
                    <Button variant="outline" size="sm" className="h-8 flex-1 gap-1" onClick={() => openEdit(s)}>
                      <Pencil className="w-3.5 h-3.5" /> {L("تعديل", "Edit")}
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => toggleActive(s)}
                      title={L("إظهار/إخفاء", "Show/Hide")}>
                      {s.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-rose-600 hover:text-rose-700"
                      onClick={() => remove(s.id)} title={L("حذف", "Delete")}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
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
              {editing ? L("تعديل خدمة", "Edit service") : L("إضافة خدمة جديدة", "Add new service")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Names side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">AR</span>
                  {L("الاسم (عربي)", "Name (Arabic)")}
                </Label>
                <Input
                  value={form.nameAr}
                  onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                  placeholder="عادي / ممتاز / نفس اليوم"
                  dir="rtl"
                  className="h-10"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold">EN</span>
                  {L("الاسم (إنجليزي)", "Name (English)")}
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Standard / Express / Same Day"
                  dir="ltr"
                  className="h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">AR</span>
                  {L("الوصف (عربي)", "Description (Arabic)")}
                </Label>
                <Textarea
                  value={form.descriptionAr || ""}
                  onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                  rows={3}
                  dir="rtl"
                  placeholder="توصيل خلال 48-96 ساعة بأفضل الأسعار"
                  className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold">EN</span>
                  {L("الوصف (إنجليزي)", "Description (English)")}
                </Label>
                <Textarea
                  value={form.descriptionEn || ""}
                  onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                  rows={3}
                  dir="ltr"
                  placeholder="Delivery in 48-96 hours at the best prices"
                  className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">{L("الوصف الافتراضي (احتياطي)", "Default description (fallback)")}</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder={L("يُستخدم إذا كانت الحقول الثنائية فارغة", "Used when bilingual fields are empty")}
              />
            </div>

            {/* CTA text bilingual */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">AR</span>
                  {L("نص الزر (عربي)", "CTA text (Arabic)")}
                </Label>
                <Input
                  value={form.ctaTextAr || ""}
                  onChange={(e) => setForm({ ...form, ctaTextAr: e.target.value })}
                  placeholder="اطلب الخدمة"
                  dir="rtl"
                  className="h-10"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold">EN</span>
                  {L("نص الزر (إنجليزي)", "CTA text (English)")}
                </Label>
                <Input
                  value={form.ctaTextEn || ""}
                  onChange={(e) => setForm({ ...form, ctaTextEn: e.target.value })}
                  placeholder="Request Service"
                  dir="ltr"
                  className="h-10"
                />
              </div>
            </div>

            {/* Icon picker */}
            <div className="space-y-2">
              <Label className="text-xs">{L("أيقونة الخدمة (lucide name أو صورة مخصصة)", "Service icon (lucide name or custom image)")}</Label>
              <Input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="truck / zap / rocket / package"
                className="h-10"
                dir="ltr"
              />
              <div className="flex flex-wrap gap-2">
                {ICON_CHOICES.map((name) => {
                  const Icon = LUCIDE_ICONS[name];
                  const isActive = form.icon === name;
                  return (
                    <button
                      key={name}
                      onClick={() => setForm({ ...form, icon: name })}
                      className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all ${
                        isActive
                          ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                          : "border-border hover:border-primary/40"
                      }`}
                      title={name}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    </button>
                  );
                })}
              </div>
              {/* Preview current icon */}
              <div className="flex items-center gap-3 mt-1 rounded-lg border border-border p-3 bg-muted/30">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 via-primary/8 to-amber-500/10 flex items-center justify-center">
                  {isImageUrl(form.icon) ? (
                    <img src={form.icon} alt="icon" className="w-6 h-6 object-contain" />
                  ) : (
                    (() => {
                      const Icon = LUCIDE_ICONS[form.icon] || Boxes;
                      return <Icon className="w-6 h-6 text-primary" />;
                    })()
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {L("معاينة الأيقونة الحالية", "Current icon preview")}
                </div>
              </div>
            </div>

            {/* Optional image upload (overrides icon with URL) */}
            <FileUpload
              label={L("ارفع صورة أيقونة مخصصة (اختياري)", "Upload custom icon image (optional)")}
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
              currentUrl={isImageUrl(form.icon) ? form.icon : ""}
              onUploaded={(url) => setForm({ ...form, icon: url })}
              type="image"
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{L("المضاعف (Multiplier)", "Multiplier")}</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.multiplier}
                  onChange={(e) => setForm({ ...form, multiplier: e.target.value })}
                  className="h-10"
                  dir="ltr"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Switch checked={!!form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                  <span>{L("نشطة", "Active")}</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={save} disabled={saving} className="flex-1 bg-gradient-to-r from-primary to-red-700 text-white gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {editing ? L("حفظ التعديلات", "Save changes") : L("إضافة الخدمة", "Add service")}
              </Button>
              <Button variant="outline" onClick={() => setModalOpen(false)}>{L("إلغاء", "Cancel")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

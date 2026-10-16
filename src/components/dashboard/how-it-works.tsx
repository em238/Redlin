"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Plus, Trash2, ClipboardList, Eye, EyeOff, Pencil, Upload,
  Package, Truck, MapPin, CreditCard, Phone, Search, BarChart3,
  ShieldCheck, Sparkles, Star, ClipboardCheck, Rocket,
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
import { useT } from "@/lib/i18n";

type Step = {
  id: string;
  order: number;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

const LUCIDE_ICONS: Record<string, any> = {
  "clipboard-list": ClipboardList,
  "clipboard-check": ClipboardCheck,
  package: Package,
  truck: Truck,
  "map-pin": MapPin,
  "credit-card": CreditCard,
  phone: Phone,
  search: Search,
  "bar-chart-3": BarChart3,
  "shield-check": ShieldCheck,
  sparkles: Sparkles,
  star: Star,
  rocket: Rocket,
};

const ICON_CHOICES = Object.keys(LUCIDE_ICONS);

const isImageUrl = (v: string) =>
  typeof v === "string" && (v.startsWith("/") || v.startsWith("http://") || v.startsWith("https://"));

const emptyForm = {
  titleAr: "", titleEn: "", descAr: "", descEn: "",
  icon: "clipboard-list", order: 0, active: true,
};

export function DashboardHowItWorks() {
  const { isAr } = useT();
  const qc = useQueryClient();
  const L = (ar: string, en: string) => (isAr ? ar : en);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Step | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({ ...emptyForm });

  const { data, isLoading } = useQuery({
    queryKey: ["how-it-works-admin"],
    queryFn: () => apiGet<{ steps: Step[] }>("/api/how-it-works?all=1"),
  });
  const steps = data?.steps ?? [];

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, order: steps.length });
    setModalOpen(true);
  };

  const openEdit = (s: Step) => {
    setEditing(s);
    setForm({
      titleAr: s.titleAr, titleEn: s.titleEn,
      descAr: s.descAr, descEn: s.descEn,
      icon: s.icon || "clipboard-list",
      order: s.order ?? 0, active: s.active,
    });
    setModalOpen(true);
  };

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["how-it-works-admin"] });
    qc.invalidateQueries({ queryKey: ["site-data"] });
    qc.invalidateQueries({ queryKey: ["site"] });
  };

  const save = async () => {
    if (!form.titleAr || !form.titleEn) {
      toast.error(L("العنوان بالعربي والإنجليزي مطلوب", "Both Arabic and English titles are required"));
      return;
    }
    if (!form.descAr || !form.descEn) {
      toast.error(L("الوصف بالعربي والإنجليزي مطلوب", "Both Arabic and English descriptions are required"));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        titleAr: form.titleAr,
        titleEn: form.titleEn,
        descAr: form.descAr,
        descEn: form.descEn,
        icon: form.icon || "clipboard-list",
        order: Number(form.order) || 0,
        active: !!form.active,
      };
      if (editing) {
        await apiPatch(`/api/how-it-works/${editing.id}`, payload);
        toast.success(L("تم تحديث الخطوة", "Step updated"));
      } else {
        await apiPost("/api/how-it-works", payload);
        toast.success(L("تمت إضافة الخطوة", "Step added"));
      }
      setModalOpen(false);
      invalidate();
    } catch (e: any) {
      toast.error(e.message || L("خطأ", "Error"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm(L("حذف هذه الخطوة؟", "Delete this step?"))) return;
    try {
      await apiDelete(`/api/how-it-works/${id}`);
      toast.success(L("تم الحذف", "Deleted"));
      invalidate();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const toggleActive = async (s: Step) => {
    try {
      await apiPatch(`/api/how-it-works/${s.id}`, { active: !s.active });
      invalidate();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const renderIcon = (iconName: string, className: string) => {
    if (isImageUrl(iconName)) {
      return <img src={iconName} alt="icon" className="w-6 h-6 object-contain" />;
    }
    const Icon = LUCIDE_ICONS[iconName] || ClipboardList;
    return <Icon className={className} />;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card className="p-5 bg-gradient-to-l from-primary/10 to-red-700/5 border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-lg shadow-primary/25">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{L("كيف نعمل", "How It Works")}</h3>
              <p className="text-sm text-muted-foreground">
                {L("أدر خطوات عملية الشحن المعروضة بالموقع", "Manage the shipping process steps shown on the site")}
              </p>
            </div>
          </div>
          <Button onClick={openCreate} className="bg-gradient-to-r from-primary to-red-700 text-white gap-2 shrink-0">
            <Plus className="w-4 h-4" /> {L("إضافة خطوة", "Add step")}
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { v: steps.length, l: L("إجمالي الخطوات", "Total steps"), c: "text-gradient-red" },
          { v: steps.filter((s) => s.active).length, l: L("نشطة", "Active"), c: "text-emerald-600" },
          { v: steps.filter((s) => !s.active).length, l: L("مخفية", "Hidden"), c: "text-zinc-500" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="p-4 text-center">
              <div className={`text-2xl font-black ${s.c} tabular-nums`}>{s.v}</div>
              <div className="text-xs text-muted-foreground">{s.l}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Steps grid */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : steps.length === 0 ? (
        <Card className="p-12 border-2 border-dashed text-center border-border">
          <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="font-bold">{L("لا توجد خطوات بعد", "No steps yet")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {L("اضغط \"إضافة خطوة\" لإنشاء أول خطوة", "Click \"Add step\" to create the first step")}
          </p>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {steps.map((s, i) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -4 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className={`p-5 h-full hover:shadow-xl transition-all relative overflow-hidden ${!s.active ? "opacity-60" : ""}`}>
                  {/* Step number watermark */}
                  <div className="absolute -top-3 -left-2 text-[7rem] font-black leading-none text-primary/5 select-none pointer-events-none">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="relative">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 via-primary/8 to-amber-500/10 flex items-center justify-center shrink-0">
                        {renderIcon(s.icon, "w-6 h-6 text-primary")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-primary/80">
                          {L(`الخطوة ${i + 1}`, `Step ${i + 1}`)}
                        </div>
                        <div className="font-bold text-sm" dir="rtl">{s.titleAr}</div>
                        <div className="text-xs text-muted-foreground" dir="ltr">{s.titleEn}</div>
                      </div>
                      {!s.active && (
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-white text-[10px] font-bold flex items-center gap-1 shrink-0">
                          <EyeOff className="w-3 h-3" /> {L("مخفي", "Hidden")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-3" dir="rtl">{s.descAr}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2" dir="ltr">{s.descEn}</p>

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
              {editing ? L("تعديل خطوة", "Edit step") : L("إضافة خطوة جديدة", "Add new step")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Titles side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">AR</span>
                  {L("العنوان (عربي)", "Title (Arabic)")}
                </Label>
                <Input
                  value={form.titleAr}
                  onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                  placeholder={L("احجز شحنتك", "Book your shipment")}
                  dir="rtl"
                  className="h-10"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold">EN</span>
                  {L("العنوان (إنجليزي)", "Title (English)")}
                </Label>
                <Input
                  value={form.titleEn}
                  onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                  placeholder="Book your shipment"
                  dir="ltr"
                  className="h-10"
                />
              </div>
            </div>

            {/* Descriptions side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">AR</span>
                  {L("الوصف (عربي)", "Description (Arabic)")}
                </Label>
                <Textarea
                  value={form.descAr}
                  onChange={(e) => setForm({ ...form, descAr: e.target.value })}
                  rows={3}
                  dir="rtl"
                  placeholder={L("اختر المحافظة ونوع الخدمة...", "Pick governorate and service...")}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold">EN</span>
                  {L("الوصف (إنجليزي)", "Description (English)")}
                </Label>
                <Textarea
                  value={form.descEn}
                  onChange={(e) => setForm({ ...form, descEn: e.target.value })}
                  rows={3}
                  dir="ltr"
                  placeholder="Pick the governorate and service..."
                />
              </div>
            </div>

            {/* Icon picker */}
            <div className="space-y-2">
              <Label className="text-xs">{L("الأيقونة (lucide name أو صورة مخصصة)", "Icon (lucide name or custom image)")}</Label>
              <Input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="clipboard-list / truck / package / map-pin"
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
              {/* Preview */}
              <div className="flex items-center gap-3 mt-1 rounded-lg border border-border p-3 bg-muted/30">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 via-primary/8 to-amber-500/10 flex items-center justify-center">
                  {renderIcon(form.icon, "w-6 h-6 text-primary")}
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
                <Label className="text-xs">{L("الترتيب", "Order")}</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
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
                {editing ? L("حفظ التعديلات", "Save changes") : L("إضافة الخطوة", "Add step")}
              </Button>
              <Button variant="outline" onClick={() => setModalOpen(false)}>{L("إلغاء", "Cancel")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

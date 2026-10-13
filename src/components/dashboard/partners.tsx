"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Plus, Trash2, Handshake, Eye, EyeOff, Pencil, ExternalLink,
  Upload, Building2, Briefcase, Store, Truck, Cpu, Smartphone, Shirt, Palette, ShoppingBag, Check
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { toast } from "sonner";

const ICONS: Record<string, any> = {
  building: Building2, briefcase: Briefcase, store: Store, truck: Truck,
  cpu: Cpu, smartphone: Smartphone, shirt: Shirt, palette: Palette,
  "shopping-bag": ShoppingBag,
};

const ICON_OPTIONS = [
  { value: "building", label: "مبنى" },
  { value: "briefcase", label: "حقيبة" },
  { value: "store", label: "متجر" },
  { value: "truck", label: "شاحنة" },
  { value: "cpu", label: "تقنية" },
  { value: "smartphone", label: "هاتف" },
  { value: "shirt", label: "ملابس" },
  { value: "palette", label: "فن" },
  { value: "shopping-bag", label: "تسوق" },
];

const COLOR_OPTIONS = [
  { value: "#dc2626", label: "أحمر" },
  { value: "#2563eb", label: "أزرق" },
  { value: "#16a34a", label: "أخضر" },
  { value: "#d97706", label: "كهرماني" },
  { value: "#9333ea", label: "بنفسجي" },
  { value: "#ec4899", label: "وردي" },
  { value: "#0d9488", label: "تركواز" },
  { value: "#4f46e5", label: "نيلي" },
];

const LOGO_OPTIONS = [
  "/images/partner-1.png", "/images/partner-2.png", "/images/partner-3.png",
  "/images/partner-4.png", "/images/partner-5.png", "/images/partner-6.png",
  "/images/partner-7.png", "/images/partner-8.png",
];

export function DashboardPartners() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    name: "", logo: "", icon: "building", color: "#dc2626", website: "", order: 0, active: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["partners-admin"],
    queryFn: () => apiGet<any>("/api/partners?all=1"),
  });
  const partners = data?.partners ?? [];

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", logo: "", icon: "building", color: "#dc2626", website: "", order: partners.length, active: true });
    setModalOpen(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ ...p });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name) { toast.error("الاسم مطلوب"); return; }
    setSaving(true);
    try {
      if (editing) {
        await apiPatch(`/api/partners/${editing.id}`, form);
        toast.success("تم تحديث الشريك");
      } else {
        await apiPost("/api/partners", form);
        toast.success("تم إضافة الشريك");
      }
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: ["partners-admin"] });
      qc.invalidateQueries({ queryKey: ["partners"] });
    } catch (e: any) {
      toast.error(e.message || "خطأ");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("حذف هذا الشريك؟")) return;
    try {
      await apiDelete(`/api/partners/${id}`);
      toast.success("تم الحذف");
      qc.invalidateQueries({ queryKey: ["partners-admin"] });
      qc.invalidateQueries({ queryKey: ["partners"] });
    } catch (e: any) { toast.error(e.message); }
  };

  const toggleActive = async (p: any) => {
    try {
      await apiPatch(`/api/partners/${p.id}`, { active: !p.active });
      qc.invalidateQueries({ queryKey: ["partners-admin"] });
      qc.invalidateQueries({ queryKey: ["partners"] });
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card className="p-5 bg-gradient-to-l from-primary/10 to-red-700/5 border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-lg shadow-primary/25">
              <Handshake className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">قسم الشركاء والعملاء</h3>
              <p className="text-sm text-muted-foreground">شعارات الشركات الظاهرة بقسم "شركاء النجاح" بالموقع</p>
            </div>
          </div>
          <Button onClick={openCreate} className="bg-gradient-to-r from-primary to-red-700 text-white gap-2 shrink-0">
            <Plus className="w-4 h-4" /> إضافة شريك
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { v: partners.length, l: "إجمالي الشركاء", c: "text-gradient-red" },
          { v: partners.filter((p: any) => p.active).length, l: "منشورة", c: "text-emerald-600" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="p-4 text-center">
              <div className={`text-2xl font-black ${s.c} tabular-nums`}>{s.v}</div>
              <div className="text-xs text-muted-foreground">{s.l}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Partners grid */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : partners.length === 0 ? (
        <Card className="p-12 border-2 border-dashed text-center border-border">
          <Handshake className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="font-bold">لا يوجد شركاء بعد</p>
          <p className="text-sm text-muted-foreground mt-1">اضغط "إضافة شريك" لإضافة شعارات الشركات</p>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {partners.map((p: any) => {
              const Icon = ICONS[p.icon] || Building2;
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className={`overflow-hidden hover:shadow-xl transition-all bg-white dark:bg-card ${!p.active ? "opacity-60" : ""}`}>
                    <div className="p-6 h-32 flex flex-col items-center justify-center gap-2 relative">
                      {p.logo ? (
                        <img src={p.logo} alt={p.name} className="w-16 h-16 object-contain" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${p.color}15` }}>
                          <Icon className="w-6 h-6" style={{ color: p.color }} />
                        </div>
                      )}
                      <div className="text-sm font-bold text-foreground/80">{p.name}</div>
                      {!p.active && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-zinc-800 text-white text-[10px] font-bold flex items-center gap-1">
                          <EyeOff className="w-3 h-3" /> مخفي
                        </span>
                      )}
                    </div>
                    <div className="p-4 border-t border-border">
                      {p.website && (
                        <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mb-2 truncate" dir="ltr">
                          <ExternalLink className="w-3 h-3" /> {p.website.replace(/^https?:\/\//, "")}
                        </a>
                      )}
                      <div className="flex gap-1.5">
                        <Button variant="outline" size="sm" className="h-8 flex-1 gap-1" onClick={() => openEdit(p)}>
                          <Pencil className="w-3.5 h-3.5" /> تعديل
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => toggleActive(p)} title="إظهار/إخفاء">
                          {p.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-rose-600 hover:text-rose-700" onClick={() => remove(p.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              {editing ? "تعديل شريك" : "إضافة شريك جديد"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs">اسم الشركة *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: TechStore" className="h-10" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">شعار الشركة (Logo)</Label>
              {form.logo && (
                <div className="rounded-xl border border-border overflow-hidden w-32 h-32 bg-white p-3 mx-auto">
                  <img src={form.logo} alt={form.name} className="w-full h-full object-contain" />
                </div>
              )}
              <div className="grid grid-cols-4 gap-2">
                {LOGO_OPTIONS.map((url) => (
                  <button
                    key={url}
                    onClick={() => setForm({ ...form, logo: url })}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 bg-white p-1 transition-all ${form.logo === url ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-border"}`}
                  >
                    <img src={url} alt={url} className="w-full h-full object-contain" />
                    {form.logo === url && (
                      <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <Input
                value={form.logo || ""}
                onChange={(e) => setForm({ ...form, logo: e.target.value })}
                placeholder="أو رابط شعار مخصص (اتركه فارغاً لاستخدام أيقونة)"
                className="h-9 text-xs"
                dir="ltr"
              />
              <p className="text-[11px] text-muted-foreground">إذا لم ترفع شعار، سيتم عرض أيقونة ملونة باسم الشركة</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">الأيقونة (إذا لا يوجد شعار)</Label>
                <Select value={form.icon} onValueChange={(v) => setForm({ ...form, icon: v })}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((o) => {
                      const I = ICONS[o.value] || Building2;
                      return (
                        <SelectItem key={o.value} value={o.value}>
                          <span className="flex items-center gap-2"><I className="w-4 h-4" /> {o.label}</span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">لون الأيقونة</Label>
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setForm({ ...form, color: c.value })}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c.value ? "scale-110 border-foreground" : "border-transparent hover:scale-105"}`}
                      style={{ background: c.value }}
                      aria-label={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">رابط موقع الشركة (اختياري)</Label>
              <Input value={form.website || ""} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://example.com" className="h-10" dir="ltr" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">الترتيب</Label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="h-10" />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Switch checked={!!form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                  <span>منشور</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={save} disabled={saving} className="flex-1 bg-gradient-to-r from-primary to-red-700 text-white gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {editing ? "حفظ التعديلات" : "إضافة الشريك"}
              </Button>
              <Button variant="outline" onClick={() => setModalOpen(false)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

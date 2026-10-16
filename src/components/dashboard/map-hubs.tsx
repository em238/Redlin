"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Plus, Trash2, MapPin, Eye, EyeOff, Pencil, Upload, MapPinned,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { toast } from "sonner";
import { useDashboardT } from "@/lib/i18n";

type Governorate = {
  id: string;
  name: string;
  nameAr: string;
  zone: string; // A | B | C | D
  basePrice: number;
  etaHours: number;
  active: boolean;
  createdAt: string;
};

const ZONES = [
  { id: "A", en: "Greater Cairo", ar: "القاهرة الكبرى", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30", dot: "bg-emerald-500" },
  { id: "B", en: "Delta", ar: "الدلتا", color: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30", dot: "bg-blue-500" },
  { id: "C", en: "Upper Egypt", ar: "صعيد مصر", color: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30", dot: "bg-amber-500" },
  { id: "D", en: "Borders", ar: "الحدود", color: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30", dot: "bg-rose-500" },
] as const;

const zoneMeta = (z: string) => ZONES.find((x) => x.id === z) ?? ZONES[0];

const emptyForm = {
  name: "", nameAr: "", zone: "A", basePrice: 30, etaHours: 48, active: true,
};

export function DashboardMapHubs() {
  const { isAr } = useDashboardT();
  const qc = useQueryClient();
  const L = (ar: string, en: string) => (isAr ? ar : en);

  const [zoneFilter, setZoneFilter] = useState<string>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Governorate | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({ ...emptyForm });

  const { data, isLoading } = useQuery({
    queryKey: ["governorates-admin"],
    queryFn: () => apiGet<{ governorates: Governorate[] }>("/api/governorates?all=1"),
  });
  const all = data?.governorates ?? [];
  const governorates =
    zoneFilter === "ALL" ? all : all.filter((g) => g.zone === zoneFilter);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEdit = (g: Governorate) => {
    setEditing(g);
    setForm({
      name: g.name, nameAr: g.nameAr, zone: g.zone,
      basePrice: g.basePrice, etaHours: g.etaHours, active: g.active,
    });
    setModalOpen(true);
  };

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["governorates-admin"] });
    qc.invalidateQueries({ queryKey: ["governorates"] });
    qc.invalidateQueries({ queryKey: ["site-data"] });
    qc.invalidateQueries({ queryKey: ["site"] });
  };

  const save = async () => {
    if (!form.name || !form.nameAr) {
      toast.error(L("الاسم بالعربي والإنجليزي مطلوب", "Both Arabic and English names are required"));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        nameAr: form.nameAr,
        zone: form.zone || "A",
        basePrice: Number(form.basePrice) || 30,
        etaHours: Number(form.etaHours) || 48,
        active: !!form.active,
      };
      if (editing) {
        await apiPatch(`/api/governorates/${editing.id}`, payload);
        toast.success(L("تم تحديث المحافظة", "Governorate updated"));
      } else {
        await apiPost("/api/governorates", payload);
        toast.success(L("تمت إضافة المحافظة", "Governorate added"));
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
    if (!confirm(L("حذف هذه المحافظة؟", "Delete this governorate?"))) return;
    try {
      await apiDelete(`/api/governorates/${id}`);
      toast.success(L("تم الحذف", "Deleted"));
      invalidate();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const toggleActive = async (g: Governorate) => {
    try {
      await apiPatch(`/api/governorates/${g.id}`, { active: !g.active });
      invalidate();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // Stats by zone
  const zoneCounts = ZONES.map((z) => ({
    ...z,
    total: all.filter((g) => g.zone === z.id).length,
    active: all.filter((g) => g.zone === z.id && g.active).length,
  }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card className="p-5 bg-gradient-to-l from-primary/10 to-red-700/5 border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-lg shadow-primary/25">
              <MapPinned className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{L("محاور الشحن والمحافظات", "Shipping Hubs & Governorates")}</h3>
              <p className="text-sm text-muted-foreground">
                {L("أدر المحافظات والمناطق وأسعار التوصيل", "Manage governorates, zones, and delivery pricing")}
              </p>
            </div>
          </div>
          <Button onClick={openCreate} className="bg-gradient-to-r from-primary to-red-700 text-white gap-2 shrink-0">
            <Plus className="w-4 h-4" /> {L("إضافة محافظة", "Add governorate")}
          </Button>
        </div>
      </Card>

      {/* Zone stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {zoneCounts.map((z, i) => (
          <motion.div key={z.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${z.dot}`} />
                <span className="text-xs font-bold">{isAr ? z.ar : z.en}</span>
                <Badge variant="outline" className={`ml-auto text-[10px] px-1.5 ${z.color}`}>Zone {z.id}</Badge>
              </div>
              <div className="mt-2 flex items-end gap-1">
                <div className="text-2xl font-black tabular-nums text-gradient-red">{z.active}</div>
                <div className="text-xs text-muted-foreground mb-1">/ {z.total}</div>
              </div>
              <div className="text-[11px] text-muted-foreground">{L("نشطة / إجمالي", "active / total")}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Zone filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground me-1">
          {L("تصفية حسب المنطقة:", "Filter by zone:")}
        </span>
        <button
          onClick={() => setZoneFilter("ALL")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            zoneFilter === "ALL"
              ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30"
              : "border-border hover:border-primary/40 text-muted-foreground"
          }`}
        >
          {L("الكل", "All")} <span className="ms-1 opacity-70">({all.length})</span>
        </button>
        {ZONES.map((z) => {
          const count = all.filter((g) => g.zone === z.id).length;
          const isActive = zoneFilter === z.id;
          return (
            <button
              key={z.id}
              onClick={() => setZoneFilter(z.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                isActive
                  ? `${z.color} ring-2 ring-offset-1 ring-offset-background`
                  : "border-border hover:border-primary/40 text-muted-foreground"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${z.dot}`} />
              <span>{isAr ? z.ar : z.en}</span>
              <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Governorates grid */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : governorates.length === 0 ? (
        <Card className="p-12 border-2 border-dashed text-center border-border">
          <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="font-bold">{L("لا توجد محافظات", "No governorates")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {L("اضغط \"إضافة محافظة\" لإنشاء أول محافظة", "Click \"Add governorate\" to create the first one")}
          </p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          {/* Table on desktop */}
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="text-start font-semibold py-3 px-4">{L("المحافظة", "Governorate")}</th>
                  <th className="text-start font-semibold py-3 px-4">{L("المنطقة", "Zone")}</th>
                  <th className="text-start font-semibold py-3 px-4">{L("السعر الأساسي", "Base price")}</th>
                  <th className="text-start font-semibold py-3 px-4">{L("وقت التوصيل", "ETA (hours)")}</th>
                  <th className="text-center font-semibold py-3 px-4">{L("نشط", "Active")}</th>
                  <th className="text-end font-semibold py-3 px-4">{L("إجراءات", "Actions")}</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {governorates.map((g, i) => {
                    const z = zoneMeta(g.zone);
                    return (
                      <motion.tr
                        key={g.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className={`border-t border-border hover:bg-muted/30 ${!g.active ? "opacity-60" : ""}`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold" dir="rtl">{g.nameAr}</div>
                          <div className="text-xs text-muted-foreground font-mono" dir="ltr">{g.name}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className={`text-[11px] gap-1 ${z.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${z.dot}`} />
                            {isAr ? z.ar : z.en} · {z.id}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 tabular-nums font-semibold" dir="ltr">
                          {Number(g.basePrice).toFixed(0)} <span className="text-[11px] text-muted-foreground">EGP</span>
                        </td>
                        <td className="py-3 px-4 tabular-nums" dir="ltr">
                          {g.etaHours} <span className="text-[11px] text-muted-foreground">{L("س", "h")}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Switch checked={g.active} onCheckedChange={() => toggleActive(g)} />
                        </td>
                        <td className="py-3 px-4 text-end">
                          <div className="inline-flex gap-1.5">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(g)} title={L("تعديل", "Edit")}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => toggleActive(g)} title={L("إظهار/إخفاء", "Show/Hide")}>
                              {g.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 text-rose-600 hover:text-rose-700" onClick={() => remove(g.id)} title={L("حذف", "Delete")}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Cards on mobile */}
          <div className="md:hidden divide-y divide-border">
            {governorates.map((g) => {
              const z = zoneMeta(g.zone);
              return (
                <div key={g.id} className={`p-4 ${!g.active ? "opacity-60" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold" dir="rtl">{g.nameAr}</div>
                      <div className="text-xs text-muted-foreground font-mono" dir="ltr">{g.name}</div>
                    </div>
                    <Badge variant="outline" className={`text-[11px] gap-1 ${z.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${z.dot}`} />
                      {z.id}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-muted-foreground">{L("السعر", "Price")}</div>
                      <div className="font-bold tabular-nums" dir="ltr">{Number(g.basePrice).toFixed(0)} EGP</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">{L("الوقت", "ETA")}</div>
                      <div className="font-bold tabular-nums" dir="ltr">{g.etaHours} {L("س", "h")}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <Switch checked={g.active} onCheckedChange={() => toggleActive(g)} />
                      <span>{g.active ? L("نشط", "Active") : L("مخفي", "Hidden")}</span>
                    </label>
                    <div className="inline-flex gap-1.5">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(g)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-rose-600" onClick={() => remove(g.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Add / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              {editing ? L("تعديل محافظة", "Edit governorate") : L("إضافة محافظة جديدة", "Add new governorate")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">AR</span>
                  {L("الاسم (عربي)", "Name (Arabic)")}
                </Label>
                <Input
                  value={form.nameAr}
                  onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                  placeholder="القاهرة / الإسكندرية / أسيوط"
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
                  placeholder="Cairo / Alexandria / Asyut"
                  dir="ltr"
                  className="h-10"
                />
              </div>
            </div>

            {/* Zone select */}
            <div className="space-y-1.5">
              <Label className="text-xs">{L("المنطقة", "Zone")}</Label>
              <Select
                value={form.zone}
                onValueChange={(v) => setForm({ ...form, zone: v })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={L("اختر المنطقة", "Select zone")} />
                </SelectTrigger>
                <SelectContent>
                  {ZONES.map((z) => (
                    <SelectItem key={z.id} value={z.id}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${z.dot}`} />
                        <span className="font-mono text-xs font-bold">{z.id}</span>
                        <span>— {isAr ? z.ar : z.en}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {ZONES.map((z) => {
                  const isActive = form.zone === z.id;
                  return (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => setForm({ ...form, zone: z.id })}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all flex items-center gap-1 ${
                        isActive ? `${z.color} ring-2 ring-offset-1 ring-offset-background` : "border-border hover:border-primary/40 text-muted-foreground"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${z.dot}`} />
                      {z.id} · {isAr ? z.ar : z.en}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{L("السعر الأساسي (EGP)", "Base price (EGP)")}</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={form.basePrice}
                  onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                  className="h-10"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{L("وقت التوصيل (ساعات)", "ETA (hours)")}</Label>
                <Input
                  type="number"
                  value={form.etaHours}
                  onChange={(e) => setForm({ ...form, etaHours: e.target.value })}
                  className="h-10"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Switch checked={!!form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                <span>{L("نشطة", "Active")}</span>
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={save} disabled={saving} className="flex-1 bg-gradient-to-r from-primary to-red-700 text-white gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {editing ? L("حفظ التعديلات", "Save changes") : L("إضافة المحافظة", "Add governorate")}
              </Button>
              <Button variant="outline" onClick={() => setModalOpen(false)}>{L("إلغاء", "Cancel")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

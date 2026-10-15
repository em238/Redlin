"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Plus, Trash2, Handshake, Eye, EyeOff, Pencil, ExternalLink, Upload, Check
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
import { FileUpload } from "@/components/shared/file-upload";



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
              // Icons removed — only images used for partners now
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
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                          <span className="text-lg font-bold text-muted-foreground">{p.name?.charAt(0)}</span>
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

            <FileUpload
              label="شعار الشركة (Logo) — ارفع من جهازك"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
              currentUrl={form.logo}
              onUploaded={(url) => setForm({ ...form, logo: url })}
              type="image"
            />
            <Input
              value={form.logo || ""}
              onChange={(e) => setForm({ ...form, logo: e.target.value })}
              placeholder="أو أدخل رابط شعار مخصص"
              className="h-9 text-xs"
              dir="ltr"
            />

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

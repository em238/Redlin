"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Plus, Trash2, Handshake, Eye, EyeOff, Pencil, ExternalLink, Upload
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { toast } from "sonner";
import { FileUpload } from "@/components/shared/file-upload";
import { useDashboardT } from "@/lib/i18n";

const LOGO_OPTIONS = [
  "/images/partner-1.png", "/images/partner-2.png", "/images/partner-3.png",
  "/images/partner-4.png", "/images/partner-5.png", "/images/partner-6.png",
  "/images/partner-7.png", "/images/partner-8.png",
];

export function DashboardPartners() {
  const { t, isAr } = useDashboardT();
  const L = (ar: string, en: string) => (isAr ? ar : en);
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({
    name: "", nameAr: "", logo: "", icon: "building", color: "#dc2626", website: "", order: 0, active: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["partners-admin"],
    queryFn: () => apiGet<any>("/api/partners?all=1"),
  });
  const partners = data?.partners ?? [];

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", nameAr: "", logo: "", icon: "building", color: "#dc2626", website: "", order: partners.length, active: true });
    setModalOpen(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ ...p });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name) { toast.error(t("d.partners.toastMissingName")); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        nameAr: form.nameAr || "",
      };
      if (editing) {
        await apiPatch(`/api/partners/${editing.id}`, payload);
        toast.success(t("d.partners.toastUpdated"));
      } else {
        await apiPost("/api/partners", payload);
        toast.success(t("d.partners.toastCreated"));
      }
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: ["partners-admin"] });
      qc.invalidateQueries({ queryKey: ["partners"] });
    } catch (e: any) {
      toast.error(e.message || t("d.partners.toastError"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm(t("d.partners.confirmDelete"))) return;
    try {
      await apiDelete(`/api/partners/${id}`);
      toast.success(t("d.partners.toastDeleted"));
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
      {/* Section Context Banner */}
      <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 mb-4">
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          📍 {L("مكان الظهور: ", "Appears at: ")}{L("قسم الشركاء وعملائنا", "Partners & Clients section")}
        </span>
        <a href="/#partners" target="_blank" className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1">
          {L("عرض في الموقع", "Preview on Site")} ↗
        </a>
      </div>

      {/* Header */}
      <Card className="p-5 bg-gradient-to-l from-primary/10 to-red-700/5 border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-lg shadow-primary/25">
              <Handshake className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{t("d.partners.headerTitle")}</h3>
              <p className="text-sm text-muted-foreground">{t("d.partners.headerSub")}</p>
            </div>
          </div>
          <Button onClick={openCreate} className="bg-gradient-to-r from-primary to-red-700 text-white gap-2 shrink-0">
            <Plus className="w-4 h-4" /> {t("d.partners.add")}
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { v: partners.length, l: t("d.partners.stats.total"), c: "text-gradient-red" },
          { v: partners.filter((p: any) => p.active).length, l: t("d.partners.stats.published"), c: "text-emerald-600" },
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
          <p className="font-bold">{t("d.partners.emptyTitle")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("d.partners.emptySub")}</p>
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
                      <div className="text-sm font-bold text-foreground/80 text-center">{p.name}</div>
                      {p.nameAr && (
                        <div className="text-xs text-muted-foreground text-center" dir="rtl">{p.nameAr}</div>
                      )}
                      {!p.active && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-zinc-800 text-white text-[10px] font-bold flex items-center gap-1">
                          <EyeOff className="w-3 h-3" /> {t("d.partners.hidden")}
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
                          <Pencil className="w-3.5 h-3.5" /> {t("d.partners.edit")}
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => toggleActive(p)} title={t("d.partners.toggleVisibility")}>
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
              {editing ? t("d.partners.modal.edit") : t("d.partners.modal.create")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Names side by side — EN + AR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold">EN</span>
                  {t("d.partners.modal.nameLabel")}
                </Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("d.partners.modal.namePlaceholder")} className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700" dir="ltr" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">AR</span>
                  {L("الاسم (عربي)", "Name (Arabic)")}
                </Label>
                <Input value={form.nameAr || ""} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} placeholder={L("أدخل الاسم بالعربية", "Enter name in Arabic")} className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700" dir="rtl" />
              </div>
            </div>

            <FileUpload
              label={t("d.partners.modal.logoLabel")}
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
              currentUrl={form.logo}
              onUploaded={(url) => setForm({ ...form, logo: url })}
              type="image"
            />

            <div className="space-y-1">
              <Label className="text-xs">{t("d.partners.modal.websiteLabel")}</Label>
              <Input value={form.website || ""} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://example.com" className="h-10" dir="ltr" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{t("d.partners.modal.order")}</Label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="h-10" />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Switch checked={!!form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
                  <span>{t("d.partners.modal.published")}</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={save} disabled={saving} className="flex-1 bg-gradient-to-r from-primary to-red-700 text-white gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {editing ? t("d.partners.modal.saveEdit") : t("d.partners.modal.saveCreate")}
              </Button>
              <Button variant="outline" onClick={() => setModalOpen(false)}>{t("d.partners.modal.cancel")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

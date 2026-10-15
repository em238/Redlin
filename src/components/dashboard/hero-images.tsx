"use client";

import { useState, type DragEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Plus, Trash2, ImageIcon, Upload, Eye, EyeOff,
  Check, MoveUp, MoveDown
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
import { useT } from "@/lib/i18n";

const IMAGE_OPTIONS = [
  "/images/hero-truck.png", "/images/fleet.png", "/images/warehouse.png",
  "/images/operations.png", "/images/courier.png",
  "/images/partner-1.png", "/images/partner-2.png", "/images/partner-3.png",
];

export function DashboardHeroImages() {
  const { t } = useT();
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState<any>({ url: "", title: "", order: 0, active: true });

  const { data, isLoading } = useQuery({
    queryKey: ["hero-images-admin"],
    queryFn: () => apiGet<any>("/api/hero-images?all=1"),
  });
  const images = data?.images ?? [];

  const openCreate = () => {
    setForm({ url: IMAGE_OPTIONS[0], title: "", order: images.length, active: true });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.url) { toast.error(t("d.hero.toastMissingUrl")); return; }
    setSaving(true);
    try {
      await apiPost("/api/hero-images", form);
      toast.success(t("d.hero.toastAdded"));
      setModalOpen(false);
      qc.invalidateQueries({ queryKey: ["hero-images-admin"] });
      qc.invalidateQueries({ queryKey: ["hero-images"] });
    } catch (e: any) {
      toast.error(e.message || t("d.hero.toastError"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm(t("d.hero.confirmDelete"))) return;
    try {
      await apiDelete(`/api/hero-images/${id}`);
      toast.success(t("d.hero.toastDeleted"));
      qc.invalidateQueries({ queryKey: ["hero-images-admin"] });
      qc.invalidateQueries({ queryKey: ["hero-images"] });
    } catch (e: any) { toast.error(e.message); }
  };

  const toggleActive = async (img: any) => {
    try {
      await apiPatch(`/api/hero-images/${img.id}`, { active: !img.active });
      qc.invalidateQueries({ queryKey: ["hero-images-admin"] });
      qc.invalidateQueries({ queryKey: ["hero-images"] });
    } catch (e: any) { toast.error(e.message); }
  };

  const reorder = async (img: any, direction: "up" | "down") => {
    const sorted = [...images].sort((a: any, b: any) => a.order - b.order);
    const idx = sorted.findIndex((s: any) => s.id === img.id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === sorted.length - 1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const swap = sorted[swapIdx];
    try {
      await Promise.all([
        apiPatch(`/api/hero-images/${img.id}`, { order: swap.order }),
        apiPatch(`/api/hero-images/${swap.id}`, { order: img.order }),
      ]);
      qc.invalidateQueries({ queryKey: ["hero-images-admin"] });
      qc.invalidateQueries({ queryKey: ["hero-images"] });
      toast.success(t("d.hero.toastReordered"));
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const text = e.dataTransfer.getData("text/plain") || e.dataTransfer.getData("text/uri-list") || "";
    const url = text.trim();
    if (url) {
      setForm((f: any) => ({ ...f, url }));
      toast.success(t("d.hero.toastUrlAdded"));
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card className="p-5 bg-gradient-to-l from-primary/10 to-red-700/5 border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-lg shadow-primary/25">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{t("d.hero.headerTitle")}</h3>
              <p className="text-sm text-muted-foreground">{t("d.hero.headerSub")}</p>
            </div>
          </div>
          <Button onClick={openCreate} className="bg-gradient-to-r from-primary to-red-700 text-white gap-2 shrink-0">
            <Plus className="w-4 h-4" /> {t("d.hero.add")}
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { v: images.length, l: t("d.hero.stats.total"), c: "text-gradient-red" },
          { v: images.filter((i: any) => i.active).length, l: t("d.hero.stats.published"), c: "text-emerald-600" },
          { v: images.filter((i: any) => !i.active).length, l: t("d.hero.stats.hidden"), c: "text-zinc-500" },
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
      {images.length === 0 && !isLoading && (
        <Card className="p-12 border-2 border-dashed text-center border-border">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="font-bold">{t("d.hero.emptyTitle")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("d.hero.emptySub")}</p>
        </Card>
      )}

      {/* Images grid */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {[...images].sort((a: any, b: any) => a.order - b.order).map((img: any, i: number) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -4 }}
              >
                <Card className={`overflow-hidden hover:shadow-xl transition-all ${!img.active ? "opacity-60" : ""}`}>
                  <div className="relative aspect-video bg-muted group">
                    <img src={img.url} alt={img.title || "hero"} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded bg-black/60 text-white text-xs font-bold backdrop-blur-sm">
                        #{i + 1}
                      </span>
                      {i === 0 && (
                        <span className="px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold">{t("d.hero.first")}</span>
                      )}
                    </div>
                    {!img.active && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-zinc-800 text-white text-[10px] font-bold flex items-center gap-1">
                        <EyeOff className="w-3 h-3" /> {t("d.hero.hidden")}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="font-bold text-sm truncate">{img.title || t("d.hero.untitled")}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-1 truncate" dir="ltr">{img.url}</div>
                    <div className="mt-3 flex gap-1.5">
                      <Button variant="outline" size="icon" className="h-8 w-8" disabled={i === 0} onClick={() => reorder(img, "up")} title={t("d.hero.up")}>
                        <MoveUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8" disabled={i === images.length - 1} onClick={() => reorder(img, "down")} title={t("d.hero.down")}>
                        <MoveDown className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => toggleActive(img)} title={t("d.hero.toggleVisibility")}>
                        {img.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-rose-600 hover:text-rose-700" onClick={() => remove(img.id)} title={t("d.hero.delete")}>
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

      {/* Add Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              {t("d.hero.modal.title")}
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
                <ImageIcon className="w-3.5 h-3.5 text-primary" /> {t("d.hero.modal.urlLabel")}
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
                  <img src={form.url} alt="preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }} />
                </div>
              </div>
            )}

            {/* Upload from desktop */}
            <FileUpload
              label={t("d.hero.modal.uploadLabel")}
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              currentUrl={form.url}
              onUploaded={(url) => setForm({ ...form, url })}
              type="image"
            />

            {/* Quick select from existing images */}
            <div className="space-y-2">
              <Label className="text-xs">{t("d.hero.modal.galleryLabel")}</Label>
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

            <div className="space-y-1">
              <Label className="text-xs">{t("d.hero.modal.titleLabel")}</Label>
              <Input
                value={form.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={t("d.hero.modal.titlePlaceholder")}
                className="h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{t("d.hero.modal.order")}</Label>
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
                  <span>{t("d.hero.modal.published")}</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={save} disabled={saving} className="flex-1 bg-gradient-to-r from-primary to-red-700 text-white gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {t("d.hero.modal.save")}
              </Button>
              <Button variant="outline" onClick={() => setModalOpen(false)}>{t("d.hero.modal.cancel")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, User, Briefcase, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/shared/file-upload";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";

export function ReviewModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, isAr } = useT();
  const [form, setForm] = useState({ name: "", role: "", content: "", rating: 5 });
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = t("review.nameReq");
    if (!form.content.trim()) e.content = t("review.contentReq");
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      await apiPost("/api/testimonials", {
        ...form,
        avatar,
      });
      toast.success(t("review.success"));
      setForm({ name: "", role: "", content: "", rating: 5 });
      setAvatar(null);
      onClose();
    } catch (e: any) {
      toast.error(t("review.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-[1.5rem] bg-card border border-border/40 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Top accent */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-primary via-red-600 to-amber-500" />

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/40">
              <div>
                <h3 className="text-lg font-bold">{t("review.title")}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{t("review.subtitle")}</p>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Name */}
              <div className="flex flex-col gap-2 text-start">
                <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                  {t("review.name")} <span className="text-primary">*</span>
                </Label>
                <div className="relative group">
                  <Input
                    value={form.name}
                    onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }); }}
                    placeholder={t("review.namePh")}
                    className={`h-12 ps-10 text-start placeholder:text-start transition-all bg-muted/30 focus-visible:ring-primary/20 ${errors.name ? "border-destructive" : ""}`}
                  />
                  <User className="absolute top-1/2 -translate-y-1/2 start-3.5 w-4 h-4 text-muted-foreground/50" />
                </div>
                {errors.name && <p className="text-xs text-destructive text-start">{errors.name}</p>}
              </div>

              {/* Role & Company */}
              <div className="flex flex-col gap-2 text-start">
                <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                  {t("review.role")}
                </Label>
                <div className="relative group">
                  <Input
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    placeholder={t("review.rolePh")}
                    className="h-12 ps-10 text-start placeholder:text-start transition-all bg-muted/30 focus-visible:ring-primary/20"
                  />
                  <Briefcase className="absolute top-1/2 -translate-y-1/2 start-3.5 w-4 h-4 text-muted-foreground/50" />
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex flex-col gap-2 text-start">
                <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                  {t("review.rating")}
                </Label>
                <div className="flex gap-1.5 items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      className="p-1 transition-transform hover:scale-110 active:scale-95"
                      aria-label={`${star} stars`}
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${star <= form.rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/30"}`}
                      />
                    </button>
                  ))}
                  <span className="ms-2 text-sm font-semibold text-muted-foreground">{form.rating}/5</span>
                </div>
              </div>

              {/* Review Text */}
              <div className="flex flex-col gap-2 text-start">
                <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                  {t("review.content")} <span className="text-primary">*</span>
                </Label>
                <div className="relative group">
                  <Textarea
                    value={form.content}
                    onChange={(e) => { setForm({ ...form, content: e.target.value }); setErrors({ ...errors, content: "" }); }}
                    placeholder={t("review.contentPh")}
                    rows={4}
                    className={`ps-10 pt-3 text-start placeholder:text-start transition-all bg-muted/30 focus-visible:ring-primary/20 ${errors.content ? "border-destructive" : ""}`}
                  />
                  <MessageCircle className="absolute top-3.5 start-3.5 w-4 h-4 text-muted-foreground/50" />
                </div>
                {errors.content && <p className="text-xs text-destructive text-start">{errors.content}</p>}
              </div>

              {/* Avatar upload */}
              <div className="flex flex-col gap-2 text-start">
                <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                  {t("review.avatar")}
                </Label>
                <FileUpload
                  label={t("review.avatarHint")}
                  currentUrl={avatar}
                  onUploaded={(url) => setAvatar(url)}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border/40 bg-muted/20">
              <Button variant="ghost" onClick={onClose} className="h-11 px-5">
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                onClick={submit}
                disabled={loading}
                className="group btn-glow h-11 px-6 bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white gap-2 font-semibold"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                {t("review.submit")}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

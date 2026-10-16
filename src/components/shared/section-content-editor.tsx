"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, Type } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";
import { useDashboardT } from "@/lib/i18n";

interface SectionRecord {
  id?: string;
  section: string;
  badgeAr?: string;
  badgeEn?: string;
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  active?: boolean;
}

interface Props {
  section: string;
  // Optional custom labels for the badge/title/description fields (defaults to generic)
  badgeLabelAr?: string;
  badgeLabelEn?: string;
  titleLabelAr?: string;
  titleLabelEn?: string;
  descLabelAr?: string;
  descLabelEn?: string;
}

const emptyForm = {
  badgeAr: "",
  badgeEn: "",
  titleAr: "",
  titleEn: "",
  descriptionAr: "",
  descriptionEn: "",
  active: true,
};

export function SectionContentEditor({
  section,
  badgeLabelAr,
  badgeLabelEn,
  titleLabelAr,
  titleLabelEn,
  descLabelAr,
  descLabelEn,
}: Props) {
  const { isAr } = useDashboardT();
  const qc = useQueryClient();
  const L = (ar: string, en: string) => (isAr ? ar : en);

  // Fetch ALL section content via /api/section-content and filter by section
  const { data, isLoading } = useQuery({
    queryKey: ["section-content"],
    queryFn: () => apiGet<{ sections: SectionRecord[] }>("/api/section-content"),
  });

  const current = data?.sections?.find((s) => s.section === section);

  const [form, setForm] = useState<any>({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  // Pre-fill the form with the fetched data (or empty defaults)
  useEffect(() => {
    if (current) {
      setForm({
        badgeAr: current.badgeAr || "",
        badgeEn: current.badgeEn || "",
        titleAr: current.titleAr || "",
        titleEn: current.titleEn || "",
        descriptionAr: current.descriptionAr || "",
        descriptionEn: current.descriptionEn || "",
        active: current.active !== false,
      });
    } else {
      setForm({ ...emptyForm });
    }
  }, [current?.id, section]);

  const save = async () => {
    setSaving(true);
    try {
      await apiPost("/api/section-content", {
        section,
        badgeAr: form.badgeAr || "",
        badgeEn: form.badgeEn || "",
        titleAr: form.titleAr || "",
        titleEn: form.titleEn || "",
        descriptionAr: form.descriptionAr || "",
        descriptionEn: form.descriptionEn || "",
        active: !!form.active,
      });
      toast.success(L("تم حفظ نصوص القسم", "Section content saved"));
      qc.invalidateQueries({ queryKey: ["section-content"] });
      qc.invalidateQueries({ queryKey: ["site-data"] });
      qc.invalidateQueries({ queryKey: ["site"] });
    } catch (e: any) {
      toast.error(e.message || L("خطأ", "Error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-5 sm:p-6 space-y-4 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-amber-500/0">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <Type className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h4 className="font-bold">
              {L("نصوص القسم (عربي/إنجليزي)", "Section Text (Ar/En)")}
            </h4>
            <p className="text-xs text-muted-foreground">
              {L(
                "عدّل العنوان والوصف وشارة القسم — تظهر بالموقع للزوار",
                "Edit the section badge, title and description — shown to public visitors"
              )}
            </p>
          </div>
        </div>
        <Button
          onClick={save}
          disabled={saving || isLoading}
          className="bg-gradient-to-r from-amber-600 to-amber-700 text-white gap-2 h-9"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {L("حفظ النصوص", "Save Text")}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Badge (AR / EN) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">AR</span>
                {badgeLabelAr || L("الشارة (عربي)", "Badge (Arabic)")}
              </Label>
              <Input
                value={form.badgeAr}
                onChange={(e) => setForm({ ...form, badgeAr: e.target.value })}
                placeholder={L("أدخل نص الشارة", "Enter badge text")}
                dir="rtl"
                className="h-10"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold">EN</span>
                {badgeLabelEn || L("الشارة (إنجليزي)", "Badge (English)")}
              </Label>
              <Input
                value={form.badgeEn}
                onChange={(e) => setForm({ ...form, badgeEn: e.target.value })}
                placeholder={L("Enter badge text", "Enter badge text")}
                dir="ltr"
                className="h-10"
              />
            </div>
          </div>

          {/* Title (AR / EN) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">AR</span>
                {titleLabelAr || L("العنوان (عربي)", "Title (Arabic)")}
              </Label>
              <Input
                value={form.titleAr}
                onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                placeholder={L("أدخل العنوان", "Enter title")}
                dir="rtl"
                className="h-10"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold">EN</span>
                {titleLabelEn || L("العنوان (إنجليزي)", "Title (English)")}
              </Label>
              <Input
                value={form.titleEn}
                onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                placeholder={L("Enter title", "Enter title")}
                dir="ltr"
                className="h-10"
              />
            </div>
          </div>

          {/* Description (AR / EN) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">AR</span>
                {descLabelAr || L("الوصف (عربي)", "Description (Arabic)")}
              </Label>
              <Textarea
                value={form.descriptionAr}
                onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                rows={3}
                dir="rtl"
                placeholder={L("أدخل الوصف", "Enter description")}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold">EN</span>
                {descLabelEn || L("الوصف (إنجليزي)", "Description (English)")}
              </Label>
              <Textarea
                value={form.descriptionEn}
                onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                rows={3}
                dir="ltr"
                placeholder={L("Enter description", "Enter description")}
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

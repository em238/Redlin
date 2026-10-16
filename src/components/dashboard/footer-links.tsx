"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Plus, Trash2, Pencil, Save, Link2, Building2, LifeBuoy,
  ArrowUp, ArrowDown, ExternalLink, Type, FileText, MapPin,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { toast } from "sonner";
import { useDashboardT } from "@/lib/i18n";
import { SectionContentEditor } from "@/components/shared/section-content-editor";

type FooterLink = {
  id: string;
  category: "company" | "services" | "support";
  labelAr: string;
  labelEn: string;
  href: string;
  order: number;
  active: boolean;
  createdAt: string;
};

type FooterContent = {
  id?: string;
  bioAr: string;
  bioEn: string;
  newsletterTitleAr: string;
  newsletterTitleEn: string;
  newsletterDescAr: string;
  newsletterDescEn: string;
  dashboardLinkAr: string;
  dashboardLinkEn: string;
  addressAr: string;
  addressEn: string;
  active: boolean;
};

const emptyLinkForm = {
  category: "company" as const,
  labelAr: "",
  labelEn: "",
  href: "#",
  order: 0,
  active: true,
};

const defaultFooterContent: FooterContent = {
  bioAr: "",
  bioEn: "",
  newsletterTitleAr: "النشرة البريدية",
  newsletterTitleEn: "Newsletter",
  newsletterDescAr: "اشترك لتصلك آخر العروض والأخبار",
  newsletterDescEn: "Subscribe to get the latest offers and updates.",
  dashboardLinkAr: "دخول لوحة التحكم",
  dashboardLinkEn: "Admin Login",
  addressAr: "التجمع الخامس، القاهرة الجديدة",
  addressEn: "Fifth Settlement, New Cairo",
  active: true,
};

const CATEGORIES = [
  {
    id: "company" as const,
    ar: "الشركة",
    en: "Company",
    icon: Building2,
    color: "from-primary/15 to-primary/5",
    iconColor: "text-primary",
    accent: "bg-primary/10 text-primary",
  },
  {
    id: "services" as const,
    ar: "الخدمات",
    en: "Services",
    icon: Link2,
    color: "from-amber-500/15 to-amber-500/5",
    iconColor: "text-amber-600",
    accent: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  {
    id: "support" as const,
    ar: "الدعم",
    en: "Support",
    icon: LifeBuoy,
    color: "from-emerald-500/15 to-emerald-500/5",
    iconColor: "text-emerald-600",
    accent: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
];

const catMeta = (c: string) => CATEGORIES.find((x) => x.id === c) ?? CATEGORIES[0];

export function DashboardFooterLinks() {
  const { isAr } = useDashboardT();
  const qc = useQueryClient();
  const L = (ar: string, en: string) => (isAr ? ar : en);

  // Footer Links list
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FooterLink | null>(null);
  const [saving, setSaving] = useState(false);
  const [linkForm, setLinkForm] = useState<any>({ ...emptyLinkForm });

  // Footer Content state
  const [footerContent, setFooterContent] = useState<FooterContent>(defaultFooterContent);
  const [savingContent, setSavingContent] = useState(false);

  // Fetch all footer links (admin view = include inactive via ?all=1)
  const { data, isLoading } = useQuery({
    queryKey: ["footer-links-admin"],
    queryFn: () => apiGet<{ links: FooterLink[] }>("/api/footer-links?all=1"),
  });

  // Fetch footer content (single record)
  const { data: fcData, isLoading: fcLoading } = useQuery({
    queryKey: ["footer-content"],
    queryFn: () => apiGet<{ footer: FooterContent }>("/api/footer-content"),
  });

  // Sync footer content with fetched data once loaded
  useEffect(() => {
    if (fcData?.footer) {
      const f = fcData.footer;
      setFooterContent({
        bioAr: f.bioAr || "",
        bioEn: f.bioEn || "",
        newsletterTitleAr: f.newsletterTitleAr || "النشرة البريدية",
        newsletterTitleEn: f.newsletterTitleEn || "Newsletter",
        newsletterDescAr: f.newsletterDescAr || "اشترك لتصلك آخر العروض والأخبار",
        newsletterDescEn: f.newsletterDescEn || "Subscribe to get the latest offers and updates.",
        dashboardLinkAr: f.dashboardLinkAr || "دخول لوحة التحكم",
        dashboardLinkEn: f.dashboardLinkEn || "Admin Login",
        addressAr: f.addressAr || "التجمع الخامس، القاهرة الجديدة",
        addressEn: f.addressEn || "Fifth Settlement, New Cairo",
        active: f.active !== false,
      });
    }
  }, [fcData]);

  // NOTE: The /api/footer-links?all=1 endpoint returns ALL rows (including inactive)
  // for the admin view (requires admin auth). Toggling active off keeps the row
  // visible here but hides it from the public site.
  const items = data?.links ?? [];
  const byCategory = (cat: string) => items.filter((i) => i.category === cat);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["footer-links-admin"] });
    qc.invalidateQueries({ queryKey: ["footer-content"] });
    qc.invalidateQueries({ queryKey: ["site-data"] });
    qc.invalidateQueries({ queryKey: ["site"] });
  };

  const openCreate = (category: "company" | "services" | "support") => {
    setEditing(null);
    const nextOrder = byCategory(category).length;
    setLinkForm({ ...emptyLinkForm, category, order: nextOrder });
    setModalOpen(true);
  };

  const openEdit = (link: FooterLink) => {
    setEditing(link);
    setLinkForm({
      category: link.category,
      labelAr: link.labelAr,
      labelEn: link.labelEn,
      href: link.href || "#",
      order: link.order ?? 0,
      active: link.active,
    });
    setModalOpen(true);
  };

  const saveLink = async () => {
    if (!linkForm.labelAr || !linkForm.labelEn) {
      toast.error(L("الاسم بالعربي والإنجليزي مطلوب", "Both Arabic and English labels are required"));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        category: linkForm.category,
        labelAr: linkForm.labelAr,
        labelEn: linkForm.labelEn,
        href: linkForm.href || "#",
        order: Number(linkForm.order) || 0,
        active: !!linkForm.active,
      };
      if (editing) {
        await apiPatch(`/api/footer-links/${editing.id}`, payload);
        toast.success(L("تم تحديث الرابط", "Link updated"));
      } else {
        await apiPost("/api/footer-links", payload);
        toast.success(L("تمت إضافة الرابط", "Link added"));
      }
      setModalOpen(false);
      invalidate();
    } catch (e: any) {
      toast.error(e.message || L("خطأ", "Error"));
    } finally {
      setSaving(false);
    }
  };

  const removeLink = async (id: string) => {
    if (!confirm(L("حذف هذا الرابط؟", "Delete this link?"))) return;
    try {
      await apiDelete(`/api/footer-links/${id}`);
      toast.success(L("تم الحذف", "Deleted"));
      invalidate();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const toggleActive = async (link: FooterLink) => {
    try {
      await apiPatch(`/api/footer-links/${link.id}`, { active: !link.active });
      invalidate();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const moveOrder = async (link: FooterLink, delta: number) => {
    try {
      await apiPatch(`/api/footer-links/${link.id}`, { order: Math.max(0, (link.order ?? 0) + delta) });
      invalidate();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const saveFooterContent = async () => {
    setSavingContent(true);
    try {
      await apiPost("/api/footer-content", {
        bioAr: footerContent.bioAr || "",
        bioEn: footerContent.bioEn || "",
        newsletterTitleAr: footerContent.newsletterTitleAr || "",
        newsletterTitleEn: footerContent.newsletterTitleEn || "",
        newsletterDescAr: footerContent.newsletterDescAr || "",
        newsletterDescEn: footerContent.newsletterDescEn || "",
        dashboardLinkAr: footerContent.dashboardLinkAr || "",
        dashboardLinkEn: footerContent.dashboardLinkEn || "",
        addressAr: footerContent.addressAr || "",
        addressEn: footerContent.addressEn || "",
        active: !!footerContent.active,
      });
      toast.success(L("تم حفظ محتوى الفوتر", "Footer content saved"));
      invalidate();
    } catch (e: any) {
      toast.error(e.message || L("خطأ", "Error"));
    } finally {
      setSavingContent(false);
    }
  };

  const renderCategoryCard = (cat: "company" | "services" | "support") => {
    const meta = catMeta(cat);
    const Icon = meta.icon;
    const list = byCategory(cat).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return (
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${meta.color} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${meta.iconColor}`} />
            </div>
            <div>
              <h4 className="font-bold flex items-center gap-2">
                {isAr ? meta.ar : meta.en}
                <Badge variant="outline" className={`text-[10px] ${meta.accent}`}>{list.length}</Badge>
              </h4>
              <p className="text-xs text-muted-foreground">
                {L(
                  cat === "company" ? "روابط الشركة العامة" : cat === "services" ? "روابط خدمات الشحن" : "روابط الدعم والمساعدة",
                  cat === "company" ? "General company links" : cat === "services" ? "Shipping service links" : "Support & help links"
                )}
              </p>
            </div>
          </div>
          <Button
            onClick={() => openCreate(cat)}
            size="sm"
            className="bg-gradient-to-r from-primary to-red-700 text-white gap-2 h-9"
          >
            <Plus className="w-3.5 h-3.5" /> {L("إضافة", "Add")}
          </Button>
        </div>

        {list.length === 0 ? (
          <div className="p-6 text-center border-2 border-dashed border-border rounded-xl">
            <Icon className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">{L("لا توجد روابط بعد", "No links yet")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {list.map((link, idx) => (
                <motion.div
                  key={link.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`flex items-start gap-3 rounded-xl border border-border p-3 hover:shadow-sm transition-all ${!link.active ? "opacity-60" : ""}`}
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${meta.color} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${meta.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <div className="font-semibold text-sm" dir="rtl">{link.labelAr}</div>
                      <div className="text-xs text-muted-foreground" dir="ltr">{link.labelEn}</div>
                    </div>
                    <a
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5 truncate font-mono"
                      dir="ltr"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{link.href}</span>
                    </a>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={idx === 0}
                      onClick={() => moveOrder(link, -1)}
                      title={L("تحريك لأعلى", "Move up")}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={idx === list.length - 1}
                      onClick={() => moveOrder(link, 1)}
                      title={L("تحريك لأسفل", "Move down")}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                    <Switch checked={link.active} onCheckedChange={() => toggleActive(link)} />
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(link)} title={L("تعديل", "Edit")}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-rose-600 hover:text-rose-700" onClick={() => removeLink(link.id)} title={L("حذف", "Delete")}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Card>
    );
  };

  // Bilingual field helper — for the FooterContent editor card
  const BilingualField = ({
    labelAr, labelEn, valueAr, valueEn, onChangeAr, onChangeEn,
    as = "input", rows = 3, placeholderAr = "", placeholderEn = "",
  }: {
    labelAr: string; labelEn: string;
    valueAr: string; valueEn: string;
    onChangeAr: (v: string) => void; onChangeEn: (v: string) => void;
    as?: "input" | "textarea"; rows?: number;
    placeholderAr?: string; placeholderEn?: string;
  }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label className="text-xs flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">AR</span>
          {labelAr}
        </Label>
        {as === "textarea" ? (
          <Textarea
            value={valueAr}
            onChange={(e) => onChangeAr(e.target.value)}
            rows={rows}
            dir="rtl"
            placeholder={placeholderAr}
          />
        ) : (
          <Input value={valueAr} onChange={(e) => onChangeAr(e.target.value)} dir="rtl" placeholder={placeholderAr} className="h-10" />
        )}
      </div>
      <div className="space-y-1">
        <Label className="text-xs flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold">EN</span>
          {labelEn}
        </Label>
        {as === "textarea" ? (
          <Textarea
            value={valueEn}
            onChange={(e) => onChangeEn(e.target.value)}
            rows={rows}
            dir="ltr"
            placeholder={placeholderEn}
          />
        ) : (
          <Input value={valueEn} onChange={(e) => onChangeEn(e.target.value)} dir="ltr" placeholder={placeholderEn} className="h-10" />
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <SectionContentEditor section="footer" />

      {/* Section Context Banner */}
      <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 mb-4">
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          📍 {L("مكان الظهور: ", "Appears at: ")}{L("الفوتر أسفل كل صفحة", "Footer at the bottom of every page")}
        </span>
        <a href="/" target="_blank" className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1">
          {L("عرض في الموقع", "Preview on Site")} ↗
        </a>
      </div>

      {/* Header */}
      <Card className="p-5 bg-gradient-to-l from-primary/10 to-red-700/5 border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-lg shadow-primary/25">
            <Link2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{L("الفوتر والروابط", "Footer & Links")}</h3>
            <p className="text-sm text-muted-foreground">
              {L("أدر نصوص الفوتر وروابط الشركة/الخدمات/الدعم", "Manage footer text and Company/Services/Support links")}
            </p>
          </div>
        </div>
      </Card>

      {/* Footer Content editor (bio, newsletter, dashboard link, address) */}
      <Card className="p-5 sm:p-6 space-y-5 bg-gradient-to-br from-amber-500/5 to-amber-500/0 border-amber-500/20">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <FileText className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h4 className="font-bold">{L("محتوى الفوتر", "Footer Content")}</h4>
              <p className="text-xs text-muted-foreground">
                {L("نبذة الشركة + النشرة البريدية + رابط الدخول + العنوان", "Company bio + newsletter + dashboard link + address")}
              </p>
            </div>
          </div>
          <Button onClick={saveFooterContent} disabled={savingContent || fcLoading}
            className="bg-gradient-to-r from-amber-600 to-amber-700 text-white gap-2">
            {savingContent ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {L("حفظ المحتوى", "Save Content")}
          </Button>
        </div>

        {fcLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-amber-600" /></div>
        ) : (
          <div className="space-y-4">
            <BilingualField
              labelAr={L("نبذة الشركة (عربي)", "Bio (Arabic)")}
              labelEn={L("نبذة الشركة (إنجليزي)", "Bio (English)")}
              valueAr={footerContent.bioAr} valueEn={footerContent.bioEn}
              onChangeAr={(v) => setFooterContent({ ...footerContent, bioAr: v })}
              onChangeEn={(v) => setFooterContent({ ...footerContent, bioEn: v })}
              as="textarea" rows={4}
              placeholderAr="شركة Redline للشحن — شريكك اللوجستي الموثوق في مصر..."
              placeholderEn="Redline Transport — Your trusted logistics partner in Egypt..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-amber-500/15">
              <BilingualField
                labelAr={L("عنوان النشرة (عربي)", "Newsletter title (Arabic)")}
                labelEn={L("عنوان النشرة (إنجليزي)", "Newsletter title (English)")}
                valueAr={footerContent.newsletterTitleAr} valueEn={footerContent.newsletterTitleEn}
                onChangeAr={(v) => setFooterContent({ ...footerContent, newsletterTitleAr: v })}
                onChangeEn={(v) => setFooterContent({ ...footerContent, newsletterTitleEn: v })}
                placeholderAr="النشرة البريدية" placeholderEn="Newsletter"
              />
              <BilingualField
                labelAr={L("وصف النشرة (عربي)", "Newsletter description (Arabic)")}
                labelEn={L("وصف النشرة (إنجليزي)", "Newsletter description (English)")}
                valueAr={footerContent.newsletterDescAr} valueEn={footerContent.newsletterDescEn}
                onChangeAr={(v) => setFooterContent({ ...footerContent, newsletterDescAr: v })}
                onChangeEn={(v) => setFooterContent({ ...footerContent, newsletterDescEn: v })}
                as="textarea" rows={2}
                placeholderAr="اشترك لتصلك آخر العروض والأخبار"
                placeholderEn="Subscribe to get the latest offers and updates."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-amber-500/15">
              <BilingualField
                labelAr={L("نص رابط لوحة التحكم (عربي)", "Dashboard link (Arabic)")}
                labelEn={L("نص رابط لوحة التحكم (إنجليزي)", "Dashboard link (English)")}
                valueAr={footerContent.dashboardLinkAr} valueEn={footerContent.dashboardLinkEn}
                onChangeAr={(v) => setFooterContent({ ...footerContent, dashboardLinkAr: v })}
                onChangeEn={(v) => setFooterContent({ ...footerContent, dashboardLinkEn: v })}
                placeholderAr="دخول لوحة التحكم" placeholderEn="Admin Login"
              />
              <BilingualField
                labelAr={L("العنوان (عربي)", "Address (Arabic)")}
                labelEn={L("العنوان (إنجليزي)", "Address (English)")}
                valueAr={footerContent.addressAr} valueEn={footerContent.addressEn}
                onChangeAr={(v) => setFooterContent({ ...footerContent, addressAr: v })}
                onChangeEn={(v) => setFooterContent({ ...footerContent, addressEn: v })}
                placeholderAr="التجمع الخامس، القاهرة الجديدة"
                placeholderEn="Fifth Settlement, New Cairo"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Switch checked={!!footerContent.active} onCheckedChange={(v) => setFooterContent({ ...footerContent, active: v })} />
                <span>{L("تفعيل الفوتر بالموقع", "Show footer on site")}</span>
              </label>
            </div>
          </div>
        )}
      </Card>

      {/* Footer Links CRUD per category */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-5">
          {renderCategoryCard("company")}
          {renderCategoryCard("services")}
          {renderCategoryCard("support")}
        </div>
      )}

      {/* Add / Edit Link Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {(() => {
                const meta = catMeta(linkForm.category);
                const Icon = meta.icon;
                return <Icon className={`w-5 h-5 ${meta.iconColor}`} />;
              })()}
              {editing
                ? L(`تعديل رابط ${catMeta(linkForm.category).ar}`, `Edit ${catMeta(linkForm.category).en} Link`)
                : L(`إضافة رابط ${catMeta(linkForm.category).ar}`, `Add ${catMeta(linkForm.category).en} Link`)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">AR</span>
                  {L("الاسم (عربي)", "Label (Arabic)")}
                </Label>
                <Input
                  value={linkForm.labelAr}
                  onChange={(e) => setLinkForm({ ...linkForm, labelAr: e.target.value })}
                  placeholder="من نحن"
                  dir="rtl"
                  className="h-10"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold">EN</span>
                  {L("الاسم (إنجليزي)", "Label (English)")}
                </Label>
                <Input
                  value={linkForm.labelEn}
                  onChange={(e) => setLinkForm({ ...linkForm, labelEn: e.target.value })}
                  placeholder="About"
                  dir="ltr"
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{L("الرابط (href)", "Link (href)")}</Label>
              <Input
                value={linkForm.href}
                onChange={(e) => setLinkForm({ ...linkForm, href: e.target.value })}
                placeholder="#services"
                className="h-10 font-mono text-xs"
                dir="ltr"
              />
              <p className="text-[11px] text-muted-foreground">
                {L(
                  "استخدم #معرّف للتمرير لقسم (مثال: #contact) أو رابط URL كامل",
                  "Use #anchor to scroll to a section (e.g. #contact) or a full URL"
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{L("الترتيب", "Order")}</Label>
                <Input
                  type="number"
                  value={linkForm.order}
                  onChange={(e) => setLinkForm({ ...linkForm, order: Number(e.target.value) })}
                  className="h-10"
                  dir="ltr"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Switch checked={!!linkForm.active} onCheckedChange={(v) => setLinkForm({ ...linkForm, active: v })} />
                  <span>{L("نشط", "Active")}</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={saveLink} disabled={saving} className="flex-1 bg-gradient-to-r from-primary to-red-700 text-white gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {editing ? L("حفظ التعديلات", "Save changes") : L("إضافة", "Add")}
              </Button>
              <Button variant="outline" onClick={() => setModalOpen(false)}>{L("إلغاء", "Cancel")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

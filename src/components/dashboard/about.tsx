"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Plus, Trash2, Info, BarChart3, Save, Pencil, Package,
  Truck, MapPin, Users, Boxes, ShieldCheck, Sparkles, Star,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { toast } from "sonner";
import { FileUpload } from "@/components/shared/file-upload";
import { useDashboardT } from "@/lib/i18n";
import { Zap, Headphones, Banknote, MapPinned } from "lucide-react";


type About = {
  id: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  image?: string | null;
};

type SiteStat = {
  id: string;
  label: string;
  labelAr: string;
  value: string;
  icon: string;
  createdAt: string;
};

const ICONS: Record<string, any> = {
  package: Package, truck: Truck, "map-pin": MapPin, users: Users,
  boxes: Boxes, "shield-check": ShieldCheck, sparkles: Sparkles, star: Star,
  "bar-chart-3": BarChart3,
};

const emptyAbout = {
  titleAr: "من نحن",
  titleEn: "About Us",
  subtitleAr: "",
  subtitleEn: "",
  descriptionAr: "",
  descriptionEn: "",
  image: "",
};

const emptyExtra = {
  badgeValue: "+15",
  badgeLabelAr: "سنة من الخبرة",
  badgeLabelEn: "Years of experience",
  image2: "",
  items: [
    { icon: "zap", titleAr: "سرعة فائقة", titleEn: "Ultra-fast", descAr: "توصيل في نفس اليوم داخل القاهرة الكبرى و48-96 ساعة لكل المحافظات", descEn: "Same-day delivery in Greater Cairo and 48-96 hours for all governorates" },
    { icon: "shield", titleAr: "أمان مضمون", titleEn: "Guaranteed safety", descAr: "تأمين كامل على كل شحنة مع تعويض كامل عند أي طارئ", descEn: "Full insurance on every shipment with complete compensation in case of any incident" },
    { icon: "chart", titleAr: "تتبع مباشر", titleEn: "Live tracking", descAr: "نظام تتبع لحظي يخبرك بمكان شحنتك في كل خطوة", descEn: "Real-time tracking system that tells you where your shipment is at every step" },
    { icon: "map", titleAr: "تغطية شاملة", titleEn: "Comprehensive coverage", descAr: "27 محافظة و40+ فرع ومستودع في كل أنحاء مصر", descEn: "27 governorates and 40+ branches and warehouses across Egypt" },
    { icon: "cash", titleAr: "أسعار منافسة", titleEn: "Competitive prices", descAr: "أفضل الأسعار في السوق مع خصومات للكميات والشركات", descEn: "Best market prices with volume and corporate discounts" },
    { icon: "headset", titleAr: "دعم 24/7", titleEn: "24/7 support", descAr: "فريق دعم متكامل على مدار الساعة لخدمتك في أي وقت", descEn: "Integrated support team available around the clock to serve you anytime" },
  ],
};

export function DashboardAbout() {
  const { isAr } = useDashboardT();
  const qc = useQueryClient();
  const L = (ar: string, en: string) => (isAr ? ar : en);

  const [about, setAbout] = useState<any>({ ...emptyAbout });
  const [extra, setExtra] = useState<any>({ ...emptyExtra });
  const [savingAbout, setSavingAbout] = useState(false);
  const [statModalOpen, setStatModalOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<SiteStat | null>(null);
  const [savingStat, setSavingStat] = useState(false);
  const [statForm, setStatForm] = useState<any>({ label: "", labelAr: "", value: "", icon: "package" });

  // Fetch About record (GET /api/about — auto-creates on first call)
  const { data: aboutData, isLoading: aboutLoading } = useQuery({
    queryKey: ["about-content"],
    queryFn: () => apiGet<{ about: About }>("/api/about"),
  });

  useEffect(() => {
    if (aboutData?.about) {
      const a = aboutData.about;
      setAbout({
        titleAr: a.titleAr || "",
        titleEn: a.titleEn || "",
        subtitleAr: a.subtitleAr || "",
        subtitleEn: a.subtitleEn || "",
        descriptionAr: a.descriptionAr || "",
        descriptionEn: a.descriptionEn || "",
              image: a.image || "",
      });
      try {
        const parsed = a.features ? JSON.parse(a.features) : null;
        setExtra({
          ...emptyExtra,
          ...(parsed || {}),
          items: parsed?.items?.length ? parsed.items : emptyExtra.items,
        });
      } catch {
        setExtra({ ...emptyExtra });
      }
    }
  }, [aboutData]);

  // Fetch SiteStat records (from /api/site which includes `stats`)
  const { data: siteData, isLoading: statsLoading } = useQuery({
    queryKey: ["site-data"],
    queryFn: () => apiGet<{ stats: SiteStat[] }>("/api/site"),
  });
  const stats = siteData?.stats ?? [];

  const saveAbout = async () => {
    setSavingAbout(true);
    try {
      await apiPost("/api/about", {
        titleAr: about.titleAr || "من نحن",
        titleEn: about.titleEn || "About Us",
        subtitleAr: about.subtitleAr || "",
        subtitleEn: about.subtitleEn || "",
        descriptionAr: about.descriptionAr || "",
        descriptionEn: about.descriptionEn || "",
               image: about.image || null,
        features: JSON.stringify(extra),
      });
      qc.invalidateQueries({ queryKey: ["about-content"] });
      qc.invalidateQueries({ queryKey: ["site-data"] });
    } catch (e: any) {
      toast.error(e.message || L("خطأ", "Error"));
    } finally {
      setSavingAbout(false);
    }
  };

  const openCreateStat = () => {
    setEditingStat(null);
    setStatForm({ label: "", labelAr: "", value: "", icon: "package" });
    setStatModalOpen(true);
  };

  const openEditStat = (s: SiteStat) => {
    setEditingStat(s);
    setStatForm({ label: s.label, labelAr: s.labelAr || "", value: s.value, icon: s.icon || "package" });
    setStatModalOpen(true);
  };

  const saveStat = async () => {
    if (!statForm.label) { toast.error(L("الوصف مطلوب", "Label is required")); return; }
    if (statForm.value === "" || statForm.value === null) {
      toast.error(L("القيمة مطلوبة", "Value is required")); return;
    }
    setSavingStat(true);
    try {
      if (editingStat) {
        await apiPatch(`/api/stats/${editingStat.id}`, {
          label: statForm.label, labelAr: statForm.labelAr || "", value: statForm.value, icon: statForm.icon || "package",
        });
        toast.success(L("تم تحديث المؤشر", "Metric updated"));
      } else {
        await apiPost("/api/stats", {
          label: statForm.label, labelAr: statForm.labelAr || "", value: statForm.value, icon: statForm.icon || "package",
        });
        toast.success(L("تمت إضافة المؤشر", "Metric added"));
      }
      setStatModalOpen(false);
      qc.invalidateQueries({ queryKey: ["site-data"] });
    } catch (e: any) {
      toast.error(e.message || L("خطأ", "Error"));
    } finally {
      setSavingStat(false);
    }
  };

  const removeStat = async (id: string) => {
    if (!confirm(L("حذف هذا المؤشر؟", "Delete this metric?"))) return;
    try {
      await apiDelete(`/api/stats/${id}`);
      toast.success(L("تم الحذف", "Deleted"));
      qc.invalidateQueries({ queryKey: ["site-data"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const renderIcon = (iconName: string, className: string) => {
    const Icon = ICONS[iconName] || Package;
    return <Icon className={className} />;
  };

  return (
    <div className="space-y-5">
      {/* Section Context Banner */}
      <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 mb-4">
        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          📍 {L("مكان الظهور: ", "Appears at: ")}{L("قسم من نحن والإحصائيات", "About Us & Statistics section")}
        </span>
        <a href="/#about" target="_blank" className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1">
          {L("عرض في الموقع", "Preview on Site")} ↗
        </a>
      </div>

      {/* Header */}
      <Card className="p-5 bg-gradient-to-l from-primary/10 to-red-700/5 border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-lg shadow-primary/25">
            <Info className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{L("من نحن والإحصائيات", "About Us & Metrics")}</h3>
            <p className="text-sm text-muted-foreground">
              {L("أدر محتوى قسم من نحن + المؤشرات والإحصائيات المعروضة بالموقع", "Manage About Us content + the metrics shown on the site")}
            </p>
          </div>
        </div>
      </Card>

      {/* Section 1: About Content */}
      <Card className="p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Info className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-bold">{L("محتوى قسم من نحن", "About Content")}</h4>
              <p className="text-xs text-muted-foreground">{L("الحقول ثنائية اللغة — العربي والإنجليزي جنباً إلى جنب", "Bilingual fields — Arabic and English side by side")}</p>
            </div>
          </div>
          <Button onClick={saveAbout} disabled={savingAbout || aboutLoading}
            className="bg-gradient-to-r from-primary to-red-700 text-white gap-2">
            {savingAbout ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {L("حفظ المحتوى", "Save content")}
          </Button>
        </div>

        {aboutLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-4">
            {/* Title AR | EN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">AR</span>
                  {L("العنوان (عربي)", "Title (Arabic)")}
                </Label>
                <Input
                  value={about.titleAr}
                  onChange={(e) => setAbout({ ...about, titleAr: e.target.value })}
                  placeholder="من نحن"
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
                  value={about.titleEn}
                  onChange={(e) => setAbout({ ...about, titleEn: e.target.value })}
                  placeholder="About Us"
                  dir="ltr"
                  className="h-10"
                />
              </div>
            </div>

            {/* Subtitle AR | EN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">AR</span>
                  {L("العنوان الفرعي (عربي)", "Subtitle (Arabic)")}
                </Label>
                <Input
                  value={about.subtitleAr}
                  onChange={(e) => setAbout({ ...about, subtitleAr: e.target.value })}
                  placeholder="Redline — عصب الشحن في مصر"
                  dir="rtl"
                  className="h-10"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold">EN</span>
                  {L("العنوان الفرعي (إنجليزي)", "Subtitle (English)")}
                </Label>
                <Input
                  value={about.subtitleEn}
                  onChange={(e) => setAbout({ ...about, subtitleEn: e.target.value })}
                  placeholder="Redline — Egypt's shipping backbone"
                  dir="ltr"
                  className="h-10"
                />
              </div>
            </div>

            {/* Description AR | EN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">AR</span>
                  {L("الوصف (عربي)", "Description (Arabic)")}
                </Label>
                <Textarea
                  value={about.descriptionAr}
                  onChange={(e) => setAbout({ ...about, descriptionAr: e.target.value })}
                  rows={5}
                  dir="rtl"
                  placeholder="منذ أكثر من 15 عاماً، نبني Redline..."
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold">EN</span>
                  {L("الوصف (إنجليزي)", "Description (English)")}
                </Label>
                <Textarea
                  value={about.descriptionEn}
                  onChange={(e) => setAbout({ ...about, descriptionEn: e.target.value })}
                  rows={5}
                  dir="ltr"
                  placeholder="For over 15 years, we've built Redline..."
                />
              </div>
            </div>

            {/* Image upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <FileUpload
                  label={L("صورة قسم من نحن", "About section image")}
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  currentUrl={about.image}
                  onUploaded={(url) => setAbout({ ...about, image: url })}
                  type="image"
                />
              </div>
            </div>

                       {about.image && (
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="relative aspect-[4/3] bg-muted max-h-64">
                  <img src={about.image} alt="about" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* Years badge */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="space-y-1">
                <Label className="text-xs">{L("رقم الشارة", "Badge value")}</Label>
                <Input value={extra.badgeValue} dir="ltr" className="h-10" placeholder="+15"
                  onChange={(e) => setExtra({ ...extra, badgeValue: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{L("نص الشارة (عربي)", "Badge label (Arabic)")}</Label>
                <Input value={extra.badgeLabelAr} dir="rtl" className="h-10"
                  onChange={(e) => setExtra({ ...extra, badgeLabelAr: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{L("نص الشارة (إنجليزي)", "Badge label (English)")}</Label>
                <Input value={extra.badgeLabelEn} dir="ltr" className="h-10"
                  onChange={(e) => setExtra({ ...extra, badgeLabelEn: e.target.value })} />
              </div>
            </div>

            {/* Small overlay image */}
            <FileUpload
              label={L("الصورة الصغيرة (غرفة العمليات)", "Small overlay image")}
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              currentUrl={extra.image2}
              onUploaded={(url) => setExtra({ ...extra, image2: url })}
              type="image"
            />

            {/* Features editor */}
            <div className="space-y-3 pt-2">
              <h5 className="font-bold text-sm">{L("المميزات", "Features")}</h5>
              {extra.items.map((it: any, i: number) => (
                <div key={i} className="rounded-xl border border-border p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input value={it.titleAr} dir="rtl" className="h-9" placeholder={L("العنوان (عربي)", "Title (Arabic)")}
                      onChange={(e) => { const items = [...extra.items]; items[i] = { ...it, titleAr: e.target.value }; setExtra({ ...extra, items }); }} />
                    <Input value={it.titleEn} dir="ltr" className="h-9" placeholder="Title (English)"
                      onChange={(e) => { const items = [...extra.items]; items[i] = { ...it, titleEn: e.target.value }; setExtra({ ...extra, items }); }} />
                    <Input value={it.descAr} dir="rtl" className="h-9" placeholder={L("الوصف (عربي)", "Description (Arabic)")}
                      onChange={(e) => { const items = [...extra.items]; items[i] = { ...it, descAr: e.target.value }; setExtra({ ...extra, items }); }} />
                    <Input value={it.descEn} dir="ltr" className="h-9" placeholder="Description (English)"
                      onChange={(e) => { const items = [...extra.items]; items[i] = { ...it, descEn: e.target.value }; setExtra({ ...extra, items }); }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Section 2: Metrics / Counters */}
      <Card className="p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h4 className="font-bold">{L("المؤشرات والإحصائيات", "Metrics / Counters")}</h4>
              <p className="text-xs text-muted-foreground">{L("الأرقام المعروضة في شريط الإحصائيات بالموقع", "Numbers shown in the stats bar on the site")}</p>
            </div>
          </div>
          <Button onClick={openCreateStat}
            className="bg-gradient-to-r from-primary to-red-700 text-white gap-2">
            <Plus className="w-4 h-4" /> {L("إضافة مؤشر", "Add metric")}
          </Button>
        </div>

        {statsLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : stats.length === 0 ? (
          <div className="p-10 text-center border-2 border-dashed border-border rounded-xl">
            <BarChart3 className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
            <p className="font-semibold text-sm">{L("لا توجد مؤشرات بعد", "No metrics yet")}</p>
            <p className="text-xs text-muted-foreground mt-1">{L("اضغط \"إضافة مؤشر\" لإنشاء أول إحصائية", "Click \"Add metric\" to create the first stat")}</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {stats.map((s, i) => (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="p-4 hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-amber-500/10 flex items-center justify-center shrink-0">
                        {renderIcon(s.icon, "w-5 h-5 text-primary")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-2xl font-black text-gradient-red tabular-nums leading-none">
                          {s.value}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 truncate" dir="rtl">
                          {s.labelAr || s.label}
                        </div>
                        {s.labelAr && (
                          <div className="text-[10px] text-muted-foreground/70 mt-0.5 flex items-center gap-1" dir="ltr">
                            <span className="px-1 py-0 rounded bg-blue-500/10 text-blue-600 text-[9px] font-bold">EN</span>
                            <span className="truncate">{s.label}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1.5 mt-3 pt-3 border-t border-border/40">
                      <Button variant="outline" size="sm" className="h-8 flex-1 gap-1" onClick={() => openEditStat(s)}>
                        <Pencil className="w-3.5 h-3.5" /> {L("تعديل", "Edit")}
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-rose-600 hover:text-rose-700"
                        onClick={() => removeStat(s.id)} title={L("حذف", "Delete")}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Card>

      {/* Add / Edit Stat Modal */}
      <Dialog open={statModalOpen} onOpenChange={setStatModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              {editingStat ? L("تعديل المؤشر", "Edit metric") : L("إضافة مؤشر", "Add metric")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs">{L("القيمة (الرقم المعروض)", "Value (displayed number)")}</Label>
              <Input
                value={statForm.value}
                onChange={(e) => setStatForm({ ...statForm, value: e.target.value })}
                placeholder="+15 / 27 / 5000 / 99.5%"
                className="h-10"
                dir="ltr"
              />
            </div>

            {/* Bilingual labels AR | EN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">AR</span>
                  {L("الوصف (عربي)", "Label (Arabic)")}
                </Label>
                <Input
                  value={statForm.labelAr || ""}
                  onChange={(e) => setStatForm({ ...statForm, labelAr: e.target.value })}
                  placeholder={L("مثال: سنة خبرة / محافظة", "E.g. years / governorates")}
                  dir="rtl"
                  className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold">EN</span>
                  {L("الوصف (إنجليزي)", "Label (English)")}
                </Label>
                <Input
                  value={statForm.label}
                  onChange={(e) => setStatForm({ ...statForm, label: e.target.value })}
                  placeholder={L("مثال: years / governorates / clients", "E.g. years / governorates / clients")}
                  dir="ltr"
                  className="h-10 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">{L("الأيقونة (lucide name)", "Icon (lucide name)")}</Label>
              <Input
                value={statForm.icon}
                onChange={(e) => setStatForm({ ...statForm, icon: e.target.value })}
                placeholder="package / truck / users / star"
                className="h-10"
                dir="ltr"
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {Object.keys(ICONS).map((name) => {
                  const Icon = ICONS[name];
                  const isActive = statForm.icon === name;
                  return (
                    <button
                      key={name}
                      onClick={() => setStatForm({ ...statForm, icon: name })}
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
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={saveStat} disabled={savingStat} className="flex-1 bg-gradient-to-r from-primary to-red-700 text-white gap-2">
                {savingStat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {editingStat ? L("حفظ التعديلات", "Save changes") : L("إضافة المؤشر", "Add metric")}
              </Button>
              <Button variant="outline" onClick={() => setStatModalOpen(false)}>{L("إلغاء", "Cancel")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

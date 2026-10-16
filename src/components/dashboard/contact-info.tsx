"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Plus, Trash2, Phone, Mail, MapPin, Pencil, MessageCircle,
  Save, MapPinned, ExternalLink,
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

type ContactInfo = {
  id: string;
  type: "address" | "phone" | "email";
  labelAr: string;
  labelEn: string;
  value: string;
  href: string | null;
  order: number;
  active: boolean;
  createdAt: string;
};

type WhatsAppSetting = {
  id: string;
  phoneNumber: string;
  defaultMessageAr: string;
  defaultMessageEn: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

const TYPES = [
  { id: "address" as const, ar: "عنوان", en: "Address", icon: MapPin, color: "from-emerald-500/15 to-emerald-500/5", iconColor: "text-emerald-600", accent: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  { id: "phone" as const, ar: "رقم هاتف", en: "Phone Number", icon: Phone, color: "from-blue-500/15 to-blue-500/5", iconColor: "text-blue-600", accent: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  { id: "email" as const, ar: "بريد إلكتروني", en: "Email", icon: Mail, color: "from-amber-500/15 to-amber-500/5", iconColor: "text-amber-600", accent: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
];

const typeMeta = (t: string) => TYPES.find((x) => x.id === t) ?? TYPES[0];

const emptyContactForm = {
  type: "address" as const,
  labelAr: "", labelEn: "", value: "", href: "", order: 0, active: true,
};

export function DashboardContactInfo() {
  const { isAr } = useDashboardT();
  const qc = useQueryClient();
  const L = (ar: string, en: string) => (isAr ? ar : en);

  // ContactInfo CRUD state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ContactInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [contactForm, setContactForm] = useState<any>({ ...emptyContactForm });

  // WhatsApp settings state
  const [whatsapp, setWhatsapp] = useState<any>({
    phoneNumber: "", defaultMessageAr: "", defaultMessageEn: "", active: true,
  });
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);

  // Fetch contact info list
  const { data, isLoading } = useQuery({
    queryKey: ["contact-info-admin"],
    queryFn: () => apiGet<{ items: ContactInfo[] }>("/api/contact-info?all=1"),
  });
  const items = data?.items ?? [];
  const addresses = items.filter((i) => i.type === "address");
  const phones = items.filter((i) => i.type === "phone");
  const emails = items.filter((i) => i.type === "email");

  // Fetch WhatsApp settings
  const { data: waData, isLoading: waLoading } = useQuery({
    queryKey: ["whatsapp-settings"],
    queryFn: () => apiGet<{ setting: WhatsAppSetting }>("/api/whatsapp-settings"),
  });

  // Sync WhatsApp state with fetched data once loaded
  useEffect(() => {
    if (waData?.setting) {
      const s = waData.setting;
      setWhatsapp({
        phoneNumber: s.phoneNumber || "",
        defaultMessageAr: s.defaultMessageAr || "",
        defaultMessageEn: s.defaultMessageEn || "",
        active: s.active,
      });
    }
  }, [waData]);

  const openCreate = (type: "address" | "phone" | "email") => {
    setEditing(null);
    const nextOrder = items.filter((i) => i.type === type).length;
    setContactForm({ ...emptyContactForm, type, order: nextOrder });
    setModalOpen(true);
  };

  const openEdit = (item: ContactInfo) => {
    setEditing(item);
    setContactForm({
      type: item.type,
      labelAr: item.labelAr, labelEn: item.labelEn,
      value: item.value, href: item.href || "",
      order: item.order ?? 0, active: item.active,
    });
    setModalOpen(true);
  };

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["contact-info-admin"] });
    qc.invalidateQueries({ queryKey: ["whatsapp-settings"] });
    qc.invalidateQueries({ queryKey: ["site-data"] });
    qc.invalidateQueries({ queryKey: ["site"] });
  };

  const saveContact = async () => {
    if (!contactForm.labelAr || !contactForm.labelEn) {
      toast.error(L("الوصف بالعربي والإنجليزي مطلوب", "Both Arabic and English labels are required"));
      return;
    }
    if (!contactForm.value) {
      toast.error(L("القيمة مطلوبة", "Value is required"));
      return;
    }
    setSaving(true);
    try {
      // Auto-build href if empty
      let href = contactForm.href;
      if (!href) {
        if (contactForm.type === "phone") href = `tel:${contactForm.value.replace(/\s+/g, "")}`;
        else if (contactForm.type === "email") href = `mailto:${contactForm.value.trim()}`;
      }
      const payload = {
        type: contactForm.type,
        labelAr: contactForm.labelAr,
        labelEn: contactForm.labelEn,
        value: contactForm.value,
        href: href || null,
        order: Number(contactForm.order) || 0,
        active: !!contactForm.active,
      };
      if (editing) {
        await apiPatch(`/api/contact-info/${editing.id}`, payload);
        toast.success(L("تم تحديث العنصر", "Item updated"));
      } else {
        await apiPost("/api/contact-info", payload);
        toast.success(L("تمت الإضافة", "Item added"));
      }
      setModalOpen(false);
      invalidate();
    } catch (e: any) {
      toast.error(e.message || L("خطأ", "Error"));
    } finally {
      setSaving(false);
    }
  };

  const removeContact = async (id: string) => {
    if (!confirm(L("حذف هذا العنصر؟", "Delete this item?"))) return;
    try {
      await apiDelete(`/api/contact-info/${id}`);
      toast.success(L("تم الحذف", "Deleted"));
      invalidate();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const toggleContactActive = async (item: ContactInfo) => {
    try {
      await apiPatch(`/api/contact-info/${item.id}`, { active: !item.active });
      invalidate();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const saveWhatsapp = async () => {
    if (!whatsapp.phoneNumber) {
      toast.error(L("رقم الواتساب مطلوب", "WhatsApp number is required"));
      return;
    }
    setSavingWhatsapp(true);
    try {
      await apiPost("/api/whatsapp-settings", {
        phoneNumber: whatsapp.phoneNumber,
        defaultMessageAr: whatsapp.defaultMessageAr || "مرحباً، أريد الاستفسار عن خدمات الشحن",
        defaultMessageEn: whatsapp.defaultMessageEn || "Hello, I'd like to inquire about shipping services",
        active: !!whatsapp.active,
      });
      toast.success(L("تم حفظ إعدادات الواتساب", "WhatsApp settings saved"));
      invalidate();
    } catch (e: any) {
      toast.error(e.message || L("خطأ", "Error"));
    } finally {
      setSavingWhatsapp(false);
    }
  };

  // Render a single contact section (address / phone / email)
  const renderSection = (type: "address" | "phone" | "email") => {
    const meta = typeMeta(type);
    const Icon = meta.icon;
    const list = type === "address" ? addresses : type === "phone" ? phones : emails;
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
                  type === "address" ? "عناوين المكاتب والمراكز" : type === "phone" ? "أرقام التواصل الهاتفي" : "عناوين البريد الإلكتروني",
                  type === "address" ? "Office and center addresses" : type === "phone" ? "Phone contact numbers" : "Email addresses"
                )}
              </p>
            </div>
          </div>
          <Button onClick={() => openCreate(type)} size="sm"
            className="bg-gradient-to-r from-primary to-red-700 text-white gap-2 h-9">
            <Plus className="w-3.5 h-3.5" /> {L("إضافة", "Add")}
          </Button>
        </div>

        {list.length === 0 ? (
          <div className="p-6 text-center border-2 border-dashed border-border rounded-xl">
            <Icon className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">{L("لا توجد عناصر بعد", "No items yet")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {list.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={`flex items-start gap-3 rounded-xl border border-border p-3 hover:shadow-sm transition-all ${!item.active ? "opacity-60" : ""}`}
                >
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${meta.color} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${meta.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <div className="font-semibold text-sm" dir="rtl">{item.labelAr}</div>
                      <div className="text-xs text-muted-foreground" dir="ltr">{item.labelEn}</div>
                    </div>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1 mt-0.5 truncate"
                        dir="ltr"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{item.value}</span>
                      </a>
                    ) : (
                      <div className="text-sm text-foreground/80 mt-0.5" dir="ltr">{item.value}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Switch checked={item.active} onCheckedChange={() => toggleContactActive(item)} />
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(item)} title={L("تعديل", "Edit")}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-rose-600 hover:text-rose-700" onClick={() => removeContact(item.id)} title={L("حذف", "Delete")}>
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

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card className="p-5 bg-gradient-to-l from-primary/10 to-red-700/5 border-primary/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-lg shadow-primary/25">
            <MapPinned className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{L("معلومات التواصل والواتساب", "Contact Info & WhatsApp")}</h3>
            <p className="text-sm text-muted-foreground">
              {L("أدر العناوين وأرقام الهاتف والبريد وإعدادات الواتساب", "Manage addresses, phones, emails and WhatsApp settings")}
            </p>
          </div>
        </div>
      </Card>

      {/* Sections */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <>
          {renderSection("address")}
          {renderSection("phone")}
          {renderSection("email")}
        </>
      )}

      {/* WhatsApp Settings */}
      <Card className="p-5 sm:p-6 space-y-5 bg-gradient-to-br from-emerald-500/5 to-emerald-700/0 border-emerald-500/20">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold">{L("إعدادات الواتساب", "WhatsApp Settings")}</h4>
              <p className="text-xs text-muted-foreground">
                {L("رقم الواتساب + الرسالة الافتراضية ثنائية اللغة", "WhatsApp number + bilingual default message")}
              </p>
            </div>
          </div>
          <Button onClick={saveWhatsapp} disabled={savingWhatsapp || waLoading}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white gap-2">
            {savingWhatsapp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {L("حفظ الإعدادات", "Save settings")}
          </Button>
        </div>

        {waLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-emerald-600" /></div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 text-[10px] font-bold">EN/AR</span>
                {L("رقم الواتساب (بصيغة دولية بدون +)", "WhatsApp number (international format, no +)")}
              </Label>
              <Input
                value={whatsapp.phoneNumber}
                onChange={(e) => setWhatsapp({ ...whatsapp, phoneNumber: e.target.value })}
                placeholder="201000000000"
                className="h-10 font-mono"
                dir="ltr"
              />
              <p className="text-[11px] text-muted-foreground">
                {L("مثال: 201000000000 — صيغة دولية كاملة بدون رمز + أو مسافات", "Example: 201000000000 — full international format without + or spaces")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">AR</span>
                  {L("الرسالة الافتراضية (عربي)", "Default message (Arabic)")}
                </Label>
                <Textarea
                  value={whatsapp.defaultMessageAr}
                  onChange={(e) => setWhatsapp({ ...whatsapp, defaultMessageAr: e.target.value })}
                  rows={3}
                  dir="rtl"
                  placeholder="مرحباً، أريد الاستفسار عن خدمات الشحن"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold">EN</span>
                  {L("الرسالة الافتراضية (إنجليزي)", "Default message (English)")}
                </Label>
                <Textarea
                  value={whatsapp.defaultMessageEn}
                  onChange={(e) => setWhatsapp({ ...whatsapp, defaultMessageEn: e.target.value })}
                  rows={3}
                  dir="ltr"
                  placeholder="Hello, I'd like to inquire about shipping services"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Switch checked={!!whatsapp.active} onCheckedChange={(v) => setWhatsapp({ ...whatsapp, active: v })} />
                <span>{L("تفعيل زر الواتساب العائم بالموقع", "Enable floating WhatsApp button on site")}</span>
              </label>
            </div>

            {/* Live preview link */}
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <div className="text-[11px] text-muted-foreground mb-1">{L("معاينة الرابط:", "Link preview:")}</div>
              <a
                href={`https://wa.me/${whatsapp.phoneNumber?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsapp.defaultMessageAr || "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-emerald-700 dark:text-emerald-400 hover:underline break-all font-mono"
                dir="ltr"
              >
                https://wa.me/{whatsapp.phoneNumber?.replace(/[^0-9]/g, "") || "..."}
              </a>
            </div>
          </div>
        )}
      </Card>

      {/* Add / Edit Contact Item Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {(() => {
                const meta = typeMeta(contactForm.type);
                const Icon = meta.icon;
                return <Icon className={`w-5 h-5 ${meta.iconColor}`} />;
              })()}
              {editing
                ? L(`تعديل ${typeMeta(contactForm.type).ar}`, `Edit ${typeMeta(contactForm.type).en}`)
                : L(`إضافة ${typeMeta(contactForm.type).ar}`, `Add ${typeMeta(contactForm.type).en}`)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">AR</span>
                  {L("الوصف (عربي)", "Label (Arabic)")}
                </Label>
                <Input
                  value={contactForm.labelAr}
                  onChange={(e) => setContactForm({ ...contactForm, labelAr: e.target.value })}
                  placeholder={
                    contactForm.type === "address"
                      ? "المقر الرئيسي"
                      : contactForm.type === "phone"
                      ? "خدمة العملاء"
                      : "الاستفسارات"
                  }
                  dir="rtl"
                  className="h-10"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold">EN</span>
                  {L("الوصف (إنجليزي)", "Label (English)")}
                </Label>
                <Input
                  value={contactForm.labelEn}
                  onChange={(e) => setContactForm({ ...contactForm, labelEn: e.target.value })}
                  placeholder={
                    contactForm.type === "address"
                      ? "Headquarters"
                      : contactForm.type === "phone"
                      ? "Customer Service"
                      : "Inquiries"
                  }
                  dir="ltr"
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">
                {contactForm.type === "address"
                  ? L("العنوان الكامل", "Full address")
                  : contactForm.type === "phone"
                  ? L("رقم الهاتف", "Phone number")
                  : L("البريد الإلكتروني", "Email")}
              </Label>
              <Textarea
                value={contactForm.value}
                onChange={(e) => setContactForm({ ...contactForm, value: e.target.value })}
                rows={contactForm.type === "address" ? 3 : 2}
                dir={contactForm.type === "address" ? "rtl" : "ltr"}
                placeholder={
                  contactForm.type === "address"
                    ? "شارع التحرير، وسط البلد، القاهرة"
                    : contactForm.type === "phone"
                    ? "+20 100 000 0000"
                    : "info@redline.eg"
                }
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">
                {L("رابط مخصص (اختياري — يُولّد تلقائياً للهاتف/البريد إذا تُرك فارغاً)", "Custom link (optional — auto-generated for phone/email if empty)")}
              </Label>
              <Input
                value={contactForm.href}
                onChange={(e) => setContactForm({ ...contactForm, href: e.target.value })}
                placeholder={
                  contactForm.type === "phone"
                    ? "tel:+201000000000"
                    : contactForm.type === "email"
                    ? "mailto:info@redline.eg"
                    : "https://maps.google.com/?q=..."
                }
                className="h-10 font-mono text-xs"
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{L("الترتيب", "Order")}</Label>
                <Input
                  type="number"
                  value={contactForm.order}
                  onChange={(e) => setContactForm({ ...contactForm, order: Number(e.target.value) })}
                  className="h-10"
                  dir="ltr"
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Switch checked={!!contactForm.active} onCheckedChange={(v) => setContactForm({ ...contactForm, active: v })} />
                  <span>{L("نشطة", "Active")}</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={saveContact} disabled={saving} className="flex-1 bg-gradient-to-r from-primary to-red-700 text-white gap-2">
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

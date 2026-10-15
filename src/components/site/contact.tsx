"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, Loader2, MessageSquare, User, AtSign, Tag, MessageCircle, ShieldCheck, Zap } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";
import { SectionHeading } from "@/components/shared/section-heading";

// Multi-entry contact data structure (departmental labels + values)
const ADDRESSES = [
  { labelKey: "contact.addrHQ", valueKey: "contact.addrHQVal" },
  { labelKey: "contact.addrDist", valueKey: "contact.addrDistVal" },
];
const PHONES = [
  { labelKey: "contact.phoneHotline", valueKey: "contact.phoneHotlineVal", href: "tel:19999" },
  { labelKey: "contact.phoneCust", valueKey: "contact.phoneCustVal", href: "tel:+201000000000" },
  { labelKey: "contact.phoneCorp", valueKey: "contact.phoneCorpVal", href: "tel:+201100000000" },
];
const EMAILS = [
  { labelKey: "contact.emailSupport", valueKey: "contact.emailSupportVal", href: "mailto:support@redline.eg" },
  { labelKey: "contact.emailSales", valueKey: "contact.emailSalesVal", href: "mailto:sales@redline.eg" },
  { labelKey: "contact.emailGeneral", valueKey: "contact.emailGeneralVal", href: "mailto:info@redline.eg" },
];

const INFO_SECTIONS = [
  { icon: MapPin, titleKey: "contact.address", entries: ADDRESSES, type: "address" as const },
  { icon: Phone, titleKey: "contact.phoneLabel", entries: PHONES, type: "link" as const },
  { icon: Mail, titleKey: "contact.emailLabel", entries: EMAILS, type: "link" as const },
];

export function Contact() {
  const { t, isAr } = useT();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = isAr ? "الاسم مطلوب" : "Name is required";
    if (!form.email.trim()) e.email = isAr ? "البريد مطلوب" : "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = isAr ? "بريد غير صحيح" : "Invalid email";
    if (!form.message.trim()) e.message = isAr ? "الرسالة مطلوبة" : "Message is required";
    else if (form.message.trim().length < 10) e.message = isAr ? "الرسالة قصيرة جداً" : "Message is too short";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) { toast.error(isAr ? "راجع البيانات" : "Please review your input"); return; }
    setLoading(true);
    try {
      await apiPost("/api/contact", form);
      toast.success(isAr ? "تم استلام رسالتك! سنتواصل معك قريباً." : "Your message has been received! We'll contact you soon.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (e: any) {
      toast.error(e.message || (isAr ? "خطأ في الإرسال" : "Error sending message"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-14 sm:py-24 lg:py-28 relative overflow-hidden">
      {/* Subtle background accents */}
      <div className="absolute top-1/3 start-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 end-0 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeading
          eyebrow={t("contact.eyebrow")}
          title={t("contact.title")}
          subtitle={t("contact.subtitle")}
        />

        <div className="max-w-5xl mx-auto flex flex-col gap-6">
          {/* ============ FORM SECTION ============ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-elevated overflow-hidden"
          >
            {/* Top gradient accent bar */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-red-600 to-amber-500" />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/15 to-amber-500/10 flex items-center justify-center icon-gold-ring">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold">{t("contact.formTitle")}</h3>
                <p className="text-xs text-muted-foreground">{isAr ? "نرد على رسالتك خلال 24 ساعة" : "We respond within 24 hours"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field 1: Name (with icon) */}
              <div className="flex flex-col gap-1.5 text-start">
                <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  {t("contact.name")} *
                </Label>
                <div className="relative">
                  <Input
                    value={form.name}
                    onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }); }}
                    placeholder={isAr ? "اسمك الكامل" : "Your full name"}
                    className={`h-12 ps-10 text-start placeholder:text-start transition-all focus-visible:ring-primary/30 ${errors.name ? "border-destructive" : ""}`}
                  />
                  <User className="absolute top-1/2 -translate-y-1/2 start-3.5 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                </div>
                {errors.name && <p className="text-xs text-destructive text-start">{errors.name}</p>}
              </div>

              {/* Field 2: Email (with icon) */}
              <div className="flex flex-col gap-1.5 text-start">
                <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1">
                  <AtSign className="w-3.5 h-3.5 text-muted-foreground" />
                  {t("contact.email")} *
                </Label>
                <div className="relative">
                  <Input
                    type="email"
                    inputMode="email"
                    value={form.email}
                    onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
                    placeholder="email@example.com"
                    className={`h-12 ps-10 text-start placeholder:text-start transition-all focus-visible:ring-primary/30 ${errors.email ? "border-destructive" : ""}`}
                  />
                  <Mail className="absolute top-1/2 -translate-y-1/2 start-3.5 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                </div>
                {errors.email && <p className="text-xs text-destructive text-start">{errors.email}</p>}
              </div>

              {/* Field 3: Phone (with icon) */}
              <div className="flex flex-col gap-1.5 text-start">
                <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  {t("contact.phone")}
                </Label>
                <div className="relative">
                  <Input
                    type="tel"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="01XXXXXXXXX"
                    className="h-12 ps-10 text-start placeholder:text-start transition-all focus-visible:ring-primary/30"
                    dir="ltr"
                  />
                  <Phone className="absolute top-1/2 -translate-y-1/2 start-3.5 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                </div>
              </div>

              {/* Field 4: Subject (with icon) */}
              <div className="flex flex-col gap-1.5 text-start">
                <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                  {t("contact.subject")}
                </Label>
                <div className="relative">
                  <Input
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder={isAr ? "موضوع الرسالة" : "Message subject"}
                    className="h-12 ps-10 text-start placeholder:text-start transition-all focus-visible:ring-primary/30"
                  />
                  <Tag className="absolute top-1/2 -translate-y-1/2 start-3.5 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                </div>
              </div>

              {/* Field 5: Message (with icon, full width) */}
              <div className="flex flex-col gap-1.5 text-start sm:col-span-2">
                <Label className="text-xs sm:text-sm font-semibold flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />
                  {t("contact.message")} *
                </Label>
                <Textarea
                  value={form.message}
                  onChange={(e) => { setForm({ ...form, message: e.target.value }); setErrors({ ...errors, message: "" }); }}
                  placeholder={isAr ? "اكتب رسالتك هنا..." : "Write your message here..."}
                  rows={4}
                  className={`ps-10 pt-3 text-start placeholder:text-start transition-all focus-visible:ring-primary/30 ${errors.message ? "border-destructive" : ""}`}
                />
                {errors.message && <p className="text-xs text-destructive text-start">{errors.message}</p>}
              </div>
            </div>

            {/* Submit + trust signal */}
            <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
              <Button
                onClick={submit}
                disabled={loading}
                className="group btn-glow w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white gap-2 text-base font-semibold rounded-xl shadow-lg shadow-primary/30"
              >
                {loading
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <Send className={`w-5 h-5 transition-transform ${isAr ? "-scale-x-100 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />}
                {t("contact.submit")}
              </Button>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                {isAr ? "بياناتك آمنة ومحمية" : "Your data is safe & protected"}
              </div>
            </div>
          </motion.div>

          {/* ============ CONTACT INFO SECTION ============ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl bg-gradient-to-br from-primary via-red-700 to-red-900 p-7 text-white relative overflow-hidden shadow-2xl shadow-primary/20"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 end-0 w-56 h-56 bg-white/10 rounded-full blur-3xl animate-aurora" />
            <div className="absolute bottom-0 start-0 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl" />
            <div className="absolute inset-0 noise opacity-20" />
            {/* Top accent bar */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

            <div className="relative">
              {/* Logo + heading + quick actions */}
              <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                <div>
                  <Image
                    src="/redline-transport-white.png"
                    alt="RedLine Transport"
                    width={1200}
                    height={514}
                    className="h-8 w-auto max-w-none object-contain mb-3"
                  />
                  <h3 className="text-xl font-bold mb-1">{t("contact.direct")}</h3>
                  <p className="text-white/70 text-xs leading-relaxed max-w-md">{t("contact.directDesc")}</p>
                </div>
                {/* Quick action buttons */}
                <div className="flex gap-2">
                  <a href="tel:19999" className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all hover:scale-110" aria-label="Call">
                    <Phone className="w-4 h-4" />
                  </a>
                  <a href="https://wa.me/201000000000" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/15 hover:bg-emerald-400/30 flex items-center justify-center transition-all hover:scale-110" aria-label="WhatsApp">
                    <FaWhatsapp className="w-4 h-4" />
                  </a>
                  <a href="mailto:info@redline.eg" className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all hover:scale-110" aria-label="Email">
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Horizontal sections grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {INFO_SECTIONS.map((section, si) => {
                  const Icon = section.icon;
                  return (
                    <motion.div
                      key={si}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.15 + si * 0.05 }}
                      className="group bg-white/5 hover:bg-white/10 rounded-2xl p-4 border border-white/10 transition-all hover:scale-[1.02] hover:border-white/20"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center shrink-0 group-hover:from-amber-400/30 group-hover:to-amber-500/10 transition-all">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h4 className="text-sm font-bold">{t(section.titleKey)}</h4>
                      </div>
                      <div className="space-y-2.5">
                        {section.entries.map((entry, i) => (
                          <div key={i}>
                            <div className="text-[11px] text-white/50 font-medium mb-0.5">{t(entry.labelKey)}</div>
                            {section.type === "link" ? (
                              <a href={(entry as any).href} className="text-sm font-semibold hover:text-amber-300 transition-colors break-all" dir="ltr">
                                {t(entry.valueKey)}
                              </a>
                            ) : (
                              <div className="text-sm font-semibold leading-snug">{t(entry.valueKey)}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Working hours card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.35 }}
                  className="group bg-white/5 hover:bg-white/10 rounded-2xl p-4 border border-white/10 transition-all hover:scale-[1.02] hover:border-white/20"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center shrink-0 group-hover:from-amber-400/30 group-hover:to-amber-500/10 transition-all">
                      <Clock className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold">{t("contact.hours")}</h4>
                  </div>
                  <div className="text-sm font-semibold leading-relaxed">{t("contact.hoursVal")}</div>
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-300/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-slow-pulse" />
                    {isAr ? "نخدمك الآن" : "Online now"}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, Loader2, MessageSquare, User, AtSign, Tag, MessageCircle, ShieldCheck } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";
import { SectionHeading } from "@/components/shared/section-heading";

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

  // Fetch section content from /api/site for DB-managed bilingual heading
  const { data: siteData } = useQuery({
    queryKey: ["site-data"],
    queryFn: () => apiGet<any>("/api/site"),
  });
  const sc = siteData?.sectionContent?.find((s: any) => s.section === "contact");
  const eyebrow = isAr ? (sc?.badgeAr || t("contact.eyebrow")) : (sc?.badgeEn || t("contact.eyebrow"));
  const title = isAr ? (sc?.titleAr || t("contact.title")) : (sc?.titleEn || t("contact.title"));
  const subtitle = isAr ? (sc?.descriptionAr || t("contact.subtitle")) : (sc?.descriptionEn || t("contact.subtitle"));
    const { data: infoData } = useQuery({
    queryKey: ["contact-info"],
    queryFn: () => apiGet<{ items: any[] }>("/api/contact-info"),
  });
  const dbItems: any[] = infoData?.items ?? [];

  const fromDb = (type: string, fallback: any[]) => {
    const rows = dbItems.filter((i) => i.type === type);
    if (rows.length === 0) return fallback;
    return rows.map((r) => ({
      label: isAr ? r.labelAr : r.labelEn,
      value: r.value || "",
      href:
        r.href ||
        (type === "phone"
          ? `tel:${(r.value || "").replace(/\s/g, "")}`
          : type === "email"
          ? `mailto:${r.value}`
          : undefined),
    }));
  };

  const INFO = [
    { icon: MapPin, titleKey: "contact.address", entries: fromDb("address", ADDRESSES), type: "address" as const },
    { icon: Phone, titleKey: "contact.phoneLabel", entries: fromDb("phone", PHONES), type: "link" as const },
    { icon: Mail, titleKey: "contact.emailLabel", entries: fromDb("email", EMAILS), type: "link" as const },
  ];

  const firstPhone = dbItems.find((i) => i.type === "phone");
  const firstEmail = dbItems.find((i) => i.type === "email");
  const callHref = firstPhone ? `tel:${(firstPhone.value || "").replace(/\s/g, "")}` : "tel:19999";
  const waHref = firstPhone
    ? `https://wa.me/${(firstPhone.value || "").replace(/\D/g, "").replace(/^0/, "20")}`
    : "https://wa.me/201000000000";
  const mailHref = firstEmail ? `mailto:${firstEmail.value}` : "mailto:info@redline.eg";

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
    <section id="contact" className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 start-0 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 end-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-[0.03] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
        />

        <div className="max-w-5xl mx-auto flex flex-col gap-8">
          {/* ============ FORM SECTION ============ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-[1.75rem] border border-border/40 bg-card/80 backdrop-blur-sm p-8 sm:p-10 shadow-elevated overflow-hidden"
          >
            {/* Top gradient accent bar */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-primary via-red-600 to-amber-500" />
            {/* Inner glow on top */}
            <div className="absolute -top-20 inset-x-0 h-40 bg-gradient-to-b from-primary/8 to-transparent pointer-events-none" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-amber-500/10 flex items-center justify-center icon-gold-ring">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">{t("contact.formTitle")}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isAr ? "نرد على رسالتك خلال 24 ساعة" : "We respond within 24 hours"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Field: Name */}
                <div className="flex flex-col gap-2 text-start">
                  <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                    {t("contact.name")} <span className="text-primary">*</span>
                  </Label>
                  <div className="relative group">
                    <Input
                      value={form.name}
                      onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }); }}
                      placeholder={isAr ? "اسمك الكامل" : "Your full name"}
                      className={`h-13 ps-11 text-start placeholder:text-start transition-all duration-200 bg-muted/30 border-border/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 focus-visible:bg-card ${errors.name ? "border-destructive" : "group-hover:border-primary/30"}`}
                    />
                    <User className="absolute top-1/2 -translate-y-1/2 start-3.5 w-4 h-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                  </div>
                  {errors.name && <p className="text-xs text-destructive text-start">{errors.name}</p>}
                </div>

                {/* Field: Email */}
                <div className="flex flex-col gap-2 text-start">
                  <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                    {t("contact.email")} <span className="text-primary">*</span>
                  </Label>
                  <div className="relative group">
                    <Input
                      type="email"
                      inputMode="email"
                      value={form.email}
                      onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
                      placeholder="email@example.com"
                      className={`h-13 ps-11 text-start placeholder:text-start transition-all duration-200 bg-muted/30 border-border/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 focus-visible:bg-card ${errors.email ? "border-destructive" : "group-hover:border-primary/30"}`}
                    />
                    <Mail className="absolute top-1/2 -translate-y-1/2 start-3.5 w-4 h-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                  </div>
                  {errors.email && <p className="text-xs text-destructive text-start">{errors.email}</p>}
                </div>

                {/* Field: Phone */}
                <div className="flex flex-col gap-2 text-start">
                  <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                    {t("contact.phone")}
                  </Label>
                  <div className="relative group">
                    <Input
                      type="tel"
                      inputMode="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="01XXXXXXXXX"
                      className="h-13 ps-11 text-start placeholder:text-start transition-all duration-200 bg-muted/30 border-border/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 focus-visible:bg-card group-hover:border-primary/30"
                      dir="ltr"
                    />
                    <Phone className="absolute top-1/2 -translate-y-1/2 start-3.5 w-4 h-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                  </div>
                </div>

                {/* Field: Subject */}
                <div className="flex flex-col gap-2 text-start">
                  <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                    {t("contact.subject")}
                  </Label>
                  <div className="relative group">
                    <Input
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder={isAr ? "موضوع الرسالة" : "Message subject"}
                      className="h-13 ps-11 text-start placeholder:text-start transition-all duration-200 bg-muted/30 border-border/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 focus-visible:bg-card group-hover:border-primary/30"
                    />
                    <Tag className="absolute top-1/2 -translate-y-1/2 start-3.5 w-4 h-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                  </div>
                </div>

                {/* Field: Message (full width) */}
                <div className="flex flex-col gap-2 text-start sm:col-span-2">
                  <Label className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                    {t("contact.message")} <span className="text-primary">*</span>
                  </Label>
                  <div className="relative group">
                    <Textarea
                      value={form.message}
                      onChange={(e) => { setForm({ ...form, message: e.target.value }); setErrors({ ...errors, message: "" }); }}
                      placeholder={isAr ? "اكتب رسالتك هنا..." : "Write your message here..."}
                      rows={4}
                      className={`ps-11 pt-3 text-start placeholder:text-start transition-all duration-200 bg-muted/30 border-border/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 focus-visible:bg-card ${errors.message ? "border-destructive" : "group-hover:border-primary/30"}`}
                    />
                    <MessageCircle className="absolute top-4 start-3.5 w-4 h-4 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                  </div>
                  {errors.message && <p className="text-xs text-destructive text-start">{errors.message}</p>}
                </div>
              </div>

              {/* Submit + trust signal */}
              <div className="mt-7 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground order-2 sm:order-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>{isAr ? "بياناتك آمنة ومحمية بالكامل" : "Your data is fully safe & protected"}</span>
                </div>
                <Button
                  onClick={submit}
                  disabled={loading}
                  className="group btn-glow w-full sm:w-auto h-13 px-10 bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white gap-2.5 text-base font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all hover:-translate-y-0.5"
                >
                  {loading
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : <Send className={`w-5 h-5 transition-transform ${isAr ? "-scale-x-100 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />}
                  {t("contact.submit")}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* ============ CONTACT INFO SECTION ============ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[1.75rem] relative overflow-hidden shadow-2xl shadow-red-900/30"
            style={{
              background: "radial-gradient(circle at 30% 20%, oklch(0.5 0.22 28), oklch(0.38 0.16 18) 60%, oklch(0.28 0.10 12))",
            }}
          >
            {/* Decorative layers */}
            <div className="absolute top-0 end-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl animate-aurora" />
            <div className="absolute bottom-0 start-0 w-56 h-56 bg-red-500/15 rounded-full blur-3xl" />
            <div className="absolute inset-0 noise opacity-[0.08]" />
            <div className="absolute inset-0 grid-bg opacity-[0.04]" />
            {/* Top gold accent line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

            <div className="relative p-8 sm:p-10 text-[#f9fafb]">
              {/* Header row */}
              <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
                <div>
                  <Image
                    src="/redline-transport-white.png"
                    alt="RedLine Transport"
                    width={1200}
                    height={514}
                    className="h-9 w-auto max-w-none object-contain mb-4 drop-shadow-lg"
                  />
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-1">{t("contact.direct")}</h3>
                  <p className="text-white/60 text-sm leading-relaxed max-w-md">{t("contact.directDesc")}</p>
                </div>
                {/* Quick action buttons */}
                <div className="flex gap-2">
                  <a href="tel:19999" className="w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 border border-white/10" aria-label="Call">
                    <Phone className="w-4.5 h-4.5" />
                  </a>
                  <a href="https://wa.me/201000000000" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-white/10 hover:bg-emerald-400/25 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 border border-white/10" aria-label="WhatsApp">
                    <FaWhatsapp className="w-4.5 h-4.5" />
                  </a>
                  <a href="mailto:info@redline.eg" className="w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 border border-white/10" aria-label="Email">
                    <Mail className="w-4.5 h-4.5" />
                  </a>
                </div>
              </div>

              {/* Info sections grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {INFO.map((section, si) => {
                  const Icon = section.icon;
                  return (
                    <motion.div
                      key={si}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + si * 0.06 }}
                      className="group bg-white/[0.06] hover:bg-white/[0.12] rounded-2xl p-5 border border-white/10 transition-all duration-300 hover:scale-[1.03] hover:border-amber-400/20"
                    >
                      <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/25 to-amber-600/10 flex items-center justify-center shrink-0 border border-amber-400/15 transition-all group-hover:from-amber-400/35 group-hover:to-amber-600/15 group-hover:border-amber-400/30">
                          <Icon className="w-4.5 h-4.5 text-amber-300" />
                        </div>
                        <h4 className="text-sm font-bold tracking-wide">{t(section.titleKey)}</h4>
                      </div>
                      <div className="space-y-3">
                        {section.entries.map((entry: any, i: number) => (
                          <div key={i}>
                            <div className="text-[10px] uppercase tracking-wider text-white/40 font-medium mb-1">{entry.label ?? t(entry.labelKey)}</div>
                            {section.type === "link" ? (
                              <a href={entry.href} className="text-sm font-semibold text-white/90 hover:text-amber-300 transition-colors break-all font-mono" dir="ltr">
                                {entry.value ?? t(entry.valueKey)}
                              </a>
                            ) : (
                              <div className="text-sm font-semibold text-white/90 leading-snug">{entry.value ?? t(entry.valueKey)}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Working hours card */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.44 }}
                  className="group bg-white/[0.06] hover:bg-white/[0.12] rounded-2xl p-5 border border-white/10 transition-all duration-300 hover:scale-[1.03] hover:border-amber-400/20"
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/25 to-amber-600/10 flex items-center justify-center shrink-0 border border-amber-400/15 transition-all group-hover:from-amber-400/35 group-hover:to-amber-600/15 group-hover:border-amber-400/30">
                      <Clock className="w-4.5 h-4.5 text-amber-300" />
                    </div>
                    <h4 className="text-sm font-bold tracking-wide">{t("contact.hours")}</h4>
                  </div>
                  <div className="text-sm font-semibold text-white/90 leading-relaxed">{t("contact.hoursVal")}</div>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-300/80">
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

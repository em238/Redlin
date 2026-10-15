"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, Loader2, MessageSquare, CheckCircle2 } from "lucide-react";
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
    <section id="contact" className="py-14 sm:py-24 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("contact.eyebrow")}
          title={t("contact.title")}
          subtitle={t("contact.subtitle")}
        />

        <div className="max-w-5xl mx-auto flex flex-col gap-6">
          {/* Form section — full width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-card"
          >
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold">{t("contact.formTitle")}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field 1: Name */}
              <div className="flex flex-col gap-1.5 text-start">
                <Label className="text-xs sm:text-sm font-semibold">{t("contact.name")} *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }); }}
                  placeholder={isAr ? "اسمك الكامل" : "Your full name"}
                  className={`h-11 text-start placeholder:text-start ${errors.name ? "border-destructive" : ""}`}
                />
                {errors.name && <p className="text-xs text-destructive text-start">{errors.name}</p>}
              </div>
              {/* Field 2: Email */}
              <div className="flex flex-col gap-1.5 text-start">
                <Label className="text-xs sm:text-sm font-semibold">{t("contact.email")} *</Label>
                <Input
                  type="email"
                  inputMode="email"
                  value={form.email}
                  onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
                  placeholder="email@example.com"
                  className={`h-11 text-start placeholder:text-start ${errors.email ? "border-destructive" : ""}`}
                />
                {errors.email && <p className="text-xs text-destructive text-start">{errors.email}</p>}
              </div>
              {/* Field 3: Phone */}
              <div className="flex flex-col gap-1.5 text-start">
                <Label className="text-xs sm:text-sm font-semibold">{t("contact.phone")}</Label>
                <Input
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  className="h-11 text-start placeholder:text-start"
                />
              </div>
              {/* Field 4: Subject */}
              <div className="flex flex-col gap-1.5 text-start">
                <Label className="text-xs sm:text-sm font-semibold">{t("contact.subject")}</Label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder={isAr ? "موضوع الرسالة" : "Message subject"}
                  className="h-11 text-start placeholder:text-start"
                />
              </div>
              {/* Field 5: Message (full width) */}
              <div className="flex flex-col gap-1.5 text-start sm:col-span-2">
                <Label className="text-xs sm:text-sm font-semibold">{t("contact.message")} *</Label>
                <Textarea
                  value={form.message}
                  onChange={(e) => { setForm({ ...form, message: e.target.value }); setErrors({ ...errors, message: "" }); }}
                  placeholder={isAr ? "اكتب رسالتك هنا..." : "Write your message here..."}
                  rows={4}
                  className={`text-start placeholder:text-start ${errors.message ? "border-destructive" : ""}`}
                />
                {errors.message && <p className="text-xs text-destructive text-start">{errors.message}</p>}
              </div>
            </div>
            <Button
              onClick={submit}
              disabled={loading}
              className="group btn-glow mt-5 w-full h-12 bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white gap-2 text-base font-semibold"
            >
              {loading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <Send className={`w-5 h-5 transition-transform ${isAr ? "-scale-x-100 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`} />}
              {t("contact.submit")}
            </Button>
          </motion.div>

          {/* Contact info section — full width, horizontal sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-br from-primary via-red-700 to-red-900 p-7 text-white relative overflow-hidden shadow-2xl shadow-primary/20"
          >
            {/* Decorative glows */}
            <div className="absolute top-0 end-0 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-aurora" />
            <div className="absolute bottom-0 start-0 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl" />
            <div className="absolute inset-0 noise opacity-20" />

            <div className="relative">
              {/* Logo + heading */}
              <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
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
              </div>

              {/* Horizontal sections grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Addresses section */}
                <div className="border-t border-white/15 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold">{t("contact.address")}</h4>
                  </div>
                  <div className="space-y-2.5">
                    {ADDRESSES.map((a, i) => (
                      <div key={i}>
                        <div className="text-[11px] text-white/50 font-medium mb-0.5">{t(a.labelKey)}</div>
                        <div className="text-sm font-semibold leading-snug">{t(a.valueKey)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phone section */}
                <div className="border-t border-white/15 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold">{t("contact.phoneLabel")}</h4>
                  </div>
                  <div className="space-y-2.5">
                    {PHONES.map((p, i) => (
                      <div key={i}>
                        <div className="text-[11px] text-white/50 font-medium mb-0.5">{t(p.labelKey)}</div>
                        <a href={p.href} className="text-sm font-semibold hover:text-amber-300 transition-colors" dir="ltr">
                          {t(p.valueKey)}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Email section */}
                <div className="border-t border-white/15 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold">{t("contact.emailLabel")}</h4>
                  </div>
                  <div className="space-y-2.5">
                    {EMAILS.map((e, i) => (
                      <div key={i}>
                        <div className="text-[11px] text-white/50 font-medium mb-0.5">{t(e.labelKey)}</div>
                        <a href={e.href} className="text-sm font-semibold hover:text-amber-300 transition-colors break-all" dir="ltr">
                          {t(e.valueKey)}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Working hours */}
                <div className="border-t border-white/15 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold">{t("contact.hours")}</h4>
                  </div>
                  <div className="text-sm font-semibold leading-relaxed">{t("contact.hoursVal")}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

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

const CONTACT_KEYS = [
  { icon: MapPin, titleKey: "contact.address", valueKey: "contact.addressVal" },
  { icon: Phone, titleKey: "contact.phoneLabel", valueKey: "contact.phoneVal" },
  { icon: Mail, titleKey: "contact.emailLabel", valueKey: "contact.emailVal" },
  { icon: Clock, titleKey: "contact.hours", valueKey: "contact.hoursVal" },
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

        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-6">
          {/* Info side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-primary to-red-800 p-8 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-aurora" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl" />
            <div className="relative">
              <div className="mb-6">
                <Image
                  src="/redline-transport-white.png"
                  alt="RedLine Transport"
                  width={1200}
                  height={514}
                  className="h-10 w-auto max-w-none object-contain"
                />
              </div>
              <h3 className="text-2xl font-bold mb-2">{t("contact.direct")}</h3>
              <p className="text-white/80 text-sm mb-8">
                {t("contact.directDesc")}
              </p>
              <div className="space-y-5">
                {CONTACT_KEYS.map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/15 group-hover:bg-white/25 flex items-center justify-center shrink-0 transition-colors">
                      <c.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-white/70">{t(c.titleKey)}</div>
                      <div className="font-semibold text-sm mt-0.5">{t(c.valueKey)}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Form side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 rounded-3xl border border-border bg-card p-8 shadow-card"
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
                  rows={5}
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
        </div>
      </div>
    </section>
  );
}

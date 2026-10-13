"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, Loader2, Truck, MessageSquare, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import { SectionHeading } from "@/components/shared/section-heading";

const CONTACT_INFO = [
  { icon: MapPin, title: "العنوان", value: "التجمع الخامس، القاهرة الجديدة، القاهرة، مصر" },
  { icon: Phone, title: "الهاتف", value: "19999 (موحد لكل المحافظات)" },
  { icon: Mail, title: "البريد الإلكتروني", value: "support@redline.eg" },
  { icon: Clock, title: "ساعات العمل", value: "السبت - الخميس · 9ص - 11م" },
];

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "الاسم مطلوب";
    if (!form.email.trim()) e.email = "البريد مطلوب";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "بريد غير صحيح";
    if (!form.message.trim()) e.message = "الرسالة مطلوبة";
    else if (form.message.trim().length < 10) e.message = "الرسالة قصيرة جداً";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) { toast.error("راجع البيانات"); return; }
    setLoading(true);
    try {
      await apiPost("/api/contact", form);
      toast.success("تم استلام رسالتك! سنتواصل معك قريباً.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (e: any) {
      toast.error(e.message || "خطأ في الإرسال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="تواصل معنا"
          title={<>جاهزون لخدمتك <span className="text-gradient-red">دائماً</span></>}
          subtitle="لديك استفسار أو طلب خاص؟ فريقنا بانتظارك على مدار الساعة"
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
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-xl font-black">Redline</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">تواصل مباشر</h3>
              <p className="text-white/80 text-sm mb-8">
                نحن هنا لمساعدتك في كل ما يخص شحناتك. اختر الطريقة الأنسب لك للتواصل.
              </p>
              <div className="space-y-5">
                {CONTACT_INFO.map((c, i) => (
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
                      <div className="text-xs text-white/70">{c.title}</div>
                      <div className="font-semibold text-sm mt-0.5">{c.value}</div>
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
            className="lg:col-span-3 rounded-3xl border border-border bg-card p-8 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold">أرسل لنا رسالة</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm">الاسم *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }); }}
                  placeholder="اسمك الكامل" className={`h-11 ${errors.name ? "border-destructive" : ""}`}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">البريد الإلكتروني *</Label>
                <Input
                  type="email" dir="ltr" value={form.email}
                  onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
                  placeholder="email@example.com" className={`h-11 text-right ${errors.email ? "border-destructive" : ""}`}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">الهاتف</Label>
                <Input
                  value={form.phone} dir="ltr"
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="01XXXXXXXXX" className="h-11 text-right"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">الموضوع</Label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="موضوع الرسالة" className="h-11"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-sm">الرسالة *</Label>
                <Textarea
                  value={form.message}
                  onChange={(e) => { setForm({ ...form, message: e.target.value }); setErrors({ ...errors, message: "" }); }}
                  placeholder="اكتب رسالتك هنا..." rows={5} className={errors.message ? "border-destructive" : ""}
                />
                {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
              </div>
            </div>
            <Button
              onClick={submit} disabled={loading}
              className="mt-5 w-full h-12 bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white gap-2 text-base group"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              إرسال الرسالة
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

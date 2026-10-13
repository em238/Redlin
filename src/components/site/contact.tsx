"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, Loader2, Truck, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";

const CONTACT_INFO = [
  { icon: MapPin, title: "العنوان", value: "التجمع الخامس، القاهرة الجديدة، القاهرة، مصر" },
  { icon: Phone, title: "الهاتف", value: "19999 (موحد لكل المحافظات)" },
  { icon: Mail, title: "البريد الإلكتروني", value: "support@redline.eg" },
  { icon: Clock, title: "ساعات العمل", value: "السبت - الخميس · 9ص - 11م" },
];

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.name || !form.email || !form.message) {
      toast.error("أكمل الحقول المطلوبة");
      return;
    }
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
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-3">
            تواصل معنا
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            جاهزون لخدمتك <span className="text-gradient-red">دائماً</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            لديك استفسار أو طلب خاص؟ فريقنا بانتظارك على مدار الساعة
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-6">
          {/* Info side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-primary to-red-800 p-8 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
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
                  <div key={i} className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                      <c.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-white/70">{c.title}</div>
                      <div className="font-semibold text-sm mt-0.5">{c.value}</div>
                    </div>
                  </div>
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
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="اسمك الكامل" className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">البريد الإلكتروني *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">الهاتف</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">الموضوع</Label>
                <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="موضوع الرسالة" className="h-11" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-sm">الرسالة *</Label>
                <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="اكتب رسالتك هنا..." rows={5} />
              </div>
            </div>
            <Button
              onClick={submit}
              disabled={loading}
              className="mt-5 w-full h-12 bg-gradient-to-r from-primary to-red-700 hover:from-red-600 hover:to-red-800 text-white gap-2 text-base"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              إرسال الرسالة
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

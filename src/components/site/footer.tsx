"use client";

import { Truck, MapPin, Phone, Mail, Facebook, Instagram, Twitter, Linkedin, Send, ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { useState } from "react";

const SOCIALS = [
  { icon: Facebook, label: "Facebook" },
  { icon: Instagram, label: "Instagram" },
  { icon: Twitter, label: "Twitter" },
  { icon: Linkedin, label: "LinkedIn" },
];

const LINKS = {
  company: { title: "الشركة", items: ["من نحن", "فريق العمل", "الوظائف", "المدونة", "الأخبار"] },
  services: { title: "الخدمات", items: ["شحن عادي", "شحن ممتاز", "نفس اليوم", "شحن ثقيل", "دفع عند الاستلام"] },
  help: { title: "المساعدة", items: ["تتبع الشحنة", "الأسئلة الشائعة", "سياسة الإرجاع", "الشروط والأحكام", "سياسة الخصوصية"] },
};

export function Footer() {
  const { setView } = useAppStore();
  const [email, setEmail] = useState("");

  const subscribe = () => {
    if (!email) { toast.error("أدخل بريدك الإلكتروني"); return; }
    toast.success("تم الاشتراك في النشرة البريدية!");
    setEmail("");
  };

  const go = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer className="mt-auto bg-zinc-950 text-zinc-300">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Truck className="w-4.5 h-4.5 text-white" strokeWidth={2.4} />
              </div>
              <div>
                <div className="text-lg font-bold text-white">Red<span className="text-primary">line</span></div>
                <div className="text-[10px] text-zinc-500 mt-0.5">شحن سريع وآمن</div>
              </div>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              شركة Redline للشحن — شريكك اللوجستي الموثوق في مصر. نغطي 27 محافظة بأكثر من 40 فرعاً ومستودعاً،
              بأسرع خدمة وأفضل الأسعار وضمان التسليم.
            </p>
            <div className="mt-5 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <MapPin className="w-4 h-4 text-primary" /> التجمع الخامس، القاهرة الجديدة
              </div>
              <a href="tel:19999" className="flex items-center gap-2 text-zinc-400 hover:text-white">
                <Phone className="w-4 h-4 text-primary" /> 19999 (موحد)
              </a>
              <a href="mailto:support@redline.eg" className="flex items-center gap-2 text-zinc-400 hover:text-white">
                <Mail className="w-4 h-4 text-primary" /> support@redline.eg
              </a>
            </div>
            <div className="mt-5 flex gap-2">
              {SOCIALS.map((s, i) => (
                <a key={i} href="#" aria-label={s.label} className="w-9 h-9 rounded-lg bg-white/5 hover:bg-primary flex items-center justify-center transition-colors">
                  <s.icon className="w-4 h-4 text-zinc-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-white text-sm mb-4">{LINKS.company.title}</h4>
            <ul className="space-y-2 text-sm">
              {LINKS.company.items.map((l, i) => (
                <li key={i}><a href="#" className="text-zinc-400 hover:text-primary transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-2">
            <h4 className="font-bold text-white text-sm mb-4">{LINKS.services.title}</h4>
            <ul className="space-y-2 text-sm">
              {LINKS.services.items.map((l, i) => (
                <li key={i}><button onClick={() => go("#services")} className="text-zinc-400 hover:text-primary transition-colors">{l}</button></li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-2">
            <h4 className="font-bold text-white text-sm mb-4">{LINKS.help.title}</h4>
            <ul className="space-y-2 text-sm">
              {LINKS.help.items.map((l, i) => (
                <li key={i}>
                  <button onClick={() => l === "تتبع الشحنة" ? go("#contact") : undefined} className="text-zinc-400 hover:text-primary transition-colors">{l}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-white text-sm mb-4">النشرة البريدية</h4>
            <p className="text-xs text-zinc-400 mb-3">اشترك لتصلك آخر العروض والأخبار</p>
            <div className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="بريدك"
                className="h-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
              />
              <Button size="icon" onClick={subscribe} className="bg-primary hover:bg-red-600 h-10 w-10 shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <button
              onClick={() => setView("dashboard")}
              className="mt-4 text-xs text-zinc-500 hover:text-primary transition-colors"
            >
              دخول لوحة التحكم ←
            </button>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} Redline Shipping. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span>صُنع بشغف في مصر 🇪🇬</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary flex items-center justify-center transition-colors"
              aria-label="للأعلى"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

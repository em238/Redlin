"use client";

import { Truck, MapPin, Phone, Mail, Facebook, Instagram, Twitter, Linkedin, Send, ArrowUp } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";
import { useState } from "react";

const SOCIALS = [
  { icon: Facebook, label: "Facebook" },
  { icon: Instagram, label: "Instagram" },
  { icon: Twitter, label: "Twitter" },
  { icon: Linkedin, label: "LinkedIn" },
];

const LINKS_AR = {
  company: ["من نحن", "فريق العمل", "الوظائف", "المدونة", "الأخبار"],
  services: ["شحن عادي", "شحن ممتاز", "نفس اليوم", "شحن ثقيل", "دفع عند الاستلام"],
  help: ["تتبع الشحنة", "الأسئلة الشائعة", "سياسة الإرجاع", "الشروط والأحكام", "سياسة الخصوصية"],
};
const LINKS_EN = {
  company: ["About", "Team", "Careers", "Blog", "News"],
  services: ["Standard", "Express", "Same Day", "Freight", "Cash on Delivery"],
  help: ["Track Shipment", "FAQ", "Return Policy", "Terms & Conditions", "Privacy Policy"],
};

export function Footer() {
  const { t, isAr } = useT();
  const { setView } = useAppStore();
  const [email, setEmail] = useState("");
  const LINKS = isAr ? LINKS_AR : LINKS_EN;

  const subscribe = () => {
    if (!email) { toast.error(isAr ? "أدخل بريدك الإلكتروني" : "Please enter your email"); return; }
    toast.success(isAr ? "تم الاشتراك في النشرة البريدية!" : "Successfully subscribed to the newsletter!");
    setEmail("");
  };

  const go = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  // Match the help list item used to jump to the contact section (track shipment).
  const trackItem = isAr ? LINKS_AR.help[0] : LINKS_EN.help[0];

  return (
    <footer className="mt-auto bg-zinc-950 text-zinc-300">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-3">
            <div className="mb-5">
              <Image
                src="/redline-transport-white.png"
                alt="RedLine Transport"
                width={1200}
                height={514}
                className="h-10 w-auto max-w-none object-contain"
              />
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              {t("footer.desc")}
            </p>
            <div className="mt-5 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <MapPin className="w-4 h-4 text-primary" /> {isAr ? "التجمع الخامس، القاهرة الجديدة" : "5th Settlement, New Cairo"}
              </div>
              <a href="tel:19999" className="flex items-center gap-2 text-zinc-400 hover:text-white">
                <Phone className="w-4 h-4 text-primary" /> {isAr ? "19999 (موحد)" : "19999 (nationwide)"}
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
            <h4 className="font-bold text-white text-sm mb-4">{t("footer.company")}</h4>
            <ul className="space-y-2 text-sm">
              {LINKS.company.map((l, i) => (
                <li key={i}><a href="#" className="text-zinc-400 hover:text-primary transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-2">
            <h4 className="font-bold text-white text-sm mb-4">{t("footer.services")}</h4>
            <ul className="space-y-2 text-sm">
              {LINKS.services.map((l, i) => (
                <li key={i}><button onClick={() => go("#services")} className="text-zinc-400 hover:text-primary transition-colors">{l}</button></li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-2">
            <h4 className="font-bold text-white text-sm mb-4">{t("footer.help")}</h4>
            <ul className="space-y-2 text-sm">
              {LINKS.help.map((l, i) => (
                <li key={i}>
                  <button onClick={() => l === trackItem ? go("#contact") : undefined} className="text-zinc-400 hover:text-primary transition-colors">{l}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <h4 className="font-bold text-white text-sm mb-4">{t("footer.newsletter")}</h4>
            <p className="text-xs text-zinc-400 mb-3">{t("footer.newsletterDesc")}</p>
            <div className="flex gap-2 items-stretch">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAr ? "بريدك" : "Your email"}
                className="h-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 flex-1"
              />
              <Button size="icon" onClick={subscribe} className="bg-primary hover:bg-red-600 h-10 w-10 shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <button
              onClick={() => setView("dashboard")}
              className="mt-4 text-xs text-zinc-500 hover:text-primary transition-colors"
            >
              {t("footer.dashboard")} ←
            </button>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500">
            {t("footer.copyright").replace("© ", `© ${new Date().getFullYear()} `)}
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span>{t("footer.made")} 🇪🇬</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-primary flex items-center justify-center transition-colors"
              aria-label={isAr ? "للأعلى" : "To top"}
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

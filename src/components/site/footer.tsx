"use client";

import { Truck, MapPin, Phone, Mail, Facebook, Instagram, Twitter, Linkedin, Send, ArrowUp } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { apiGet } from "@/lib/api";
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

// Default HREFs for the fallback (legacy) hardcoded link lists — these map by
// index to the LINKS_AR/LINKS_EN arrays. They mirror the seeded DB hrefs so
// the behavior is identical whether the API returns data or not.
const LINK_HREFS_BY_CATEGORY: Record<string, string[]> = {
  company: ["#", "#", "#", "#", "#"],
  services: ["#services", "#services", "#services", "#services", "#services"],
  help: ["#contact", "#", "#", "#", "#"],
};

type FooterLink = {
  id: string;
  category: string;
  labelAr: string;
  labelEn: string;
  href: string;
  order: number;
  active: boolean;
};

type FooterContent = {
  bioAr: string;
  bioEn: string;
  newsletterTitleAr: string;
  newsletterTitleEn: string;
  newsletterDescAr: string;
  newsletterDescEn: string;
  dashboardLinkAr: string;
  dashboardLinkEn: string;
  addressAr: string;
  addressEn: string;
};

export function Footer() {
  const router = useRouter();
  const { t, isAr } = useT();
  const [email, setEmail] = useState("");
  const LINKS = isAr ? LINKS_AR : LINKS_EN;

  // Fetch footer content + footer links from /api/site
  const { data } = useQuery({
    queryKey: ["site-data"],
    queryFn: () => apiGet<any>("/api/site"),
  });
  const fc: FooterContent | undefined = data?.footerContent;
  const footerLinks: FooterLink[] = data?.footerLinks ?? [];

  const bio = isAr ? (fc?.bioAr || t("footer.desc")) : (fc?.bioEn || t("footer.desc"));
  const address = isAr ? (fc?.addressAr || (isAr ? "التجمع الخامس، القاهرة الجديدة" : "5th Settlement, New Cairo")) : (fc?.addressEn || (isAr ? "التجمع الخامس، القاهرة الجديدة" : "5th Settlement, New Cairo"));
  const newsletterTitle = isAr ? (fc?.newsletterTitleAr || t("footer.newsletter")) : (fc?.newsletterTitleEn || t("footer.newsletter"));
  const newsletterDesc = isAr ? (fc?.newsletterDescAr || t("footer.newsletterDesc")) : (fc?.newsletterDescEn || t("footer.newsletterDesc"));
  const dashboardLink = isAr ? (fc?.dashboardLinkAr || t("footer.dashboard")) : (fc?.dashboardLinkEn || t("footer.dashboard"));

  // Build the 3 link lists from DB rows (fallback to legacy hardcoded lists if API returns nothing)
  const linksByCategory = (cat: string) => {
    const dbRows = footerLinks.filter((l) => l.category === cat).sort((a, b) => a.order - b.order);
    if (dbRows.length > 0) {
      return dbRows.map((l) => ({ label: isAr ? l.labelAr : l.labelEn, href: l.href }));
    }
    const legacyList = (LINKS as any)[cat] as string[];
    const legacyHrefs = LINK_HREFS_BY_CATEGORY[cat] ?? [];
    return legacyList.map((label, i) => ({ label, href: legacyHrefs[i] ?? "#" }));
  };
  const companyLinks = linksByCategory("company");
  const servicesLinks = linksByCategory("services");
  const helpLinks = linksByCategory("help");

  // Match the help list item used to jump to the contact section (track shipment).
  const trackItem = isAr ? LINKS_AR.help[0] : LINKS_EN.help[0];

  const subscribe = () => {
    if (!email) { toast.error(isAr ? "أدخل بريدك الإلكتروني" : "Please enter your email"); return; }
    toast.success(isAr ? "تم الاشتراك في النشرة البريدية!" : "Successfully subscribed to the newsletter!");
    setEmail("");
  };

  const go = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  const handleLinkClick = (href: string, label: string) => {
    if (href && href.startsWith("#") && href.length > 1) {
      go(href);
    } else if (label === trackItem) {
      go("#contact");
    }
  };

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
                className="h-8 w-auto max-w-none object-contain"
              />
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              {bio}
            </p>
            <div className="mt-5 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <MapPin className="w-4 h-4 text-primary" /> {address}
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

          {/* Links — Company */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-white text-sm mb-4">{t("footer.company")}</h4>
            <ul className="space-y-2 text-sm">
              {companyLinks.map((l, i) => (
                <li key={i}>
                  <a href={l.href} onClick={(e) => { if (l.href.startsWith("#")) { e.preventDefault(); handleLinkClick(l.href, l.label); } }} className="text-zinc-400 hover:text-primary transition-colors cursor-pointer">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links — Services */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-white text-sm mb-4">{t("footer.services")}</h4>
            <ul className="space-y-2 text-sm">
              {servicesLinks.map((l, i) => (
                <li key={i}>
                  <a href={l.href} onClick={(e) => { if (l.href.startsWith("#")) { e.preventDefault(); handleLinkClick(l.href, l.label); } }} className="text-zinc-400 hover:text-primary transition-colors cursor-pointer">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links — Help / Support */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-white text-sm mb-4">{t("footer.help")}</h4>
            <ul className="space-y-2 text-sm">
              {helpLinks.map((l, i) => (
                <li key={i}>
                  <a href={l.href} onClick={(e) => { if (l.href.startsWith("#")) { e.preventDefault(); handleLinkClick(l.href, l.label); } }} className="text-zinc-400 hover:text-primary transition-colors cursor-pointer">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <h4 className="font-bold text-white text-sm mb-4">{newsletterTitle}</h4>
            <p className="text-xs text-zinc-400 mb-3">{newsletterDesc}</p>
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
              onClick={() => router.push("/dashboard")}
              className="mt-4 text-xs text-zinc-500 hover:text-primary transition-colors"
            >
              {dashboardLink} ←
            </button>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-500">
            {t("footer.copyright").replace("© ", `© ${new Date().getFullYear()} `)}
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="text-slate-400 text-[11px]">
              {t("footer.made")}{" "}
              <a
                href="https://gloval.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-white hover:text-red-500 transition-colors"
              >
                GloVal
              </a>
            </span>
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

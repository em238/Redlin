import { create } from "zustand";

type Locale = "ar" | "en";

// === Messages dictionary (all site strings) ===
export const MESSAGES: Record<Locale, Record<string, string>> = {
  ar: {
    // Navbar
    "nav.home": "الرئيسية",
    "nav.services": "خدماتنا",
    "nav.how": "كيف نعمل",
    "nav.map": "الخريطة",
    "nav.videos": "المعرض",
    "nav.partners": "الشركاء",
    "nav.contact": "تواصل",
    "nav.dashboard": "لوحة التحكم",
    "nav.tagline": "شحن سريع وآمن",

    // Hero
    "hero.badge": "نشحن لكل محافظات مصر — 27 محافظة بنفس السرعة",
    "hero.title1": "شحن يصل لكل مصر",
    "hero.title2": "بسرعة",
    "hero.subtitle": "شركة شحن احترافية تغطي جميع محافظات مصر بخدمات متنوعة — عادي، ممتاز، نفس اليوم، وشحن ثقيل — مع تتبع مباشر وأسعار منافسة وضمان التسليم.",
    "hero.cta1": "اطلب شحن الآن",
    "hero.cta2": "خدماتنا",
    "hero.feat1": "توصيل نفس اليوم في القاهرة الكبرى",
    "hero.feat2": "ضمان كامل على كل شحنة",
    "hero.feat3": "27 محافظة بتغطية كاملة",

    // Stats
    "stats.shipments": "شحنة تم توصيلها",
    "stats.governorates": "محافظة نغطّيها",
    "stats.customers": "عميل سعيد",
    "stats.branches": "فرع ومستودع",

    // Services
    "services.eyebrow": "خدماتنا",
    "services.title": "حلول شحن متكاملة لكل احتياجاتك",
    "services.subtitle": "من الشحن العادي إلى التوصيل في نفس اليوم، نوفّر لك خيارات تناسب سرعتك وميزانيتك",
    "services.cta": "اطلب الخدمة",
    "service.standard": "عادي",
    "service.standard.desc": "توصيل خلال 48-96 ساعة بأفضل الأسعار",
    "service.express": "ممتاز",
    "service.express.desc": "توصيل خلال 24-48 ساعة مع أولوية الشحن",
    "service.sameday": "نفس اليوم",
    "service.sameday.desc": "توصيل في نفس اليوم داخل القاهرة الكبرى",
    "service.freight": "شحن ثقيل",
    "service.freight.desc": "شحن البضائع والأغراض الثقيلة والكميات",
    "service.cod": "دفع عند الاستلام",
    "service.cod.desc": "استلام قيمة الشحنة عند التسليم للمستلم",
    "service.returns": "مرتجعات",
    "service.returns.desc": "استرجاع الشحنات المرتجعة من العملاء",

    // How It Works
    "how.eyebrow": "إزاي بنشتغل",
    "how.title": "الشحن مع Redline في 3 خطوات",
    "how.subtitle": "من الحجز للتسليم — عملية بسيطة وسريعة من البداية للنهاية",
    "how.step1": "احجز شحنتك",
    "how.step1.desc": "احجز شحنتك أونلاين أو بالهاتف 19999 في دقائق معدودة — بدون تعقيد.",
    "how.step2": "نستلم ونشحن",
    "how.step2.desc": "مندوبنا يستلم الشحنة منك ونشحنها لوجهتها بأسرع خدمة مناسبة لك.",
    "how.step3": "توصّل للمستلم",
    "how.step3.desc": "توصّل الشحنة لأي محافظة في مصر وتسليمها للمستلم بأمان وضمان كامل.",
    "how.cta": "ابدأ شحنتك الآن",

    // Map
    "map.eyebrow": "الشبكة الإقليمية — أفريقيا والخليج",
    "map.title": "شبكة Redline على خريطة أفريقيا والخليج",
    "map.subtitle": "محافظة مصرية + مركز إقليمي — جرّب الضغط على أي نقطة",
    "map.hud": "LIVE LOGISTICS GRID — AFRICA & MIDDLE EAST",
    "map.nodes": "NODES ACTIVE",
    "map.placeholder": "اضغط على أي محافظة",
    "map.active": "نقطة توصيل نشطة",
    "map.covered": "محافظة مغطاة",
    "map.delivery": "تسليم في الوقت",
    "map.quicklist": "قائمة المحافظات",

    // Videos
    "videos.eyebrow": "معرض الفيديو",
    "videos.title": "شاهد Redline أثناء العمل",
    "videos.subtitle": "مقاطع توثّق عملياتنا، شبكتنا، وقصص عملائنا في كل أنحاء مصر",

    // About
    "about.eyebrow": "من نحن",
    "about.title": "Redline — عصب الشحن في مصر",
    "about.p1": "منذ أكثر من 15 عاماً، نبني Redline لنكون الشريك اللوجستي الموثوق للشركات والأفراد في مصر. شبكتنا تغطي 27 محافظة بأكملها بأكثر من 40 فرعاً ومستودعاً، ونوفّر حلول شحن متكاملة بسرعة وأمان وأسعار تنافسية لا تضاهى.",
    "about.p2": "من البداية، آمنّا بأن الشحن ليس مجرد نقل طرود، بل التزام بالوعد. لذلك نستثمر في التكنولوجيا والبنية التحتية والكوادر البشرية لنضمن وصول كل شحنة في الوقت المحدد.",
    "about.exp": "سنة من الخبرة",

    // Partners
    "partners.eyebrow": "شركاء النجاح",
    "partners.title": "شعارات شركائنا وعملائنا",
    "partners.subtitle": "أكثر من 12,000 شركة وعلامة تجارية تثق في Redline لشحناتها يومياً",
    "partners.trust": "موثوق به من قِبل أكبر العلامات التجارية في مصر",

    // Testimonials
    "test.eyebrow": "آراء العملاء",
    "test.title": "عملاؤنا هم قوتنا",
    "test.subtitle": "أكثر من 12,000 عميل يثقون في Redline لشحناتهم يومياً",

    // CTA
    "cta.title": "جاهز تبدأ شحن مع Redline؟",
    "cta.subtitle": "انضم لأكثر من 12,000 عميل يثقون بنا يومياً. تواصل معنا الآن واحصل على عرض سعر مخصص لشحناتك.",
    "cta.button": "اطلب عرض سعر",

    // Contact
    "contact.eyebrow": "تواصل معنا",
    "contact.title": "جاهزون لخدمتك دائماً",
    "contact.subtitle": "لديك استفسار أو طلب خاص؟ فريقنا بانتظارك على مدار الساعة",
    "contact.formTitle": "أرسل لنا رسالة",
    "contact.name": "الاسم",
    "contact.email": "البريد الإلكتروني",
    "contact.phone": "الهاتف",
    "contact.subject": "الموضوع",
    "contact.message": "الرسالة",
    "contact.submit": "إرسال الرسالة",
    "contact.direct": "تواصل مباشر",
    "contact.directDesc": "نحن هنا لمساعدتك في كل ما يخص شحناتك. اختر الطريقة الأنسب للتواصل.",
    "contact.address": "العنوان",
    "contact.addressVal": "التجمع الخامس، القاهرة الجديدة، مصر",
    "contact.phoneLabel": "الهاتف",
    "contact.phoneVal": "19999 (موحد لكل المحافظات)",
    "contact.emailLabel": "البريد الإلكتروني",
    "contact.emailVal": "support@redline.eg",
    "contact.hours": "ساعات العمل",
    "contact.hoursVal": "السبت - الخميس · 9ص - 11م",

    // Footer
    "footer.desc": "شركة Redline للشحن — شريكك اللوجستي الموثوق في مصر. نغطي 27 محافظة بأكثر من 40 فرعاً ومستودعاً، بأسرع خدمة وأفضل الأسعار وضمان التسليم.",
    "footer.company": "الشركة",
    "footer.services": "الخدمات",
    "footer.help": "المساعدة",
    "footer.newsletter": "النشرة البريدية",
    "footer.newsletterDesc": "اشترك لتصلك آخر العروض والأخبار",
    "footer.copyright": "© Redline Shipping. جميع الحقوق محفوظة.",
    "footer.made": "صُنع بشغف في مصر",
    "footer.dashboard": "دخول لوحة التحكم",
  },

  en: {
    // Navbar
    "nav.home": "Home",
    "nav.services": "Services",
    "nav.how": "How It Works",
    "nav.map": "Map",
    "nav.videos": "Gallery",
    "nav.partners": "Partners",
    "nav.contact": "Contact",
    "nav.dashboard": "Dashboard",
    "nav.tagline": "Fast & Safe Shipping",

    // Hero
    "hero.badge": "Shipping to all of Egypt — 27 governorates at the same speed",
    "hero.title1": "Shipping across all Egypt",
    "hero.title2": "with",
    "hero.subtitle": "A professional shipping company covering all Egyptian governorates with diverse services — Standard, Express, Same-Day, and Freight — with real-time tracking, competitive pricing, and guaranteed delivery.",
    "hero.cta1": "Book a Shipment",
    "hero.cta2": "Our Services",
    "hero.feat1": "Same-day delivery in Greater Cairo",
    "hero.feat2": "Full guarantee on every shipment",
    "hero.feat3": "27 governorates fully covered",

    // Stats
    "stats.shipments": "Delivered shipments",
    "stats.governorates": "Governorates covered",
    "stats.customers": "Happy customers",
    "stats.branches": "Branches & warehouses",

    // Services
    "services.eyebrow": "Our Services",
    "services.title": "Integrated shipping solutions for all your needs",
    "services.subtitle": "From standard shipping to same-day delivery, we offer options that fit your speed and budget",
    "services.cta": "Request Service",
    "service.standard": "Standard",
    "service.standard.desc": "Delivery within 48-96 hours at the best prices",
    "service.express": "Express",
    "service.express.desc": "Delivery within 24-48 hours with shipping priority",
    "service.sameday": "Same Day",
    "service.sameday.desc": "Same-day delivery within Greater Cairo",
    "service.freight": "Freight",
    "service.freight.desc": "Shipping heavy goods, cargo, and bulk quantities",
    "service.cod": "Cash on Delivery",
    "service.cod.desc": "Collect shipment value upon delivery to the recipient",
    "service.returns": "Returns",
    "service.returns.desc": "Retrieve returned shipments from customers",

    // How It Works
    "how.eyebrow": "How It Works",
    "how.title": "Shipping with Redline in 3 steps",
    "how.subtitle": "From booking to delivery — a simple and fast process from start to finish",
    "how.step1": "Book your shipment",
    "how.step1.desc": "Book your shipment online or by phone at 19999 in minutes — no hassle.",
    "how.step2": "We pick up & ship",
    "how.step2.desc": "Our courier picks up your shipment and we ship it to its destination with the fastest service.",
    "how.step3": "Delivered to recipient",
    "how.step3.desc": "We deliver to any governorate in Egypt and hand it to the recipient safely and guaranteed.",
    "how.cta": "Start your shipment now",

    // Map
    "map.eyebrow": "Regional Network — Africa & Gulf",
    "map.title": "Redline network across Africa & the Gulf",
    "map.subtitle": "Egyptian governorates + regional centers — try clicking any point",
    "map.hud": "LIVE LOGISTICS GRID — AFRICA & MIDDLE EAST",
    "map.nodes": "NODES ACTIVE",
    "map.placeholder": "Click any governorate",
    "map.active": "Active delivery point",
    "map.covered": "Governorates covered",
    "map.delivery": "On-time delivery",
    "map.quicklist": "Governorates list",

    // Videos
    "videos.eyebrow": "Video Gallery",
    "videos.title": "Watch Redline in action",
    "videos.subtitle": "Videos documenting our operations, network, and customer stories across Egypt",

    // About
    "about.eyebrow": "About Us",
    "about.title": "Redline — Egypt's shipping backbone",
    "about.p1": "For over 15 years, we've built Redline to be the trusted logistics partner for businesses and individuals in Egypt. Our network covers all 27 governorates with more than 40 branches and warehouses, providing integrated shipping solutions with speed, security, and unbeatable competitive pricing.",
    "about.p2": "From the start, we believed that shipping isn't just moving parcels — it's a commitment to a promise. That's why we invest in technology, infrastructure, and human capital to ensure every shipment arrives on time.",
    "about.exp": "Years of experience",

    // Partners
    "partners.eyebrow": "Our Partners",
    "partners.title": "Logos of our partners & clients",
    "partners.subtitle": "Over 12,000 companies and brands trust Redline for their daily shipping",
    "partners.trust": "Trusted by the biggest brands in Egypt",

    // Testimonials
    "test.eyebrow": "Testimonials",
    "test.title": "Our customers are our strength",
    "test.subtitle": "Over 12,000 customers trust Redline for their shipments daily",

    // CTA
    "cta.title": "Ready to start shipping with Redline?",
    "cta.subtitle": "Join over 12,000 customers who trust us daily. Contact us now for a custom quote for your shipments.",
    "cta.button": "Get a Quote",

    // Contact
    "contact.eyebrow": "Contact Us",
    "contact.title": "Always ready to serve you",
    "contact.subtitle": "Have a question or special request? Our team is waiting for you around the clock",
    "contact.formTitle": "Send us a message",
    "contact.name": "Name",
    "contact.email": "Email",
    "contact.phone": "Phone",
    "contact.subject": "Subject",
    "contact.message": "Message",
    "contact.submit": "Send Message",
    "contact.direct": "Direct Contact",
    "contact.directDesc": "We're here to help with everything related to your shipments. Choose the best way to reach us.",
    "contact.address": "Address",
    "contact.addressVal": "5th Settlement, New Cairo, Egypt",
    "contact.phoneLabel": "Phone",
    "contact.phoneVal": "19999 (nationwide)",
    "contact.emailLabel": "Email",
    "contact.emailVal": "support@redline.eg",
    "contact.hours": "Working Hours",
    "contact.hoursVal": "Sat - Thu · 9 AM - 11 PM",

    // Footer
    "footer.desc": "Redline Shipping — your trusted logistics partner in Egypt. We cover 27 governorates with 40+ branches and warehouses, with the fastest service, best prices, and guaranteed delivery.",
    "footer.company": "Company",
    "footer.services": "Services",
    "footer.help": "Help",
    "footer.newsletter": "Newsletter",
    "footer.newsletterDesc": "Subscribe for the latest offers and news",
    "footer.copyright": "© Redline Shipping. All rights reserved.",
    "footer.made": "Made with passion in Egypt",
    "footer.dashboard": "Dashboard login",
  },
};

// === i18n store ===
interface I18nState {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

export const useI18n = create<I18nState>((set) => ({
  locale: "ar",
  setLocale: (locale) => {
    set({ locale });
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    }
    try { localStorage.setItem("redline-locale", locale); } catch {}
  },
}));

// === Hook: useT (returns t function + current locale) ===
export function useT() {
  const locale = useI18n((s) => s.locale);
  const t = (key: string): string => MESSAGES[locale]?.[key] ?? MESSAGES.ar[key] ?? key;
  return { t, locale, isAr: locale === "ar", isEn: locale === "en" };
}

// === Init locale from storage ===
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem("redline-locale") as Locale | null;
    if (saved) {
      useI18n.getState().setLocale(saved);
    }
  } catch {}
}

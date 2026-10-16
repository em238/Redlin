/**
 * Redline Shipping — Comprehensive Prisma Seed
 * Populates ALL live website content into the database.
 *
 * Idempotent: safe to re-run — deletes existing rows then re-inserts.
 * Preserves the admin user (admin@redline.eg / admin123) and links them
 * to the super-admin role.
 *
 * Run with: npx tsx prisma/seed.ts   (or `bun run db:seed`)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ====================================================================
// 1. HERO IMAGES (from src/components/site/hero.tsx FALLBACK_IMAGES)
//    Expanded to include all 5 site-generated images used in carousel.
// ====================================================================
const heroImages = [
  {
    url: "/images/hero-truck.png",
    title: "شاحنة Redline على الطريق السريع",
    titleAr: "شاحنة Redline على الطريق السريع",
    titleEn: "Redline truck on the highway",
    order: 0,
    active: true,
  },
  {
    url: "/images/fleet.png",
    title: "أسطول Redline عند الفجر",
    titleAr: "أسطول Redline عند الفجر",
    titleEn: "Redline fleet at dawn",
    order: 1,
    active: true,
  },
  {
    url: "/images/warehouse.png",
    title: "مستودعات Redline",
    titleAr: "مستودعات Redline",
    titleEn: "Redline warehouses",
    order: 2,
    active: true,
  },
  {
    url: "/images/operations.png",
    title: "مركز العمليات",
    titleAr: "مركز العمليات",
    titleEn: "Operations center",
    order: 3,
    active: true,
  },
  {
    url: "/images/courier.png",
    title: "مندوب التوصيل",
    titleAr: "مندوب التوصيل",
    titleEn: "Delivery courier",
    order: 4,
    active: true,
  },
];

// ====================================================================
// 2. ABOUT (from src/components/site/about.tsx + i18n keys about.*)
// ====================================================================
const aboutRecords = [
  {
    titleAr: "Redline — عصب الشحن في مصر",
    titleEn: "Redline — Egypt's shipping backbone",
    subtitleAr: "من نحن",
    subtitleEn: "About Us",
    descriptionAr:
      "منذ أكثر من 15 عاماً، نبني Redline لنكون الشريك اللوجستي الموثوق للشركات والأفراد في مصر. شبكتنا تغطي 27 محافظة بأكملها بأكثر من 40 فرعاً ومستودعاً، ونوفّر حلول شحن متكاملة بسرعة وأمان وأسعار تنافسية لا تضاهى.\n\nمن البداية، آمنّا بأن الشحن ليس مجرد نقل طرود، بل التزام بالوعد. لذلك نستثمر في التكنولوجيا والبنية التحتية والكوادر البشرية لنضمن وصول كل شحنة في الوقت المحدد.",
    descriptionEn:
      "For over 15 years, we have built Redline to be the trusted logistics partner for businesses and individuals across Egypt. Our network covers all 27 governorates with more than 40 branches and warehouses, and we provide integrated shipping solutions with speed, safety, and unbeatable competitive prices.\n\nFrom the start, we believed that shipping is not just moving parcels — it's a promise. That's why we invest in technology, infrastructure, and human talent to guarantee that every shipment arrives on time.",
    image: "/images/warehouse.png",
    features: JSON.stringify([
      {
        icon: "zap",
        titleAr: "سرعة فائقة",
        titleEn: "Ultra-fast",
        descAr: "توصيل في نفس اليوم داخل القاهرة الكبرى و48-96 ساعة لكل المحافظات",
        descEn: "Same-day delivery in Greater Cairo and 48-96 hours for all governorates",
      },
      {
        icon: "shield-check",
        titleAr: "أمان مضمون",
        titleEn: "Guaranteed safety",
        descAr: "تأمين كامل على كل شحنة مع تعويض كامل عند أي طارئ",
        descEn: "Full insurance on every shipment with complete compensation in case of any incident",
      },
      {
        icon: "bar-chart-3",
        titleAr: "تتبع مباشر",
        titleEn: "Live tracking",
        descAr: "نظام تتبع لحظي يخبرك بمكان شحنتك في كل خطوة",
        descEn: "Real-time tracking system that tells you where your shipment is at every step",
      },
      {
        icon: "map-pinned",
        titleAr: "تغطية شاملة",
        titleEn: "Comprehensive coverage",
        descAr: "27 محافظة و40+ فرع ومستودع في كل أنحاء مصر",
        descEn: "27 governorates and 40+ branches and warehouses across Egypt",
      },
      {
        icon: "banknote",
        titleAr: "أسعار منافسة",
        titleEn: "Competitive prices",
        descAr: "أفضل الأسعار في السوق مع خصومات للكميات والشركات",
        descEn: "Best market prices with volume and corporate discounts",
      },
      {
        icon: "headphones",
        titleAr: "دعم 24/7",
        titleEn: "24/7 support",
        descAr: "فريق دعم متكامل على مدار الساعة لخدمتك في أي وقت",
        descEn: "Integrated support team available around the clock to serve you anytime",
      },
    ]),
  },
];

// ====================================================================
// 3. SERVICES (bilingual AR/EN with CTA text + custom multipliers)
// ====================================================================
const services = [
  {
    name: "Standard Delivery",
    nameAr: "عادي",
    description: "توصيل خلال 48-96 ساعة بأفضل الأسعار",
    descriptionAr: "توصيل خلال 48-96 ساعة بأفضل الأسعار",
    descriptionEn: "Delivery within 48-96 hours at the best rates",
    ctaTextAr: "اطلب الخدمة",
    ctaTextEn: "Request Service",
    icon: "truck",
    multiplier: 1.0,
    active: true,
  },
  {
    name: "Cash on Delivery",
    nameAr: "دفع عند الاستلام",
    description: "استلام قيمة الشحنة عند التسليم للمستلم",
    descriptionAr: "استلام قيمة الشحنة عند التسليم للمستلم",
    descriptionEn: "Collection of parcel value upon delivery to recipient",
    ctaTextAr: "اطلب الخدمة",
    ctaTextEn: "Request Service",
    icon: "banknote",
    multiplier: 1.3,
    active: true,
  },
  {
    name: "Returns Management",
    nameAr: "مرتجعات",
    description: "استرجاع الشحنات المرتجعة من العملاء",
    descriptionAr: "استرجاع الشحنات المرتجعة من العملاء",
    descriptionEn: "Seamless reverse logistics and customer returns",
    ctaTextAr: "اطلب الخدمة",
    ctaTextEn: "Request Service",
    icon: "rotate-ccw",
    multiplier: 1.2,
    active: true,
  },
  {
    name: "Heavy Cargo & Freight",
    nameAr: "شحن ثقيل",
    description: "شحن البضائع والأغراض الثقيلة والكميات",
    descriptionAr: "شحن البضائع والأغراض الثقيلة والكميات",
    descriptionEn: "Shipping bulky items, heavy cargo, and commercial bulk quantities",
    ctaTextAr: "اطلب الخدمة",
    ctaTextEn: "Request Service",
    icon: "package",
    multiplier: 2.0,
    active: true,
  },
  {
    name: "Express Shipping",
    nameAr: "ممتاز",
    description: "توصيل خلال 24-48 ساعة مع أولوية الشحن",
    descriptionAr: "توصيل خلال 24-48 ساعة مع أولوية الشحن",
    descriptionEn: "Priority delivery within 24-48 hours",
    ctaTextAr: "اطلب الخدمة",
    ctaTextEn: "Request Service",
    icon: "zap",
    multiplier: 1.5,
    active: true,
  },
  {
    name: "Same-Day Delivery",
    nameAr: "نفس اليوم",
    description: "توصيل في نفس اليوم داخل القاهرة الكبرى",
    descriptionAr: "توصيل في نفس اليوم داخل القاهرة الكبرى",
    descriptionEn: "Same-day fast dispatch and delivery within Greater Cairo",
    ctaTextAr: "اطلب الخدمة",
    ctaTextEn: "Request Service",
    icon: "rocket",
    multiplier: 2.3,
    active: true,
  },
];

// ====================================================================
// 4. HOW-IT-WORKS STEPS (from src/components/site/how-it-works.tsx)
// ====================================================================
const howItWorksSteps = [
  {
    order: 1,
    titleAr: "احجز شحنتك",
    titleEn: "Book your shipment",
    descAr: "احجز شحنتك أونلاين أو بالهاتف 19999 في دقائق معدودة — بدون تعقيد.",
    descEn: "Book your shipment online or by phone at 19999 in minutes — no hassle.",
    icon: "clipboard-list",
    active: true,
  },
  {
    order: 2,
    titleAr: "نستلم ونشحن",
    titleEn: "We pick up & ship",
    descAr: "مندوبنا يستلم الشحنة منك ونشحنها لوجهتها بأسرع خدمة مناسبة لك.",
    descEn: "Our courier picks up your shipment and we ship it to its destination with the fastest suitable service.",
    icon: "truck",
    active: true,
  },
  {
    order: 3,
    titleAr: "توصّل للمستلم",
    titleEn: "Delivered to recipient",
    descAr: "توصّل الشحنة لأي محافظة في مصر وتسليمها للمستلم بأمان وضمان كامل.",
    descEn: "We deliver the shipment to any governorate in Egypt and hand it to the recipient with full safety and guarantee.",
    icon: "package-check",
    active: true,
  },
];

// ====================================================================
// 5. VIDEOS (from src/components/site/video-section.tsx FALLBACK_VIDEOS)
// ====================================================================
const videos = [
  {
    title: "Redline — The Shipping Story",
    titleAr: "Redline — قصة شحن",
    description: "Discover Redline's journey from the beginning to becoming Egypt's largest shipping company",
    descriptionAr: "تعرف على رحلة Redline منذ البداية وحتى أصبحت أكبر شركة شحن في مصر",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "/images/operations.png",
    category: "promo",
    active: true,
    featured: true,
  },
  {
    title: "Delivery Network Across 27 Governorates",
    titleAr: "شبكة التوصيل في 27 محافظة",
    description: "How we cover all Egyptian governorates in the fastest time",
    descriptionAr: "كيف نغطي جميع محافظات مصر بأسرع وقت وأعلى دقة",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "/images/fleet.png",
    category: "logistics",
    active: true,
    featured: false,
  },
];

// ====================================================================
// 6. PARTNERS (from src/components/site/partners.tsx + seed-content.ts)
// ====================================================================
const partners = [
  { name: "TechStore", nameAr: "متجر التقنية", logo: "/images/partner-1.png", icon: "smartphone", color: "#2563eb", website: null, order: 0, active: true },
  { name: "FashionHub", nameAr: "مركز الأزياء", logo: "/images/partner-2.png", icon: "shirt", color: "#ec4899", website: null, order: 1, active: true },
  { name: "Adel Trading", nameAr: "شركة عادل للتجارة", logo: "/images/partner-3.png", icon: "briefcase", color: "#d97706", website: null, order: 2, active: true },
  { name: "Nour Crafts", nameAr: "حرفيات نور", logo: "/images/partner-4.png", icon: "palette", color: "#9333ea", website: null, order: 3, active: true },
  { name: "Ibrahim Group", nameAr: "مجموعة إبراهيم", logo: "/images/partner-5.png", icon: "building", color: "#0d9488", website: null, order: 4, active: true },
  { name: "MegaMart", nameAr: "ميجا مارت", logo: "/images/partner-6.png", icon: "store", color: "#16a34a", website: null, order: 5, active: true },
  { name: "QuickShip", nameAr: "كويك شيب", logo: "/images/partner-7.png", icon: "truck", color: "#dc2626", website: null, order: 6, active: true },
  { name: "GlobalTech", nameAr: "جلوبال تك", logo: "/images/partner-8.png", icon: "cpu", color: "#4f46e5", website: null, order: 7, active: true },
];

// ====================================================================
// 7. GOVERNORATES (27 governorates from src/lib/egypt-coords.ts GOV_COORDS)
//    Zones: A = Greater Cairo | B = Delta | C = Upper Egypt | D = Borders
// ====================================================================
const governorates = [
  { name: "Cairo", nameAr: "القاهره", zone: "A", basePrice: 30, etaHours: 24, active: true },
  { name: "Giza", nameAr: "الجيزه", zone: "A", basePrice: 30, etaHours: 24, active: true },
  { name: "Alexandria", nameAr: "الاسكندريه", zone: "A", basePrice: 40, etaHours: 36, active: true },
  { name: "Qalyubia", nameAr: "القليوبيه", zone: "A", basePrice: 35, etaHours: 24, active: true },
  { name: "Port Said", nameAr: "بورسعيد", zone: "B", basePrice: 55, etaHours: 48, active: true },
  { name: "Suez", nameAr: "السويس", zone: "B", basePrice: 55, etaHours: 48, active: true },
  { name: "Dakahlia", nameAr: "الدقهليه", zone: "B", basePrice: 45, etaHours: 36, active: true },
  { name: "Sharqia", nameAr: "الشرقيه", zone: "B", basePrice: 45, etaHours: 36, active: true },
  { name: "Kafr El Sheikh", nameAr: "كفر الشيخ", zone: "B", basePrice: 50, etaHours: 48, active: true },
  { name: "Gharbia", nameAr: "الغربيه", zone: "B", basePrice: 45, etaHours: 36, active: true },
  { name: "Monufia", nameAr: "المنوفيه", zone: "B", basePrice: 40, etaHours: 36, active: true },
  { name: "Beheira", nameAr: "البحيره", zone: "B", basePrice: 50, etaHours: 48, active: true },
  { name: "Ismailia", nameAr: "الاسماعيليه", zone: "B", basePrice: 50, etaHours: 48, active: true },
  { name: "Faiyum", nameAr: "الفيوم", zone: "C", basePrice: 55, etaHours: 60, active: true },
  { name: "Beni Suef", nameAr: "بني سويف", zone: "C", basePrice: 55, etaHours: 60, active: true },
  { name: "Minya", nameAr: "المنيا", zone: "C", basePrice: 60, etaHours: 72, active: true },
  { name: "Asyut", nameAr: "اسيوط", zone: "C", basePrice: 65, etaHours: 72, active: true },
  { name: "Sohag", nameAr: "سوهاج", zone: "C", basePrice: 70, etaHours: 72, active: true },
  { name: "Qena", nameAr: "قنا", zone: "D", basePrice: 75, etaHours: 84, active: true },
  { name: "Luxor", nameAr: "الاقصر", zone: "D", basePrice: 80, etaHours: 96, active: true },
  { name: "Aswan", nameAr: "اسوان", zone: "D", basePrice: 90, etaHours: 96, active: true },
  { name: "Red Sea", nameAr: "البحر الاحمر", zone: "D", basePrice: 85, etaHours: 96, active: true },
  { name: "New Valley", nameAr: "الوادي الجديد", zone: "D", basePrice: 95, etaHours: 120, active: true },
  { name: "Matrouh", nameAr: "مطروح", zone: "D", basePrice: 85, etaHours: 96, active: true },
  { name: "North Sinai", nameAr: "شمال سيناء", zone: "D", basePrice: 90, etaHours: 96, active: true },
  { name: "South Sinai", nameAr: "جنوب سيناء", zone: "D", basePrice: 90, etaHours: 96, active: true },
  { name: "Damietta", nameAr: "دمياط", zone: "B", basePrice: 45, etaHours: 36, active: true },
];

// ====================================================================
// 8. CONTACT INFO (from src/components/site/contact.tsx ADDRESSES/PHONES/EMAILS)
// ====================================================================
const contactInfo = [
  // Addresses (type: "address")
  {
    type: "address",
    labelAr: "الفرع الرئيسي",
    labelEn: "Headquarters",
    value: "التجمع الخامس، القاهرة الجديدة، مصر",
    href: null,
    order: 0,
    active: true,
  },
  {
    type: "address",
    labelAr: "مركز التوزيع والشحن",
    labelEn: "Distribution & Shipping Center",
    value: "المنطقة اللوجستية، العاشر من رمضان",
    href: null,
    order: 1,
    active: true,
  },
  // Phones (type: "phone")
  {
    type: "phone",
    labelAr: "الخط الساخن الموحد",
    labelEn: "Unified Hotline",
    value: "19999 (24/7)",
    href: "tel:19999",
    order: 0,
    active: true,
  },
  {
    type: "phone",
    labelAr: "خدمة العملاء والشحنات",
    labelEn: "Customer & Shipping Service",
    value: "01000000000",
    href: "tel:+201000000000",
    order: 1,
    active: true,
  },
  {
    type: "phone",
    labelAr: "إدارة التعاقدات والشركات",
    labelEn: "Contracts & Corporate",
    value: "01100000000",
    href: "tel:+201100000000",
    order: 2,
    active: true,
  },
  // Emails (type: "email")
  {
    type: "email",
    labelAr: "الدعم الفني وخدمة العملاء",
    labelEn: "Technical Support & Customer Service",
    value: "support@redline.eg",
    href: "mailto:support@redline.eg",
    order: 0,
    active: true,
  },
  {
    type: "email",
    labelAr: "قسم المبيعات والشركات",
    labelEn: "Sales & Corporate",
    value: "sales@redline.eg",
    href: "mailto:sales@redline.eg",
    order: 1,
    active: true,
  },
  {
    type: "email",
    labelAr: "الاستفسارات العامة",
    labelEn: "General Inquiries",
    value: "info@redline.eg",
    href: "mailto:info@redline.eg",
    order: 2,
    active: true,
  },
];

// ====================================================================
// 9. TESTIMONIALS (from src/components/site/testimonials.tsx + TEST_EN map)
//    Each testimonial has bilingual name/role/company/content fields.
// ====================================================================
const testimonials = [
  {
    name: "Ahmed Mansour",
    nameAr: "أحمد منصور",
    role: "Store Owner",
    roleAr: "صاحب متجر إلكترونيات",
    company: "TechStore EG",
    companyAr: "TechStore EG",
    content: "Excellent and fast service! Shipments reached my customers across all Egyptian governorates on time. Redline completely changed how I manage my shipments.",
    contentAr: "خدمة ممتازة وسريعة! وصلت الشحنات لعملائي في كل محافظات مصر في الوقت المحدد. Redline غيّرت طريقة إدارة شحناتي تماماً.",
    rating: 5,
    avatar: null,
    active: true,
    status: "approved",
  },
  {
    name: "Sara El-Sayed",
    nameAr: "سارة السيد",
    role: "Sales Manager",
    roleAr: "مديرة مبيعات",
    company: "Fashion Hub",
    companyAr: "Fashion Hub",
    content: "The best shipping company I've dealt with. Competitive prices and professional service. The tracking system is excellent.",
    contentAr: "أفضل شركة شحن تعاملت معها. الأسعار منافسة والخدمة احترافية. نظام التتبع ممتاز ويسهل عليّ متابعة كل شحنة.",
    rating: 5,
    avatar: null,
    active: true,
    status: "approved",
  },
  {
    name: "Mohamed Adel",
    nameAr: "محمد عادل",
    role: "Wholesale Trader",
    roleAr: "تاجر جملة",
    company: "Adel Trading",
    companyAr: "Adel Trading",
    content: "Heavy shipping and high professionalism. The team is professional and delivery is precise. I recommend Redline to everyone.",
    contentAr: "شحن ثقيل وبضائع كثيرة ولم أواجه أي مشكلة. الفريق محترف والتوصيل دقيق. أنصح الجميع بـ Redline.",
    rating: 5,
    avatar: null,
    active: true,
    status: "approved",
  },
  {
    name: "Nour Hassan",
    nameAr: "نور حسن",
    role: "Startup Founder",
    roleAr: "مؤسس شركة ناشئة",
    company: "Nour Crafts",
    companyAr: "نور كرافتس",
    content: "As a small business, Redline provided me with affordable shipping solutions with high quality. Thank you for the professionalism.",
    contentAr: "كشركة صغيرة، وفرت لي Redline حلول شحن بأسعار مناسبة وبأعلى جودة. شكراً على الاحترافية والالتزام بالمواعيد.",
    rating: 5,
    avatar: null,
    active: true,
    status: "approved",
  },
  {
    name: "Khaled Ibrahim",
    nameAr: "خالد إبراهيم",
    role: "Supply Chain Manager",
    roleAr: "مدير سلاسل الإمداد",
    company: "Ibrahim Group",
    companyAr: "Ibrahim Group",
    content: "A strategic partnership for two years. The flexibility and speed in handling large quantities is unmatched. A reliable company by all measures.",
    contentAr: "شراكة استراتيجية منذ سنتين. المرونة والسرعة في التعامل مع الكميات الكبيرة لا تضاهى. شركة موثوقة بكل المقاييس.",
    rating: 5,
    avatar: null,
    active: true,
    status: "approved",
  },
];

// ====================================================================
// 10. SITE STATS (from src/components/site/stats-bar.tsx FALLBACK)
//     + a 5th "ticker" SiteStat storing the bilingual cities list as JSON
// ====================================================================
const tickerCities = [
  { nameAr: "القاهرة", nameEn: "Cairo" },
  { nameAr: "الجيزة", nameEn: "Giza" },
  { nameAr: "الإسكندرية", nameEn: "Alexandria" },
  { nameAr: "القليوبية", nameEn: "Qalyubia" },
  { nameAr: "بورسعيد", nameEn: "Port Said" },
  { nameAr: "السويس", nameEn: "Suez" },
  { nameAr: "الدقهلية", nameEn: "Dakahlia" },
  { nameAr: "الشرقية", nameEn: "Sharqia" },
  { nameAr: "كفر الشيخ", nameEn: "Kafr El Sheikh" },
  { nameAr: "الغربية", nameEn: "Gharbia" },
  { nameAr: "المنوفية", nameEn: "Menofia" },
  { nameAr: "البحيرة", nameEn: "Beheira" },
  { nameAr: "الإسماعيلية", nameEn: "Ismailia" },
  { nameAr: "الفيوم", nameEn: "Fayoum" },
  { nameAr: "بني سويف", nameEn: "Beni Suef" },
  { nameAr: "المنيا", nameEn: "Minya" },
  { nameAr: "أسيوط", nameEn: "Asyut" },
  { nameAr: "سوهاج", nameEn: "Sohag" },
  { nameAr: "قنا", nameEn: "Qena" },
  { nameAr: "الأقصر", nameEn: "Luxor" },
  { nameAr: "أسوان", nameEn: "Aswan" },
  { nameAr: "البحر الأحمر", nameEn: "Red Sea" },
  { nameAr: "الوادي الجديد", nameEn: "New Valley" },
  { nameAr: "مطروح", nameEn: "Matrouh" },
  { nameAr: "شمال سيناء", nameEn: "North Sinai" },
  { nameAr: "جنوب سيناء", nameEn: "South Sinai" },
  { nameAr: "دمياط", nameEn: "Damietta" },
  { nameAr: "طنطا", nameEn: "Tanta" },
  { nameAr: "المنصورة", nameEn: "Mansoura" },
  { nameAr: "الزقازيق", nameEn: "Zagazig" },
  { nameAr: "شرم الشيخ", nameEn: "Sharm El Sheikh" },
  { nameAr: "الغردقة", nameEn: "Hurghada" },
];

const siteStats = [
  { label: "Shipments delivered", labelAr: "شحنة تم تسليمها", value: "850K+", icon: "package" },
  { label: "Governorates covered", labelAr: "محافظة مغطاة", value: "27", icon: "map" },
  { label: "Happy customers", labelAr: "عميل يثقون بنا", value: "12K+", icon: "users" },
  { label: "Branches & warehouses", labelAr: "فرع ومستودع", value: "40+", icon: "building" },
  // Ticker entry — value field carries the bilingual cities list as JSON
  {
    label: "Ticker cities",
    labelAr: "مداخل شريط المدن",
    value: JSON.stringify(tickerCities),
    icon: "ticker",
  },
];

// ====================================================================
// 11. WHATSAPP SETTING (default — phone + bilingual messages)
// ====================================================================
const whatsappSetting = {
  phoneNumber: "201000000000",
  defaultMessageAr: "مرحباً، أريد الاستفسار عن خدمات الشحن",
  defaultMessageEn: "Hello, I'd like to inquire about shipping services",
  active: true,
};

// ====================================================================
// 11b. HERO CONTENT (text & CTA settings — single record)
// ====================================================================
const heroContent = {
  badgeAr: "نشحن لكل محافظات مصر — 27 محافظة بنفس السرعة",
  badgeEn: "We Ship Across All Egypt — 27 Governorates with Equal Speed",
  titleAr: "شحن يصل لكل مصر بسرعة Redline",
  titleEn: "Shipping Across Egypt at Redline Speed",
  subtitleAr: "شركة شحن احترافية تغطي جميع محافظات مصر بخدمات متنوعة — عادي، ممتاز، نفس اليوم، وشحن ثقيل — مع تتبع مباشر وأسعار منافسة وضمان التسليم.",
  subtitleEn: "A professional shipping company covering all Egyptian governorates with versatile services — Standard, Express, Same-Day, and Heavy Freight — with live tracking, competitive rates, and guaranteed delivery.",
  cta1TextAr: "اطلب شحن الآن",
  cta1TextEn: "Order Shipment Now",
  cta1Link: "#contact",
  cta2TextAr: "خدماتنا",
  cta2TextEn: "Our Services",
  cta2Link: "#services",
  feature1Ar: "توصيل نفس اليوم في القاهرة الكبرى",
  feature1En: "Same-day delivery in Greater Cairo",
  feature2Ar: "ضمان كامل على كل شحنة",
  feature2En: "Full guarantee on every shipment",
  feature3Ar: "27 محافظة بتغطية كاملة",
  feature3En: "Full coverage across 27 governorates",
  active: true,
};

// ====================================================================
// 11c. PRE-FOOTER CTA BANNER (single record — heading, subtitle, button, hotline)
// ====================================================================
const ctaBanner = {
  headingAr: "جاهز تبدأ شحن مع Redline؟",
  headingEn: "Ready to Start Shipping with Redline?",
  subAr: "انضم لأكثر من 12,000 عميل يثقون بنا يومياً. تواصل معنا الآن واحصل على عرض سعر مخصص لشحناتك.",
  subEn: "Join over 12,000 clients who trust us daily. Contact us now and get a custom quote for your shipments.",
  btnTextAr: "اطلب عرض سعر",
  btnTextEn: "Request a Quote",
  btnLink: "#contact",
  phone: "19999",
  active: true,
};

// ====================================================================
// 11b. SECTION CONTENT (8 sections × badge/title/description AR+EN)
//      DB-managed section-level text for the public site sections.
//      Replaces the i18n.ts hardcoded values with editable DB rows.
// ====================================================================
const sectionContents = [
  {
    section: "services",
    badgeAr: "خدماتنا",
    badgeEn: "Our Services",
    titleAr: "حلول شحن متكاملة لكل احتياجاتك",
    titleEn: "Integrated Shipping Solutions for All Your Needs",
    descriptionAr: "من الشحن العادي إلى التوصيل في نفس اليوم، نوفّر لك خيارات تناسب سرعتك وميزانيتك",
    descriptionEn: "From standard shipping to same-day delivery, we offer options tailored to your speed and budget.",
  },
  {
    section: "how-it-works",
    badgeAr: "إزاي بنشتغل",
    badgeEn: "How It Works",
    titleAr: "الشحن مع Redline في 3 خطوات",
    titleEn: "Shipping with Redline in 3 Steps",
    descriptionAr: "من الحجز للتسليم — عملية بسيطة وسريعة من البداية للنهاية",
    descriptionEn: "From booking to delivery — a simple and fast process from start to finish.",
  },
  {
    section: "videos",
    badgeAr: "معرض الفيديو",
    badgeEn: "Video Gallery",
    titleAr: "شاهد Redline أثناء العمل",
    titleEn: "Watch Redline in Action",
    descriptionAr: "مقاطع توثّق عملياتنا، شبكتنا، وقصص عملائنا في كل أنحاء مصر",
    descriptionEn: "Footage documenting our operations, network, and client stories across Egypt.",
  },
  {
    section: "partners",
    badgeAr: "شركاء النجاح",
    badgeEn: "Partners in Success",
    titleAr: "شعارات شركائنا وعملائنا",
    titleEn: "Our Partners and Clients",
    descriptionAr: "أكثر من 12,000 شركة وعلامة تجارية تثق في Redline لشحناتها يومياً",
    descriptionEn: "Over 12,000 companies and brands trust Redline for their daily shipments.",
  },
  {
    section: "testimonials",
    badgeAr: "آراء العملاء",
    badgeEn: "Customer Reviews",
    titleAr: "عملاؤنا هم قوتنا",
    titleEn: "Our Customers Are Our Strength",
    descriptionAr: "أكثر من 12,000 عميل يثقون في Redline لشحناتهم يومياً",
    descriptionEn: "Over 12,000 customers trust Redline for their daily shipments.",
  },
  {
    section: "contact",
    badgeAr: "تواصل معنا",
    badgeEn: "Contact Us",
    titleAr: "جاهزون لخدمتك دائماً",
    titleEn: "Always Ready to Serve You",
    descriptionAr: "لديك استفسار أو طلب خاص؟ فريقنا بانتظارك على مدار الساعة",
    descriptionEn: "Have an inquiry or special request? Our team is available around the clock.",
  },
  {
    section: "map",
    badgeAr: "الشبكة الإقليمية — أفريقيا والخليج",
    badgeEn: "Regional Network — Africa & Gulf",
    titleAr: "شبكة Redline على خريطة أفريقيا والخليج",
    titleEn: "Redline Network Across Africa & Gulf",
    descriptionAr: "محافظة مصرية + مركز إقليمي — جرّب الضغط على أي نقطة",
    descriptionEn: "Egyptian governorates + regional centers — try clicking any point",
  },
  {
    section: "footer",
    badgeAr: "النشرة البريدية",
    badgeEn: "Newsletter",
    titleAr: "اشترك لتصلك آخر العروض والأخبار",
    titleEn: "Subscribe to get the latest offers and updates.",
    descriptionAr: "دخول لوحة التحكم",
    descriptionEn: "Admin Login",
  },
];

// ====================================================================
// 11c. FOOTER CONTENT (1 record — bio, newsletter text, dashboard link, address)
// ====================================================================
const footerContent = {
  bioAr: "شركة Redline للشحن — شريكك اللوجستي الموثوق في مصر. نغطي 27 محافظة بأكثر من 40 فرعاً ومستودعاً، بأسرع خدمة وأفضل الأسعار وضمان التسليم.",
  bioEn: "Redline Transport — Your trusted logistics partner in Egypt. Covering 27 governorates with 40+ branches and warehouses, fast service, competitive rates, and guaranteed delivery.",
  newsletterTitleAr: "النشرة البريدية",
  newsletterTitleEn: "Newsletter",
  newsletterDescAr: "اشترك لتصلك آخر العروض والأخبار",
  newsletterDescEn: "Subscribe to get the latest offers and updates.",
  dashboardLinkAr: "دخول لوحة التحكم",
  dashboardLinkEn: "Admin Login",
  addressAr: "التجمع الخامس، القاهرة الجديدة",
  addressEn: "Fifth Settlement, New Cairo",
  facebookUrl: "https://facebook.com",
  instagramUrl: "https://instagram.com",
  twitterUrl: "https://x.com",
  linkedinUrl: "https://linkedin.com",
  whatsappUrl: "https://wa.me/201000000000",
  telegramUrl: "https://t.me/redline",
  darkThemeVariant: "slate",
  active: true,
};

// ====================================================================
// 11d. FOOTER LINKS (15 links across 3 categories: company / services / support)
// ====================================================================
const footerLinks = [
  // Company
  { category: "company", labelAr: "من نحن", labelEn: "About", href: "#", order: 0 },
  { category: "company", labelAr: "فريق العمل", labelEn: "Team", href: "#", order: 1 },
  { category: "company", labelAr: "الوظائف", labelEn: "Careers", href: "#", order: 2 },
  { category: "company", labelAr: "المدونة", labelEn: "Blog", href: "#", order: 3 },
  { category: "company", labelAr: "الأخبار", labelEn: "News", href: "#", order: 4 },
  // Services
  { category: "services", labelAr: "شحن عادي", labelEn: "Standard", href: "#services", order: 0 },
  { category: "services", labelAr: "شحن ممتاز", labelEn: "Express", href: "#services", order: 1 },
  { category: "services", labelAr: "نفس اليوم", labelEn: "Same Day", href: "#services", order: 2 },
  { category: "services", labelAr: "شحن ثقيل", labelEn: "Freight", href: "#services", order: 3 },
  { category: "services", labelAr: "دفع عند الاستلام", labelEn: "Cash on Delivery", href: "#services", order: 4 },
  // Support
  { category: "support", labelAr: "تتبع الشحنة", labelEn: "Track Shipment", href: "#contact", order: 0 },
  { category: "support", labelAr: "الأسئلة الشائعة", labelEn: "FAQ", href: "#", order: 1 },
  { category: "support", labelAr: "سياسة الإرجاع", labelEn: "Return Policy", href: "#", order: 2 },
  { category: "support", labelAr: "الشروط والأحكام", labelEn: "Terms & Conditions", href: "#", order: 3 },
  { category: "support", labelAr: "سياسة الخصوصية", labelEn: "Privacy Policy", href: "#", order: 4 },
];

// ====================================================================
// 12. ROLES (3 system roles with permission matrices)
//     permissions stored as JSON string per schema
// ====================================================================
const ALL_ACTIONS = ["create", "read", "edit", "delete"];
const REVIEWS_ACTIONS = ["read", "approve", "reject", "delete"];

const buildAllPermissions = () => ({
  hero: ALL_ACTIONS,
  about: ALL_ACTIONS,
  services: ALL_ACTIONS,
  "how-it-works": ALL_ACTIONS,
  videos: ALL_ACTIONS,
  partners: ALL_ACTIONS,
  map: ALL_ACTIONS,
  contact: ALL_ACTIONS,
  reviews: REVIEWS_ACTIONS,
  users: ALL_ACTIONS,
  roles: ALL_ACTIONS,
});

const buildEditorPermissions = () => ({
  hero: ["create", "read", "edit", "delete"],
  about: ["create", "read", "edit", "delete"],
  services: ["create", "read", "edit", "delete"],
  "how-it-works": ["create", "read", "edit", "delete"],
  videos: ["create", "read", "edit", "delete"],
  partners: ["create", "read", "edit", "delete"],
  map: ["create", "read", "edit", "delete"],
  contact: ["create", "read", "edit", "delete"],
  reviews: ["read", "approve", "reject"],
  users: ["read"],
  roles: ["read"],
});

const buildViewerPermissions = () => ({
  hero: ["read"],
  about: ["read"],
  services: ["read"],
  "how-it-works": ["read"],
  videos: ["read"],
  partners: ["read"],
  map: ["read"],
  contact: ["read"],
  reviews: ["read"],
  users: ["read"],
  roles: ["read"],
});

const roles = [
  {
    name: "super-admin",
    nameAr: "المدير العام",
    description: "Super Administrator — full access to all modules and actions",
    descriptionAr: "مدير عام — صلاحية كاملة على كل الوحدات والإجراءات",
    descriptionEn: "Super Administrator — full access to all modules and actions",
    isSystemRole: true,
    permissions: JSON.stringify(buildAllPermissions()),
  },
  {
    name: "editor",
    nameAr: "محرر",
    description: "Editor — manage site content (hero, about, services, videos, etc.) and moderate reviews",
    descriptionAr: "محرر — إدارة محتوى الموقع (الهيدر، من نحن، الخدمات، الفيديوهات، إلخ) ومراجعة الآراء",
    descriptionEn: "Editor — manage site content (hero, about, services, videos, etc.) and moderate reviews",
    isSystemRole: true,
    permissions: JSON.stringify(buildEditorPermissions()),
  },
  {
    name: "viewer",
    nameAr: "مشاهد",
    description: "Viewer — read-only access to all dashboard modules",
    descriptionAr: "مشاهد — صلاحية قراءة فقط لكل وحدات لوحة التحكم",
    descriptionEn: "Viewer — read-only access to all dashboard modules",
    isSystemRole: true,
    permissions: JSON.stringify(buildViewerPermissions()),
  },
];

// ====================================================================
// MAIN SEED FUNCTION
// ====================================================================
async function main() {
  console.log("🌱 Seeding Redline database (comprehensive)...");

  // --- 1. ROLES (created first so users can link to them) ---
  console.log("→ Roles (3 system roles)...");
  const superAdminRole = await prisma.role.upsert({
    where: { name: "super-admin" },
    update: {
      nameAr: roles[0].nameAr,
      description: roles[0].description,
      descriptionAr: roles[0].descriptionAr,
      descriptionEn: roles[0].descriptionEn,
      isSystemRole: true,
      permissions: roles[0].permissions,
    },
    create: roles[0],
  });
  await prisma.role.upsert({
    where: { name: "editor" },
    update: {
      nameAr: roles[1].nameAr,
      description: roles[1].description,
      descriptionAr: roles[1].descriptionAr,
      descriptionEn: roles[1].descriptionEn,
      isSystemRole: true,
      permissions: roles[1].permissions,
    },
    create: roles[1],
  });
  await prisma.role.upsert({
    where: { name: "viewer" },
    update: {
      nameAr: roles[2].nameAr,
      description: roles[2].description,
      descriptionAr: roles[2].descriptionAr,
      descriptionEn: roles[2].descriptionEn,
      isSystemRole: true,
      permissions: roles[2].permissions,
    },
    create: roles[2],
  });
  console.log(`  ✓ ${roles.length} system roles seeded (super-admin, editor, viewer)`);

  // --- 2. ADMIN USER (upsert + link to super-admin role) ---
  console.log("→ Admin user (admin@redline.eg)...");
  const admin = await prisma.user.upsert({
    where: { email: "admin@redline.eg" },
    update: {
      name: "Redline Admin",
      password: "admin123",
      role: "admin",
      roleId: superAdminRole.id,
      status: "active",
    },
    create: {
      email: "admin@redline.eg",
      name: "Redline Admin",
      password: "admin123",
      role: "admin",
      roleId: superAdminRole.id,
      status: "active",
    },
  });
  console.log(`  ✓ Admin user linked to super-admin role (id: ${admin.id})`);

  // --- 3. GOVERNORATES (upsert by name) ---
  console.log(`→ Governorates (${governorates.length} entries)...`);
  for (const g of governorates) {
    await prisma.governorate.upsert({
      where: { name: g.name },
      update: g,
      create: g,
    });
  }
  console.log(`  ✓ ${governorates.length} governorates seeded`);

  // --- 4. SERVICES (delete + create) ---
  //     delete+create pattern (matches HowItWorksSteps / ContactInfo / etc.)
  //     so renamed services don't leave stale duplicates behind.
  console.log(`→ Services (${services.length} entries)...`);
  await prisma.service.deleteMany();
  for (const s of services) {
    await prisma.service.create({ data: s });
  }
  console.log(`  ✓ ${services.length} services seeded`);

  // --- 5. HOW-IT-WORKS STEPS (delete + create) ---
  console.log(`→ HowItWorksSteps (${howItWorksSteps.length} entries)...`);
  await prisma.howItWorksStep.deleteMany();
  for (const step of howItWorksSteps) {
    await prisma.howItWorksStep.create({ data: step });
  }
  console.log(`  ✓ ${howItWorksSteps.length} steps seeded`);

  // --- 6. CONTACT INFO (delete + create) ---
  console.log(`→ ContactInfo (${contactInfo.length} entries)...`);
  await prisma.contactInfo.deleteMany();
  for (const c of contactInfo) {
    await prisma.contactInfo.create({ data: c });
  }
  console.log(`  ✓ ${contactInfo.length} contact items seeded`);

  // --- 7. HERO IMAGES (delete + create) ---
  console.log(`→ HeroImages (${heroImages.length} entries)...`);
  await prisma.heroImage.deleteMany();
  for (const h of heroImages) {
    await prisma.heroImage.create({ data: h });
  }
  console.log(`  ✓ ${heroImages.length} hero images seeded`);

  // --- 8. PARTNERS (delete + create) ---
  console.log(`→ Partners (${partners.length} entries)...`);
  await prisma.partner.deleteMany();
  for (const p of partners) {
    await prisma.partner.create({ data: p });
  }
  console.log(`  ✓ ${partners.length} partners seeded`);

  // --- 9. VIDEOS (delete + create) ---
  console.log(`→ Videos (${videos.length} entries)...`);
  await prisma.video.deleteMany();
  for (const v of videos) {
    await prisma.video.create({ data: v });
  }
  console.log(`  ✓ ${videos.length} videos seeded`);

  // --- 10. TESTIMONIALS (delete + create) ---
  console.log(`→ Testimonials (${testimonials.length} entries)...`);
  await prisma.testimonial.deleteMany();
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }
  console.log(`  ✓ ${testimonials.length} testimonials seeded`);

  // --- 11. SITE STATS (delete + create) ---
  console.log(`→ SiteStats (${siteStats.length} entries)...`);
  await prisma.siteStat.deleteMany();
  for (const s of siteStats) {
    await prisma.siteStat.create({ data: s });
  }
  console.log(`  ✓ ${siteStats.length} site stats seeded`);

  // --- 12. ABOUT (upsert single record) ---
  console.log(`→ About (1 record)...`);
  await prisma.about.deleteMany();
  for (const a of aboutRecords) {
    await prisma.about.create({ data: a });
  }
  console.log(`  ✓ About content seeded`);

  // --- 13. WHATSAPP SETTING (upsert single record) ---
  console.log(`→ WhatsAppSetting (1 record)...`);
  await prisma.whatsAppSetting.deleteMany();
  await prisma.whatsAppSetting.create({ data: whatsappSetting });
  console.log(`  ✓ WhatsApp setting seeded (phone: ${whatsappSetting.phoneNumber})`);

  // --- 14. HERO CONTENT (text & CTA settings — single record) ---
  console.log(`→ HeroContent (text & CTA settings)...`);
  await prisma.heroContent.deleteMany();
  await prisma.heroContent.create({ data: heroContent });
  console.log(`  ✓ Hero content seeded (badge, title, subtitle, CTAs, features)`);

  // --- 15. PRE-FOOTER CTA BANNER (single record — heading, subtitle, button, hotline) ---
  console.log(`→ CtaBanner (pre-footer CTA)...`);
  await prisma.ctaBanner.deleteMany();
  await prisma.ctaBanner.create({ data: ctaBanner });
  console.log(`  ✓ CTA banner seeded (heading, subtitle, button, hotline: ${ctaBanner.phone})`);

  // --- 16. SECTION CONTENT (8 sections × badge/title/description AR+EN) ---
  console.log(`→ SectionContent (${sectionContents.length} sections)...`);
  await prisma.sectionContent.deleteMany();
  for (const sc of sectionContents) {
    await prisma.sectionContent.create({ data: sc });
  }
  console.log(`  ✓ ${sectionContents.length} section content records seeded`);

  // --- 17. FOOTER CONTENT (1 record) ---
  console.log(`→ FooterContent (1 record)...`);
  await prisma.footerContent.deleteMany();
  await prisma.footerContent.create({ data: footerContent });
  console.log(`  ✓ Footer content seeded`);

  // --- 18. FOOTER LINKS (15 links across 3 categories) ---
  console.log(`→ FooterLinks (${footerLinks.length} links)...`);
  await prisma.footerLink.deleteMany();
  for (const fl of footerLinks) {
    await prisma.footerLink.create({ data: fl });
  }
  console.log(`  ✓ ${footerLinks.length} footer links seeded`);

  console.log("✅ Comprehensive seed complete!");
  console.log("");
  console.log("Summary:");
  console.log(`  - 3 system roles (super-admin, editor, viewer)`);
  console.log(`  - 1 admin user (admin@redline.eg / admin123) → super-admin`);
  console.log(`  - ${governorates.length} governorates (zones A/B/C/D)`);
  console.log(`  - ${services.length} services (with bilingual fields)`);
  console.log(`  - ${howItWorksSteps.length} how-it-works steps`);
  console.log(`  - ${contactInfo.length} contact info items (address/phone/email)`);
  console.log(`  - ${heroImages.length} hero images (carousel)`);
  console.log(`  - ${partners.length} partners`);
  console.log(`  - ${videos.length} videos`);
  console.log(`  - ${testimonials.length} testimonials`);
  console.log(`  - ${siteStats.length} site stats (incl. ticker cities JSON)`);
  console.log(`  - About content + features JSON`);
  console.log(`  - WhatsApp default setting`);
  console.log(`  - Pre-footer CTA banner (heading, subtitle, button, hotline)`);
  console.log(`  - ${sectionContents.length} section content rows (badge/title/desc AR+EN)`);
  console.log(`  - Footer content (bio, newsletter, dashboard link, address)`);
  console.log(`  - ${footerLinks.length} footer links (3 categories × 5)`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

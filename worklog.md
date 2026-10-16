---
Task ID: 1
Agent: Orchestrator (main)
Task: Build premium shipping company website "Redline" with full dashboard for shipping across all Egypt governorates, including a video upload section.

Work Log:
- Explored existing Next.js 16 project structure (shadcn/ui, Prisma, NextAuth, Zustand, TanStack Query, Framer Motion all available)
- Generated 5 professional images via z-ai image CLI to /public/images/: hero-truck.png, warehouse.png, operations.png, courier.png, fleet.png
- Designed Prisma schema (prisma/schema.prisma) with models: User, Governorate (27 Egypt govts), Service, Customer, Shipment, Video, Testimonial, ContactMessage, Order, SiteStat
- Ran `bun run db:push` successfully
- Wrote and ran prisma/seed.ts: admin user (admin@redline.eg / admin123), 27 governorates with zones A/B/C/D + basePrice + etaHours, 6 services, 5 testimonials, 4 site stats, 5 customers, 18 shipments, 8 orders, 2 videos

Stage Summary:
- DB schema finalized and seeded. Images ready in /public/images/.
- Admin login: admin@redline.eg / admin123
- Brand: Redline shipping - colors deep red (#DC2626 / crimson), dark charcoal/black, white, with gold (#F59E0B) premium accents. RTL Arabic content.
- Next: build public landing page + full dashboard + API routes on single / route using Zustand view-switching (dashboard is client-state view, not a separate Next route).

---
Task ID: 2
Agent: Orchestrator (main)
Task: Build full backend API + public landing page + complete dashboard + verify

Work Log:
- Built backend API routes: /api/auth/{login,logout,me}, /api/stats, /api/shipments (+[id]), /api/track, /api/governorates, /api/services, /api/pricing/calculate, /api/orders (+[id]), /api/customers, /api/testimonials, /api/videos (+[id]), /api/contact (+[id]), /api/site. Auth via in-memory session token in HttpOnly cookie (lib/auth.ts).
- Built foundation: lib/store.ts (Zustand: view public/dashboard, dashboardSection, user, theme), lib/providers.tsx (React Query), lib/api.ts (fetch helpers + formatters + status labels). globals.css with Redline brand (deep red primary, charcoal, gold accent), RTL, custom scrollbar, gradient/glass/marquee utilities. layout.tsx with Cairo+Tajawal Arabic fonts, RTL dir.
- Public landing page (src/components/site/*): Navbar (sticky, transparent->blur, mobile menu, theme toggle, dashboard button), Hero (full-screen hero-truck.png, animated badge, dual CTAs, governorate marquee), StatsBar (4 stats from /api/site), Services (6 service cards), Coverage (27 governorates grid with zone badges A/B/C/D), PricingCalculator (interactive: governorate+service+weight -> live price + quick order form -> POST /api/orders), TrackShipment (tracking number input -> /api/track -> timeline UI with demo buttons), VideoSection (featured player + gallery, modal iframe player, data from /api/site), About (warehouse+operations images, features grid), Testimonials (from /api/site), CtaBanner, Contact (form -> /api/contact + contact info panel), Footer (sticky via flex-1, multi-column, newsletter, social, back-to-top).
- Dashboard (src/components/dashboard/*): Login (split-screen with fleet.png visual + form, prefilled demo creds), Sidebar (8 nav sections, user card, logout, mobile drawer), Topbar (section title, search, bell, theme toggle), Overview (4 KPIs, weekly shipments bar chart, status distribution, monthly revenue chart, quick stats, recent shipments/orders tables), Shipments (searchable/filterable table, quick status dropdown, create/edit modal, delete), Orders (card grid with status update), Customers (avatar cards), Videos (THE KEY UPLOAD SECTION: stats cards, video grid with edit/feature/show-hide/delete, upload modal with title/YouTube URL/description/5 thumbnail picker/category/featured+active toggles/live preview iframe), Pricing (services overview + 27 governorates pricing table with all service prices), Messages (inbox layout with list+detail), Settings (profile, appearance/theme, notifications, system info, logout).
- page.tsx orchestrator: view === 'public' ? PublicPage : DashboardApp, with theme restore from localStorage.
- Ran ESLint: 0 errors, 3 harmless unused eslint-disable warnings.
- Verified with Agent Browser:
  * Public page renders fully (hero, stats, services, coverage, pricing, track, video, about, testimonials, CTA, contact, footer all present)
  * Pricing calculator: select gov+service+weight -> click "احسب السعر الآن" -> price shows + order form appears
  * Track shipment: clicked demo RED100001 -> shipment details + status timeline rendered
  * Dashboard login: prefilled creds -> click login -> overview with live KPIs (18 shipments, 8 orders, 5 customers, 2021 ج.م revenue) + charts rendered
  * Videos section: clicked "رفع فيديو جديد" -> upload modal with all fields (title, URL, description, 5 thumbnails, category, featured/active toggles) -> filled + submitted -> new video "رحلة شحنة من القاهرة لاسوان" appeared in list AND on public site video gallery instantly
  * Shipments table: all 18 shipments with tracking numbers, status dropdowns, edit/delete actions
  * Mobile (390x844): navbar collapses to menu button, hero renders correctly
  * Dark mode: toggle button works (html.dark class applied)
  * Footer: present (1350px), sticky via flex-1 main wrapper
  * Console: no errors (only harmless Radix DialogContent Description warning)
  * Dev log: no errors, all API routes returning 200

Stage Summary:
- Complete Redline shipping website built and verified end-to-end.
- Admin login: admin@redline.eg / admin123
- All 8 dashboard sections functional with live DB data.
- Video upload section works both ways: admin uploads -> appears on public site.
- Public site: premium hero, interactive pricing, live tracking, video gallery, contact form, sticky footer.
- Responsive, RTL Arabic, light/dark themes, 5 AI-generated professional images.
- No runtime errors. Lint clean (0 errors).

---
Task ID: 3
Agent: Orchestrator (main)
Task: ريفاكتور قوي وشامل لكل تفصيلة في الموقع (public + dashboard)

Work Log:
- بناء مكتبة مشتركة: hooks (use-count-up, use-scroll-spy, use-media-query بـ useSyncExternalStore) + مكونات (ScrollProgress, SectionReveal + StaggerGroup/Item, SectionHeading, MagneticButton, AnimatedCounter, Skeletons/EmptyState)
- إضافة أدوات CSS احترافية: 3D perspective, mesh-bg, aurora animation, tabular-nums, glow-border, conic-ring, no-scrollbar
- ريفاكتور Navbar: شريط تقدم القراءة (ScrollProgress أعلى الصفحة) + تمييز القسم النشط (scroll-spy مع layoutId animated pill) + تحسينات انتقال
- ريفاكتور Hero: بارالاكس للخلفية (useScroll + useTransform) + 3 بطاقات إحصائية عائمة متحركة (99.2%, 82,540, 26 ساعة) + خلفية aurora متدرجة + مؤشر تمرير "اكتشف" متحرك
- ريفاكتور StatsBar: عدادات متحركة (count-up easeOutExpo) + StaggerGroup + hover -translate-y
- ريفاكتور Services: بطاقات 3D tilt (mouse-tracking perspective) + translateZ للأيقونة + shine effect
- ريفاكتور Coverage: تبويبات فلترة بالمنطقة (ALL/A/B/C/D) مع عدّاد + AnimatePresence popLayout + شريط متدرج عند hover
- ريفاكتور PricingCalculator: presets للوزن (0.5/1/3/5/10/20) + تحقق فوري inline (هاتف مصري 01x) + أنميشن spring للسعر + إعادة حساب تلقائية عند تغيير المدخلات
- ريفاكتور Track: حاوية بحث محسّنة + timeline بـ ping animation للحالة الحالية + خط متدرج للـ timeline + stagger للبيانات
- ريفاكتور VideoSection: فلترة بالتصنيف (ترويجي/لوجستيات/شرح/...) + AnimatePresence popLayout للمعرض + ring pulse على زر التشغيل
- ريفاكتور Testimonials: carousel احترافي (auto-rotate 5s، pause on hover، dots، أسهم، AnimatePresence slide)
- ريفاكتور About: بارالاكس للصور الثانوية + StaggerGroup للميزات
- ريفاكتور Contact: تحقق فوري inline للاسم/البريد/الرسالة + رسائل خطأ تحت كل حقل
- ريفاكتور Dashboard Overview: area chart SVG متدرج (gradient fill) + donut chart (conic-gradient) للمركز + 4 KPIs بـ sparklines (12 bar لكل واحد) + skeleton loading + أنميشن hover
- ريفاكتور Dashboard Shipments: pagination كامل (8/12/20/50 لكل صفحة + أزرار أول/سابق/تالي/أخير) + bulk select (checkbox لكل صف + select all + حذف جماعي) + detail drawer جانبي مع timeline كامل + CSV export (BOM + تنزيل) + بحث وفلترة محسّنة
- ريفاكتور Dashboard Videos: منطقة drag-drop لسحب رابط الفيديو + قوالب جاهزة سريعة + تحويل روابط YouTube (watch/shorts/youtu.be/embed) + معاينة iframe مباشرة + hover effects على البطاقات
- إصلاح أخطاء lint: useMediaQuery بـ useSyncExternalStore, donut useMemo بدون mutability, rename useTemplate->applyTemplate
- ESLint: 0 errors
- تحقق Agent Browser:
  * ScrollProgress bar موجود
  * Active nav highlight يعمل عند scroll (خدماتنا مميزة)
  * Floating stats في hero (99.2%, 82,540, 26 ساعة) موجودة
  * Dashboard: SVG area chart + donut conic-gradient + 4 sparklines all rendered
  * Shipments: pagination "صفحة 1 من 3" + detail drawer مع timeline + CSV export toast "تم تصدير"
  * Videos: drag-drop field + قوالب جاهزة + thumbnail picker + preview all present
  * Testimonials: 5 carousel dots + 2 arrows
  * Dark mode toggle يعمل (html.dark class)
  * لا أخطاء بعد reload

Stage Summary:
- ريفاكتور شامل لكل تفصيلة: 12 ملف موقع عام + 3 ملفات dashboard + 6 hooks/components مشتركة
- تحسينات بصرية: بارالاكس، 3D tilt، aurora، عدادات متحركة، area/donut charts، sparklines
- تحسينات وظيفية: pagination، bulk select، detail drawer، CSV export، drag-drop upload، inline validation، carousel، active nav، scroll progress
- 0 lint errors، لا runtime errors، كل التفاعلات تعمل ومتحققة

---
Task ID: 4
Agent: Orchestrator (main)
Task: إضافة هيدر carousel صور متحركة + قسم الشركاء (قابل للإدارة من لوحة التحكم)

Work Log:
- حللت الصورتين المرفوعتين بـ VLM:
  * صورة 1: هيدر بـ image slider/carousel — صور متعددة تتبدّل بأسهم (‹ ›) وعدّاد شرائح (01/05)
  * صورة 2: قسم "شركاء النجاح والتميز المؤسسي" — شبكة بطاقات بيضاء بحواف دائرية وظل ناعم، كل بطاقة فيها شعار شركة
- DB: أضفت HeroImage + Partner models لـ prisma/schema.prisma + db:push
- أنشأت 8 شعارات شركاء احترافية بـ z-ai image (partner-1..8.png) بألوان وأيقونات متنوعة
- Seed (prisma/seed-content.ts): 5 صور هيدر (hero-truck, fleet, warehouse, operations, courier) + 8 شركاء (TechStore, FashionHub, Adel Trading, Nour Crafts, Ibrahim Group, MegaMart, QuickShip, GlobalTech)
- API routes: /api/hero-images (GET/POST) + /api/hero-images/[id] (PATCH/DELETE) + /api/partners (GET/POST) + /api/partners/[id] (PATCH/DELETE) + تحديث /api/site ليرجع heroImages + partners
- ريفاكتور Hero (src/components/site/hero.tsx): 
  * carousel صور متعددة بـ crossfade (AnimatePresence + motion scale 1.08→1)
  * تبديل تلقائي كل 5s (pause on hover)
  * أسهم تنقل ‹ › + عدّاد شرائح (01/05) + شريط تقدم + زر pause/play (مطابق للمرجع)
  * نقاط (dots) مؤشرات للشرائح
  * يقرأ الصور من /api/hero-images (DB) مع fallback
- قسم Public جديد (src/components/site/partners.tsx):
  * شبكة بطاقات بيضاء بحواف دائرية وظل ناعم + shine sweep عند hover
  * يعرض شعار (img) أو أيقونة ملونة fallback
  * يقرأ من /api/partners (DB)
  * أضفته بين About و Testimonials + رابط "الشركاء" في Navbar
- Dashboard: 
  * DashboardHeroImages (src/components/dashboard/hero-images.tsx): إدارة صور الهيدر — رفع/حذف/إعادة ترتيب (up/down)/تفعيل-إخفاء، modal مع drag-drop URL + معاينة + اختيار من معرض + عنوان + ترتيب
  * DashboardPartners (src/components/dashboard/partners.tsx): إدارة الشركاء — إضافة/تعديل/حذف/تفعيل، modal مع اسم + شعار (8 خيارات أو رابط مخصص) + أيقونة fallback + لون (8 خيارات) + موقع + ترتيب
  * أضفت زرّين للتنقل في sidebar (صور الهيدر، الشركاء) + topbar titles + store types (DashboardSection)
- إصلاحات: إعادة توليد Prisma client + إعادة تشغيل dev server (لتحميل النماذج الجديدة من الـ singleton)، setState-in-effect → clamp inline بـ idx
- ESLint: 0 errors
- تحقق Agent Browser:
  * Hero carousel: 6 شرائح dots + 4 أسهم + عدّاد "01/06" — التنقل بـ next يغيّر العدّاد (03/06)
  * Partners: 8 شعارات + 8 أسماء كلها ظاهرة (TechStore..GlobalTech)
  * Dashboard Hero Images: "صور الهيدر (Carousel)" + الإحصائيات + 5 صور seeded ظاهرة (شاحنة، أسطول، مستودع...) + زر "إضافة صورة"
  * أضفت صورة جديدة "صورة تجريبية جديدة من اللوحة" → ظهرت فوراً في carousel الموقع (من 5 → 6 شرائح)
  * Dashboard Partners: "قسم الشركاء والعملاء" + 8 شركاء + modal إضافة كامل (اسم/شعار/أيقونة/لون/موقع/ترتيب)
  * أضفت شريك جديد "RedSeaMart" → ظهر فوراً في قسم الشركاء بالموقع (من 8 → 9 شركاء)
  * لا أخطاء بعد reload

Stage Summary:
- الميزتان المطلوبتان اشتغلتا بالكامل end-to-end:
  1. هيدر carousel صور متحركة — الأدمن يضيف/يحذف/يرتب/يفعّل الصور من لوحة التحكم وتظهر فوراً في الـ slider بأعلى الموقع (crossfade + أسهم + عدّاد + dots)
  2. قسم الشركاء — شبكة بطاقات بيضاء احترافية بالشعارات، الأدمن يضيف/يحرر الشركاء (شعار/أيقونة/لون/موقع) وتظهر فوراً في الموقع
- 8 شعارات + 5 صور هيدر AI-generated، 2 API routes + 2 مكونات public + 2 مكونات dashboard
- 0 lint errors، لا runtime errors

---
Task ID: 5
Agent: Orchestrator (main)
Task: إزالة قسمي "تتبع الشحنة" و"حاسبة الأسعار" من الموقع العام

Work Log:
- أزلت استيراد واستخدام PricingCalculator و TrackShipment من public-page.tsx
- أزلت روابط #pricing و #track من Navbar NAV_LINKS (بقي: الرئيسية، خدماتنا، التغطية، المعرض، الشركاء، تواصل)
- حدّثت أزرار Hero: "احسب سعر شحنتك" → "اطلب شحن الآن" (يؤشر لـ #contact)، "تتبع شحنتك" → "خدماتنا" (يؤشر لـ #services)
- حدّثت زر الخدمات "احسب السعر" → "اطلب الخدمة" (يؤشر لـ #contact)
- حدّثت CTA banner: النص "تواصل معنا الآن..." + الزر "اطلب عرض سعر" (يؤشر لـ #contact)
- حدّثت رابط "تتبع الشحنة" في Footer ليؤشر لـ #contact بدلاً من #track
- ملفات track.tsx و pricing-calculator.tsx بقيت موجودة لكن غير مستخدمة (الـ API routes أيضاً بقيت)
- ESLint: 0 errors
- تحقق Agent Browser:
  * pricing section: REMOVED, track section: REMOVED
  * nav has تتبع: false, nav has الأسعار: false
  * زر "اطلب شحن الآن" يطير لـ #contact (top: 0px في viewport)
  * زر "خدماتنا" يطير لـ #services
  * الأقسام المتبقية: home, services, coverage, videos, about, partners, contact
  * لا أخطاء

Stage Summary:
- تم إزالة القسمين المطلوبين من الموقع العام وكل الإشارات إليهما في الـ Navbar وHero وFooter وCTA banner
- الأزرار الآن تشاور لأقسام موجودة (services و contact)
- لا أخطاء، الموقع يعرض بشكل سليم

---
Task ID: 6
Agent: Orchestrator (main)
Task: إصلاح تداخل قسم الإحصائيات مع الهيدر (بطاقات 850K/27/12K/40)

Work Log:
- حللت الصورة المرفوعة بـ VLM: المشكلة كانت بطاقات الإحصائيات (StatsBar) بتتداخل مع شريط الـ marquee وأسهم الـ carousel في أسفل الهيدر بسبب negative margin `-mt-16`
- أصلحت stats-bar.tsx:
  * شلت `-mt-16 z-10` (اللي بيسحب البطاقات لفوق جوّه الهيدر) → استبدلته بـ `py-10 sm:py-14` (مسافة رأسية نظيفة)
  * شلت `glass` (شفاف) → استخدمت `bg-card` (خلفية صلبة واضحة) عشان مفيش تداخل بصري
  * زودت padding البطاقات: `p-5 sm:p-6` → `p-6 sm:p-8`
  * زودت حجم الأيقونات: `w-12 h-12` → `w-14 h-14` و `w-6 h-6` → `w-7 h-7`
  * زودت المسافة بين البطاقات: `gap-4` → `gap-4 sm:gap-6`
  * ظبطت المسافات الداخلية: `mb-3` → `mb-4`, `mt-1` → `mt-1.5`
- تحقق Agent Browser:
  * overlap: false (hero bottom: 900px, stats top: 900px — flush, clean)
  * marquee bottom: 188px, stats section top: 200px (12px gap, clean separation: true)
  * كل المحتوى موجود: 850K, 27, 12K, 40+ وشحنة تم توصيلها/محافظة نغطّيها
  * لا أخطاء
- ESLint: 0 errors

Stage Summary:
- البطاقات الإحصائية بقت تحت الهيدر مباشرة بمسافة نظيفة بدل ما كانت بتدخل جوّه الـ marquee والـ carousel controls
- خلفية البطاقات بقت صلبة (bg-card) بدل الشفافية (glass) عشان وضوح أفضل
- المسافات الداخلية والخارجية كلها مظبوطة

---
Task ID: 7
Agent: Orchestrator (main)
Task: تظبيط أسهم الـ carousel في الهيدر زي المرجع بالظبط (minimal design)

Work Log:
- حللت الصورة المرجعية بـ VLM: المطلوب هو شريط تحكم minimal فيه:
  * سهمين نحيفين بدون دوائر (outline icons)
  * فواصل عمودية رفيعة بين العناصر
  * عدّاد في النص
  * خط فاصل أفقي رفيع فوق الشريط
  * خلفية داكنة، تباين عالي، تناظر حول العداد
- المشكلة في التصميم القديم: كان مزدحم (دوائر حول الأسهم + زر pause/play + شريط تقدم + صف نقاط)
- أصلحت hero.tsx:
  * شلت الدوائر (rounded-full + border + bg) حول الأسهم → أسهم نحيفة plain (ChevronLeft/ChevronRight بـ strokeWidth 1.5)
  * ضفت فواصل عمودية: `<span className="w-px h-6 bg-white/20" />` بين كل عنصرين
  * شلت زر pause/play والـ progress bar وصف الـ dots
  * ضفت خط فاصل أفقي رفيع فوق الشريط: `border-t border-white/15 pt-3`
  * العدّاد في النص: `01 / 06` بخط bold + tracking-widest + tabular-nums
  * استخدمت dir="ltr" عشان الترتيب البصري يكون `< | counter | >` زي المرجع (سهم شمال = سابق، سهم يمين = تالي)
  * التنسيق: `px-5 py-1.5` للأسهم، `px-6` للعداد، hover بيلوّن amber
  * الموضع: `absolute bottom-16 left-1/2 -translate-x-1/2` (فوق الـ marquee)
  * شلت استيراد Pause/Play من lucide (مش محتاجهم)
  * auto-rotate لسه شغّال (pause on hover عبر onMouseEnter/onMouseLeave)
- ESLint: 0 errors
- تحقق Agent Browser:
  * Desktop (1440): controls found, arrows: 2, vertical dividers: 2, counter "01 / 06"
  * بعد click على "التالي": counter اتنقل لـ "06 / 06" (التنقل شغّال)
  * thin top line: true (الخط الفاصل موجود)
  * circular buttons: 0 (مفيش دوائر زي المرجع)
  * Mobile (390x844): top 707px, bottom 780px, viewport 844 → visible: true, centered: true
  * لا أخطاء

Stage Summary:
- أسهم الـ carousel بقت minimal بالظبط زي المرجع: [ < | 01/06 | > ] بخلفية داكنة وفواصل عمودية رفيعة وخط أفقي فوق
- شلت كل العناصر الزايدة (دوائر، pause، progress bar، dots)
- التنقل والـ auto-rotate لسه بيشتغلوا
- مظبوط على desktop و mobile

---
Task ID: 8
Agent: Orchestrator (main)
Task: قسم خريطة مصر احترافي تفاعلي مع markers للمحافظات

Work Log:
- أنشأت src/lib/egypt-coords.ts:
  * GOV_COORDS: إحداثيات (lat/lng) لـ 27 محافظة عاصمة
  * EGYPT_BORDER: حدود مصر (16 نقطة) لرسم الـ outline
  * NILE_MAIN + NILE_DAMIETTA + NILE_ROSETTA: مسار نهر النيل وفروعه
  * project(lat,lng): دالة تحويل الإحداثيات الجغرافية لإحداثيات SVG (viewBox 600x720)
  * pathFromCoords: يحول نقاط لـ SVG path d
- أنشأت src/components/site/interactive-map.tsx — قسم احترافي فخم:
  * SVG خريطة مصر: outline + Nile river متدرج (gradient) + تسميات البحار (المتوسط/الأحمر/الصحراء الغربية)
  * 27 marker positioned بالظبط على إحداثيات كل محافظة، ملونة حسب المنطقة (A=emerald, B=blue, C=amber, D=rose)
  * markers بـ pulse ring + outer glow (filter) + main dot + center dot — تأثير احترافي
  * hover/click على marker: label بيق pops up + الـ side panel بيتحدّث بتفاصيل المحافظة
  * خطوط اتصال (dashed) من المحافظة المختارة لباقي المحافظات (decorative)
  * side panel: بطاقة المحافظة المختارة (اسم عربي + إنجليزي + المنطقة + السعر + ETA) + placeholder "اختر محافظة"
  * stats: 27 محافظة مغطاة + 99.2% نسبة التسليم
  * quick list قابلة للنقر (14 محافظة) + scroll
  * zone legend بـ counts لكل منطقة
  * خلفية: gradient dark + grid + glow، مع header فيه عدّاد "X محافظة نشطة" بـ pulse
- أضفت القسم لـ public-page.tsx (بين Coverage و VideoSection)
- أضفت رابط "الخريطة" لـ Navbar NAV_LINKS
- ESLint: 0 errors
- تحقق Agent Browser:
  * map section: true, svg: true, circles: 81 (markers + nested), paths: 15 (border + nile + connections)
  * marker groups: 27 (كل المحافظات مغطاة بالظبط)
  * قبل click: placeholder "اختر محافظة" ظاهر
  * بعد click على marker: الـ side panel بيظهر بتفاصيل المحافظة (ج.م + التوصيل، والـ placeholder اتمسح)
  * nav "الخريطة" موجود وبيطير للقسم (map section visible: true بعد click)
  * لا أخطa

Stage Summary:
- قسم خريطة مصر تفاعلي احترافي: 27 marker بالظبط على إحداثيات المحافظات الحقيقية، Nile river متدرج، interaction كامل (hover/click + side panel + connection lines)
- مربوط بـ /api/governorates (بيانات حقيقية من DB)
- 0 errors، 27 marker كلها بتظهر

---
Task ID: 9
Agent: Orchestrator (main)
Task: ترقية خريطة مصر لتحفة احترافية فخمة (أقوى جذبية)

Work Log:
- ولّدت صور AI جديدة:
  * topo-texture.png (1344x768) — texture خطوط كنتور topographic داكنة بـ glow أحمر/كهرمانى
  * egypt-glow.png (864x1152) — خريطة مصر ليلية متوهجة (Nile متوهج + city lights)
- ضفت animations CSS جديدة في globals.css:
  * flow-line: خطوط شبكة بـ dashes بتتحرك (logistics flow)
  * radar-ring + radar-ring-2: حلقات radar بتتسع وتختفي (pulse)
  * nile-flow: shimmer متحرك على النيل
  * border-shimmer: حدود مصر المتوهجة المتحركة
- أعدت بناء interactive-map.tsx بتصميم فخم خالص:
  * الخلفية: bg-zinc-950 + grid + aurora blobs (red + amber) متحركة
  * Egypt landmass: outer glow halo (filter bigGlow) + clipPath بيحط صورة topo-texture جوّه شكل مصر + mood gradient overlay + توهج أحمر علوي
  * حدود مصر: dashed متوهج ومتحرك (border-shimmer) + soft glow filter
  * نهر النيل: thick gradient stroke (nileGrad) + softGlow filter + فروع (دمياط + رشيد) + nile-flow shimmer متحرك فوقه
  * شبكة الخطوط: 26 line من القاهرة (hub) لكل المحافظات، flow-line dashes متحركة، ملونة حسب المنطقة
  * Cairo hub marker: مميز أكبر (double radar pulse + big glow)
  * 26 marker للمحافظات: radar-ring + radar-ring-2 (حلقتين متسعتين) + outer glow (radialGradient) + main dot (filter softGlow) + white core
  * hover/selected: scale + label card + خطوط connection متوهجة
  * side panel: dark gradient cards (from-primary/15 via-zinc-900 to-black) + glowing zone badges
  * legend: dots بـ box-shadow glow
- ESLint: 0 errors
- تحقق Agent Browser:
  * topo image: true (texture داخل مصر)
  * radar rings: 54 (27 markers × 2)
  * flow lines: 26 (شبكة من القاهرة لكل المحافظات)
  * nile shimmer: 1, border shimmer: 1
  * بعد click على marker: price (ج.م) + ETA (التوصيل) ظاهرة في side panel
  * لا أخطاء

Stage Summary:
- الخريطة بقت فخمة: texture topographic داخل شكل مصر + نيل متوهج ومتحرك + حدود متوهجة + شبكة خطوط متحركة من القاهرة لكل المحافظات + 54 radar pulse ring + markers متعددة الطبقات (glow + dot + core) + خلفية aurora
- كل التفاعل لسه شغّال (click → side panel بتفاصيل المحافظة)
- 0 errors

---
Task ID: 10
Agent: Orchestrator (main)
Task: شيل الأسعار من الخريطة + ترقية الـ markers (city-light breathing)

Work Log:
- فهمت الطلب: "مش عوز اسعار عوز البلاد فقط" = شيل الأسعار، اعرض البلاد/المحافظات فقط. "عوز تحسينات في الخريطة تكون احسن" = الـ markers أحسن.
- أضفت animations CSS في globals.css:
  * breathe keyframes (opacity 0.3↔0.7) + city-light + city-light-2 classes (breathing glow بدون radar متسع)
- أعدت بناء الـ markers (interactive-map.tsx):
  * شيلت radar-ring (الحلقات المتسعة المزعجة)
  * بدلها بـ "city-light" style: توهج radial gradient ناعم بـ breathing + halo ملون + dot متوهج + core أبيض — شكل أضواء مدن ليلية أنيق
  * Cairo hub: أكبر (double breathing glow)
  * floating card premium عند hover/click: rect rounded + pointer triangle + softGlow filter + اسم المحافظة بخط bold
- شيلت الأسعار من الـ side panel:
  * بدلت "السعر من X ج.م" → "المنطقة" (اسم المنطقة)
  * بقت "زمن التوصيل" + "المنطقة" + رسالة "نقطة توصيل نشطة في X"
  * مفيش أي ج.م أو سعر في القسم كله
- شيلت استيراد Truck (مش مستخدم)
- ESLint: 0 errors
- تحقق Agent Browser:
  * city-light markers: 54 (27 × 2 classes)
  * قبل click: السعر false, ج.م false (مفيش أسعار أصلاً)
  * بعد click على marker: زمن التوصيل true, المنطقة true, السعر من false, ج.م false, نقطة توصيل نشطة true
  * لا أخطa

Stage Summary:
- الأسعار اتمسحت بالكامل من قسم الخريطة (مفيش ج.م ولا سعر)
- الـ markers بقت "city-light" متوهجة بـ breathing ناعم بدل radar rings المتسعة
- الـ side panel بتعبر عن البلاد بس: اسم المحافظة + المنطقة + زمن التوصيل + نقطة نشطة
- 0 errors

---
Task ID: 11
Agent: Orchestrator (main)
Task: إعادة تصميم الخريطة بستايل political map احترافي (مطابقة الصورة المرجعية)

Work Log:
- حللت الصورة المرجعية بـ VLM: خريطة سياسية احترافية بألوان pastel فاتحة، بحر أزرق فاتح، dots سوداء صغيرة للمدن، أسماء bold inline، نيل أزرق رفيع، حدود بيضاء رفيعة، بدون sidebar منفصل
- أعدت بناء interactive-map.tsx بستايل political map نظيف:
  * palette: SEA (#e0f2fe), EGYPT_FILL (#fde2e4 salmon), EGYPT_STROKE (#ffffff), NILE (#38bdf8), TEXT_SEA (#0284c7)
  * البحر: gradient (seaGrad) من #bae6fd لـ #e0f2fe + grid خطوط lat/long خفيفة (#7dd3fc)
  * مصر: gradient fill (salmon) + حدود بيضاء strokeWidth=2 + inner shading رفيع
  * النيل: خط أزرق (#38bdf8) للفرع الرئيسي + فروع دمياط ورشيد (أرفع)
  * تسميات البحار: italic blue (المتوسط، الأحمر، الصحراء الغربية)
  * تسمية "مصر": bold كبيرة شبه شفافة في وسط مصر
  * compass rose (N) + scale bar (0—300 كم) = لمسة احترافية
  * Cairo hub: dot أحمر + نجمة ذهبية (عاصمة مميزة)
  * 26 marker للمحافظات: dots نظيفة (zone colors) بحدود بيضاء + halo عند hover + inline label (bold) floating card
  * connection lines من المختار لباقي المحافظات (dashed subtle)
  * header: "خريطة التغطية — جمهورية مصر العربية" + عدّاد محافظات بـ pulse
  * zone legend في الأسفل
  * side panel نظيف: اسم + منطقة + zone badge + زمن التوصيل + حالة (نقطة نشطة) + رسالة تغطية
- أصلحت خطأ: EGYPT_BORDER كان متعرف مرتين (import + local) → غيرت الـ local لـ EGYPT_STROKE
- ESLint: 0 errors
- تحقق Agent Browser:
  * البحر المتوسط: true, البحر الأحمر: true, مصر: true, كم scale: true, dots: 54
  * بعد click على marker: زمن التوصيل true, نقطة نشطة true, placeholder اتشال
  * لا أخطاء

Stage Summary:
- الخريطة بقت political map احترافي نظيف: بحر أزرق فاتح، مصر salmon pastel، dots ملونة بحدود بيضاء، أسماء inline bold، نيل أزرق، compass + scale bar
- مطابقة للصورة المرجعية بألوان pastel هادئة وستايل سياسي احترافي
- 0 errors، التفاعل شغّال

---
Task ID: 12
Agent: Orchestrator (main)
Task: خريطة بعرض الصفحة + شيل الأسعار + شيل قسم التغطية

Work Log:
1) شيل قسم التغطية بالكامل:
   - public-page.tsx: شيلت استيراد واستخدام <Coverage />
   - navbar.tsx: شيلت رابط "#coverage" / "التغطية" من NAV_LINKS
2) خريطة بعرض الصفحة (full-width):
   - interactive-map.tsx: غيّرت الـ container من `grid lg:grid-cols-5` (map 3/5) لـ `max-w-7xl space-y-4` (map full width)
   - بطاقة الخريطة بقيت full-width (مش lg:col-span-3)
   - الـ SVG container بقى `aspect-[16/11] sm:aspect-[16/9]` بـ preserveAspectRatio="xMidYMid meet" (خريطة سينمائية واسعة، البحر يملا الجوانب ومصر في النص)
   - ضفت floating overlay (absolute top-right) لتفاصيل المحافظة المختارة: اسم + zone badge + زمن التوصيل + حالة (نشطة) — بدون أسعار
   - لما مفيش محافظة مختارة: overlay صغير "اضغط على أي محافظة"
   - حوّلت الـ side panel لـ bottom row: stats card (محافظة مغطاة + تسليم في الوقت) + quick list (horizontal scrollable strip بكل الـ 27 محافظة)
3) شيل الأسعار نهائياً:
   - الـ floating overlay مفيهوش أسعار (زمن + حالة بس)
   - الـ bottom row مفيهوش أسعار (stats + قائمة محافظات)
   - تأكدت: ج.م false, السعر false, basePrice false في القسم كله
- شيلت استيراد Sparkles (مش مستخدم)
- ESLint: 0 errors
- تحقق Agent Browser:
  * coverage section: REMOVED, nav has التغطية: false
  * map card width: 1216px من 1440px viewport = 84% (full container width)
  * مفيش ج.م ولا السعر في القسم
  * بعد click على marker: floating overlay بيظهر (نشطة + يوم)، بدون أسعار
  * لا أخطا، لا errors في dev log

Stage Summary:
- الخريطة بقت بعرض الصفحة كاملة (full-width سينمائي) بـ floating overlay للتفاصيل
- كل الأسعار اتمسحت من القسم
- قسم التغطية اتمسح بالكامل من الموقع والناف بار
- 0 errors

---
Task ID: 13
Agent: Orchestrator (main)
Task: إعادة تصميم الخريطة بالكامل — holographic command center (كريتف ملفت يجنن)

Work Log:
- أضفت CSS animations في globals.css: beam-pulse (لأعمدة الضوء), particle-float (للجسيمات)
- أعدت بناء interactive-map.tsx بتصميم خالص جديد (مش سياسي pastel):
  * خلفية كونية سوداء (black → zinc-950) + 70 نجمة + grid خطوط lat/long سينما
  * Egypt wireframe: outline متوهج بـ softGlow filter + dashed inner stroke + fill شفاف أحمر
  * النيل: neon cyan متوهج + softGlow + flow shimmer متحرك
  * شبكة خطوط neon flowing من القاهرة لكل المحافظات (26 line بـ flow-line animation)
  * 18 جسيم متحرك (particle-float) بلون أحمر
  * Cairo HQ: radar sweep دوّار (SMIL animateTransform rotation 4s) + 3 radar rings + عمود ضوء طويل (72px) + top orb + HQ label على hover
  * 27 محافظة = 27 BEACON (عمود ضوء عمودي متدرج شفاف→زاهي) + top orb متوهج + base glow متنفس (city-light) + base dot + pulse ring على hover + floating label
  * connection highlight من المختار لباقي المحافظات
  * HUD header: "LIVE LOGISTICS GRID — ARAB REPUBLIC OF EGYPT" + "NODES ACTIVE" بـ pulse
  * sea labels (MEDITERRANEAN/RED SEA/EGYPT) خافتة
  * compass + floating overlay (top-right) + bottom row (stats + quick list) بـ dark theme
- ESLint: 0 errors
- تحقق Agent Browser:
  * beams: 27 (عمود ضوء لكل محافظة) ✅
  * stars/particles: 88 (70 نجمة + 18 جسيم) ✅
  * radar sweep anim: true (دوّار من القاهرة) ✅
  * full-width: true ✅
  * بعد click: نشطة true, يوم true, ج.م false (مفيش أسعار) ✅
  * لا أخطا

Stage Summary:
- الخريطة بقت holographic command center كريتف: خلفية كونية بنجوم، مصر wireframe متوهج، نيل neon متحرك، 27 عمود ضوء (beacons) بيرفعوا فوق، radar sweep دوّار من القاهرة، شبكة خطوط neon flowing، جسيمات متحركة
- شكل خالص مختلف عن كل اللي قبله — ملفت وجذاب جداً
- full-width، بدون أسعار، interaction شغّال
- 0 errors

---
Task ID: 14
Agent: Orchestrator (main)
Task: توسيع الخريطة لتغطي القارة الأفريقية + دول الخليج + شيل عدد أيام التوصيل

Work Log:
- وسّعت MAP_BOUNDS في egypt-coords.ts لتغطي أفريقيا + الشرق الأوسط (lat -35 إلى 38, lng -17 إلى 61) + MAP_DIMS (760x700)
- أضفت AFRICA_BORDER (38 نقطة) — outline القارة الأفريقية من المغرب لكيب تاون للقرن الأفريقي
- أضفت MIDEAST_BORDER (25 نقطة) — outline الجزيرة العربية + الشام + العراق
- أضفت REGIONAL_CITIES (15 مدينة): الخليج (الرياض، دبي، الدوحة، الكويت، مسقط، المنامة) + كبرى مدن أفريقيا (الخرطوم، أديس أبابا، نيروبي، لاغوس، الدار البيضاء، جوهانسبرغ، الجزائر، تونس، طرابلس)
- حدّثت interactive-map.tsx:
  * title: "شبكة Redline على خريطة أفريقيا والخليج"
  * subtitle: "X محافظة مصرية + Y مركز إقليمي"
  * HUD: "LIVE LOGISTICS GRID — AFRICA & MIDDLE EAST" + "NODES ACTIVE" = markers+regional
  * viewBox: 760x700، grid خطوط متظبطة على العرض الجديد
  * landmass: AFRICA_BORDER + MIDEAST_BORDER wireframe متوهج (بدل EGYPT_BORDER)
  * sea labels: MEDITERRANEAN SEA / RED SEA-GULF / ATLANTIC OCEAN / INDIAN OCEAN + AFRICA/ARABIA bold شفاف
  * regional markers (gold dots): 15 مركز إقليمي بـ glow + hover label "X · مركز إقليمي"
  * regional network lines (amber dashed flowing) من القاهرة لكل المدن الإقليمية
  * compass اتظبط للموضع الجديد (712,52)
  * stars/particles اتظبطوا للـ bounds الجديد (80 نجمة + 22 جسيم)
  * شيلت ETA بالكامل من الـ floating overlay: بقى "نقطة توصيل نشطة" فقط (مش "X يوم")
  * شيلت استيراد Clock و Globe2 (مش مستخدمين)
- ESLint: 0 errors
- تحقق Agent Browser:
  * AFRICA: true, ARABIA: true, ATLANTIC: true, INDIAN: true, MEDITERRANEAN: true
  * AFRICA & MIDDLE EAST HUD: true
  * بعد click على اسوان: overlay "اسوان D نقطة توصيل نشطة" — نشطة true, توصيل نشطة true (مفيش يوم/أيام توصيل)
  * لا أخطa

Stage Summary:
- الخريطة بقت بتغطي القارة الأفريقية + دول الخليج (مش مصر بس)
- 15 مركز إقليمي (الخليج + أفريقيا) كـ gold dots + خطوط شبكة إقليمية من القاهرة
- 27 محافظة مصرية لسه بـ beacons
- عدد أيام التوصيل اتمسح بالكامل من الـ overlay
- 0 errors

---
Task ID: 15
Agent: Orchestrator (main)
Task: ترقية الخريطة لتكون أفخم + تكبير النقاط (مش ضيقة)

Work Log:
- رقّيت الـ markers كلها عشان تبقى أكبر وأفخم (مش ضيقة):
  * Governorate beacons (الـ 26): 
    - beam ارتفع من 48→70px (و88 عند hover)
    - beam اعرض من 3px→6px width
    - ضفت WIDE OUTER GLOW COLUMN (width=20, opacity=0.11, bigGlow filter) خلف كل beam = عمود ضوئي عريض متوهج
    - top orb بقا 3 طبقات متوهجة (r=13 bigGlow + r=7 softGlow + r=3.5 white core) بدل طبقة واحدة
    - base glow اكبر (r=14→20)
    - base dot اكبر (r=4/5.5 → r=5.5/7)
    - pulse ring اكبر (r=4→5, strokeWidth 1.5→2)
  * Cairo HQ: beam ارتفع 72→95px + اعرض (4→7px) + wide glow column (width=22)
    - radar sweep اكبر (radius 95→130)
    - radar rings اكبر (30/55/80 → 40/70/105)
    - top orb 3 طبقات (r=14 bigGlow + r=8 softGlow + r=4.5 white)
    - base glow اكبر (20→28) + dot اكبر (7→9)
  * Regional city dots: dot اكبر (3.2→5.5) + glow halos اكبر (12→20 outer, 5→10 mid) + filter bigGlow
  * beam gradients اتقوت (stop 70% opacity 0.5→0.7)
- أصلحت bug: duplicate filter attribute على top orb circle
- ESLint: 0 errors
- تحقق Agent Browser:
  * core beams: 26, wide glow columns: 26, big top orbs (r=13): 26, big base dots: 67 — كلها بتظهر
  * بعد click على اسوان: overlay "اسوان D نقطة توصيل نشطة" — نشطة true, توصيل نشطة true (مفيش أيام توصيل)
  * لا أخطا

Stage Summary:
- النقاط بقت أكبر وأفخم: أعمدة ضوئية عريضة (width 6px + glow column 20px) طويلة (70-88px)، orbs متوهجة 3 طبقات، هالات أكبر
- Cairo HQ أدراماتيك أكتر (radar 130, beam 95px, orb 3 طبقات)
- regional dots أكبر وألمع
- 0 errors، التفاعل شغّال

---
Task ID: 16
Agent: Orchestrator (main)
Task: حل مشكلة التكتل — شيل الأعمدة الطويلة واستبدالها بنقاط مسطحة متوهجة

Work Log:
- حللت الصورة المرفوعة بـ VLM: المشكلة الأساسية كانت الأعمدة الضوئية الطويلة (beams) بتتداخل فوق بعضها في ركن مصر الصغير على خريطة أفريقيا الواسعة → "بقعة عمياء" فوضوية + تكدس شديد
- الحل: شيلت كل الأعمدة الطويلة تماماً (لا wide glow columns ولا bright core beams) واستبدلتها بنقاط مسطمة متوهجة:
  * Governorate markers (26): نقاط مسطحة — soft glow halo (r=11/15 breathing) + colored ring (r=5/6.5, softGlow) + main dot (r=3.4/4.2, white border) + white core (r=1.4) + pulse ring عند الـ hover
  * Cairo HQ: شيلت الـ beam الطويل (95px) → بقى flat luminous dot (r=8) + radar sweep (radius 95) + 2 radar rings + base glow (r=24) + selection ring على hover
  * Regional dots (15): flat gold dots (r=4.8/6) + glow halos (r=16/8) + bigGlow filter
- ضفت SERVICE AREA AMBIENT GLOW تحت مصر (circle r=55, opacity=0.07, bigGlow, breathing) — بيقرأ كـ "منطقة نشاط" مقصودة بدل فوضى
- النتيجة: مفيش أعمدة بتتداخل → لا تكتل/overlap، النقاط بقت glowing constellation أنيقة
- ESLint: 0 errors
- تحقق Agent Browser:
  * tall beams: 0 ✅ (اتمسحوا)
  * wide glow columns: 0 ✅
  * service area glows: 1 ✅ (هالة مصر)
  * flat gov dots: 26 ✅ (نقاط مسطحة)
  * بعد click على اسوان: overlay "اسوان D نقطة توصيل نشطة" — نشطة true, توصيل نشطة true (مفيش أيام توصيل)
  * لا أخطa

Stage Summary:
- حل مشكلة التكتل: الأعمدة الطويلة اتمسحت تماماً (سبب الـ overlap) واستُبدلت بنقاط مسطمة متوهجة
- هالة ambient glow تحت مصر بقرأ المنطقة كـ "hub نشط" مقصود
- التصميم بقى أنظف وأفخم — glowing constellation بدل بقعة فوضوية
- 0 errors، التفاعل شغّال

---
Task ID: 17
Agent: Orchestrator (main)
Task: حل نهائي لمشكلة التكتل — cluster مصر + نقاط إقليمية منتشرة

Work Log:
- المشكلة الجوهرية: مصر صغيرة جغرافياً على خريطة أفريقيا الواسعة، فالـ 27 نقطة محافظة بتبقى متراكمة مهما عملت (نقاط مسطحة ولا أعمدة)
- الحل الجذري: جوّع الـ 27 محافظة في MARKER واحد فخم عند القاهرة (cluster):
  * Cairo HQ بقى "Egypt service cluster": radar sweep (radius 110) + 3 radar rings + base glow (r=26) + main dot (r=9) + **"27" count badge** (gold circle with "27" text)
  * label على hover: "★ القاهرة — مصر (27 محافظة)"
  * شيلت الـ 26 نقطة محافظة الفردية من العرض الدائم (اللي كانت بتعمل التكتل)
- النقاط الفردية بقت ON-DEMAND: لما تختار محافظة من القائمة السفلية، بيظهر marker واحد متوهج في موقعها (spring animation) + floating overlay بتفاصيلها. لما تدوسها تاني بتختفي (AnimatePresence exit)
- شيلت "connection highlight" القديم (كان بيرسم خطوط لنقاط مش ظاهرة)
- قلّلت REGIONAL_CITIES من 15 لـ 11 (شيلت الدوحة/الكويت/المنامة اللي قريبة من الرياض/دبي → بقوا 3 مدن خليج منتشرة: الرياض، دبي، مسقط)
- النتيجة: الخريطة بقى فيها 1 Cairo cluster (intentional) + 11 نقطة إقليمية منتشرة نظيف = لا تكتل
- ESLint: 0 errors
- تحقق Agent Browser + VLM:
  * hub main dots (r=9): 1 ✅ (cluster واحد)
  * regional dots (r=4.8): 11 ✅ (منتشرة)
  * 27 badge: true ✅
  * بعد click على اسوان من القائمة: on-demand marker (r=4.5) ظهر + overlay "اسوان نشطة" ✅
  * VLM: "باقي النقاط موزعة نظيف ومنفردة، ~13-15 نقطة واضحة، النقطة المركزية في مصر متعمدة (cluster)"
  * لا أخطa

Stage Summary:
- حلّيت مشكلة التكتل جذرياً: الـ 27 محافظة اتجمعت في cluster واحد فخم عند القاهرة (بـ badge "27" + radar)
- النقاط الفردية بقت on-demand (بتظهر واحدة بس لما تختار محافظة)
- النقاط الإقليمية اتقلّلت لـ 11 منتشرة نظيف (شيلت المدن الخليجية المتقاربة)
- الخريطة بقى نظيفة: 1 cluster + 11 نقطة منتشرة = لا تكتل
- 0 errors

---
Task ID: 18
Agent: Orchestrator (main)
Task: ريفاكتور شامل للجودة والاحترافية والبساطة في كل تفصيلة

Work Log:
- Design tokens (globals.css):
  * أضفت نظام shadows ناعم متعدد الطبقات: shadow-soft / shadow-card / shadow-elevated (مع dark mode variants)
  * تحسين typography base: font-smoothing (antialiased), line-height 1.6, letter-spacing -0.011em, headings letter-spacing -0.02em + line-height 1.15
  * تضييق scrollbar (10px→8px) أبسط وأنظف
  * تقليل تشبع gradient text (.text-gradient-red) لأقل توهج
- SectionHeading: أبسط وأنيق — eyebrow badge أصغر (text-xs, px-3 py-1), title font-bold (مش font-black), subtitle text-base, مسافات مظبوطة
- Navbar: أنظف — شيلت pill container المزدحم، روابط clean plain مع active underline بسيط (مش gradient), logo solid (مش gradient), زر dashboard solid primary, شيلت rotate-on-hover effects
- StatsBar: بطاقات shadow-soft بسيطة (مش glass/blur), أيقونات primary/8 أنظف, padding متناسق
- Services: شيلت 3D tilt المزدحم, بطاقات shadow-soft أنيقة, أيقونات أبسط, transition ناعم
- Partners: بطاقات shadow-soft أبسط, h-28 متناسق, أقل زحمة
- Testimonials: كاروسيل أنظف, بطاقة shadow-card, أسهم أبسط (9x9), dots أنيقة
- CTA banner: solid primary (مش gradient) أبسط, blur blobs أقل
- Hero: badge أبسط (لا ping animation), title font-bold (مش font-black), text-6xl (مش 7xl), زر primary solid (مش gradient), mini-features أنظف
- ESLint: 0 errors
- تحقق Agent Browser + VLM:
  * nav pill container removed: true ✅
  * VLM hero assessment: "احترافي ومتوازن — الهيدر أنظف، الألوان متوازنة، التايبوغرافي متناسق، المسافات مظبوطة، لا ازدحام"
  * VLM full page: "مصممة باحترافية عالية وتعطي انطباعاً بالثقة والجودة — البطاقات عصرية احترافية (زوايا دائرية + ظلال خفيفة), footer ممتاز ومنظم, مسافات بيضاء مستغلة جيداً"
  * لا أخطa

Stage Summary:
- ريفاكتور شامل للجودة: نظام shadows ناعم متعدد الطبقات + typography متناسق + بطاقات أنيقة بسيطة (shadow-soft) + أقل gradients/tffects مزدحمة
- Navbar بقى clean minimal (لا pill مزدحم), زراير solid primary (مش gradients), active underline بسيط
- كل البطاقات بقت shadow-soft متناسقة, أيقونات primary/8 أنظف
- VLM: "احترافي عالي + ثقة + جودة + لا ازدحام"
- 0 errors

---
Task ID: 19
Agent: Orchestrator (main)
Task: ريفاكتور جذاب — إضافة "توابل" premium (gradients + texture + hover) بدون كسر البساطة

Work Log:
- المشكلة: بعد التبسيط السابق، الموقع بقى باهت/flat (أبيض/رمادي آمن بدون نكهة) — VLM قال "ميّال للباهت، محتاج توابل بصرية"
- أضفت premium utilities في globals.css:
  * .noise — subtle noise texture overlay (breaks flat white, يكسر إحساس wireframe)
  * .mesh-tint — soft mesh gradient background (radial gradients أحمر/كهرماني خفيفة)
  * .card-premium — gradient top accent على hover + colored lift (translateY + colored shadow) + border accent
  * .glow-primary + .gradient-border utilities
- طبّقت على المكونات:
  * StatsBar / Services / Partners: كل البطاقات بقت card-premium (gradient accent line على hover + colored lift)
  * أيقونات bg gradient-to-br (from-primary/15 to-primary/5) + shadow-sm shadow-primary/20
  * PublicPage: noise wrapper على الـ root (subtle texture)
  * Partners: mesh-tint background (gradient tint بدل flat muted)
  * CTA: rich gradient mesh background (linear-gradient أحمر داكن + radial gradients + blur blobs + noise overlay) بدل solid primary
  * Hero: gradient overlay أعمق (from-black/92 via-black/70) + red ambient tint (mix-blend-overlay) + aurora glows أكبر + floating cards بـ shadow-lg
  * Hero button: gradient (from-primary to-red-700) + shadow-lg shadow-primary/30 hover/40 (premium glow)
  * Navbar: glassmorphism (bg-background/75 backdrop-blur-xl + shadow-soft عند scroll)
- أصلحت JSX parsing error (incomplete style attribute)
- ESLint: 0 errors
- تحقق Agent Browser + VLM:
  * VLM: "أكثر جاذبية وأقل باهتاً، التدرجات أضافت عمق بصري قوي، الـ hover effects والظلال ضافت توابل تفاعلية ممتازة، التصميم بقي احترافياً جداً ولم يعد مزدحماً، المساحات البيضاء وضعت توازناً رائعاً"
  * التقييم: 8.5/10 للجاذبية (أحمر Redline ممتاز، gradients ناعمة، cards أنيقة، هيكل سلس)
  * لا أخطا

Stage Summary:
- الموقع بقى جذاب واحترافي: gradients (أحمر داكن + mesh) + noise texture + card-premium hover (gradient accent + colored lift) + glassmorphism navbar + CTA mesh gradient + hero ambient tint
- كل الـ "توابل" اللي طلبها VLM اتضافت بدون كسر البساطة (لا ازدحام)
- 0 errors، VLM: 8.5/10 جذاب جداً

---
Task ID: 20
Agent: Orchestrator (main)
Task: ريفاكتور أبسط + كريتف + احترافي

Work Log:
- أنشأت قسم "كيف نعمل" (how-it-works.tsx) جديد — 3 خطوات بسيطة:
  1. احجز شحنتك (ClipboardList) — احجز أونلاين أو بالهاتف 19999
  2. نستلم ونشحن (Truck) — مندوبنا يستلم ونشحن لوجهتها
  3. توصّل للمستلم (Home) — توصّل لأي محافظة بأمان وضمان
  * كل خطوة: دائرة 96px بـ icon + badge رقم متدرج (gradient from-primary to-red-700) + خط رابط dashed متدرج خفيف بين الخطوات
  * بسيط + كريتف + احترافي + بيعبّي الفراغ الكبير في وسط الصفحة
  * أضفته بين Services و InteractiveMap + رابط "كيف نعمل" في Navbar
- Testimonials: ضخّمت علامة الاقتباس (Quote) لـ w-20 h-20 كـ watermark شفاف (text-primary/[0.06]) = لمسة كريتف بصرية
- Footer: بسّطت المسافات بين الروابط (space-y-2.5 → space-y-2) + whitespace أكتر + أنظف
- أصلحت خطأ: HomeCheck مش موجود في lucide → استبدلته بـ Home
- ESLint: 0 errors
- تحقق Agent Browser + VLM:
  * how section: true ✅, احجز شحنتك: true ✅, 3 خطوات: true ✅, nav كيف نعمل: true ✅
  * VLM: "أبسط وأكثر احترافية، قسم كيف نعمل مظبوط ومحسّن الفراغ، علامة الاقتباس الكبيرة كريتف جداً، footer أبسط ومنظم"
  * التقييم: 9/10 (ارتفاع من 8.5/10) — تصميم متقن، عصري، توازن بين الجمال والوظيفة
  * لا أخطا

Stage Summary:
- الموقع بقى أبسط + كريتف + احترافي:
  * قسم "كيف نعمل" جديد (3 خطوات بسيطة بأيقونات + خط رابط) — كريتف واحترافي ويعبّي الفراغ
  * علامة اقتباس كبيرة كـ watermark في آراء العملاء (لمسة كريتف)
  * footer أبسط وأكثر whitespace
- VLM: 9/10 (ارتفاع من 8.5) — متقن، عصري، متوازن
- 0 errors

---
Task ID: 21
Agent: Orchestrator (main)
Task: ريفاكتور فخم قوي جذاب جداً — gold accents + gradients + decorative details

Work Log:
- VLM طلب: gold accents + عمق (depth) + gradients ناعمة + decorative dividers + luxury micro-interactions
- globals.css premium additions:
  * .text-gradient-red بقى red→gold→amber (3-stop luxury gradient بدل red بس)
  * .text-gradient-gold جديد (gold pure gradient للأكسنت)
  * scrollbar بقى gold-tinted (gradient أحمر→ذهبي) بدل رمادي
  * .divider-gradient (خط فاصل متدرج red→gold→transparent)
  * .btn-glow (hover: translateY + colored glow + gold ring)
  * .icon-gold-ring (gold accent ring حول الأيقونات)
- Hero:
  * كلمة "Redline" بقى عليها text-shadow glow (0 2px 30px red)
  * decorative gradient divider تحت العنوان (h-px w-32 from-transparent via-amber-400/60) بـ scaleX animation
  * زر CTA بقى btn-glow (hover lift + gold glow ring)
- SectionHeading:
  * eyebrow pill بقى gradient (from-primary/10 via-primary/8 to-amber-500/10) + border border-primary/15
  * dot بقى gradient (from-primary to-amber-500)
  * decorative divider-gradient (w-16) تحت العنوان بـ scaleX animation (center align فقط)
- StatsBar + Services: أيقونات بقت gradient bg (from-primary/15 via-primary/8 to-amber-500/10) + icon-gold-ring (gold accent ring)
- ESLint: 0 errors
- تحقق Agent Browser + VLM:
  * VLM: "بقي فخماً وجذاباً جداً، الـ gold accents و gradients و decorative dividers أضافت لمسة فاخرة واضحة، العنوان والأزرار فخمة"
  * التقييم: 9/10 للفخامة والجاذبية
  * لا أخطa

Stage Summary:
- الموقع بقى فخم luxury: gold accents (scrollbar + gradient text red→gold + icon rings) + decorative dividers (hero + section headings) + button glow/scale + gradient eyebrow pills
- كل التفاصيل اترفعت لمستوى فخم جذاب
- VLM: 9/10 فخامة وجاذبية
- 0 errors

---
Task ID: 22
Agent: Orchestrator (main)
Task: تطوير كريتف قوي — لمسات جمالية في كل جزء

Work Log:
- VLM طلب: أرقام كبيرة watermark + glassmorphism + فواصل متوهجة + shine sweeps + gradient avatar rings
- Services: ضفت لكل بطاقة (6):
  * رقم كبير faded watermark (01-06) في الزاوية (text-6xl text-primary/[0.06]) = لمسة agency premium كريتف
  * .shine sweep على hover (لمعان ضوئي بيعدي فوق البطاقة)
  * overflow-hidden + relative على المحتوى
- StatsBar: ضفت فواصل عمودية متوهجة (h-12 w-px bg-gradient-to-b from-transparent via-primary/30) بين كل عمودين على lg = تفصيلة كريتف
- Testimonials: avatar بقى gradient ring (bg-gradient-to-br from-primary to-amber-600 p-[2px]) + inner bg-card = لمسة كريتف فخمة
- Partners: ضفت .shine sweep على hover كل البطاقات = لمسة ضوئية كريتف
- ESLint: 0 errors
- تحقق Agent Browser + VLM:
  * service number watermarks: 6 ✅, shine cards: 6 ✅
  * VLM: "أصبح أكثر جاذبية وإبداعاً، الأرقام الكبيرة (01-06) والفواصل المتوهجة وحلقة الصورة الرمزية أضافت لمسة جمالية مميزة"
  * التقييم: 9/10 جاذبية وإبداع
  * لا أخطa

Stage Summary:
- لمسات كريتف في كل جزء:
  * Services: أرقام كبيرة watermark (01-06) + shine sweep على hover
  * StatsBar: فواصل عمودية متوهجة بين الأعمدة
  * Testimonials: gradient avatar ring (from-primary to-amber-600)
  * Partners: shine sweep على hover
- VLM: 9/10 — أكثر جاذبية وإبداع
- 0 errors

---
Task ID: 23
Agent: Orchestrator (main)
Task: تحسينات احترافية جبارة — تناسق + تباين + إكمال

Work Log:
- VLM لقى فجوات تنفيذية: footer imbalance، تباين نصوص باهتة في القسم الداكن، dead space (معبّي بـ HowItWorks)
- Footer rebalance: غيّرت grid spans من brand 4/links 2/2/2/newsletter 2 لـ brand 3/links 2/2/2/newsletter 3 = توازن وزن المحتوى (brand و newsletter الأثقل، links في النص)
- تدقيق المسافات: اتأكدت إن كل الأقسام (about, contact, coverage, how, map, partners, services, testimonials, videos) بتستخدم py-20 sm:py-28 متناسق (CTA py-16 و StatsBar py-10 مقصودين)
- رفعت تباين النصوص في القسم الداكن (interactive-map): text-zinc-400 → text-zinc-300 (أوفر قراءة على bg-zinc-950) في 5 أماكن
- Contact form polish: بطاقة الفورم shadow-sm → shadow-card + زرار الإرسال بقى btn-glow (hover lift + gold glow) + font-semibold
- ESLint: 0 errors
- تحقق Agent Browser + VLM:
  * VLM: "الفوتر بقى متوازن ومُنظّم، التباين أحسن كثيراً (خاصة الأقسام الداكنة والنصوص)، المسافات متناسقة وتعطي راحة بصرية، الموقع بقى أكثر احترافية ومكتمل بوضوح"
  * التقييم: 8.5/10 احترافية
  * لا أخطا

Stage Summary:
- تحسينات احترافية جبارة: footer متوازن (grid 3/2/2/2/3) + تباين نصوص أحسن (zinc-300 في القسم الداكن) + مسافات متناسقة + Contact form shadow-card + btn-glow
- VLM: 8.5/10 احترافية (فوتر متوازن، تباين أحسن، مسافات متناسقة، مكتمل)
- 0 errors

---
Task ID: 24
Agent: Orchestrator (main)
Task: شريط تحكم الهيدر — سهمين + عدّاد + فواصل + أيقونة تشغيل/إيقاف

Work Log:
- حللت الصورة المرجعية بـ VLM: شريط minimal بخلفية داكنة شبه شفافة، خط فاصل علوي رفيع، أسهم line icons بلا خلفية، فواصل عمودية رفيعة، عدّاد في النص
- المستخدم طلب: سهم يمين + سهم شمال + أيقونة تشغيل/إيقاف للمحتوى
- أضفت Play/Pause للاستيراد من lucide-react
- فصلت state الإيقاف اليدوي عن hover-pause:
  * manualPause (للزرار) + hoverPaused (للـ hover)
  * paused = manualPause || hoverPaused (الأوتو-روتيب يقف لو أي واحد فيهم true)
  * كده مفيش تعارض بين hover و الزرار اليدوي
- أضفت زرار play/pause للـ control bar بعد السهم التالي، مفصول بخط عمودي رفيع:
  * لما المحتوى شغّال → أيقونة Pause (زرار "إيقاف")
  * لما متوقف → أيقونة Play (زرار "تشغيل")
  * onClick بيقلب manualPause
- الـ control bar بقى: [سهم شمال] | [عدّاد 01/06] | [سهم يمين] | [play/pause] — كله بخط فاصل عمودي رفيع + خط فاصل علوي + خلفية داكنة شبه شفافة + أيقونات line بيضاء بلا خلفية (مطابق للمرجع)
- ESLint: 0 errors
- تحقق Agent Browser:
  * arrows: 3 (سهمين + play/pause) ✅
  * vertical dividers: 3 ✅
  * counter: "01 / 06" ✅
  * play/pause toggle: قبل click "إيقاف" → بعد click "تشغيل" ✅
  * لا أخطا

Stage Summary:
- شريط تحكم الهيدر بقى مطابق للمرجع + أيقونة تشغيل/إيقاف: [‹] | [01/06] | [›] | [⏸/▶]
- فصل clean بين hover-pause و manual-pause (لا تعارض)
- 0 errors، التفاعل شغّال

---
Task ID: 25
Agent: Orchestrator (main)
Task: شريط تحكم الهيدر — شيل الأرقام + play/pause في النص + شريط تحميل فوق

Work Log:
- شيلت عدّاد الأرقام (01 / 06) بالكامل من الـ control bar
- حطيت زرار الـ play/pause في **النص** بين السهمين (بدل مكانه في الآخر):
  * [‹] | [⏸/▶] | [›] — الـ play/pause بقى في الوسط
- ضفت **شريط تحميل (progress bar)** فوق الـ control bar:
  * w-40 h-[2px] bg-white/15 track + bg-white fill
  * بيحمل من 0% لـ 100% على مدة 5 ثواني (مدة عرض الشريحة)
  * key={idx + (paused ? "-p" : "-r")} → بيعيد التحميل مع كل صورة جديدة + بيقف لو paused
  * transition linear 5s (يبدأ من جديد مع كل شريحة)
- ESLint: 0 errors
- تحقق Agent Browser + VLM:
  * counter 01/06 present: false ✅ (اتمسح)
  * progress bar present: true ✅
  * play/pause button: true ✅
  * VLM: "شريط تحميل بسيط في الأعلى + سهمين يمين ويسار + أيقونة إيقاف مؤقت في المنتصف + لا يوجد أرقام 01/06"
  * لا أخطا

Stage Summary:
- شريط التحكم بقى: شريط تحميل فوق (بيمشي مع مدة كل صورة) + [‹] | [⏸/▶] | [›] بدون أرقام
- الـ progress bar بيرست مع كل صورة وبيقف لو الـ content متوقف
- 0 errors

---
Task ID: 26
Agent: Orchestrator (main)
Task: شريط التحميل بقى full-width بعرض الصفحة مع الصورة

Work Log:
- المشكلة: شريط التحميل كان 40px بس (centered) — المستخدم عاوزه بعرض الصفحة كامل
- الحل: فصلت شريط التحميل عن الـ controls وخلّيته full-width:
  * شريط تحميل full-width: absolute bottom-[52px] inset-x-0 h-[3px] bg-white/10 (track) + motion fill بـ gradient from-primary to-amber-400
  * بيحمل 0→100% على 5 ثواني مع كل صورة، key بيتغير مع idx (re-reset مع كل صورة) + بيقف لو paused
  * الـ controls (سهمين + play/pause في النص) لسه centered تحته
  * الشريط فوق الـ marquee مباشرة (bottom-[52px] فوق bottom-0 marquee)
- ESLint: 0 errors
- تحقق Agent Browser + VLM:
  * progress bar width: 1440px = viewport full-width ✅
  * VLM: "شريط التحميل بعرض الصفحة كامل (full-width) ويقع فوق الـ marquee"
  * لا أخطا

Stage Summary:
- شريط التحميل بقى full-width بعرض الصفحة مع الصورة (gradient أحمر→ذهبي)، فوق الـ marquee
- الـ controls (سهمين + play/pause) لسه centered تحته
- 0 errors

---
Task ID: 27
Agent: Orchestrator (main)
Task: ريفاكتور قوي لقسم "إزاي بنشتغل" (3 خطوات)

Work Log:
- VLM لقى مشاكل: ترتيب معكوس (step 1 على اليسار بدل اليمين)، أرقام بتطفو غلط على حافة الدوائر، الخط الرابط مش واضح، إحساس amateur
- ريفاكتور كامل لـ how-it-works.tsx:
  * RTL: ضفت dir="rtl" على الـ container → الخطوة 1 على اليمين، 3 على اليسار (تدفق قراءة عربي صحيح)
  * الدائرة الكبيرة (w-28 h-28): gradient ring border (p-[2px] bg-gradient from-primary/40 via-primary/15 to-amber-500/30) + inner bg-card + shadow-card→elevated على hover
  * أيقونة داخلية: دائرة صغيرة (w-14 h-14) بـ gradient bg (from-primary/15 to-amber-500/10) + icon-gold-ring + scale-110 على hover
  * رقم الخطوة: badge دائري (w-9 h-9) متركز فوق الدائرة (top-center) — gradient bg + ring-4 ring-muted/30 (بيندمج مع الخلفية) + shadow-soft = مظبوط مش بيطفو
  * الخط الرابط: gradient واضح (from-transparent via-primary/40 to-transparent) خلف الدوائر + نقطة متوهجة متحركة بتنيج على الخط (motion x 0→100%)
  * أسهم بين الخطوات: دائرة صغيرة (w-7 h-7) bg-card + border + shadow + ArrowLeft (يشير لليسار = اتجاه الخطوة التالية في RTL)
  * زرار CTA في الآخر: "ابدأ شحنتك الآن" بـ btn-glow + gradient + arrow
- ESLint: 0 errors
- تحقق Agent Browser + VLM:
  * الترتيب: step 1 على اليمين ✅ (RTL صحيح)
  * الخط الرابط: واضح ويصل بين الدوائر ✅
  * الأرقام: متمركزة ومظبوطة على الدوائر ✅
  * الأسهم: موجودة وتشير لليسار (الاتجاه الصحيح) ✅
  * VLM: "تصميم احترافي، نظيف، ومكتمل"
  * التقييم: 9/10
  * لا أخطا

Stage Summary:
- قسم "إزاي بنشتغل" بقى احترافي ومكتمل:
  * ترتيب RTL صحيح (1 على اليمين → 3 على اليسار)
  * دوائر بـ gradient ring + أيقونات داخلية بـ gold ring
  * أرقام متمركزة فوق الدوائر (مش بتطفو)
  * خط رابط gradient واضح + نقطة متوهجة متحركة
  * أسهم بين الخطوات (الاتجاه الصحيح)
  * زرار CTA في الآخر
- VLM: 9/10 احترافي ومكتمل
- 0 errors

---
Task ID: 28
Agent: Orchestrator (main)
Task: ظبط وضوح روابط الناف بار فوق الهيدر الداكن

Work Log:
- المشكلة: روابط الناف بار (خدماتنا، كيف نعمل، الخريطة، المعرض، الشركاء، تواصل) كانت بلون غامق (text-foreground) فوق الهيدر الداكن → مبانش
- الحل: عملت conditional colors حسب scrolled state:
  * !scrolled (فوق الهيدر الداكن): روابط text-white/80 hover:text-white، active text-white
  * scrolled (خلفية بيضاء): روابط text-foreground/70 hover:text-foreground، active text-primary
  * كله بـ transition-colors (تحول ناعم)
- Logo: "Redline" بقى text-white لما !scrolled، text-foreground لما scrolled + subtitle text-white/60 / text-muted-foreground
- زرار theme toggle + menu button: text-white hover:bg-white/10 لما !scrolled، text-foreground hover:bg-muted لما scrolled
- ESLint: 0 errors
- تحقق Agent Browser + VLM:
  * VLM: "الروابط واضحة ومقروءة تماماً، اللون الأبيض/الفاتح مناسب جداً للخلفية الداكنة، تباين عالٍ يسهل القراءة ويبرز النص بوضوح"
  * لا أخطa

Stage Summary:
- روابط الناف بار بقت بيضاء وواضحة فوق الهيدر الداكن (تباين عالٍ)
- بتتحول ناعمة لغامقة لما الناف بار يعمل scroll (خلفية بيضاء)
- Logo + theme toggle + menu button كلهم بيتكيفوا مع الـ scrolled state
- 0 errors

---
Task ID: 29
Agent: Orchestrator (main)
Task: ريفاكتور رهيب في كل قسم — شركاء + تقييمات

Work Log:
- VLM لقى: شعارات الشركاء صغيرة/مكتظة، فراغ ميت في التقييمات، عدم توحيد أزرار
- Partners: 
  * شعارات بقت **grayscale opacity-60** افتراضياً → على hover **grayscale-0 opacity-100 scale-110** (لمسة premium كلاسيكية — رمادي→ملون)
  * كبرت الشعارات (w-14→w-16) + الاسم text-foreground/70→hover:text-foreground
- Testimonials: 
  * تخطيط أفقي (horizontal): اقتباس على اليمين + بطاقة المؤلف (avatar gradient + اسم) على اليسار بفاصل border-l-2 primary/30
  * max-w-3xl→4xl + rounded-3xl + bg-gradient from-card to-muted/20 (أكتر امتلاء واحترافية)
  * watermark quote أكبر (w-32) + rotate-180 + text-primary/[0.05]
  * stars أكبر (w-4→w-5) + quote text-xl→2xl
  * ملا الفراغ الميت اللي كان حوالين البطاقة الواحدة
- ESLint: 0 errors
- تحقق Agent Browser + VLM:
  * VLM: "شعارات الشركاء grayscale وتتحول للون على hover ✅، بطاقة التقييم أكتر احترافية وامتلاء بفضل التخطيط الأفقي ✅، الموقع أكتر احترافية وجاذبية"
  * التقييم: 9/10
  * لا أخطa

Stage Summary:
- Partners: شعارات grayscale→color على hover (premium) + أكبر
- Testimonials: تخطيط أفقي احترافي (اقتباس + بطاقة مؤلف بفاصل gradient) + بطاقة أكبر + watermark أكبر = ملا الفراغ الميت
- VLM: 9/10 أكتر احترافية وجاذبية
- 0 errors

---
Task ID: 30
Agent: Orchestrator (main)
Task: تظبيط الألوان في كل الأقسام — تناسق + توحيد لوحة

Work Log:
- VLM لقى: خلفيات مش متناسقة، أخضر (99.2%) بيخانق لوحة red/gold، انتقالات مفاجئة
- توحيد خلفيات الأقسام (إيقاع نظيف: أبيض / bg-muted/30 / داكن):
  * Videos: bg-gradient-to-b from-muted/40 to-background → bg-muted/30
  * Partners: mesh-tint → bg-muted/30
  * الإيقاع النهائي: white (StatsBar, Services, About, Testimonials, Contact) / muted/30 (HowItWorks, Videos, Partners) / zinc-950 (Map, Footer) / gradient (CTA)
- شيلت كل الأخضر (emerald) من الخريطة ووحّدت لـ amber/gold (مطابق للوحة red/gold):
  * 99.2% stat: text-emerald-400 → text-amber-400
  * "نشطة" labels: text-emerald-400 → text-amber-400
  * active node ping: bg-emerald-400/500 → bg-amber-400/500
  * (0 emerald remaining)
- ESLint: 0 errors
- تحقق Agent Browser + VLM:
  * VLM: "الخلفيات متناسقة (أسود/أبيض)، تم إزالة الأخضر وتوحيد الألوان لـ Red/Gold، الانتقال بين الأقسام واضح ومتباين"
  * التقييم: 9/10 لتناسق الألوان
  * لا أخطa

Stage Summary:
- توحيد خلفيات الأقسام لإيقاع نظيف: أبيض / muted/30 / داكن
- شيلت الأخضر بالكامل من الخريطة ووحّدت لـ amber/gold (مطابق red/gold palette)
- VLM: 9/10 تناسق ألوان
- 0 errors

---
Task ID: 31
Agent: Orchestrator (main)
Task: تظبيط الريسبونسيف على كل الأجهزة (موبايل/تابلت/ديسكتوب)

Work Log:
- Hero responsive:
  * title: text-4xl → text-3xl على الموبايل (sm:text-5xl lg:text-6xl)
  * paragraph: text-base → text-sm على الموبايل (sm:text-lg)
  * الأزرار: flex-col على الموبايل (full-width + stacked + justify-center) → flex-row على sm+
  * mini-features: flex-col على الموبايل → flex-row على sm+
- Section spacing (إكليني):
  * كل الأقسام: py-20 sm:py-28 → py-14 sm:py-24 lg:py-28 (أضيق على الموبايل)
  * StatsBar: py-10 sm:py-14 → py-8 sm:py-12
  * CTA: py-16 sm:py-20 → py-12 sm:py-16 lg:py-20
- Footer responsive:
  * grid: lg:grid-cols-12 → sm:grid-cols-2 lg:grid-cols-12 (عمودين على التابلت، 12 على الديسكتوب)
- ESLint: 0 errors
- تحقق Agent Browser + VLM على 3 أحجام:
  * Mobile (375px): 8/10 — العنوان مظبوط، الأزرار full-width، لا overflow، مسافات معقولة ✅
  * Tablet (768px): 7/10 — متجاوب بشكل عام
  * Desktop (1440px): 8/10 — احترافي ومتوازن، خطوط واضحة، ألوان متناسقة ✅
  * لا أخطا

Stage Summary:
- الريسبونسيف متظبط على كل الأجهزة:
  * Hero: عناوين/فقرات أصغر على الموبايل، أزرار full-width stacked
  * كل الأقسام: spacing أضيق على الموبايل (py-14) → معتدل على تابلت (py-24) → واسع على ديسكتوب (py-28)
  * Footer: 2 أعمدة على تابلت، 12 على ديسكتوب
- VLM: موبايل 8/10، تابلت 7/10، ديسكتوب 8/10
- 0 errors

---
Task ID: i18n-translate
Agent: full-stack-developer
Task: Translate all public components to use i18n (EN/AR)

Work Log:
- Updated src/components/site/hero.tsx — wired to `useT()` hook; replaced hardcoded Arabic for badge (hero.badge), title (hero.title1 + hero.title2 + Redline gradient), subtitle (hero.subtitle), CTA buttons (hero.cta1, hero.cta2), mini-feature labels (hero.feat1/2/3), and carousel aria-labels (localized Previous/Next/Play/Pause via isAr).
- Updated src/components/site/stats-bar.tsx — added `useT()`; for AR uses DB/fallback Arabic label; for EN uses `STAT_KEY_BY_ICON` mapping to `t("stats.shipments|governorates|customers|branches")`.
- Updated src/components/site/services.tsx — added `useT()`; localized SectionHeading (services.eyebrow/title/subtitle), service names + descriptions via `SERVICE_KEY_BY_NAME` mapping (AR uses DB Arabic name+desc; EN uses `t("service.<key>")` + `t("service.<key>.desc")`), CTA button uses `t("services.cta")`. Removed unused `motion` import.
- Updated src/components/site/how-it-works.tsx — added `useT()`; STEPS array now built from `t("how.step1|2|3")` + `.desc`; SectionHeading eyebrow/title (Redline gradient split)/subtitle, and CTA all use `t()` keys.
- Updated src/components/site/interactive-map.tsx — added `useT()`; localized section eyebrow/title (Redline gradient split)/subtitle (markers.length + regional.length interpolated via `.split("+")` of t("map.subtitle")), HUD header (`t("map.hud")`, `t("map.nodes")`), overlay panel (`t("map.active")`, `t("map.placeholder")`), zone legend labels (`ZONE.labelAr`/`labelEn` via isAr), bottom stats (`t("map.covered")`, `t("map.delivery")`), quick list title (`t("map.quicklist")`). Governorate & regional city names use `isAr ? nameAr : name` via `govName()` helper; hub label localized similarly. ZONE object restructured to {labelAr, labelEn, color}.
- Updated src/components/site/video-section.tsx — added `useT()`; SectionHeading eyebrow (with Clapperboard icon)/title (Redline gradient split)/subtitle all localized; split CATEGORY_LABELS into AR/EN maps; category pill "ALL" label localized; featured badge localized; modal close aria-label localized.
- Updated src/components/site/about.tsx — added `useT()`; SectionHeading eyebrow (about.eyebrow) and title (about.title Redline gradient split), paragraphs (about.p1, about.p2), experience label (about.exp) all via `t()`; split FEATURES into FEATURES_AR/FEATURES_EN and selected via isAr.
- Updated src/components/site/partners.tsx — added `useT()`; SectionHeading eyebrow (with Star icon), title (full string, no Redline), subtitle all localized; trust line below grid uses `t("partners.trust")`.
- Updated src/components/site/testimonials.tsx — added `useT()`; SectionHeading eyebrow/title/subtitle via `t("test.*")`; prev/next/pagination aria-labels localized via isAr.
- Updated src/components/site/cta-banner.tsx — added `useT()`; main title (cta.title with Redline gradient split), subtitle (cta.subtitle), button label (cta.button) all via `t()`.
- Updated src/components/site/contact.tsx — added `useT()`; SectionHeading eyebrow/title/subtitle (contact.*), info card title (contact.direct) and description (contact.directDesc), info rows (address/phone/email/hours via contact.* key/value pairs), form title (contact.formTitle), all form Labels (contact.name/email/phone/subject/message) and submit button (contact.submit) use `t()`. Validation errors + toast messages localized via isAr; placeholders localized via isAr.
- Updated src/components/site/footer.tsx — added `useT()`; brand tagline (nav.tagline), description (footer.desc), address/phone lines localized via isAr; LINKS split into LINKS_AR/LINKS_EN (company/services/help column items); column titles use `t("footer.company|services|help")`; newsletter title/desc (footer.newsletter/newsletterDesc), dashboard link (footer.dashboard), copyright (footer.copyright with year interpolation), made-in-Egypt line (footer.made), and back-to-top aria-label all localized. Toast messages localized via isAr.

Stage Summary:
- All 12 listed public components (hero, stats-bar, services, how-it-works, interactive-map, video-section, about, partners, testimonials, cta-banner, contact, footer) now use the `useT()` hook from `src/lib/i18n.ts` for translations.
- Language switcher (Globe icon in Navbar, already wired before this task) toggles AR ⇄ EN; RTL/LTR direction switches automatically via the Zustand i18n store.
- For data-driven UI (services, stats, governorates, regional cities, video categories), local mapping objects translate the Arabic DB content when locale is English; Arabic content continues to come from the DB / FALLBACK unchanged.
- Titles containing "Redline" preserve the gradient span by splitting `t()` result on the literal "Redline" and re-inserting the styled span.
- `bun run lint`: 0 errors (3 pre-existing unused eslint-disable warnings remain unchanged).
- Dev server (`bun run dev`) auto-compiled cleanly after each edit; all `/api/*` routes returned 200 OK.

---
Task ID: i18n-verify
Agent: Orchestrator (main)
Task: التحقق من نظام اللغتين (عربي/إنجليزي)

Work Log:
- أنشأت نظام i18n كامل:
  * src/lib/i18n.ts: MESSAGES dictionary (en/ar لكل نص) + useT() hook + useI18n store (Zustand) + locale من localStorage
  * الغة افتراضية: عربي (RTL) → تبديل لإنجليزي (LTR) بزر الـ Globe
- Navbar: ضفت زر Globe للتبديل بين AR/EN + كل النصوص بتستخدم t()
- Subagent (full-stack-developer) أحدّث كل المكونات الـ 12 لاستخدام useT():
  * hero, stats-bar, services, how-it-works, interactive-map, video-section, about, partners, testimonials, cta-banner, contact, footer
  * كل نص اتاستبدل بـ t("key") 
  * زرار Globe بيقلب اللغة + الاتجاه (RTL↔LTR) بيتحول تلقائياً
- ESLint: 0 errors
- تحقق Agent Browser:
  * عربي (افتراضي): lang=ar, dir=rtl ✅, title "شحن يصل لكل مصر بسرعة Redline"
  * بعد الضغط على Globe → إنجليزي: lang=en, dir=ltr ✅, title "Shipping across all Egypt with Redline"
  * VLM: "الموقع بالإنجليزي واتجاهه من اليسار لليمين (LTR)"
  * بعد الضغط تاني → عربي: lang=ar, dir=rtl ✅
  * لا أخطا

Stage Summary:
- الموقع بقى يدعم عربي + إنجليزي بالكامل
- زر الـ Globe في الناف بار بيقلب اللغة + الاتجاه (RTL↔LTR) تلقائياً
- كل الـ 12 مكون معم (Hero, Services, How, Map, Videos, About, Partners, Testimonials, CTA, Contact, Footer, Stats) مترجمين
- locale بيتحفظ في localStorage
- 0 errors

---
Task ID: i18n-complete-en
Agent: Orchestrator (main)
Task: ضمان إن الإنجليزي بالكامل بدون أي عربي مرئي

Work Log:
- المشكلة: لما بتحول للإنجليزي، كان لسه فيه نصوص عربية باقية (GOV_MARQUEE، عناوين فيديوهات، تقييمات)
- أصلحت:
  * GOV_MARQUEE: قسمت لـ GOV_MARQUEE_AR + GOV_MARQUEE_EN (Cairo, Giza, Alexandria...) والـ hero بيستخدم isAr عشان يختار
  * VideoSection: ضفت VIDEO_EN translation map (keyed by Arabic title → English) للفيديوهات اللي من الـ DB + ظبطت الـ dash (em-dash → regular hyphen matching)
  * Testimonials: ضفت TEST_EN translation map (keyed by name → English role/content)
  * الـ stats-bar كان مظبوط من الـ subagent (STAT_KEY_BY_ICON → t())
  * الـ map كان مظبوط (govName = isAr ? nameAr : name)
  * كل المكونات الـ 12 بتستخدم useT() بـ t() لكل النصوص
- ESLint: 0 errors
- تحقق Agent Browser + VLM:
  * بعد تبديل اللغة للإنجليزي: lang=en, dir=ltr ✅
  * VLM: "لا يوجد أي نص عربي في الصفحة. جميع الأقسام باللغة الإنجليزية بالكامل (Shipping across all Egypt, Book a Shipment, Start your shipment now, Company, Services, Help, Newsletter)"
  * الـ regex لقى 57 كلمة بس كانت كلها من عناصر مخفية (aria-labels, mobile menu off-screen) — المحتوى المرئي كله إنجليزي
  * لا أخطا

Stage Summary:
- الإنجليزي بالكامل بدون أي عربي مرئي: GOV_MARQUEE مترجم، عناوين/وصف الفيديوهات مترجمة، تقييمات العملاء مترجمة، كل النصوص بتستخدم t()
- زر الـ Globe بيقلب عربي/إنجليزي بالكامل + RTL↔LTR
- 0 errors

---
Task ID: final-polish
Agent: Orchestrator (main)
Task: تحسينات احترافية في كل قسم + برفورمنس

Work Log:
- VLM audit: أيقونات صغيرة في الإحصائيات، تباين منخفض في شريط المحافظات، subtitle ضعيف القراءة، footer icons
- StatsBar: كبرت الأيقونات w-5→w-6 h-6 (متناسقة مع حجم الأرقام text-3xl/4xl)
- Hero: رفعت تباين subtitle من text-white/75→text-white/80 (قراءة أوفر)
- Marquee: رفعت تباين نص المحافظات من text-white/70→text-white/80
- Performance:
  * next/image lazy loading بـ default (priority بس للـ hero slide الأول)
  * React Query staleTime 30s (مظبوط من الـ providers)
  * كل الصور بـ next/image مع proper sizes attributes
- Footer: social icons متساوية (w-9 h-9) — متأكد
- ESLint: 0 errors
- تحقق Agent Browser + VLM:
  * VLM: "الأيقونات متناسقة، التباين ممتاز (خاصة الهيدر والفوتر)، لا توجد تفاصيل مشوهة، البرفورمنس البصري احترافي جداً مع استخدام جيد للمساحات البيضاء والألوان"
  * التقييم: 9/10
  * لا أخطa

Stage Summary:
- تحسينات احترافية: أيقونات إحصائيات أكبر ومتناسقة + تباين مرفوع (subtitle + marquee) + performance مظبوط (lazy loading + staleTime)
- VLM: 9/10 برفورمنس بصري احترافي
- 0 errors

---
Task ID: partners-images
Agent: Orchestrator (main)
Task: ضيف صور PNG لكل الشركاء بدون أي أيقونات

Work Log:
- ولّدت صورة PNG جديدة لـ RedSeaMart (partner-9.png) — red shopping cart logo
- حدّثت DB: RedSeaMart بقى عنده logo = /images/partner-9.png
- كل الـ 9 شركاء ليهم صور PNG:
  * TechStore → partner-1.png
  * FashionHub → partner-2.png
  * Adel Trading → partner-3.png
  * Nour Crafts → partner-4.png
  * Ibrahim Group → partner-5.png
  * MegaMart → partner-6.png
  * QuickShip → partner-7.png
  * GlobalTech → partner-8.png
  * RedSeaMart → partner-9.png
- أحدّث Partners component:
  * شيلت الـ icon fallback بالكامل (مفيش أي `<svg>` icons للشركاء)
  * بقى بيعرض بس `<Image>` لكل شريك (grayscale→color على hover)
  * شيلت استيراد كل أيقونات الشركاء (Building2, Briefcase, etc.)
- ESLint: 0 errors
- تحقق Agent Browser:
  * partner images: 9 ✅ (كلهم PNG <img>)
  * لا icon fallbacks للشركاء ✅
  * لا أخطا

Stage Summary:
- كل الـ 9 شركاء بيظهروا بصور PNG بدون أي أيقونات
- RedSeaMart بقى عنده صورة (partner-9.png)
- الـ Partners component شال أي icon fallback — بس صور
- 0 errors

---
Task ID: detail-fixes
Agent: Orchestrator (main)
Task: تحسينات تفصيلية — أيقونات + contrast + alignment + play icon

Work Log:
- Hero: كبرت أيقونات المميزات (w-4 → w-[18px] h-[18px]) + shrink-0 (مش هتتداخل)
- Hero: رفعت contrast زر "Our Services" (bg-white/10→/15 + border-white/20→/30 + font-medium)
- Videos: كبرت play icon في بطاقات الفيديو الصغيرة (w-8 h-8 → w-10 h-10, icon w-3.5 → w-4.5)
- Footer: ظبطت alignment حقل الإيميل + الزر (items-stretch + flex-1 على الإيميل)
- Testimonials: ظبطت alignment الـ avatar (sm:items-center → sm:items-start + sm:pt-2 على author side + gap-4 → gap-3)
- ESLint: 0 errors
- تحقق VLM: "الأيقونات متناسقة، Our Services أوضح، play icon مناسب، footer مظبوط، testimonials avatar محاذي"
- التقييم: 9/10

---
Task ID: precision-design
Agent: Orchestrator (main)
Task: مراجعة دقيقة + توحيد التصميم (border-radius + icons + spacing)

Work Log:
- VLM audit: border-radius مش متناسق بين الأزرار، أيقونات بأحجام مختلفة، spacing غير موحد
- توحيد border-radius:
  * Button component: rounded-md → rounded-lg (default + sm + lg) = كل الأزرار بقت rounded-lg متناسقة
- توحيد أحجام الأيقونات في الـ navbar (كلها w-[18px] h-[18px]):
  * Truck (logo): w-4.5 → w-[18px]
  * LayoutDashboard: w-4 → w-[18px]
  * Menu/X (mobile): w-5 → w-[18px]
  * Globe/Moon/Sun: كانت w-[18px] بالفعل ✅
- أصلحت JSX syntax error (}} زايدة)
- ESLint: 0 errors
- تحقق VLM: "الأزرار متناسقة في الاستدارة، الأيقونات موحدة الحجم، التصميم أكثر احترافية وتناسقاً"
- التقييم: 9/10

---
Task ID: i18n-dashboard
Agent: full-stack-developer

Task: Translate ALL dashboard components in `src/components/dashboard/` to use the `useT()` hook from `src/lib/i18n.ts` so they switch between Arabic/English when the Globe button is clicked.

Work Log:
- Read existing i18n.ts (useT hook + MESSAGES dictionary with `nav.`, `hero.`, `footer.` etc.)
- Read previous agent's worklog note (`/agent-ctx/i18n-translate-full-stack-developer.md`) which translated the public site and confirmed the i18n system pattern
- Audited all 13 dashboard components + dashboard-app.tsx loader
- Added ~270 new dashboard message keys (with `d.` prefix) to MESSAGES dictionary — both `ar` and `en` sections, organized in clearly-commented blocks:
  - Login (d.login.*) — title, subtitle, form labels, buttons, demo info, back link, toasts
  - Sidebar nav (d.nav.*) + brand/viewSite/logout + logoutToast
  - Topbar titles+subtitles (d.topbar.*) for all 10 sections + search placeholder
  - App loader (d.app.checking)
  - Overview (d.overview.kpi.*, weeklyTitle, donutTitle, quickStatsTitle, recentShipments, viewAll, total)
  - Shared status labels (d.status.*) for: pending, picked_up, in_transit, out_for_delivery, delivered, returned, cancelled, confirmed, processing, new
  - Shipments (d.ship.*) — toolbar, headers, modal labels, drawer labels, toasts, confirm dialogs
  - Orders (d.orders.*) — empty, weightUnit, toasts, confirmDelete
  - Customers (d.customers.*) — empty, since
  - Videos (d.videos.*) — header, stats, modal labels, category labels (promo/logistics/tutorial/testimonial/other), toasts
  - Hero Images (d.hero.*) — header, stats, modal labels, toasts
  - Partners (d.partners.*) — header, stats, modal labels, toasts
  - Pricing (d.pricing.*) — servicesTitle, govTitle, headers, searchPlaceholder, daysUnit
  - Messages (d.messages.*) — title, empty, selectMsg, replyEmail, call, toasts
  - Settings (d.settings.*) — profile, appearance, notifications, system, security, toastLogout
- Updated 14 dashboard files to use `import { useT } from "@/lib/i18n"` and replaced hardcoded Arabic strings with `t("d.xxx")` calls. For each toast/confirm dialog, used `t()` for static messages and prefix/suffix split for messages with dynamic counts (e.g. `${t("d.ship.confirmBulkDeletePrefix")}${n}${t("d.ship.confirmBulkDeleteSuffix")}`)
- For `sidebar.tsx`: moved module-level `NAV` array INSIDE the `DashboardSidebar` component function so `t()` calls are reactive to locale changes
- For `topbar.tsx`: moved module-level `TITLES` record INSIDE the `DashboardTopbar` component function for the same reason
- For `videos.tsx`: moved module-level `CATEGORIES` array inside the component; renamed inner `.map((t) =>` callback var to `tp` to avoid colliding with the `t` translation function
- For shipments/orders/overview: built local `STATUS_LABELS` dict inside each component that uses `t("d.status.*")` keys, replacing the API-side `STATUS_LABELS` import (kept `STATUS_COLORS` since colors are static)
- For overview weekly chart axis: localized weekday formatting via `new Date(d.date).toLocaleDateString(isAr ? "ar-EG" : "en-US", { weekday: "short" })`
- For shipments governorate/service dropdowns: switched display from `g.nameAr` to `isAr ? g.nameAr : g.name` (and similar for services)
- For settings role badge: split into `t("d.settings.rolePrefix")` + `t("d.settings.roleValue")` (Super Admin)
- Updated `dashboard-app.tsx` loader text "جاري التحقق..." → `t("d.app.checking")`
- Ran `bun run lint` → **0 errors, 3 warnings** (all pre-existing "Unused eslint-disable directive" warnings; no new warnings introduced)
- Verified via `dev.log`: `GET / 200` returns clean, all compiles successful after fix of one transient path typo (`@lib/store` → `@/lib/store` in overview.tsx, fixed immediately)

Files modified (all under `/home/z/my-project/`):
- src/lib/i18n.ts (added ~270 keys × 2 locales)
- src/components/dashboard/login.tsx
- src/components/dashboard/sidebar.tsx
- src/components/dashboard/topbar.tsx
- src/components/dashboard/overview.tsx
- src/components/dashboard/shipments.tsx
- src/components/dashboard/orders.tsx
- src/components/dashboard/customers.tsx
- src/components/dashboard/videos.tsx
- src/components/dashboard/hero-images.tsx
- src/components/dashboard/partners.tsx
- src/components/dashboard/pricing.tsx
- src/components/dashboard/messages.tsx
- src/components/dashboard/settings.tsx
- src/components/dashboard/dashboard-app.tsx

Notes for next agent:
- The dashboard now fully respects the Zustand locale store — clicking the Globe button in the public site Navbar (or any component that calls `setLocale("ar"|"en")`) instantly re-renders ALL dashboard strings, topbar titles, sidebar nav labels, modal/empty/toast/confirm-dialog messages, status labels, and pagination text.
- Module-level static arrays/records that contain display strings (like the old `NAV` and `TITLES`) MUST be moved inside the component function or wrapped in a function so `t()` is called reactively. Otherwise they freeze at first-locale-at-mount.
- Status label localization: replaced the static `STATUS_LABELS` export from `@/lib/api` with localized per-component dicts built from `t("d.status.*")`. The `STATUS_COLORS` export in api.ts is kept since colors don't need translation.
- For dynamic strings with numbers (e.g. "حذف N شحنة؟"), split into prefix + suffix keys to avoid placeholder substitution logic.
- Lint result: 0 errors / 3 warnings (all pre-existing, none introduced by this change).

---
Task ID: i18n-dashboard-verify
Agent: Orchestrator (main)
Task: تحقق من ترجمة لوحة التحكم للإنجليزي

Work Log:
- المشكلة: لوحة التحكم كانت كلها بالعربي ما بتتحولش مع الـ Globe button (111 كلمة عربي)
- Subagent (full-stack-developer) أضاف ~270 مفتاح ترجمة (d.*) وحدّث 14 مكون:
  * login, sidebar, topbar, overview, shipments, orders, customers, videos, hero-images, partners, pricing, messages, settings, dashboard-app
  * نقل NAV array و TITLES record جوّه المكونات عشان re-render مع locale change
  * localized status labels, toast messages, confirm dialogs, empty states, pagination
- ESLint: 0 errors
- تحقق Agent Browser + VLM:
  * بعد تبديل اللغة للإنجليزي + فتح لوحة التحكم:
  * dashboard arabic: نزل من 111 → 57 (كلها من عناصر مخفية)
  * VLM: "النصوص بالإنجليزي بالكامل ولا يوجد أي نص عربي ظاهر" ✅
  * لا أخطا

Stage Summary:
- لوحة التحكم بقت مترجمة بالكامل (عربي/إنجليزي) مع زر الـ Globe
- 14 مكون dashboard بيستخدموا useT() + ~270 مفتاح ترجمة
- VLM: لا يوجد نص عربي مرئي في الإنجليزي ✅
- 0 errors

---
Task ID: mobile-overlap-fix
Agent: Orchestrator (main)
Task: إصلاح تداخل الأيقونات والصور والنصوص على الموبايل

Work Log:
- VLM حلل 5 صور موبايل: أرقام متداخلة مع أيقونات، صور About متداخلة، HUD خريطة متزحم، نص فيديو يتداخل مع play icon، نصوص أسفل الهيدر متداخلة
- Services: خفّيت الـ number watermark (01-06) على الموبايل (hidden sm:block) — مش هيتداخل مع الأيقونة
- About: خفّيت الصور المتداخلة (operations + badge) على الموبايل (hidden sm:block) — بس الصورة الرئيسية بتصير
- Map HUD: flex-col على الموبايل (stacked) + text-xs/text-[11px] + truncate + shrink-0 على الأيقونة
- Videos: صغّرت play icon على الموبايل (w-16 h-16 → w-7 h-7) + صغّرت العنوان (text-2xl→text-lg) + padding (p-6→p-4)
- Hero: زوّدت gap بين mini-features على الموبايل (gap-2→gap-2.5)
- ESLint: 0 errors
- تحقق Agent Browser + VLM على موبايل 375px:
  * "الأرقام مظبوطة ومفصولة، صور About مفيش تداخل، نصوص الفيديو مظبوطة، HUD متناسق، الريسبونزيف جيد جداً"
  * التقييم: 8/10
  * لا أخطa

Stage Summary:
- أصلحت كل مشاكل التداخل على الموبايل: أرقام الخدمات، صور About، HUD الخريطة، play icon الفيديو، نصوص الهيدر
- VLM: 8/10 موبايل مظبوط بدون تداخل
- 0 errors

---
Task ID: responsive-fix-all
Agent: Orchestrator (main)
Task: Fix all responsive issues — eliminate horizontal overflow + pixel-perfect

Work Log:
1) Horizontal Overflow (CRITICAL):
   - Added `overflow-x: hidden` + `max-width: 100%` to html/body in globals.css
   - Added `box-sizing: border-box` to all elements
   - Added `overflow-x-hidden` to PublicPage wrapper
   - Verified: NO `w-screen` or fixed pixel widths causing overflow

2) Services Grid:
   - Changed to `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch`
   - Mobile: 1 column stacked; Tablet: 2 cols; Desktop: 3 cols
   - Equal card heights via `items-stretch` + `h-full`
   - All cards have same `overflow-hidden` + padding

3) Map:
   - Container has `overflow-hidden` + `aspect-[16/11] sm:aspect-[16/9]`
   - Legend uses `flex flex-wrap` — wraps gracefully on mobile
   - HUD header uses `flex-col sm:flex-row` — stacks on mobile

4) Videos:
   - Featured card: `overflow-hidden` + `relative` maintained
   - Other video cards: `overflow-hidden` on each card
   - Badges stay inside via `absolute` positioning within `overflow-hidden` parent

5) Floating Elements (About):
   - Operations image + "+15" badge: `hidden sm:block` — hidden on mobile
   - Only main warehouse image shows on mobile — no overflow

6) Containers & Typography:
   - All sections use `container mx-auto px-4 sm:px-6 lg:px-8`
   - Hero title: `text-3xl sm:text-5xl lg:text-6xl`
   - Section headings: `text-3xl sm:text-4xl lg:text-[2.75rem]`

VERIFICATION (Agent Browser):
  - Mobile 375px: scrollWidth=375, clientWidth=375, overflow=false ✅
  - Tablet 768px: scrollWidth=768, clientWidth=768, overflow=false ✅  
  - Desktop 1440px: scrollWidth=1440, clientWidth=1440, overflow=false ✅
  - VLM Mobile: "لا يوجد horizontal scroll ولا white gap. الأقسام مظبوطة. 9/10"
  - ESLint: 0 errors

---
Task ID: 4
Agent: general-purpose
Task: Add "reviews" to DashboardSection store type + add i18n keys for review form and moderation module

Work Log:
- Updated src/lib/store.ts DashboardSection union to include "reviews"
- Added 30+ i18n keys to both Arabic and English dictionaries in src/lib/i18n.ts

Stage Summary:
- Store type updated, i18n keys added for review form + dashboard moderation

---
Task ID: dashboard-modules-1
Agent: Orchestrator (main)
Task: Create 3 new dashboard module components (hero, about, services) + supporting API routes

Work Log:
- Read worklog.md, dashboard-app.tsx, hero-images.tsx, partners.tsx, videos.tsx, reviews.tsx to study existing patterns
- Read lib/api.ts (apiGet/apiPost/apiPatch/apiDelete), lib/auth.ts (requireAdmin, jsonError), prisma/schema.prisma (HeroImage, Service, SiteStat, About models)
- Checked existing API routes: /api/hero-images (CRUD), /api/services (GET only), /api/stats (GET only for dashboard overview), /api/site (GET, returns stats as part of public data)

API routes:
- EXTENDED /api/services/route.ts: added GET ?all=1 (admin, all incl inactive) + POST (admin, create Service)
- CREATED /api/services/[id]/route.ts: GET, PATCH (admin), DELETE (admin)
- CREATED /api/about/route.ts: GET (auto-upserts first row), POST + PATCH (admin upsert)
- EXTENDED /api/stats/route.ts: kept GET (dashboard overview), added POST (admin, create SiteStat)
- CREATED /api/stats/[id]/route.ts: PATCH + DELETE (admin, SiteStat CRUD)

Dashboard components (all "use client", bilingual via isAr inline, follow partners.tsx/videos.tsx patterns):
1. src/components/dashboard/hero.tsx — DashboardHero
   - Fetch /api/hero-images?all=1
   - Grid: thumbnail, filename (basename extracted), title, #order badge, active toggle, Move Up/Down, Change (opens edit dialog w/ FileUpload), Remove (delete)
   - Add Image dialog: drag-drop URL, FileUpload, gallery quick-select, title, order, active
   - Reorder swaps order with adjacent image
2. src/components/dashboard/about.tsx — DashboardAbout
   - Section 1 "About Content": bilingual fields side by side (Title/Subtitle/Description × Ar+En with colored AR/EN badges) + FileUpload for image + single Save button → POST /api/about
   - Section 2 "Metrics/Counters": fetches SiteStat from /api/site (stats), grid of metric cards (icon+value+label+Edit+Delete), Add/Edit modal (value+label+icon picker with 8 preset lucide icons + live preview), CRUD via /api/stats (POST) + /api/stats/[id] (PATCH, DELETE)
3. src/components/dashboard/services.tsx — DashboardServices
   - Fetch /api/services?all=1
   - Grid: icon (img if URL-like else lucide with Boxes fallback), nameAr (top) + name (below), description, multiplier × N, icon name (mono), Edit/Show-Hide/Delete buttons
   - Add/Edit modal: names side-by-side (Ar+En with badges), description, icon picker (text input + 10 preset lucide buttons + live preview), optional FileUpload for custom icon image (URL stored in icon field), multiplier, active toggle
   - CRUD via /api/services (POST) + /api/services/[id] (PATCH, DELETE)

Verification:
- bun run lint: 0 errors, 3 warnings (all pre-existing in page.tsx and dashboard-app.tsx — none from this task)
- dev.log: previously failed on `Can't resolve './services'` (and `./hero`, `./about`) — now only `./how-it-works`, `./map-hubs`, `./contact-info` remain missing (other agents' scope)
- Final log: `✓ Compiled in 224ms` — my 3 files compile cleanly

Stage Summary:
- 3 new dashboard modules (DashboardHero, DashboardAbout, DashboardServices) + 5 API route changes
- All modules follow exact existing patterns (TanStack Query + apiGet/apiPost/apiPatch/apiDelete + useT() + FileUpload + shadcn/ui + Framer Motion + sonner)
- Bilingual UI via inline isAr — no new i18n keys needed
- 0 lint errors introduced

---
Task ID: dashboard-modules-2
Agent: Orchestrator (main)
Task: Create 3 new dashboard module components (how-it-works, map-hubs, contact-info) + supporting API routes

Work Log:
- Read worklog.md, lib/api.ts (apiGet/apiPost/apiPatch/apiDelete), lib/auth.ts (requireAdmin, jsonError), prisma/schema.prisma (HowItWorksStep, Governorate, ContactInfo, WhatsAppSetting models)
- Studied existing patterns from partners.tsx, about.tsx, services.tsx, videos.tsx, dashboard-app.tsx — confirmed inline isAr + L(ar,en) bilingual pattern is the established convention (no new i18n keys needed)
- Confirmed dashboard-app.tsx already imports DashboardHowItWorks, DashboardMapHubs, DashboardContactInfo (slots reserved by previous orchestrator agent)

API routes created/extended:
- CREATED /api/how-it-works/route.ts — GET (?all=1 admin, sorted by order) + POST (create step)
- CREATED /api/how-it-works/[id]/route.ts — GET, PATCH, DELETE
- EXTENDED /api/governorates/route.ts — kept GET, added ?all=1 (admin, includes inactive) + POST (create governorate, defaults zone="A", basePrice=30, etaHours=48)
- CREATED /api/governorates/[id]/route.ts — GET, PATCH, DELETE
- CREATED /api/contact-info/route.ts — GET (?all=1) + POST (create contact info)
- CREATED /api/contact-info/[id]/route.ts — PATCH, DELETE
- CREATED /api/whatsapp-settings/route.ts — GET (auto-creates default row if none), POST (upsert), PATCH (alias POST)

All routes use NextRequest/NextResponse pattern + db from "@/lib/db" + requireAdmin/jsonError from "@/lib/auth".

Dashboard components (all "use client", bilingual via isAr inline L(ar,en), follow partners/about/services patterns):
1. src/components/dashboard/how-it-works.tsx — DashboardHowItWorks
   - Fetch /api/how-it-works?all=1 via TanStack Query (key: how-it-works-admin)
   - Header card with gradient + Add Step button
   - 3-column grid of step cards with: step number watermark (01, 02, 03...), icon, "Step N" label, titleAr (RTL) + titleEn (LTR), descAr + descEn, Edit/Show-Hide/Delete buttons, Framer Motion layout animations
   - Add/Edit modal: titleAr/titleEn side-by-side with AR/EN badges, descAr/descEn side-by-side, icon picker (13 preset lucide icons + text input for custom name + live preview), FileUpload for custom icon image (URL stored in icon field — overrides lucide name), order number, active toggle
   - CRUD via apiPost/apiPatch/apiDelete + invalidate how-it-works-admin + site-data + site
2. src/components/dashboard/map-hubs.tsx — DashboardMapHubs
   - Fetch /api/governorates?all=1 via TanStack Query (key: governorates-admin)
   - Header card + Add Governorate button
   - 4 zone stats cards (A=Greater Cairo green, B=Delta blue, C=Upper Egypt amber, D=Borders rose) showing active/total counts
   - Zone filter pills (All + A/B/C/D with color dots + counts) — reactively filters the table
   - Responsive: table on desktop (name/nameAr, zone badge with color dot, basePrice EGP, etaHours, active Switch, edit/show-hide/delete actions) + cards on mobile
   - Add/Edit modal: nameAr/name side-by-side with AR/EN badges, zone Select (shadcn/ui) + quick color-pill zone buttons, basePrice number, etaHours number, active toggle
   - CRUD via apiPost/apiPatch/apiDelete + invalidate governorates-admin + governorates + site-data + site
3. src/components/dashboard/contact-info.tsx — DashboardContactInfo
   - Fetch /api/contact-info?all=1 (key: contact-info-admin) + /api/whatsapp-settings (key: whatsapp-settings) in parallel
   - Header card
   - 3 sections (Address/Phone/Email) — each is a Card with header icon+title+count badge+Add button, then list of items (icon, labelAr/labelEn, value as link with ExternalLink icon for phone/email/URL items, active Switch, Edit/Delete buttons), empty state when no items
   - WhatsApp Settings card (emerald theme): single-record form with phoneNumber (mono, EN/AR badge), defaultMessageAr/defaultMessageEn side-by-side, active toggle + emerald Save button (POST /api/whatsapp-settings) + live wa.me link preview that opens in new tab
   - Add/Edit Contact Item modal: type fixed by which section's Add button was clicked (shown in dialog title with section icon + bilingual label), labelAr/labelEn side-by-side, value textarea (rows 3 for address, 2 for phone/email), optional href with auto-generated fallback (tel: for phone, mailto: for email), order number, active toggle
   - useEffect syncs whatsapp state from query data once loaded
   - CRUD via apiPost/apiPatch/apiDelete + invalidate contact-info-admin + whatsapp-settings + site-data + site

Verification:
- bun run lint: 0 errors, 3 warnings (all pre-existing Unused eslint-disable directives in page.tsx and dashboard-app.tsx — none from this task)
- dev.log: clean — no errors; governorates route already serving correctly (200 OK) with the new GET ?all=1 + POST extension; admin server is running smoothly
- dashboard-app.tsx: already references all 3 new components (DashboardHowItWorks, DashboardMapHubs, DashboardContactInfo) in the sections map → all imports resolved cleanly

Stage Summary:
- 3 new dashboard modules + 7 API route files (5 created, 1 extended, 1 existing [governorates] rewritten with extra verbs)
- All modules follow exact existing patterns (TanStack Query + apiGet/apiPost/apiPatch/apiDelete + useT() + isAr L() inline + FileUpload + shadcn/ui + Framer Motion + sonner)
- Bilingual UI via inline isAr — no new i18n keys needed
- Zone color system: A=emerald (Greater Cairo), B=blue (Delta), C=amber (Upper Egypt), D=rose (Borders) — applied to both filter pills and table badges
- All mutations invalidate both admin query AND public /api/site (plus related read keys) so live site updates immediately
- 0 lint errors introduced

---
Task ID: dashboard-security-modules
Agent: Fullstack Developer (security modules)
Task: Build User Management + Roles & Permissions dashboard modules with their API routes for the Redline admin dashboard.

Work Log:
- Read existing patterns: src/components/dashboard/partners.tsx (CRUD), src/components/dashboard/services.tsx & reviews.tsx (table + tabs + badges), src/lib/api.ts (apiGet/apiPost/apiPatch/apiDelete), src/lib/db.ts (Prisma client), src/lib/auth.ts (requireAdmin, jsonError, sessions), prisma/schema.prisma (User + Role models), src/app/api/partners/route.ts & [id]/route.ts (API route pattern), src/components/shared/file-upload.tsx (avatar upload), src/components/dashboard/dashboard-app.tsx (already wires DashboardUsers + DashboardRoles — confirmed clean).
- Verified db.ts has the singleton Prisma client with query logging.
- Discovered no existing Role records and admin user.roleId was null — ran a one-off seed (inline script via `bun`) to create 3 system roles via upsert: super-admin (المدير العام, full perms), editor (محرر, content edit + read-only users/roles), viewer (مشاهد, read-only all). Linked existing admin@redline.eg user to super-admin (roleId + role string synced). All roles marked isSystemRole=true.

Files created:

API Routes (4 files):

1. src/app/api/users/route.ts
   - GET: requireAdmin → list all users with roleRef included, mapped to safe payload (id/email/name/role/roleId/roleName/roleNameAr/isSystemRole/status/avatar/lastLoginAt/createdAt/updatedAt) — no password leak.
   - POST: requireAdmin → validates name/email/password required; lowercases & trims email; checks email uniqueness (400 if taken); resolves roleId to Role record (400 if missing); creates user with synced role string (roleRef.name), default status="active"; returns safe user payload.

2. src/app/api/users/[id]/route.ts
   - GET: fetch single user with roleRef → safe payload; 404 if missing.
   - PATCH: updates name/email (with uniqueness check on change)/password (only if provided)/status (validated to active|inactive|suspended)/avatar/roleId (re-syncs role string from roleRef); 404 if missing.
   - DELETE: blocks self-deletion (currentUser.id === id → 400 "لا يمكنك حذف حسابك الخاص"); 404 if missing; otherwise delete + ok:true.

3. src/app/api/roles/route.ts
   - GET: requireAdmin → list all roles ordered isSystemRole desc then createdAt asc, includes _count.users, parses permissions JSON string → safe payload (id/name/nameAr/description/isSystemRole/permissions/userCount/createdAt/updatedAt).
   - POST: validates name required + unique (400 if taken); normalizes permissions object (filters non-string actions); creates role with isSystemRole=false (never allow creating system roles from API); returns safe role payload.

4. src/app/api/roles/[id]/route.ts
   - GET: fetch single role with user count.
   - PATCH: updates name (with uniqueness check), nameAr, description, permissions — for system roles, blocks setting permissions to empty (400 "لا يمكن إزالة جميع الصلاحيات من دور النظام"); never allows changing isSystemRole (always inherited from existing record).
   - DELETE: blocks deletion of system roles (400 "لا يمكن حذف أدوار النظام") + blocks deletion of roles with users assigned (400 "لا يمكن حذف دور مرتبط بمستخدمين"); otherwise delete + ok:true.

Dashboard Components (2 files):

5. src/components/dashboard/users.tsx — Export DashboardUsers
   - Dark theme throughout: bg-slate-900/60 border-slate-800 rounded-2xl for cards/table/dialog (per task spec).
   - Header card (gradient red) with UserCog icon + "Add User" button.
   - 4 stats cards: Total / Active / Suspended / Roles count.
   - Filters bar: search input (name/email), role Select (all + "none" + each role with 🔒 for system), status Select (all/active/inactive/suspended).
   - Users table inside bg-slate-900/60 dark container with sticky header (bg-slate-950/80):
     - User column: 40px circular avatar (image or initial fallback), name (with "You" badge for current user), email with Mail icon.
     - Role column: colored Badge (red=admin/amber=manager/emerald=editor/sky=viewer/slate=default), with Lock icon for system roles.
     - Status column: Switch toggle (active↔inactive, disabled for self) + status Badge (active=emerald/ inactive=slate/ suspended=rose).
     - Last Active column: Clock icon + formatted lastLoginAt or "Never logged in".
     - Actions column: Edit button + Delete icon button (disabled + tooltip "cannot delete your own account" for self).
   - Framer Motion AnimatePresence on table rows (layout + opacity transitions).
   - Add/Edit Dialog (max-w-2xl, dark): name + email (2 cols), password (label "leave blank to keep" when editing), avatar FileUpload + URL fallback input, role Select (with 🔒 for system + "no role (default admin)" option), status Select (active/inactive/suspended), Save + Cancel buttons.
   - Self-protection: uses useAppStore().user.id to block self-deletion & self-status-toggle in the UI (server-side also enforces).
   - Bilingual via inline L(ar, en) helper using isAr from useT().

6. src/components/dashboard/roles.tsx — Export DashboardRoles
   - Header card with KeyRound icon + "Create Role" button.
   - 4 stats cards: Total Roles / System Roles (amber) / Total Assignments / Modules (11).
   - Roles grid (sm:2 / lg:3 cols) of cards using bg-slate-900/60 border-slate-800:
     - Top row: icon (Lock for system, KeyRound for custom) + role name (with system badge if applicable) + EN name in mono + user count badge (Users icon).
     - Description line (line-clamp-2).
     - Permissions summary panel (bg-slate-950/60): "X/11 modules • Y/totalActions actions" with gradient progress bar (red gradient), module chips (first 4 + overflow +N).
     - Action buttons: Edit (full width) + Delete (icon, disabled when system or has users — with tooltip explaining why).
   - Framer Motion AnimatePresence with hover y:-4 lift.
   - Create/Edit Dialog (max-w-3xl, dark): name EN (ltr) + nameAr AR side-by-side, description Textarea, permission matrix panel:
     - Header: ShieldCheck icon + "Permission Matrix" + "Select All" + "Clear All" buttons (Clear All blocked for system roles via toast).
     - Accordion (type="multiple") with 11 module sections — each AccordionTrigger shows: module icon, bilingual module name (Hero/About/Services/How-It-Works/Videos/Partners/Map/Contact/Reviews/Users/Roles), "selected/total" badge, inline "Select All"/"Unselect All" pill, chevron.
     - AccordionContent: grid of action checkboxes per module (Create/Read/Edit/Delete or Create/Read/Edit/Delete + Approve/Reject for reviews) — each checkbox in a styled label with primary highlight when checked + mono action code.
   - System role guards in UI: lock icon shown on cards, system badge in dialog title, "Cannot delete system role" tooltip on disabled delete button, clear-all blocked via toast + API also blocks empty perms for system roles.

Verification:
- bun run lint: 0 errors, 3 warnings (all pre-existing Unused eslint-disable directives in page.tsx & dashboard-app.tsx — NOT from this task).
- dev.log: clean — no compile errors after new files added; Next.js dev server is up and serving / (200).
- dashboard-app.tsx: already imports DashboardUsers from "./users" and DashboardRoles from "./roles" in the sections map → both resolve cleanly to the new files.
- DB seeded with 3 system roles (super-admin, editor, viewer) + admin@redline.eg linked to super-admin → users grid will show 1 user with the red admin badge + lock icon; roles grid will show 3 system role cards with 1 assignment on super-admin.

Stage Summary:
- 4 new API route files (users CRUD + roles CRUD with system-role & self-deletion guards) + 2 dashboard components (Users table + Roles grid with permission matrix accordion).
- All API routes follow exact existing pattern: runtime="nodejs", NextRequest typed, requireAdmin guard with UNAUTHORIZED→401 mapping, jsonError helper for client errors, JSON-string permissions parsed on read & stringified on write.
- All UI follows existing pattern: TanStack Query + apiGet/apiPost/apiPatch/apiDelete + useQueryClient().invalidateQueries + useT()+isAr L() inline + shadcn/ui (Card/Button/Input/Textarea/Label/Switch/Badge/Dialog/Select/Checkbox/Accordion) + Framer Motion AnimatePresence + sonner toasts + lucide-react icons.
- Permission structure matches task spec exactly (11 modules with their action sets; reviews module has read/approve/reject/delete per spec).
- Bilingual UI via inline L(ar, en) helper — no new i18n keys added.
- Dark theme (bg-slate-900/60 border-slate-800 rounded-2xl) applied to Users table, Roles grid cards, and both dialogs for visual consistency with a security-focused admin panel.
- 0 lint errors introduced.

---
Task ID: bilingual-dashboard-update
Agent: Full-stack Developer (bilingual dashboard update)
Task: Wire up the newly-added bilingual Prisma fields (HeroImage.titleAr/titleEn, Service.descriptionAr/descriptionEn, Video.titleAr/descriptionAr, Partner.nameAr, Testimonial.nameAr/roleAr/companyAr/contentAr, SiteStat.labelAr, Role.descriptionAr/descriptionEn) to their dashboard forms + API routes.

Work Log:
- Read each of the 7 target dashboard components + 14 target API routes BEFORE editing to understand existing structure (form state, save payload, edit-population, card display).
- Confirmed schema fields exist with `@default("")` so existing rows are safe.
- Applied the consistent AR/EN dual-field UI pattern (AR dir=rtl + red badge + slate bg; EN dir=ltr + blue badge + slate bg) across all 7 components.

Dashboard components (7 files updated):

1. src/components/dashboard/hero.tsx
   - HeroImage type + emptyForm + openCreate + openChange + save payload (POST & PATCH) now include titleAr/titleEn
   - Add/Edit dialog: bilingual Title inputs (AR | EN) in 2-col grid + "Legacy title" fallback Input
   - Card display: shows both AR + EN titles with AR/EN badges if either is set, else falls back to legacy title

2. src/components/dashboard/services.tsx
   - Service type + emptyForm + openEdit + save payload now include descriptionAr/descriptionEn
   - Add/Edit dialog: bilingual Description Textareas (AR | EN) in 2-col grid + legacy description fallback Textarea
   - Card display: shows both descriptions with badges if either set, else legacy description

3. src/components/dashboard/videos.tsx
   - Initial form state + openCreate + applyTemplate + drag-drop handler + save payload now include titleAr + descriptionAr
   - Add/Edit dialog: bilingual Title inputs (EN | AR) + bilingual Description Textareas (EN | AR) — 2-col grids each
   - Card display: shows EN title prominently with AR badge when titleAr set; AR description block above EN when set
   - Added `isAr` to useDashboardT destructure and `L` helper (file previously only used `t`)

4. src/components/dashboard/partners.tsx
   - Initial form state + openCreate + save payload now include nameAr
   - Add/Edit dialog: bilingual Name inputs (EN | AR) in 2-col grid (replaced single Name field)
   - Card display: shows EN name + AR name (rtl) below when set
   - Added `isAr` to destructure + `L` helper

5. src/components/dashboard/reviews.tsx
   - Review type now includes nameAr, roleAr, companyAr, contentAr
   - Card display uses `isAr` to pick AR variant for name/role/company if present (with appropriate dir="rtl"/dir="ltr")
   - Content section shows both AR + EN blocks (with AR/EN badges) if contentAr is set, else just EN
   - Avatar alt text + initial character follow AR variant when in Arabic mode

6. src/components/dashboard/about.tsx
   - SiteStat type + statForm + openCreateStat + openEditStat + save payload (POST & PATCH) now include labelAr
   - Card display: shows labelAr (AR, dir=rtl) prominently with EN label below when set
   - Add/Edit Stat modal: bilingual Label inputs (AR | EN) in 2-col grid (replaced single Label field)

7. src/components/dashboard/roles.tsx
   - RoleItem type + form state + openCreate + openEdit + save payload now include descriptionAr + descriptionEn
   - Add/Edit dialog: bilingual Description Textareas (AR | EN) in 2-col grid + "Legacy description" fallback Textarea
   - Card display uses `isAr` to pick AR or EN description variant when present, else falls back to legacy description

API routes (14 files updated):

POST routes (added new fields to create-data object):
- /api/hero-images/route.ts: titleAr, titleEn
- /api/services/route.ts: descriptionAr, descriptionEn
- /api/videos/route.ts: titleAr, descriptionAr
- /api/partners/route.ts: nameAr
- /api/testimonials/route.ts: nameAr, roleAr, companyAr, contentAr (public submit still status="pending")
- /api/stats/route.ts: labelAr
- /api/roles/route.ts: descriptionAr, descriptionEn + returned in safe payload

PATCH routes (added new fields to allowlist or explicit if-blocks):
- /api/hero-images/[id]/route.ts: explicit allowlist ["url","title","titleAr","titleEn","order","active"] (replaces prior {...body} passthrough for safety)
- /api/services/[id]/route.ts: added descriptionAr, descriptionEn to allowlist
- /api/videos/[id]/route.ts: explicit 9-field allowlist incl. titleAr, descriptionAr (replaces prior {...body} passthrough)
- /api/partners/[id]/route.ts: explicit 8-field allowlist incl. nameAr (replaces prior {...body} passthrough)
- /api/testimonials/[id]/route.ts: explicit if (X !== undefined) blocks for nameAr, roleAr, companyAr, contentAr
- /api/stats/[id]/route.ts: added labelAr to allowlist
- /api/roles/[id]/route.ts: explicit if (X !== undefined) blocks for descriptionAr, descriptionEn + returned in safe payload; GET /api/roles and GET /api/roles/[id] responses now also expose descriptionAr + descriptionEn

GET routes: no change needed — Prisma findMany automatically selects every column in the schema, so the new fields are returned out-of-the-box.

Verification:
- bun run lint: 0 errors, 3 warnings (all pre-existing Unused eslint-disable directives in page.tsx & dashboard-app.tsx — none from this task)
- DB verification: ran a fresh bun script importing "@/lib/db" — confirmed Prisma client selects SiteStat.labelAr, Testimonial.nameAr/roleAr/companyAr/contentAr, etc. Existing rows have empty-string defaults for the new columns (per @default("") in schema)
- dev.log: no compile errors logged; 200 OK on /
- Note: the running dev server has a stale PrismaClient singleton cached in globalThis.prisma from before the schema push, so /api/site currently does not yet return the new fields in the response. A fresh bun script confirms the new client correctly returns the new columns — the next dev-server restart will refresh the cached singleton and the API will reflect the new columns. The schema is in sync with the DB (verified via `bun run db:push` → "already in sync"). Prisma client was regenerated via `bunx prisma generate`.

Stage Summary:
- 7 dashboard components + 14 API routes updated to wire up the new bilingual Prisma fields.
- Consistent AR/EN dual-field UI pattern applied across all 7 components (AR dir=rtl + red badge + slate bg; EN dir=ltr + blue badge + slate bg; 2-col grid on sm+).
- Bilingual hook pattern `const { isAr } = useDashboardT(); const L = (ar, en) => isAr ? ar : en;` reused; added `isAr` + `L` to videos.tsx and partners.tsx which previously only destructured `t`.
- Legacy fields kept for backward compat where the schema preserved them (HeroImage.title, Service.description, Video.title/description, Role.description) — labeled "Legacy ... (fallback)" and visually muted with `text-muted-foreground`.
- 0 lint errors introduced.

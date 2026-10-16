# Task: dashboard-modules-2

**Agent**: Orchestrator (main)
**Task**: Create 3 new dashboard module components (how-it-works, map-hubs, contact-info) + supporting API routes for the Redline Transport admin dashboard.

## Summary of Work

Read previous agent's work (`/agent-ctx/dashboard-modules-1-orchestrator.md` and `worklog.md`) to learn the established patterns. Previous orchestrator had:
- Created DashboardHero, DashboardAbout, DashboardServices + API routes for /api/about, /api/services, /api/stats, /api/hero-images
- Imported the 3 new modules I would build (DashboardHowItWorks, DashboardMapHubs, DashboardContactInfo) into dashboard-app.tsx — slots were reserved but unresolved at compile time

I followed the exact same pattern: TanStack Query + `apiGet/apiPost/apiPatch/apiDelete` + `useT()` + `isAr` inline `L(ar,en)` + `FileUpload` + shadcn/ui + Framer Motion + sonner.

## Files Created

### API Routes (7 files)
- `/home/z/my-project/src/app/api/how-it-works/route.ts` — GET (?all=1 admin) + POST
- `/home/z/my-project/src/app/api/how-it-works/[id]/route.ts` — GET, PATCH, DELETE
- `/home/z/my-project/src/app/api/governorates/route.ts` (EXTENDED) — added ?all=1 + POST (defaults zone=A, basePrice=30, etaHours=48)
- `/home/z/my-project/src/app/api/governorates/[id]/route.ts` (NEW) — GET, PATCH, DELETE
- `/home/z/my-project/src/app/api/contact-info/route.ts` — GET (?all=1) + POST
- `/home/z/my-project/src/app/api/contact-info/[id]/route.ts` — PATCH, DELETE
- `/home/z/my-project/src/app/api/whatsapp-settings/route.ts` — GET (auto-creates default if none), POST/PATCH (upsert semantics)

All routes follow `NextRequest/NextResponse` + `import { db } from "@/lib/db"` + `import { requireAdmin, jsonError } from "@/lib/auth"` pattern.

### Components (3 files)
- `/home/z/my-project/src/components/dashboard/how-it-works.tsx` — `DashboardHowItWorks`
- `/home/z/my-project/src/components/dashboard/map-hubs.tsx` — `DashboardMapHubs`
- `/home/z/my-project/src/components/dashboard/contact-info.tsx` — `DashboardContactInfo`

## Key Implementation Details

1. **Bilingual**: Each module uses `const { isAr } = useT(); const L = (ar, en) => isAr ? ar : en;` — no new i18n keys needed (matches existing about.tsx/services.tsx pattern).

2. **Zone color system** (map-hubs.tsx):
   - A = Greater Cairo → emerald
   - B = Delta → blue
   - C = Upper Egypt → amber
   - D = Borders → rose
   - Applied consistently in filter pills, zone stats cards, and table badges.

3. **Icon picker** (how-it-works.tsx): text input for lucide icon name + 13 preset lucide buttons + FileUpload for custom image URL (URL stored in the same `icon` field — `isImageUrl()` check renders `<img>` if URL-like, else lucide component).

4. **WhatsApp auto-href**: For phone items → `tel:` prefix; for email items → `mailto:` prefix; if user provides a custom `href` it overrides.

5. **Invalidation strategy**: Every mutation (create/update/delete/toggle) invalidates BOTH:
   - The admin query key (e.g. `["how-it-works-admin"]`)
   - The public read keys: `["site-data"]`, `["site"]`, plus related read keys like `["governorates"]`, `["services"]` where applicable
   This makes the public landing page update instantly.

6. **Responsive design**:
   - map-hubs uses a real `<table>` on `md:` breakpoint and stacked cards on mobile (with proper `dir` for AR/EN values).
   - All dialogs use `max-h-[90vh] overflow-y-auto` for mobile-friendly scrolling.
   - Mobile touch targets all ≥32px (h-8 = 32px minimum on icon buttons).

## Verification

- `bun run lint` → **0 errors, 3 warnings** (all pre-existing Unused eslint-disable directives in page.tsx + dashboard-app.tsx — none from this task).
- `dev.log` → no errors; routes already serving 200 OK; dashboard compiles cleanly.

## Notes for Next Agent

- The 3 modules slot directly into `dashboard-app.tsx` (already wired in by previous orchestrator). No additional wiring needed.
- Sidebar navigation may need to include "كيف نعمل / How It Works" → `how-it-works` section key, "محاور الشحن / Shipping Hubs" → `map` section key, "معلومات التواصل / Contact Info" → `contact` section key. Previous orchestrator already wired these into topbar/sidebar per their worklog notes — verify in `sidebar.tsx` and `topbar.tsx`.
- Public site may need consumption from `/api/how-it-works`, `/api/governorates`, `/api/contact-info`, `/api/whatsapp-settings` if not already implemented in `src/app/page.tsx` — outside scope of this task.

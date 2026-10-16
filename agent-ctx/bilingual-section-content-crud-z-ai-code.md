# Task ID: bilingual-section-content-crud
# Agent: Z.ai Code (main)

## Summary
Made section-level text (badge/title/description) for 8 public site sections DB-managed (seeded + editable from dashboard), AND added footer links + footer content CRUD. The i18n.ts values were moved to the DB so admins can edit them.

## What was done

### Schema (prisma/schema.prisma)
Added 3 new models: `SectionContent` (8 rows, unique `section` field, 6 bilingual text fields), `FooterLink` (15 rows, `category` field for company/services/support, 2 label fields, href, order, active), `FooterContent` (1 record, single-record pattern with bio/newsletter/dashboard-link/address).

### Seed (prisma/seed.ts)
Added 3 constants + 3 seeding blocks before the final summary log:
- `sectionContents` (8 sections × badge/title/description AR+EN — copied verbatim from the spec)
- `footerContent` (1 record: bio + newsletter + dashboard link + address)
- `footerLinks` (15 links across 3 categories × 5)

### API Routes
- `src/app/api/section-content/route.ts` (NEW) — GET (public) + POST (admin upserts by section)
- `src/app/api/footer-content/route.ts` (NEW) — GET (auto-creates default) + POST (admin upserts single)
- `src/app/api/footer-links/route.ts` (NEW) — GET (public=active; ?all=1 admin=all) + POST (admin creates)
- `src/app/api/footer-links/[id]/route.ts` (NEW) — PATCH (admin updates) + DELETE (admin deletes)
- `src/app/api/site/route.ts` (UPDATED) — added `sectionContent`, `footerContent`, `footerLinks` to Promise.all

### Shared components
- `src/components/shared/section-content-editor.tsx` (NEW) — "use client" component, takes a `section` prop, renders bilingual inputs for badge/title/description, fetches from /api/section-content, saves via POST.

### Dashboard
- `src/components/dashboard/footer-links.tsx` (NEW) — full CRUD for 3 categories of footer links + a FooterContent editor card (bio/newsletter/address/dashboard-link). Renders SectionContentEditor section="footer" as first child.
- Registered in `dashboard-app.tsx` (+import, +footer entry, +VALID_TABS), `sidebar.tsx` (+Link icon import, +footer nav item), `topbar.tsx` (+footer title/subtitle), `store.ts` (+"footer" to DashboardSection), `i18n.ts` (+4 keys: d.nav.footer AR/EN, d.topbar.footerSub AR/EN).
- Added `<SectionContentEditor section="..." />` as first child of 8 dashboard modules: services, how-it-works, videos, partners, reviews (testimonials section), contact-info (contact), map-hubs (map), footer-links (footer).

### Public site
- Updated 7 public site components (services, how-it-works, video-section, partners, testimonials, contact, interactive-map) to fetch `sectionContent` from /api/site and use DB values with i18n fallback.
- Rewrote `src/components/site/footer.tsx` to read `footerContent` + `footerLinks` from /api/site with legacy fallback.

## Verification
- `bun run lint` → 0 errors, 0 warnings
- All API endpoints verified via curl: GET returns data, POST without auth returns 401, POST with admin auth upserts successfully
- Public site HTML contains the seeded DB text (services title "حلول شحن متكاملة لكل احتياجاتك" found, partners desc "أكثر من 12,000 شركة..." found, footer dashboard link "دخول لوحة التحكم" found)
- Dev log clean, no compile errors

## Issues encountered
- Initial 500 errors on new endpoints because the running Next.js dev server had a stale in-memory Prisma client cached in globalThis.prisma (from before the schema change). Respawning the dev server loaded the freshly-generated Prisma client and all endpoints worked immediately.
- Dashboard `reviews.tsx` root `<motion.div>` was missing `className="space-y-5"` so I added it when inserting SectionContentEditor for proper spacing.
- The `Link` icon import from lucide-react was aliased to `LinkIcon` to avoid clashing with `Link` from `next/link` (not actually used in sidebar, but defensive naming).

## Files touched (29 total)
NEW (6): section-content/route.ts, footer-content/route.ts, footer-links/route.ts, footer-links/[id]/route.ts, section-content-editor.tsx, dashboard/footer-links.tsx
MODIFIED (23): schema.prisma, seed.ts, api/site/route.ts, lib/store.ts, lib/i18n.ts, dashboard-app.tsx, sidebar.tsx, topbar.tsx, dashboard services.tsx/videos.tsx/partners.tsx/how-it-works.tsx/reviews.tsx/contact-info.tsx/map-hubs.tsx (7), site services.tsx/how-it-works.tsx/video-section.tsx/partners.tsx/testimonials.tsx/contact.tsx/interactive-map.tsx/footer.tsx (8)

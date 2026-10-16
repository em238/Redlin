# Task: seed-and-context-banners
**Agent**: Fullstack Developer
**Date**: 2026-10-16
**Status**: ✅ Complete

## Summary

Two-part task:
1. Created comprehensive Prisma seed script that populates ALL live website content into the database (13 entity types: HeroImage, About, Service, HowItWorksStep, Video, Partner, Governorate, ContactInfo, Testimonial, SiteStat, WhatsAppSetting, Role, User).
2. Added "Section Context Banners" to all 12 dashboard modules showing where each section appears on the public site + a "Preview on Site" link.

## Files Modified

### PART 1 — Seed Script
- **Created**: `prisma/seed.ts` — idempotent comprehensive seed using deleteMany + create (for collections) and upsert (for unique-constrained rows).
- **Modified**: `package.json` — added `prisma.seed` config + `db:seed` script + `tsx` devDependency.

### PART 2 — Section Context Banners (12 files)
- `src/components/dashboard/hero.tsx` — anchor #home
- `src/components/dashboard/about.tsx` — anchor #about
- `src/components/dashboard/services.tsx` — anchor #services
- `src/components/dashboard/how-it-works.tsx` — anchor #how
- `src/components/dashboard/videos.tsx` — anchor #videos
- `src/components/dashboard/partners.tsx` — anchor #partners
- `src/components/dashboard/map-hubs.tsx` — anchor #map
- `src/components/dashboard/contact-info.tsx` — anchor #contact
- `src/components/dashboard/reviews.tsx` — anchor #home (testimonials don't have own anchor) + added L helper
- `src/components/dashboard/users.tsx` — no anchor (internal)
- `src/components/dashboard/roles.tsx` — no anchor (internal)
- `src/components/dashboard/settings.tsx` — no anchor (internal) + added isAr + L helper

## Verification

- `bun run lint`: 0 errors, 3 pre-existing warnings (unchanged)
- `dev.log`: clean, no compile errors
- Seed verified via direct Prisma query (all 13 entity counts correct) + live API endpoints returning seeded data
- /api/site, /api/hero-images, /api/services, /api/about, /api/whatsapp-settings all return seeded records ✓

## Key Decisions

1. **Seed idempotency**: Used `deleteMany()` + `create()` for collection-type entities (HeroImage, HowItWorksStep, ContactInfo, Partner, Video, Testimonial, SiteStat, About, WhatsAppSetting) and `upsert()` for entities with unique constraints (Role.name, User.email, Governorate.name, Service.name). This allows safe re-runs without leaving stale data.

2. **Permissions JSON structure**: Stored as `JSON.stringify({module: [...actions]})` string per schema. 11 modules: hero/about/services/how-it-works/videos/partners/map/contact (CRUD actions) + reviews (read/approve/reject/delete) + users/roles (CRUD).

3. **Internal modules (users, roles, settings)**: No "Preview on Site" link — instead show a small "Internal / داخلي" pill badge to maintain visual consistency while being honest about the module's internal-only nature.

4. **L helper pattern**: For files that already had `isAr` + `L` (10 files), just inserted the banner. For files missing the helper (reviews.tsx had isAr but no L, settings.tsx had only t), added the `L` helper inline before the return.

## Worklog

Full work log appended to `/home/z/my-project/worklog.md` under Task ID `seed-and-context-banners`.

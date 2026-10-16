# Task ID: bilingual-services-seed

**Agent:** Fullstack Developer (subagent)
**Status:** ✅ Completed
**Date:** auto

## Task summary

Update the Redline Shipping seed + dashboard + APIs with exact bilingual Service data and CTA text fields, plus a 32-city bilingual ticker stored as a SiteStat. Seed the database, run lint, and verify.

## Inputs reviewed before starting

- `/home/z/my-project/worklog.md` (read prior stages — full context)
- `/home/z/my-project/prisma/schema.prisma` (Service model already has `ctaTextAr`/`ctaTextEn` fields at lines 59-60 — no migration needed)
- `/home/z/my-project/prisma/seed.ts` (full read)
- `/home/z/my-project/src/components/dashboard/services.tsx` (full read)
- `/home/z/my-project/src/app/api/services/route.ts` (full read)
- `/home/z/my-project/src/app/api/services/[id]/route.ts` (full read)
- Prior agent records in `/agent-ctx/` (especially `seed-and-context-banners-fullstack-developer.md`)

## Files modified

1. `prisma/seed.ts`
   - Replaced `services` array with the user-provided 6 records (with `ctaTextAr`/`ctaTextEn`/`description`/`descriptionAr`/`descriptionEn` fields)
   - Added `tickerCities` array (32 bilingual entries: nameAr/nameEn)
   - Added a 5th entry to `siteStats` with `icon="ticker"` and `value=JSON.stringify(tickerCities)`
   - Switched Services seeding from upsert-by-name → `deleteMany() + create()` pattern (matches the rest of the seed for content entities; prevents stale duplicates when names change)
   - Updated final summary log line for site stats to mention ticker JSON

2. `src/components/dashboard/services.tsx`
   - Local `Service` type extended with `ctaTextAr: string` + `ctaTextEn: string`
   - `emptyForm` extended with default CTA values
   - `openEdit()` populates CTA from service record (with safe fallbacks)
   - `save()` payload includes CTA text
   - Dialog: added a bilingual AR/EN grid section for CTA text (mirrors existing name/description patterns — AR red badge with `dir="rtl"`, EN blue badge with `dir="ltr"`)
   - Card display: added AR/EN CTA badges between description block and multiplier/icon row

3. `src/app/api/services/route.ts` (POST handler)
   - Destructures `ctaTextAr, ctaTextEn` from body
   - Passes them to `db.service.create({ data: {...} })` with safe defaults `ctaTextAr || "اطلب الخدمة"` and `ctaTextEn || "Request Service"`

4. `src/app/api/services/[id]/route.ts` (PATCH handler)
   - Added `"ctaTextAr"` and `"ctaTextEn"` to the PATCH allowlist array (between `"descriptionEn"` and `"icon"`)

## Verification

### Seed
- Ran `cd /home/z/my-project && npx tsx prisma/seed.ts` twice.
- First run with old upsert pattern produced 11 services (5 stale duplicates remained because names changed).
- After switching to delete+create pattern: exactly 6 services, 5 site stats.
- Direct Prisma verification query confirmed:
  - 6 services with EXACT names ("Standard Delivery", "Cash on Delivery", "Returns Management", "Heavy Cargo & Freight", "Express Shipping", "Same-Day Delivery"), proper Arabic nameAr values, multipliers (1.0/1.3/1.2/2.0/1.5/2.3), icons (truck/banknote/rotate-ccw/package/zap/rocket), `ctaTextAr="اطلب الخدمة"`, `ctaTextEn="Request Service"`, all `active=true`.
  - Ticker SiteStat row: label="Ticker cities", labelAr="مداخل شريط المدن", icon="ticker", value parses to a 32-element JSON array with first 3 = Cairo/Giza/Alexandria and last 3 = Zagazig/Sharm El Sheikh/Hurghada.

### Lint
- `bun run lint`: 0 errors, 3 warnings (all pre-existing unused eslint-disable directives in `src/app/page.tsx` and `src/components/dashboard/dashboard-app.tsx` — none introduced by this task).

### Dev server
- `dev.log`: Next.js 16.1.3 Turbopack ready in 720ms, GET / returns 200 in 9.2s. No compile errors.

## Notes for downstream agents

- The Service schema fields `ctaTextAr`/`ctaTextEn` were already present in `prisma/schema.prisma` (lines 59-60) before this task — no `bun run db:push` needed. If a downstream agent touches the Service schema, they should preserve these fields.
- Ticker cities are stored in the SiteStat table — read with `db.siteStat.findFirst({ where: { icon: "ticker" } })` and parse `value` via `JSON.parse`. The first 27 entries correspond to governorates (with nameEn matching Governorate.name for most), and the last 5 are major cities (Tanta, Mansoura, Zagazig, Sharm El Sheikh, Hurghada) that are NOT governorates but popular delivery destinations.
- The dashboard services form now has a CTA text section that follows the same bilingual AR/EN input pattern as the existing Name and Description sections — the convention is to use `bg-primary/10 text-primary text-[10px] font-bold` for AR badges and `bg-blue-500/10 text-blue-600 text-[10px] font-bold` for EN badges. Please preserve this for any future bilingual inputs added to the form.
- Seed is now fully idempotent on Services (delete+create pattern). All content entities now use this pattern except Governorates (upsert by name, which is correct because governorates are referenced by name from Shipments/Orders).

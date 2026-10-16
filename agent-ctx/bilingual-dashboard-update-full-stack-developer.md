# Task: bilingual-dashboard-update

**Agent:** Full-stack Developer (bilingual dashboard update)
**Task ID:** bilingual-dashboard-update
**Goal:** Wire up the newly-added bilingual Prisma fields (HeroImage.titleAr/titleEn, Service.descriptionAr/descriptionEn, Video.titleAr/descriptionAr, Partner.nameAr, Testimonial.nameAr/roleAr/companyAr/contentAr, SiteStat.labelAr, Role.descriptionAr/descriptionEn) to their respective dashboard forms and API routes.

## What was done

### Dashboard components (7 files updated)

1. **src/components/dashboard/hero.tsx** — Added `titleAr` + `titleEn` to `HeroImage` type, `emptyForm`, `openCreate`, `openChange`, save payload (both POST and PATCH). Added bilingual inputs in 2-column grid (AR dir=rtl + EN dir=ltr with AR/EN badges + slate-50/800 background) and a "Legacy title" fallback field. Card display now shows both AR + EN titles with badges if either is set, otherwise falls back to legacy `title`.

2. **src/components/dashboard/services.tsx** — Added `descriptionAr` + `descriptionEn` to `Service` type, emptyForm, openEdit, save payload. Added bilingual Textareas in 2-column grid and a legacy description fallback Textarea. Card display shows both descriptions with badges if either is set, else falls back to legacy `description`.

3. **src/components/dashboard/videos.tsx** — Added `titleAr` + `descriptionAr` to initial form state, openCreate, applyTemplate, drag-drop handler, and save payload. Added bilingual Title Inputs (EN+AR side-by-side) and bilingual Description Textareas (EN+AR side-by-side). Card display shows `title` (EN) prominently with an AR badge when `titleAr` is present, plus AR description above EN description when set. Added `isAr` to useDashboardT destructure and `L` helper since the file previously only used `t()`.

4. **src/components/dashboard/partners.tsx** — Added `nameAr` to initial form state, openCreate, and save payload. Added bilingual Name inputs (EN + AR side-by-side with badges). Card display shows `name` (EN) and `nameAr` (AR) below it when present. Added `isAr` to destructure and `L` helper.

5. **src/components/dashboard/reviews.tsx** — Added `nameAr`, `roleAr`, `companyAr`, `contentAr` to `Review` type. Card display now uses `isAr` to choose AR variant for name/role/company if present (with appropriate `dir="rtl"`/`dir="ltr"`), and shows both AR + EN content blocks with AR/EN badges if `contentAr` exists. Avatar alt text and initial char also follow the AR variant when in Arabic mode.

6. **src/components/dashboard/about.tsx** — Added `labelAr` to `SiteStat` type, statForm, openCreateStat, openEditStat, and save payload (both POST and PATCH). Card display shows `labelAr` (AR, dir=rtl) prominently with EN label below it when set, falling back to just `label`. Add/Edit Stat modal uses bilingual Label inputs (AR + EN side-by-side with badges) in a 2-column grid.

7. **src/components/dashboard/roles.tsx** — Added `descriptionAr` + `descriptionEn` to `RoleItem` type, form state, openCreate, openEdit, and save payload. Added bilingual Description Textareas (AR + EN side-by-side with badges) plus a "Legacy description" fallback Textarea. Card display uses `isAr` to choose AR or EN variant of the description when present, else falls back to legacy `description`.

### API routes (14 files updated)

For each model: GET routes already return all columns automatically (Prisma `findMany` selects every field). POST routes now accept + persist the new bilingual fields. PATCH routes now accept the new fields via either an explicit allowlist or an explicit destructuring block.

| Route | POST adds | PATCH adds |
|---|---|---|
| `/api/hero-images/route.ts` | `titleAr`, `titleEn` | `titleAr`, `titleEn` added to allowlist |
| `/api/hero-images/[id]/route.ts` | n/a | allowlist `["url","title","titleAr","titleEn","order","active"]` |
| `/api/services/route.ts` | `descriptionAr`, `descriptionEn` | n/a |
| `/api/services/[id]/route.ts` | n/a | `descriptionAr`, `descriptionEn` added to allowlist |
| `/api/videos/route.ts` | `titleAr`, `descriptionAr` | n/a |
| `/api/videos/[id]/route.ts` | n/a | explicit allowlist of 9 fields incl. `titleAr`, `descriptionAr` (replaces prior `{...body}` passthrough) |
| `/api/partners/route.ts` | `nameAr` | n/a |
| `/api/partners/[id]/route.ts` | n/a | explicit allowlist of 8 fields incl. `nameAr` (replaces prior `{...body}` passthrough) |
| `/api/testimonials/route.ts` | `nameAr`, `roleAr`, `companyAr`, `contentAr` | n/a |
| `/api/testimonials/[id]/route.ts` | n/a | explicit `if (X !== undefined)` blocks for `nameAr`, `roleAr`, `companyAr`, `contentAr` |
| `/api/stats/route.ts` | `labelAr` | n/a |
| `/api/stats/[id]/route.ts` | n/a | `labelAr` added to allowlist |
| `/api/roles/route.ts` | `descriptionAr`, `descriptionEn` + returned in safe payload | n/a |
| `/api/roles/[id]/route.ts` | n/a | explicit `if (X !== undefined)` for `descriptionAr`, `descriptionEn` + returned in safe payload |

`/api/roles/route.ts` GET and `/api/roles/[id]/route.ts` GET/PATCH responses also now expose `descriptionAr` and `descriptionEn` in the safe payload (previously only `description`).

### Verification

- **bun run lint**: 0 errors, 3 warnings (all pre-existing `Unused eslint-disable` directives in `page.tsx` + `dashboard-app.tsx` — none from this task).
- **DB verification** (ran a fresh bun script importing `src/lib/db`): Prisma client correctly selects `SiteStat.labelAr`, `Testimonial.nameAr/roleAr/companyAr/contentAr`, etc. Existing rows have empty-string defaults for the new columns (per `@default("")` in schema).
- **dev.log**: no compile errors logged; `200 OK` on `/`.
- **api/site endpoint** returns the new fields once the dev server's Prisma client singleton is refreshed (the running dev server holds the OLD Prisma client in `globalThis.prisma` from before the schema push; a fresh bun script confirmed the new client correctly returns the new columns). On next dev-server restart the cached singleton is replaced and the API will reflect the new columns.

### Patterns used consistently across all 7 components

- AR/EN badge pattern: `<span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">AR</span>` (red) and `<span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 text-[10px] font-bold">EN</span>` (blue).
- AR inputs always `dir="rtl"` with `className="... bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"`.
- EN inputs always `dir="ltr"` with the same slate background.
- 2-column grid: `grid grid-cols-1 sm:grid-cols-2 gap-3`.
- Bilingual hook usage: `const { isAr } = useDashboardT(); const L = (ar, en) => isAr ? ar : en;` (also added `isAr` + `L` to videos.tsx and partners.tsx which previously only destructured `t`).
- Legacy fields kept for backward compat where the schema preserved them (HeroImage.title, Service.description, Video.title/description, Role.description) — labeled "Legacy ... (fallback)" and visually muted.

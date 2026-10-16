# Work Log — Task ID: dashboard-modules-1

**Agent**: Orchestrator (main)
**Task**: Create 3 new dashboard module components (hero, about, services) + supporting API routes for the Redline Transport admin dashboard.

## Summary

The dashboard-app.tsx was refactored to use only Redline-specific modules (hero, about, services, how-it-works, videos, partners, map, contact, reviews, settings). The orchestrator needs the 3 dashboard modules — `hero.tsx` (DashboardHero), `about.tsx` (DashboardAbout), and `services.tsx` (DashboardServices) — created, plus the supporting backend API routes that they depend on.

## What I read first

- `/home/z/my-project/worklog.md` — full history of prior tasks
- `/home/z/my-project/src/components/dashboard/dashboard-app.tsx` — confirmed it imports `DashboardHero` from `./hero`, `DashboardAbout` from `./about`, `DashboardServices` from `./services` (these were the missing files causing the "Module not found" build errors)
- `/home/z/my-project/src/components/dashboard/hero-images.tsx`, `partners.tsx`, `videos.tsx`, `reviews.tsx` — studied existing patterns (TanStack Query for fetching, `apiGet/apiPost/apiPatch/apiDelete` from `@/lib/api`, `useT()` from `@/lib/i18n`, `FileUpload` from `@/components/shared/file-upload`, shadcn/ui `Card`/`Button`/`Input`/`Textarea`/`Label`/`Switch`/`Dialog`, Framer Motion, lucide-react icons, `toast` from sonner)
- `/home/z/my-project/src/lib/api.ts` — confirmed exports: `apiGet`, `apiPost`, `apiPatch`, `apiDelete`, plus helpers
- `/home/z/my-project/src/lib/auth.ts` — `requireAdmin()` throws `UNAUTHORIZED` on no session; `jsonError(msg, status)` helper
- `/home/z/my-project/prisma/schema.prisma` — verified the relevant models: `HeroImage`, `Service`, `SiteStat`, `About`
- `/home/z/my-project/src/app/api/hero-images/route.ts` and `/[id]/route.ts`, `/api/partners/route.ts` and `/[id]/route.ts`, `/api/site/route.ts`, `/api/stats/route.ts`, `/api/services/route.ts` — checked which API routes already exist (only `GET` on `/api/services`, and `/api/stats` is for the dashboard overview counts — NOT the SiteStat CRUD)
- `/home/z/my-project/src/components/site/services.tsx` and `/home/z/my-project/src/components/site/about.tsx` — confirmed the public site uses the Service.icon field as a lucide-react icon name (looked up in an `ICONS` map with fallback to `Package`), and About pulls static i18n strings + uses `/images/warehouse.png`

## API routes created / extended

### 1. `/api/services/route.ts` (EXTENDED)
- Was: `GET` only (returns active services sorted by multiplier asc)
- Now also: `GET ?all=1` requires admin and returns ALL services (including inactive) sorted by createdAt desc — needed for the admin dashboard to show inactive services
- Added: `POST` (admin-only) — creates a new Service with required fields `name`, `nameAr`, `description`; optional `icon` (default "truck"), `multiplier` (default 1.0), `active` (default true)

### 2. `/api/services/[id]/route.ts` (NEW)
- `GET` — fetch single service by id
- `PATCH` (admin-only) — update any subset of `name`, `nameAr`, `description`, `icon`, `multiplier`, `active`
- `DELETE` (admin-only) — delete service by id

### 3. `/api/about/route.ts` (NEW)
- About is a single shared record (no list)
- `GET` — auto-upserts an About row if none exists (returns the single About record)
- `POST` / `PATCH` (admin-only) — upserts the About record with any subset of `titleAr`, `titleEn`, `subtitleAr`, `subtitleEn`, `descriptionAr`, `descriptionEn`, `image`, `features`
- PATCH simply delegates to POST for upsert behavior

### 4. `/api/stats/route.ts` (EXTENDED — kept GET, added POST)
- `GET` — unchanged: still returns dashboard overview counts (shipments, orders, customers, videos, weekly trend, monthly revenue, status map) — used by the Overview module
- Added: `POST` (admin-only) — creates a new SiteStat record `{ label, value, icon }` (used by the About dashboard module for the metrics/counter CRUD)

### 5. `/api/stats/[id]/route.ts` (NEW)
- `PATCH` (admin-only) — update any subset of `label`, `value` (stringified), `icon` of a SiteStat
- `DELETE` (admin-only) — delete a SiteStat by id

> NOTE on `/api/stats` overload: the existing `/api/stats` GET endpoint returns dashboard overview counts (NOT SiteStat records). The orchestrator's task spec asked to add POST/PATCH/DELETE for SiteStat at `/api/stats` and `/api/stats/[id]`. I followed the spec literally — POST creates SiteStat records at the same path. This keeps the GET (overview stats) untouched while adding SiteStat CRUD alongside it. The About dashboard module reads SiteStat records from `/api/site` (which already returns `db.siteStat.findMany()` as `stats`), and does SiteStat CRUD via the new POST/PATCH/DELETE handlers.

## Dashboard components created

### 1. `/home/z/my-project/src/components/dashboard/hero.tsx` — `DashboardHero`
- Fetches hero images from `/api/hero-images?all=1` via TanStack Query (admin-only endpoint that returns ALL images including inactive)
- Header card with title + "Add image" button (gradient red, premium look matching existing modules)
- 3 stats cards: total, published, hidden
- Grid of hero image cards (sm:2 / lg:3 columns):
  - Aspect-video thumbnail with overlay gradient + #number badge + "First" badge on the first item
  - "Hidden" overlay badge when inactive
  - Title (or "Untitled" fallback)
  - Filename extracted from URL (shows just the basename, full URL on hover via `title` attribute)
  - Buttons row: Move Up, Move Down, toggle Show/Hide, "Change" (opens edit dialog with FileUpload), "Remove" (delete)
- Add Image dialog: drag-drop URL input, live preview, FileUpload component (drag-drop + preview), gallery quick-select (8 preset images), title, order, active toggle, Save
- Edit dialog: same form, pre-populated, saves via PATCH to `/api/hero-images/[id]`
- Reorder: swaps order values with the adjacent image (two parallel PATCH calls), then invalidates queries
- All UI labels bilingual via `isAr` inline (no new i18n keys needed)
- Toasts on success/error
- Invalidates both `hero-images-admin` (for the dashboard) and `hero-images` / `site-data` (for the public site) on every mutation

### 2. `/home/z/my-project/src/components/dashboard/about.tsx` — `DashboardAbout`
- Two main sections inside dedicated cards:

  **Section 1: "About Content"**
  - Single form (state-driven, not react-hook-form) with bilingual fields displayed SIDE BY SIDE:
    - Title (Ar) | Title (En)
    - Subtitle (Ar) | Subtitle (En)
    - Description (Ar) | Description (En) — both Textareas with rows=5, RTL/LTR set per language
  - Each field has a colored AR/EN badge (red for AR, blue for EN)
  - FileUpload component for the About section image
  - Live image preview when `image` is set
  - Single "Save content" button calls `POST /api/about` (upserts the About record)
  - Fetches existing data from `/api/about` (which auto-creates the row if missing)

  **Section 2: "Metrics / Counters"**
  - Fetches SiteStat records from `/api/site` (which returns them as `stats`)
  - "Add metric" button opens a dialog with: Value (the displayed number), Label, Icon picker (text input + 8 preset lucide icons as buttons with live preview highlighting)
  - Each metric card: lucide icon (rendered from `s.icon` field), big value, label, Edit + Delete buttons
  - Edit opens the same dialog pre-populated
  - CRUD via `POST /api/stats`, `PATCH /api/stats/[id]`, `DELETE /api/stats/[id]`
  - Animations via Framer Motion AnimatePresence + stagger

### 3. `/home/z/my-project/src/components/dashboard/services.tsx` — `DashboardServices`
- Fetches services from `/api/services?all=1` (admin endpoint added this task — returns ALL services including inactive)
- Header card with title + "Add service" button
- 3 stats: total, active, hidden
- Grid of service cards (sm:2 / lg:3 columns):
  - Icon (renders as `<img>` if `s.icon` looks like a URL/path; otherwise renders the lucide icon via lookup with fallback to `Boxes`)
  - Name (Ar) on top, Name (En) below
  - Description (line-clamp-2)
  - Multiplier (×N) + icon name (mono font) shown as small metadata
  - "Hidden" badge when inactive
  - Buttons: Edit, toggle Show/Hide, Delete
- Add / Edit dialog:
  - Names side-by-side (Arabic + English) with AR/EN badges
  - Description Textarea
  - Icon picker: text Input (lucide name like "truck"/"zap") + 10 preset lucide icon buttons + live preview
  - Optional FileUpload for custom icon image — when uploaded, the URL replaces the lucide name in the `icon` field (the dashboard card auto-detects URLs vs lucide names)
  - Multiplier (number input) + Active toggle
  - Save calls POST `/api/services` (create) or PATCH `/api/services/[id]` (edit)
  - Delete via DELETE `/api/services/[id]`
  - Toasts on success/error
  - Invalidates both `services-admin` and `services` query keys

## Patterns followed

- All 3 modules follow the EXACT same pattern as the existing `partners.tsx`, `videos.tsx`, `hero-images.tsx`:
  - `"use client"` directive
  - Header card with red gradient + decorative blur circle
  - Stats row with motion stagger
  - Empty state card with dashed border
  - Loading spinner (Loader2 animate-spin)
  - Card grid with `AnimatePresence` + `motion.div layout` + `whileHover={{ y: -4 }}`
  - Dialog with `Upload` icon in title
  - Save button with `bg-gradient-to-r from-primary to-red-700 text-white` + `Loader2` spinner when saving
- All UI labels are bilingual via inline `isAr ? "عربي" : "English"` (per the task spec — "use isAr for Arabic vs English labels")
- All async mutations invalidate both the admin query key and the public site query key so the public site re-fetches immediately
- All admin mutations are protected by `requireAdmin()` server-side; the dashboard shows toast on auth failure

## Verification

- Ran `cd /home/z/my-project && bun run lint 2>&1 | tail -5`:
  - Result: **0 errors, 3 warnings** (all 3 warnings are pre-existing `Unused eslint-disable directive` in `page.tsx` and `dashboard-app.tsx` — none introduced by this task)
- Checked `/home/z/my-project/dev.log`:
  - Before this task, dev log showed `Module not found: Can't resolve './services'` at dashboard-app.tsx line 12 (and similarly for `./hero` and `./about`)
  - After this task: only `./how-it-works`, `./map-hubs`, `./contact-info` are still missing — those are out of scope for this task (other agents handle them)
  - Final log line: `✓ Compiled in 224ms` — confirms my 3 files compile cleanly with no syntax/type errors

## Files Created / Modified

**Created (5 files):**
- `src/app/api/services/[id]/route.ts`
- `src/app/api/about/route.ts`
- `src/app/api/stats/[id]/route.ts`
- `src/components/dashboard/hero.tsx`
- `src/components/dashboard/about.tsx`
- `src/components/dashboard/services.tsx`

**Modified (2 files):**
- `src/app/api/services/route.ts` — added `?all=1` admin branch + POST handler
- `src/app/api/stats/route.ts` — added POST handler for SiteStat creation (kept existing GET for dashboard overview)

## Notes for next agent

- The `hero.tsx`, `about.tsx`, `services.tsx` modules are now ready and dashboard-app.tsx will resolve them cleanly. Other agents still need to create `how-it-works.tsx`, `map-hubs.tsx`, `contact-info.tsx` for the full dashboard-app.tsx to compile without errors.
- The `/api/stats` route now has DUAL responsibility: `GET` returns dashboard overview counts (used by Overview module), `POST` creates SiteStat records (used by the new About module). Both are admin-only for write operations. The About module reads SiteStat records from `/api/site` (which is the canonical source for all public site data).
- The `/api/about` route auto-creates the About row on first GET, so there's no seeding step required.
- The Service.icon field is overloaded: it stores either a lucide icon name (e.g. "truck") OR a custom image URL. The dashboard and (eventually) the public site detect which one by checking if the value starts with "/" or "http". The public site's services.tsx currently only handles lucide names — a future improvement could be to also handle custom image URLs there.

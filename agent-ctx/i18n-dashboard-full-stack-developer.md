# Task ID: i18n-dashboard
## Agent: full-stack-developer
## Goal
Translate ALL dashboard components in `src/components/dashboard/` to use the existing `useT()` hook (`src/lib/i18n.ts`) instead of hardcoded Arabic strings. Bilingual AR (RTL) ⇄ EN (LTR) via Zustand store; language toggle lives in the public site Navbar (Globe button).

## Scope
Updated 14 dashboard files: login, sidebar, topbar, overview, shipments, orders, customers, videos, hero-images, partners, pricing, messages, settings, dashboard-app.

## Approach
1. `import { useT } from "@/lib/i18n";` then `const { t, isAr } = useT();`.
2. Replaced all hardcoded Arabic strings with `t("d.xxx")` calls — ~270 new keys added to MESSAGES (both `ar` and `en` sections) with the `d.` prefix.
3. For sidebar `NAV` and topbar `TITLES` (originally module-level constants): moved them INSIDE the component function so `t()` calls re-render on locale change.
4. For status labels: built local per-component `STATUS_LABELS` dicts from `t("d.status.*")` keys, replacing the static export from `@/lib/api`.
5. For dynamic strings with counts (e.g. bulk delete confirmation): split into prefix/suffix keys (e.g. `d.ship.confirmBulkDeletePrefix` + `${n}` + `d.ship.confirmBulkDeleteSuffix`).
6. For data fields from the API (governorate name, service name): Arabic shows `nameAr`, English shows `name` (via `isAr ? g.nameAr : g.name`).
7. Toast messages, confirm dialogs, empty-state text, and pagination labels are all translated.

## Files modified (all under `/home/z/my-project/`)
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

## Verification
- `bun run lint` → **0 errors, 3 warnings** (all pre-existing "Unused eslint-disable directive"; no new warnings introduced)
- Dev server `GET / 200` returns clean. All compiles successful.

## Notes for next agent
- The dashboard now fully respects the Zustand locale store — clicking the Globe button instantly re-renders ALL dashboard strings.
- Module-level static arrays/records that contain display strings MUST be moved inside the component function so `t()` is called reactively. Otherwise they freeze at first-locale-at-mount.
- Status label localization uses local per-component dicts keyed by `t("d.status.*")` — kept `STATUS_COLORS` in api.ts since colors don't need translation.
- For dynamic strings with numbers, split into prefix + suffix keys to avoid placeholder substitution logic.
- Lint result: 0 errors / 3 warnings (all pre-existing, none introduced).

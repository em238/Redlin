# Task ID: 4 — Add "reviews" DashboardSection + i18n keys

## Task
- Update `src/lib/store.ts` `DashboardSection` type to add `| "reviews"`.
- Add 30+ review-form and dashboard moderation i18n keys to BOTH the Arabic and English dictionaries in `src/lib/i18n.ts`.

## Work Log
- Read `/home/z/my-project/worklog.md` and `src/lib/store.ts` + `src/lib/i18n.ts` to understand context.
- Edited `src/lib/store.ts`: appended `| "reviews"` as the last member of the `DashboardSection` union (now 11 sections).
- Inserted two i18n key blocks in `src/lib/i18n.ts`:
  - Arabic block (after `contact.emailGeneralVal` line 154, before the existing `// Footer` comment around line 156). New lines ~156–193.
  - English block (after `contact.emailGeneralVal` line ~654, before the existing `// Footer` comment around line 656). New lines ~695–732.
- Each block adds 35 keys total:
  - 17 `review.*` keys (title, subtitle, name, namePh, role, rolePh, rating, content, contentPh, avatar, avatarHint, submit, success, error, nameReq, contentReq, leaveReview)
  - 1 `d.nav.reviews` key
  - 17 `d.reviews.*` keys (title, subtitle, pending, approved, rejected, all, approve, reject, delete, empty, approvedToast, rejectedToast, deletedToast, feature, unfeature, status, date)
- Verified with ripgrep: exactly 70 matches for the new key patterns across the file = 35 keys × 2 dictionaries, confirming no duplicates and both dictionaries updated.
- Verified the store.ts change compiles cleanly (TypeScript union extended; no other code change needed — `setDashboardSection` accepts `DashboardSection` so callers passing `"reviews"` will type-check).

## Stage Summary
- `DashboardSection` type in `src/lib/store.ts` now includes `"reviews"` — TypeScript-safe for downstream review components.
- `MESSAGES.ar` and `MESSAGES.en` in `src/lib/i18n.ts` both gained the full review-form + dashboard-moderation strings, placed between the existing `contact.*` keys and the Footer section as instructed. No duplicate keys introduced.

## Notes for downstream agents
- The i18n keys added here are ready to be consumed by:
  - A public review submission form component (likely under `src/components/site/`).
  - A new dashboard section component (e.g. `src/components/dashboard/reviews.tsx`) — the `dashboardSection: "reviews"` value can now be set via `setDashboardSection("reviews")` and rendered by `dashboard-app.tsx`.
- A pre-existing unrelated Prisma error exists in `src/app/api/site/route.ts` (the `Testimonial` model in `prisma/schema.prisma` has no `status` field, but `db.testimonial.findMany({ where: { status: "approved" } })` is called). This is outside the scope of Task 4 and was left untouched. A future task may need to either add a `status` (and `feature`/`rejected`) field to the `Testimonial` model and run `bun run db:push`, or update the API to filter by `active` instead.

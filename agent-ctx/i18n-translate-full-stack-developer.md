# Task ID: i18n-translate
## Agent: full-stack-developer
## Goal
Translate all public-facing components in `src/components/site/` to use the existing `useT()` hook (`src/lib/i18n.ts`) instead of hardcoded Arabic strings. Bilingual AR (RTL) ⇄ EN (LTR) via Zustand store; language toggle lives in the Navbar.

## Scope
Updated 12 components: hero, stats-bar, services, how-it-works, interactive-map, video-section, about, partners, testimonials, cta-banner, contact, footer.

## Approach
1. `import { useT } from "@/lib/i18n";` then `const { t, isAr } = useT();`.
2. Replace hardcoded Arabic strings with `t("key")` calls — keys already defined in `MESSAGES` dictionary in `src/lib/i18n.ts`.
3. For data coming from the API (services, stats, governorates, regional cities), Arabic uses DB/fallback fields; English uses a local name→key mapping that translates via `t()`.
4. For titles containing "Redline", preserve the gradient span by `t("title").split("Redline")` and re-inserting `<span className="text-gradient-red">Redline</span>`.
5. Validation errors + toast messages localized inline via `isAr ? "..." : "..."`.

## Files modified (all under `/home/z/my-project/`)
- src/components/site/hero.tsx
- src/components/site/stats-bar.tsx
- src/components/site/services.tsx
- src/components/site/how-it-works.tsx
- src/components/site/interactive-map.tsx
- src/components/site/video-section.tsx
- src/components/site/about.tsx
- src/components/site/partners.tsx
- src/components/site/testimonials.tsx
- src/components/site/cta-banner.tsx
- src/components/site/contact.tsx
- src/components/site/footer.tsx

## Verification
- `bun run lint` → 0 errors (3 pre-existing warnings unchanged)
- Dev server re-compiles cleanly on every save; all `/api/*` routes returned 200 OK during testing
- Visual verification done via dev.log inspection (Prisma queries + HTTP 200s for /api/site, /api/services, /api/governorates, /api/hero-images, /api/partners)

## Notes for next agent
- The `i18n.ts` `useT()` hook returns `{ t, locale, isAr, isEn }`. The `t()` function takes a plain string key and falls back to AR, then to the key itself if missing — safe for partial key sets.
- Locale state is persisted to `localStorage` under `redline-locale` and applied to `document.documentElement.lang`/`dir` automatically inside `setLocale()`.
- SectionHeading accepts `ReactNode` for `eyebrow` and `title`, so it gracefully handles both strings and JSX-with-gradient-split.

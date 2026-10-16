# Task ID: dashboard-security-modules
## Agent: Fullstack Developer (security modules)

### Task
Build User Management + Roles & Permissions dashboard modules + their API routes for the Redline Transport admin dashboard.

### Inputs Read
- `/home/z/my-project/worklog.md` — overall project context (Redline shipping, dark red theme, Zustand view-switching dashboard).
- `/home/z/my-project/src/components/dashboard/partners.tsx` — reference CRUD pattern (TanStack Query + apiGet/apiPost/apiPatch/apiDelete + useT + FileUpload + Framer Motion + sonner).
- `/home/z/my-project/src/components/dashboard/services.tsx` + `reviews.tsx` — table + tabs + status badges patterns.
- `/home/z/my-project/src/lib/api.ts` — apiGet/apiPost/apiPatch/apiDelete helpers.
- `/home/z/my-project/src/lib/db.ts` — Prisma client singleton.
- `/home/z/my-project/src/lib/auth.ts` — `requireAdmin`, `jsonError`, in-memory sessions.
- `/home/z/my-project/prisma/schema.prisma` — User (id/email/name/password/role/roleId/status/avatar/lastLoginAt) + Role (id/name/nameAr/description/isSystemRole/permissions JSON string) models.
- `/home/z/my-project/src/app/api/partners/route.ts` + `[id]/route.ts` — API route pattern (runtime="nodejs", NextRequest, requireAdmin, jsonError, UNAUTHORIZED→401).
- `/home/z/my-project/src/components/shared/file-upload.tsx` — avatar upload component.
- `/home/z/my-project/src/components/dashboard/dashboard-app.tsx` — confirmed already imports `DashboardUsers` from "./users" and `DashboardRoles` from "./roles" in the sections map.

### Files Created

**API Routes (4):**
1. `src/app/api/users/route.ts` — GET list (with roleRef, safe payload, no password) + POST create (validates email/password, syncs role string from roleRef).
2. `src/app/api/users/[id]/route.ts` — GET one, PATCH (name/email/password/roleId/status/avatar with email uniqueness check), DELETE (blocks self-deletion via currentUser.id check).
3. `src/app/api/roles/route.ts` — GET list (with _count.users, permissions JSON parsed) + POST create (never allows isSystemRole=true; normalizes perms object).
4. `src/app/api/roles/[id]/route.ts` — GET one, PATCH (block empty-perms for system roles), DELETE (block system roles + block roles with users assigned).

**Dashboard Components (2):**
5. `src/components/dashboard/users.tsx` — `DashboardUsers` export. Dark theme (bg-slate-900/60 border-slate-800 rounded-2xl). Header card + 4 stats + filters (search + role + status selects) + dark sticky-header table with columns: User (avatar+name+email), Role (colored Badge with Lock icon for system), Status (Switch toggle + Badge), Last Active (Clock icon), Actions (Edit + Delete with self-disable). Add/Edit dialog with name/email/password/role dropdown/status/avatar FileUpload. Self-protection via useAppStore().user.id.
6. `src/components/dashboard/roles.tsx` — `DashboardRoles` export. Header card + 4 stats + grid of role cards (icon, name with system badge, user count, description, permissions summary with progress bar + module chips, Edit + Delete buttons disabled for system/assigned). Create/Edit dialog with name (EN)/nameAr (AR)/description + permission matrix Accordion (11 modules per task spec, "Select All"/"Clear All" top-level + per-module, action checkboxes per module). System role guards in UI + API.

### DB Seed (one-off)
Ran an inline `bun` script to upsert 3 system roles (super-admin/editor/viewer) with full/editor/viewer permission sets per the task spec, and linked the existing `admin@redline.eg` user to super-admin (roleId + role string synced). Verified:
- super-admin (المدير العام) — system=true — users=1
- editor (محرر) — system=true — users=0
- viewer (مشاهد) — system=true — users=0

### Verification
- `bun run lint` — **0 errors**, only 3 pre-existing warnings (Unused eslint-disable directives in `page.tsx` and `dashboard-app.tsx` — NOT from this task).
- `dev.log` — clean; Next.js 16 dev server compiling & serving `/` (200 OK) without errors.
- `dashboard-app.tsx` already wired with imports for both new components — no extra wiring needed.

### Patterns Followed
- TanStack Query (`useQuery` + `useQueryClient().invalidateQueries`).
- `apiGet/apiPost/apiPatch/apiDelete` from `@/lib/api`.
- `useT()` + `isAr` + inline `L(ar, en)` bilingual helper — no new i18n keys needed.
- shadcn/ui: Card, Button, Input, Textarea, Label, Switch, Badge, Dialog, Select, Checkbox, Accordion.
- FileUpload from `@/components/shared/file-upload` for avatars.
- Framer Motion AnimatePresence on table rows / role cards.
- sonner `toast.success/error` for feedback.
- lucide-react icons (UserCog, KeyRound, Lock, ShieldCheck, ShieldOff, Ban, CheckCircle2, Mail, Clock, Plus, Pencil, Trash2, Loader2, Search, Crown, CheckCheck, ChevronDown, Users).
- Redline dark styling: `bg-slate-900/60 border border-slate-800 rounded-2xl` for cards/table/dialog per task spec.
- Red gradient header cards: `bg-gradient-to-l from-primary/10 to-red-700/5 border-primary/30`.
- Self-protection: server-side (requireAdmin → currentUser.id match → 400) AND client-side (useAppStore user.id disable/tooltip).

### Stage Summary
4 new API route files + 2 new dashboard components added cleanly to the existing Redline admin dashboard. Both modules are immediately functional (DB seeded with system roles + admin user linked). No regressions; lint passes with 0 errors.

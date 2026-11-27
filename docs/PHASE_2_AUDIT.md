# Phase 2 Audit — FMS (Faculty Management System)

**Date**: 2026-11-26  
**Scope**: Comprehensive audit of Phase 1 foundation prior to Phase 2 UI redesign and functional implementation.

---

## 1. What Already Works

- **Core Stack & Tooling**: `package.json` has pinned versions (`next@16.4.3`, `react@19.2.4`, `typescript@5.9.3`, `prisma@6.19.3`, `@prisma/adapter-mariadb@6.19.3`, `mariadb@3.5.4`, `tailwindcss@4.x`, `framer-motion@12.40.0`, `lucide-react@1.16.0`, `zod`, `react-hook-form`, `@tanstack/react-table`, `recharts`, `vitest`, `playwright`).
- **Database Foundation**: `src/server/db/client.ts` provides a global Prisma singleton with optional MariaDB pool adapter. `prisma/schema.prisma` defines 18 relational models.
- **Authentication & Session**: `src/server/auth/` implements `bcryptjs` password hashing, `jose` HS256 JWT tokens stored in HttpOnly `fms_session` cookies, and server-side session retrieval (`getCurrentUser()`, `requireAuthenticatedUser()`).
- **Authorization & Proxy**: `src/proxy.ts` provides coarse route protection. `src/server/auth/permissions.ts` and `guards.ts` implement centralized role and entity checks (`MAIN_MANAGER`, `DEPUTY_MANAGER`, `TEAM_LEAD`, `EMPLOYEE`).
- **Storage & Audit**: `src/server/storage/localStorageProvider.ts` validates MIME types/sizes and writes to `MEDIA_STORAGE_ROOT`. `/api/files/[fileId]/route.ts` streams files only to authorized users. `src/server/audit/auditService.ts` appends to `activity_logs`.
- **Tests**: Unit tests in `tests/unit/` pass under Vitest.

---

## 2. What Is Incomplete

- **Functional UI & Pages**: All dashboard routes (`/dashboard`, `/employees`, `/teams`, `/jobs`, `/tasks`, `/deliverables`, `/approvals`, `/analytics`, `/roi`, `/settings`) are currently static empty-state placeholders with no database queries or mutations.
- **Missing Phase 2 Routes**: `/jobs/new`, `/jobs/[jobId]`, `/jobs/[jobId]/edit`, `/my-work`, `/employees/[employeeId]`, `/productivity`, `/branding-jobs`, `/branding-jobs/[jobId]`.
- **UI Design System**: Current UI uses `#0A1F44` Navy, `#E8871A` Orange, and green/emerald status badges, which must be completely replaced with the Phase 2 Indigo/Violet/Slate/Blue/Rose palette (`#F7F8FC` background, `#4F46E5` primary accent, `#7C3AED` secondary accent, `#202638` primary text).
- **Workflow & Tracker Fields in Schema**:
  - `Deliverable` needs explicit separation between operational workflow state and delivery performance status (`COMPLETED_ON_TIME`, `LATE_COMPLETED`, `NOT_DONE_TILL_DATE`, `CANCELLED`), plus `firstSubmittedAt`, `cancellationReason`, and `assignedToId`.
  - Shoot / Cameraman, Video Editor, and Social Media Publishing tracker fields need explicit employee foreign keys (`shootAssignedToId`, `editorAssignedToId`) and scheduled/actual dates/statuses.
  - `DeliverableStage` needs `responsibleUserId` for configurable Branding & Production stage ownership, plus credit tracking (`contentCredits`, `jobOwnerCredits`, `creditsAllocated`).
  - `Job` needs `jobDate` and `ownerId` (Job Owner / Team Lead).
  - `User` needs `designation` for display in selectors and headers.
- **End-to-End Business Logic**: No live job creation, multi-deliverable target-date assignment, employee submission UI, manager review/star-rating flow, productivity report aggregations, branding 5-stage tracker, or ROI calculator UI exist yet.

---

## 3. What Can Be Reused

- `src/server/db/client.ts` & `src/server/db/health.ts` (keep as-is, zero duplicate clients).
- `src/server/auth/config.ts`, `session.ts`, `permissions.ts`, `guards.ts`, and `src/features/auth/actions.ts`.
- `src/server/storage/localStorageProvider.ts` and `src/app/api/files/[fileId]/route.ts`.
- `src/server/audit/auditService.ts`.
- `src/lib/env.ts`, `utils.ts`, `dates.ts`, `formatting.ts`.
- `src/components/ui/*` and `src/components/shared/*` (re-themed to Phase 2 palette).

---

## 4. What Needs Modification

- `src/app/globals.css`, `src/lib/constants.ts`, `src/components/layout/*`, `src/components/ui/*`, `src/components/shared/*` — complete UI redesign removing all orange, green, and GU branding colors.
- `src/proxy.ts` — add `/my-work`, `/productivity`, `/branding-jobs` to `PROTECTED_PREFIXES`.
- `prisma/schema.prisma` — extend existing models cleanly (no duplicate models) via `prisma db push` / migrations.
- `prisma/seed.ts` — support `MAIN_MANAGER` Deepak Juneja via env/bootstrap and opt-in dev demo seeding (`SEED_DEMO_DATA=true`).

---

## 5. What Needs to Be Created

- Phase 2 Services & Server Actions for Jobs, Deliverables, Submissions, Reviews/Ratings, Productivity Analytics, Branding & Production Stages, Employees/Teams, and ROI.
- Complete interactive UI pages and components for Manager Dashboard, Create Job, Job Details/Edit, My Work, Approvals, Productivity Dashboard, Branding Jobs, Employees, Teams, ROI, and Settings.
- Automated unit and integration tests covering job creation, submission, rating/approval, IDOR/RBAC denial, productivity queries, and branding stages.


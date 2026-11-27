# FMS Phase 3 — Current State Audit

**Date:** 2026-11-27  
**Department:** Geeta University — Branding Department  

---

## 1. Existing Stack & Architecture
- **Framework:** Next.js 16.4.6 (App Router), React 19.2.4, TypeScript 5.9.3, Node.js 22.22.0.
- **Database:** MySQL (Aiven Cloud) via Prisma ORM 6.19.3 (`src/server/db/client.ts` singleton).
- **Auth & Security:** Cookie-based HMAC/JWT session (`src/server/auth/session.ts`), `bcryptjs` password hashing (`src/server/auth/config.ts`), RBAC permissions (`src/server/auth/permissions.ts`), resource guards (`src/server/auth/guards.ts`).
- **Validation & Audit:** Zod schemas (`src/validations/*`), append-only `ActivityLog` (`src/server/audit/auditService.ts`).

---

## 2. Live Database Snapshot (Pre-Phase 3)
- **Existing Users (10):**
  - `admin@geetauniversity.edu.in` — Deepak Juneja (`MAIN_MANAGER`, `Main Manager`)
  - `yash.demo@fms.local` — Yash (`TEAM_LEAD`, `Team Lead — Content Creation`) → **Reconciled:** Full name is **Yashpreet**, role `DEPUTY_MANAGER`, `Deputy Branding Manager — Online Production`.
  - `ruhi.demo@fms.local` — Ruhi (`TEAM_LEAD`, `Team Lead — Content Creation`) → `Anchor and Content Strategist`.
  - `navneet.demo@fms.local` — Navneet (`DEPUTY_MANAGER`, `Branding Coordinator`) → `Offline Branding Team Head`.
  - `vishal.demo@fms.local` — Vishal (`EMPLOYEE`, `Production Executive`) → **Reconciled:** **Vishal Tavni**, `Designer` (separate from Vishal Tyagi).
  - `rajesh.demo@fms.local` — Rajesh (`EMPLOYEE`, `Production Executive`) → `Designer`.
  - `mandeep.demo@fms.local` — Mandeep (`EMPLOYEE`, `Content & Mockup Designer`) → `Content Writer and Proofreader`, reports directly to Deepak Juneja.
  - `kajal.demo@fms.local` — Kajal (`EMPLOYEE`, `Social Media Executive`), reports to Yashpreet.
  - `arjun.demo@fms.local` — Arjun (dummy account with 2 shoot deliverables & 1 work submission) → **Deactivated (`INACTIVE`)** to preserve historical submission FKs.
  - `rohit.demo@fms.local` — Rohit (dummy account with 1 editor deliverable) → **Deactivated (`INACTIVE`)** to preserve historical deliverable FKs.
- **Existing Teams (2):**
  - `TEAM-CONTENT` (`Content Creation Team`)
  - `TEAM-BRANDING` (`Branding & Production Team`)
- **Existing Operational Data:** 3 Jobs, 5 Deliverables, 1 WorkSubmission — all preserved.

---

## 3. Gaps Identified for Phase 3
1. **Reporting & Shared Resource:** `User` only had a single `managerId`, and `TeamMembership` lacked `membershipType`, `isPrimary`, and `status` to model Hardik's dual participation (primary under Yashpreet, additional incharge Ruhi).
2. **Missing Specialist Accounts:** Ankit (Fitter), Anup (Fitter), Hardik (Photographer), Aashish (Video Editor), Sarvjeet (Cinematographer), Vishal Tyagi (Video Editor).
3. **Workflow Engine:** Needed explicit sequential workflow pipelines (`OFFLINE_DESIGN`, `RUHI_VIDEO`, `YASHPREET_VIDEO`, `PHOTOGRAPHY`, `CINEMATOGRAPHY`, `SOCIAL_PUBLISHING`, `INSTALLATION`) with stage-level `assignedById`, `requiresApproval`, dependency checks (e.g., Aashish editing gated on raw footage unless overridden; Kajal publishing gated on final Deepak approval), and `previousStatus` on `ApprovalReview`.
4. **Role-Specific Dashboards:** `/dashboard` previously rendered a single manager dashboard for all non-`EMPLOYEE` roles and redirected all `EMPLOYEE` users to a single generic `/my-work` page.

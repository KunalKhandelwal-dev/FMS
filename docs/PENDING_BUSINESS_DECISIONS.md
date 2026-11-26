# Pending Business Decisions & Department Policy Review

# Project: FMS — Faculty Management System

# Department: Geeta University — Branding Department

> [!IMPORTANT]
> The items listed in this document are currently **PENDING CONFIRMATION** from Geeta University Branding Department leadership.
> Neither developers nor AI assistants may unilaterally decide, invent, or hardcode assumptions for any of these items.
> All data structures and logic in FMS are architected to be dynamic, configurable, and driven by database settings.

---

## 1. Final Employee List & Staff Directory

- **Status**: [PENDING CONFIRMATION]
- **Details**: The authoritative roster of faculty, administrative, and production personnel (full legal names, official university email addresses, employee IDs) has not yet been finalized.
- **System Impact**: FMS seed scripts and database tables use schema placeholders without dummy staff data. Accounts will be provisioned by the Main Manager upon official delivery of the roster.

## 2. Actual Department Hierarchy & Sub-Units

- **Status**: [PENDING CONFIRMATION]
- **Details**: The formal organizational tree separating the Branding Department into specific wings (e.g., Creative Media, Digital Campaigns, Event Logistics) is awaiting administrative review.
- **System Impact**: Managed dynamically via `departments` and `teams` tables with flexible manager-subordinate relationships.

## 3. Deputy-to-Employee Mapping

- **Status**: [PENDING CONFIRMATION]
- **Details**: The exact distribution of creative personnel (cameramen, video editors, copywriters, graphic designers) under Deputy Manager 1 versus Deputy Manager 2 has not been formally declared.
- **System Impact**: FMS utilizes the `TeamMembership` model and `managerId` foreign key on the `users` table to allow instant reassignment without schema modifications.

## 4. Team Lead Roles & Scope of Authority

- **Status**: [PENDING CONFIRMATION]
- **Details**: Whether an intermediate "Team Lead" tier exists between Deputy Managers and frontline production staff is under departmental discussion.
- **System Impact**: `UserRole.TEAM_LEAD` is defined as a configurable role. If unconfirmed, permissions fall back to standard `EMPLOYEE` privileges.

## 5. Final Granular RBAC Permissions Matrix

- **Status**: [PENDING CONFIRMATION]
- **Details**: Exact boundaries regarding who can view peer deliverables, whether deputies can reassign tasks cross-team, and whether team leads can reject submissions.
- **System Impact**: Centralized in `src/server/auth/permissions.ts` and `src/server/auth/guards.ts`.

## 6. Credit Allocation Values per Deliverable Type

- **Status**: [PENDING CONFIRMATION]
- **Details**: Points awarded for each deliverable (Photo Post, Byte Reel, Standard Reel, Chronological Video, Live Story, Pre-Event Reel, Cinematic Reel, Mockup, Pack-up).
- **System Impact**: Stored in `credit_rules` table. The UI displays "Not Configured" until formal values are entered by the Main Manager.

## 7. Team ROI Calculation Formula

- **Status**: [PENDING CONFIRMATION]
- **Details**: The mathematical definition of Team ROI (weighted output sum / resource cost / working days) and what threshold defines acceptable performance (e.g., Target >= 1.0).
- **System Impact**: Module marked as "Under Configuration / Pending Formula Sign-off". No fabricated calculations are executed.

## 8. Weighted Output Rules & Complexity Factors

- **Status**: [PENDING CONFIRMATION]
- **Details**: Multipliers assigned to different production tasks (e.g., 1.0 for standard reels vs 2.5 for multi-day scripted cinematic productions).
- **System Impact**: Supported via the `weight` column in `credit_rules`.

## 9. Salary Reporting Period & Denominators

- **Status**: [PENDING CONFIRMATION]
- **Details**: Whether individual ROI (`Credits Earned / Salary Taken`) evaluates on a monthly, quarterly, or academic term basis, and how prorated leaves are treated.
- **System Impact**: Segregated in `salary_records` table with access restricted exclusively to `MAIN_MANAGER`.

## 10. Rating Authority & Performance Appraisal Rules

- **Status**: [PENDING CONFIRMATION]
- **Details**: Who is permitted to assign 1–5 star ratings (Main Manager only, or both Main Manager and Deputy Managers).
- **System Impact**: Stored in `performance_ratings` with `isManagerNote` distinction.

## 11. Final Approval Authority & Escalation Gates

- **Status**: [PENDING CONFIRMATION]
- **Details**: Whether Deputy approval is sufficient for social media release, or if Main Manager sign-off is mandatory for all high-visibility assets.
- **System Impact**: Configured per stage in `workflow_stage_templates` via `requiresApproval`.

## 12. Calendar Days vs. Working Days for Deadlines

- **Status**: [PENDING CONFIRMATION]
- **Details**: Whether stage turnaround targets (e.g., 1-day mockup, 2-day design) count calendar days or exclude university holidays and weekends.
- **System Impact**: Stored as integer offsets (`defaultTargetDays`) with date computation abstracted in `src/lib/dates.ts`.

## 13. File Upload Storage Limits & Retention Lifecycle

- **Status**: [PENDING CONFIRMATION]
- **Details**: Maximum allowable single file size (initial baseline: 25 MB) and archiving policy for raw footage links vs. hosted binary assets.
- **System Impact**: Governed by `MAX_UPLOAD_SIZE_MB` and `MEDIA_STORAGE_ROOT` in environment variables with support for external Google Drive links.

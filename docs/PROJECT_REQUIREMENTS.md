# Project Requirements: FMS (Faculty Management System)

# Geeta University — Branding Department

## 1. Functional Requirements

### 1.1 User & Account Management

- **No Public Registration**: Accounts are strictly provisioned by the `MAIN_MANAGER` (or authorized administrative delegate).
- **Authentication**: Secure credentials-based authentication with bcrypt-hashed passwords and HttpOnly session cookies.
- **Hierarchical Association**: Every employee reports to a designated supervisor (`managerId`) and can belong to one or more functional teams (`TeamMembership`).
- **Account State Lifecycle**: Support for `ACTIVE`, `INACTIVE`, and `SUSPENDED` account states.

### 1.2 Job & Campaign Management

- **Job Creation**: Initiated by `MAIN_MANAGER` and delegated to `DEPUTY_MANAGER` leads.
- **Job Metadata**: Job Date, Category (Events, Placement, Meta Ads, Campus Life, etc.), Priority, Venue, Organizer, and Target Completion Date.
- **Dual Workflow Paradigms**: Dynamic support for both _Content Creation_ and _Branding & Production_ workflows.

### 1.3 Task Assignment & Distribution

- **Deputy Delegation**: Deputy Managers decompose broad jobs into distinct deliverable tasks.
- **Attribution**: System records both the assigner (`assignedById`) and assignee (`assignedToId`).
- **Deadlines & Schedules**: Target dates, actual start times, and completion timestamps.

### 1.4 Work Submissions & Multi-Stage Reviews

- **Versioned Submissions**: Employees submit work packages with version numbers, notes, local file uploads, or external Google Drive links.
- **Review Segregation**: Reviewers can leave public feedback visible to the employee as well as private managerial notes.
- **Actionable Verdicts**: Explicit approval statuses: `PENDING_REVIEW`, `APPROVED`, `REVISION_REQUESTED`, `REJECTED`.

### 1.5 Performance Ratings & Productivity

- **Rating Matrix**: 1–5 star scoring attached to completed deliverables.
- **Productivity Analytics**: Filterable metrics tracking on-time completion, late completion, cancellation rates, and role-specific outputs (cameramen, video editors, designers).

### 1.6 Credits & ROI Calculations

- **Configurable Ledger**: Credits earned calculated based on configurable rules (`credit_rules`), never hardcoded.
- **Executive Salary Safeguards**: Salary data (`salary_records`) is strictly isolated and accessible only to `MAIN_MANAGER`.

---

## 2. Non-Functional Requirements

- **Security**: Strict server-side RBAC, CSRF protection, input sanitization via Zod, rate limiting, and zero-trust parameter validation.
- **Maintainability**: Modular monolithic architecture separating UI, server actions, services, and repositories.
- **Performance**: Edge-optimized layouts, minimal client JavaScript, efficient MariaDB connection pooling, and explicit Prisma query projections.
- **Storage Resilience**: Abstraction layer supporting local disk storage (`MEDIA_STORAGE_ROOT`) in development and mounted persistent cloud volumes in production.

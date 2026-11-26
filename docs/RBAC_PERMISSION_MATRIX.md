# RBAC Permission Matrix: FMS (Faculty Management System)

# Geeta University — Branding Department

## 1. Role Definitions

- **`MAIN_MANAGER`**: Head of the Branding Department. Exercises universal read, write, administrative, and configuration authority across all departmental jobs, teams, personnel, credit rules, and financial/salary records.
- **`DEPUTY_MANAGER`**: Operational supervisor managing a dedicated team (or wing). Oversees assigned jobs, distributes tasks to direct subordinates, conducts reviews, and evaluates team productivity. Cannot view peer deputies' confidential evaluations or salary records.
- **`TEAM_LEAD`**: Intermediate operational coordinator (_status pending final confirmation_). Coordinates day-to-day workflow within a specialized cell, submits work, and performs initial quality checks if delegated.
- **`EMPLOYEE`**: Creative specialist (cameraman, video editor, graphic designer, copywriter, event crew). Views assigned tasks, submits deliverables and links, views personal feedback, and tracks personal progress. Zero access to managerial administrative consoles or peer compensation data.

---

## 2. Granular Permissions Matrix

| Capability / Module                     | Main Manager |   Deputy Manager    |     Team Lead     |       Employee        |
| :-------------------------------------- | :----------: | :-----------------: | :---------------: | :-------------------: |
| **Department & User Management**        |              |                     |                   |                       |
| Create / Deactivate Staff Accounts      |      ✅      |         ❌          |        ❌         |          ❌           |
| Assign Roles & Supervisor (`managerId`) |      ✅      |         ❌          |        ❌         |          ❌           |
| Create & Reconfigure Teams              |      ✅      |         ❌          |        ❌         |          ❌           |
| Assign Employees to Teams               |      ✅      |    ✅ (Own Team)    |        ❌         |          ❌           |
| View Staff Directory                    |  ✅ (Full)   |   ✅ (Dept-wide)    |  ✅ (Team-wide)   |      ✅ (Basic)       |
| **Job Management**                      |              |                     |                   |                       |
| Create Master Jobs                      |      ✅      |         ❌          |        ❌         |          ❌           |
| Assign Jobs to Deputy Managers          |      ✅      |         ❌          |        ❌         |          ❌           |
| Edit Job Metadata & Deadlines           |      ✅      |    ✅ (Assigned)    |        ❌         |          ❌           |
| Close / Cancel / Archive Jobs           |      ✅      |         ❌          |        ❌         |          ❌           |
| **Task & Deliverable Management**       |              |                     |                   |                       |
| Break Down Deliverables into Tasks      |      ✅      |    ✅ (Assigned)    |        ❌         |          ❌           |
| Assign Tasks to Subordinates            |      ✅      |    ✅ (Own Team)    |        ❌         |          ❌           |
| View Tasks                              |   ✅ (All)   | ✅ (Assigned/Team)  |     ✅ (Team)     | ✅ (Assigned to Self) |
| Upload Work Submissions / Drive Links   |      ✅      |         ✅          |        ✅         |          ✅           |
| **Review & Quality Control**            |              |                     |                   |                       |
| Conduct Approval Reviews                |      ✅      | ✅ (Assigned Jobs)  | ⚠️ (If delegated) |          ❌           |
| Request Revisions                       |      ✅      | ✅ (Assigned Jobs)  | ⚠️ (If delegated) |          ❌           |
| Author Private Managerial Notes         |      ✅      |         ✅          |        ❌         |          ❌           |
| Award 1–5 Star Performance Ratings      |      ✅      | ✅ (Pending policy) |        ❌         |          ❌           |
| View Performance Ratings                |   ✅ (All)   |    ✅ (Own Team)    |        ❌         |    ✅ (Self Only)     |
| **Credits & ROI Analytics**             |              |                     |                   |                       |
| Configure Credit Rules & Weights        |      ✅      |         ❌          |        ❌         |          ❌           |
| Award / Adjust Manual Credits           |      ✅      |         ❌          |        ❌         |          ❌           |
| View Department Productivity Reports    |      ✅      |    ✅ (Own Team)    |        ❌         |          ❌           |
| View Individual Staff ROI               |      ✅      |         ❌          |        ❌         |          ❌           |
| Manage / View `SalaryRecord` Data       |      ✅      |         ❌          |        ❌         |          ❌           |
| **Audit Logs**                          |              |                     |                   |                       |
| View Comprehensive Audit Trail          |      ✅      |         ❌          |        ❌         |          ❌           |

---

## 3. Enforcement Architecture

> [!CAUTION]
> **No Frontend Trust**: Frontend route guards and UI button toggles are merely cosmetic navigation aids.
> Every Server Action, Route Handler, and service query independently validates the caller's session via `src/server/auth/guards.ts`.
> Missing authorization raises a typed `AuthorizationError` and terminates the request.

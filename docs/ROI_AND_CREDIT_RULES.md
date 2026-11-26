# ROI and Credit Calculation Guidelines

# Project: FMS — Faculty Management System

# Department: Geeta University — Branding Department

## 1. Foundational Policy: No Speculative Formulas

> [!WARNING]
> The exact conversion rates, monetary multipliers, output weightings, and team ROI formulas are currently **UNFINALIZED**.
> FMS strictly avoids displaying fabricated financial calculations.
> Until formal institutional formulas are ratified and configured by the Main Manager, ROI metrics are flagged as **"NOT CONFIGURED / PENDING POLICY"**.

---

## 2. Productivity Tracking Dimensions

The database schema and analytics engine are structured to capture raw, verifiable production data across four dimensions:

### 2.1 Team Productivity

- **Total Deliverables Assigned**: Cumulative scope assigned within a reporting window.
- **Completed On Time**: Delivered on or before target deadline.
- **Completed Late**: Delivered past deadline.
- **Not Completed / In Progress**: Active pipeline.
- **Cancelled**: Abandoned or terminated jobs.
- **Deliverable Type Breakdown**: Volume per asset category.
- **Workload Balance**: Active assignments distributed across members.

### 2.2 Cameraman Productivity

- Assignment count by date range and deliverable type.
- Turnaround time from shoot schedule to raw footage upload.
- Punctuality index (scheduled shoot date vs. actual shoot date).

### 2.3 Video Editor Productivity

- Assignment count by date range and video complexity.
- Turnaround time from footage availability to first draft submission.
- Revision cycles per deliverable (iterations requested before approval).

---

## 3. Preliminary Business Sheet Models (Pending Confirmation)

### 3.1 Individual Staff ROI

The initial spreadsheet references:
$$\text{Individual ROI} = \frac{\text{Credits Earned}}{\text{Salary Taken}}$$

- **Questions Pending Confirmation**:
  - What is the credit base value for each deliverable type?
  - Does "Salary Taken" represent monthly CTC, base salary, or prorated working days?
  - How are revisions or rejected submissions handled in credit totals?

### 3.2 Team ROI

The initial spreadsheet captures:

- Start date and End date.
- Total working days within window.
- Total weighted outputs (sum of completed deliverables $\times$ complexity weights).
- Target benchmark: $\ge 1.0$.

---

## 4. Configuration Schema

All parameters are configured in the `credit_rules` table:

- `deliverableType`: Type of asset.
- `baseCredits`: Decimal base points.
- `weight`: Complexity multiplier (e.g., $1.00$ to $3.00$).
- `effectiveFrom` / `effectiveTo`: Historical versioning for audit compliance.

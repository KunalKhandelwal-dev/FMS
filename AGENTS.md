# AGENTS.md — Permanent Project Rules & Development Guidelines

# Project: FMS — Faculty Management System

# Department: Geeta University — Branding Department

Welcome to the FMS codebase. All human and AI contributors must strictly adhere to the permanent architectural and engineering rules detailed below.

---

## 1. Core Operating Principles

1. **Documentation First**: Always read the relevant documentation in `docs/` before implementing or modifying any feature.
2. **Strict Project Structure**: Follow the established folder organization (`src/app`, `src/components`, `src/features`, `src/server`, `src/validations`, `src/lib`, `src/types`). Do not introduce ad-hoc top-level directories.
3. **Strict TypeScript**: Never use `any` unless strictly unavoidable and justified. Define explicit interfaces and return types for server functions and components.
4. **Separation of Concerns**: Keep business logic completely outside UI components. UI components only render data and invoke typed server actions or services.
5. **Server Components by Default**: Default to React Server Components (RSC). Use `"use client"` only at the leaf nodes when interactive event listeners, React Hook Form, or browser animations are strictly required.
6. **No Client-Side Prisma**: Never import or invoke Prisma Client from browser-rendered code or Client Components. All database interactions must execute exclusively in Node.js server environments (`src/server/`).
7. **Zero Secret Exposure**: Never expose environment secrets, database credentials, or private managerial evaluation notes to the client. Keep all sensitive fields out of client payloads.
8. **Strict Input Validation**: Validate every external input using Zod schemas located in `src/validations/`. Never trust form data, URL parameters, or request headers without validation.
9. **Centralized Error Handling**: Use structured server errors with friendly user-facing messages. Never expose raw SQL exceptions or stack traces to end-users.
10. **Enforce Permissions Server-Side**: Always verify authorization in Server Actions, Route Handlers, and domain services. Never trust role, team, or permission claims supplied by the client.
11. **Transactional Integrity**: Multi-step business operations (such as stage progress, task assignment, review submission, and credit allocation) must use Prisma transactions (`db.$transaction`).
12. **Append-Only Audit History**: Maintain immutable activity audit logs (`ActivityLog`) for all state transitions, approvals, rejections, ratings, and credential changes.
13. **Comprehensive Automated Tests**: Write unit tests for services, validations, and authorization guards (`tests/unit/`). Write integration and end-to-end tests for critical flows.
14. **No Speculative Business Rules**: Never invent employee names, salaries, credit values, or ROI calculation formulas. If a rule is undecided, mark it as configurable and reference `docs/PENDING_BUSINESS_DECISIONS.md`.
15. **Production Safety**:
    - Never modify production database schemas without tested migrations.
    - Never execute destructive queries against live databases.
    - Never automatically push to the `main` GitHub branch.
    - Never deploy to production without explicit human stakeholder sign-off.

---

## 2. Technology Constraints

- **Runtime**: Node.js 22.22.0, npm.
- **Framework**: Next.js 16.4.3 (App Router), React 19.2.4, TypeScript 5.9.3.
- **Styling**: Tailwind CSS 4.x, Lucide React (named imports only), Framer Motion (purposeful transitions only).
- **Database**: MariaDB / MySQL via Prisma ORM 6.19.3. (Do not introduce PostgreSQL, Supabase, Firebase, or MongoDB).
- **Architecture**: Modular Monolith. Do not introduce separate Express microservices.
- **Production Build**: `prisma generate && next build --webpack`.

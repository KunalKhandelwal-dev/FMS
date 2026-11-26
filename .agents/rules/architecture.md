---
description: Architectural guidelines and module boundaries for FMS
globs: ["src/**/*", "app/**/*"]
---

# Architecture Rules

## 1. Modular Monolithic Structure

- All application logic resides in `src/`.
- Layers must maintain strict boundaries:
  - `src/app/`: Routing, App Router pages, layouts, Route Handlers.
  - `src/components/`: Reusable UI elements (`ui/`), application layout shell (`layout/`), and shared widgets (`shared/`).
  - `src/features/`: Feature-scoped business components, state hooks, and client-side presentation.
  - `src/server/`: Server-only logic (`db/`, `auth/`, `repositories/`, `services/`, `storage/`, `audit/`).
  - `src/validations/`: Zod schemas for all client inputs and mutations.
  - `src/lib/`: Pure utilities, environment parsing, date utilities, constants.
  - `src/types/`: Shared TypeScript domain types and DTOs.

## 2. Server-Side Execution Model

- Database access is permitted ONLY within `src/server/` or Server Actions / Route Handlers.
- Never import `@prisma/client` in client components or files marked `"use client"`.
- Use React Server Components (RSC) for page layouts and static presentation to minimize client JS bundle size.
- Server Actions must validate arguments with Zod before delegating to `src/server/services/`.

## 3. Webpack Production Builds

- Use `next build --webpack` for production builds as mandated by deployment specifications.

---
description: Database standards, Prisma ORM practices, and MariaDB pooling rules
globs: ["prisma/**/*", "src/server/db/**/*", "src/server/repositories/**/*"]
---

# Database Rules

## 1. Provider & Connectivity

- Provider is MariaDB / MySQL via Prisma ORM 6.19.3.
- PostgreSQL, SQLite, MongoDB, or Supabase are strictly prohibited.
- Development uses the global Prisma client singleton attached to `globalThis` to prevent connection exhaustion.
- When `USE_PRISMA_MARIADB_ADAPTER=true`, configure connection pooling with max 5 connections and 15s timeout.

## 2. Query Guidelines

- Explicitly select only necessary fields using Prisma `select` projections. Do not query wide rows or sensitive columns (`passwordHash`, `salaryRecords`) unnecessarily.
- Use explicit foreign key relations and appropriate composite indexes on frequently filtered fields (`status`, `departmentId`, `assignedToId`).
- Use `db.$transaction` for multi-step mutations to guarantee consistency across deliverables, stages, and ledger entries.

## 3. Migration Safety

- Never run destructive migrations or manual SQL drops on production environments.
- Seed scripts must never inject fictitious production employee or salary data.

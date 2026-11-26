# System Architecture: FMS (Faculty Management System)

# Geeta University — Branding Department

## 1. High-Level Architectural Pattern

FMS is built as a **Modular Monolith** using **Next.js 16 (App Router)** and **React 19**, running on **Node.js 22.22.0**.

The design avoids unnecessary microservices, external orchestration overhead, or separate backend runtimes while maintaining pristine logical separation across domain boundaries.

```
+-------------------------------------------------------------------------+
|                              Next.js 16                                 |
|                                                                         |
|  +------------------------+  +---------------------------------------+  |
|  |       App Router       |  |          Client Components            |  |
|  |  (Server Components)   |  |   (Forms, Tables, Charts, Modals)     |  |
|  +-----------+------------+  +-------------------+-------------------+  |
|              |                                   |                      |
|              | Direct Prop Passing               | Server Actions       |
|              v                                   v                      |
|  +-------------------------------------------------------------------+  |
|  |                           src/server/                             |  |
|  |                                                                   |  |
|  |  +------------------+  +------------------+  +------------------+ |  |
|  |  |  Auth & Guards   |  | Domain Services  |  |  Audit & Storage | |  |
|  |  +--------+---------+  +--------+---------+  +--------+---------+ |  |
|  |           |                     |                     |           |  |
|  |           +---------------------+---------------------+           |  |
|  |                                 |                                 |  |
|  |                                 v                                 |  |
|  |                    +-------------------------+                    |  |
|  |                    | Repositories (Data Acc) |                    |  |
|  |                    +------------+------------+                    |  |
|  |                                 |                                 |  |
|  |                                 v                                 |  |
|  |                    +-------------------------+                    |  |
|  |                    | Prisma ORM 6.19 Client  |                    |  |
|  +--------------------+------------+------------+--------------------+  |
+------------------------------------|------------------------------------+
                                     v
                  +-------------------------------------+
                  |   Hostinger MariaDB / MySQL Server  |
                  +-------------------------------------+
```

---

## 2. Layered Responsibilities

| Layer               | Location                   | Purpose & Constraints                                                                                   |
| :------------------ | :------------------------- | :------------------------------------------------------------------------------------------------------ |
| **Routing & Pages** | `src/app/`                 | Declarative routes, nested layouts, loading states, and error boundaries. Default to Server Components. |
| **Presentation**    | `src/components/`          | Presentational components, design system elements, tables, and dialogs. No database access.             |
| **Feature Slices**  | `src/features/`            | Domain-specific UI assemblies (e.g., job creator modal, submission card).                               |
| **Validation**      | `src/validations/`         | Zod schemas ensuring all client inputs are typed and sanitized before reaching services.                |
| **Services**        | `src/server/services/`     | Pure business logic, transactional workflows, orchestration, and notification dispatch.                 |
| **Repositories**    | `src/server/repositories/` | Encapsulated database queries using Prisma Client. Enforces field selection and relational joins.       |
| **Security Guards** | `src/server/auth/`         | Session verification, role guards, and entity-level permission assertions.                              |
| **Database**        | `src/server/db/`           | Prisma Client singleton and MariaDB connection pool adapters.                                           |
| **Storage**         | `src/server/storage/`      | Abstracted file management verifying MIME types, sizes, and disk paths.                                 |

---

## 3. Database Connection Pooling Strategy

- **Development**: Prisma Client singleton bound to `globalThis` prevents connection leaks during Next.js Hot Module Replacement (HMR).
- **Production (Hostinger Cloud)**:
  - Default MySQL protocol connection string (`DATABASE_URL`).
  - Option to enable `@prisma/adapter-mariadb` with configured pool size (`connectionLimit: 5`, `connectTimeout: 15000`) when operating under low-resource VPS environments.

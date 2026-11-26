# FMS — Faculty Management System

### Geeta University — Branding Department

[![Next.js](https://img.shields.io/badge/Next.js-16.4.3-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19.3-2D3748)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC)](https://tailwindcss.com/)

---

## 1. Project Overview

The **Faculty Management System (FMS)** is an internal enterprise operations and performance management platform designed specifically for the **Branding Department at Geeta University**.

The platform provides end-to-end management of:

- **Staff Directory & Hierarchy**: Dynamic reporting tree connecting the Main Manager, Deputy Managers, and production specialists.
- **Job Creation & Allocation**: Master university campaigns, event coverages, and branding initiatives.
- **Task Scheduling & Delegation**: Sub-allocating deliverables to cameramen, video editors, designers, and logistical staff.
- **Dual Production Pipelines**: Supporting both _Content Creation_ (shoot, editing, review, publishing) and _Branding & Production_ (5-stage mockup, approved design, print, installation, pack-up).
- **Submissions & Multi-Stage Approvals**: Versioned file and Google Drive link uploads with public employee feedback and private management notes.
- **Performance Appraisals**: 1–5 star ratings attached directly to completed deliverables.
- **Productivity & ROI Intelligence**: On-time delivery rates, role turnaround times, and configurable ROI calculation frameworks.
- **Append-Only Audit History**: Immutable transaction log recording every state mutation, assignment, and approval verdict.

---

## 2. Technology Stack

- **Runtime**: Node.js `22.22.0`, npm `9.9.4`
- **Framework**: Next.js `16.4.3` (App Router, Server Components & Server Actions)
- **UI Engine**: React `19.2.4`, React DOM `19.2.4`
- **Language**: TypeScript `5.9.3` (Strict Mode)
- **Styling**: Tailwind CSS `4.x`, Lucide React `1.16.0`, Framer Motion `12.40.0`
- **Database ORM**: Prisma ORM `6.19.3`
- **Database Driver**: MariaDB / MySQL connector, `@prisma/adapter-mariadb 6.19.3`, `mariadb 3.5.4`
- **Validation**: Zod `3.24.2`, React Hook Form `7.54.2`
- **Tables & Analytics**: TanStack Table `8.21.2`, Recharts `2.15.1`
- **Testing**: Vitest `3.0.6`, Playwright `1.50.1`
- **Authentication**: Custom signed JWT sessions via `jose 5.9.6` and `bcryptjs 2.4.3` with HttpOnly cookies
- **Production Build Engine**: Webpack (`next build --webpack`)
- **Hosting Target**: Hostinger Cloud Node.js runner with Hostinger Managed MySQL

---

## 3. Prerequisites

Before setting up the project locally or on a server, verify the following prerequisites:

- **Node.js**: `v22.22.0` (or Node.js 22 LTS)
- **npm**: `v9.x` or `v10.x`
- **Database**: Local or remote instance of MariaDB (>= 10.6) or MySQL (>= 8.0)

---

## 4. Initial Setup & Configuration

### 4.1 Clone & Install

```bash
git clone <repository-url>
cd FMS
npm install
```

### 4.2 Configure Environment

Copy the environment template:

```bash
cp .env.example .env
```

Generate a secure 32-character authentication secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Place the generated secret into `AUTH_SECRET` inside `.env`.

Configure your database connection string in `.env`:

```ini
DATABASE_URL="mysql://fms_user:your_password@127.0.0.1:3306/fms_db"
```

To enable the MariaDB connection pool adapter, set:

```ini
USE_PRISMA_MARIADB_ADAPTER=true
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=fms_user
DB_PASSWORD=your_password
DB_NAME=fms_db
```

---

## 5. Prisma & Database Management

```bash
# Validate Prisma schema syntax
npm run db:validate

# Generate Prisma Client
npm run db:generate

# Run development migrations
npm run db:migrate

# Apply migrations safely on production (Hostinger)
npm run db:migrate:deploy

# Seed initial department, admin account, and default workflow templates
npm run db:seed

# Launch interactive Prisma Studio GUI
npm run db:studio
```

---

## 6. Development & Quality Assurance Commands

```bash
# Start local development server (http://localhost:3000)
npm run dev

# Run TypeScript compiler check
npm run typecheck

# Run Next.js and ESLint code checks
npm run lint

# Format codebase with Prettier
npm run format

# Verify formatting without writing
npm run format:check

# Execute unit and integration tests with Vitest
npm run test

# Execute Playwright E2E browser tests
npm run test:e2e

# Run production build (using Webpack)
npm run build

# Start production server
npm run start
```

---

## 7. Folder Structure Explanation

```
FMS/
├── .agents/                 # Antigravity rules (architecture, security, database, development)
├── docs/                    # Technical & workflow specifications (12 detailed markdown docs)
├── prisma/                  # Prisma schema, migrations, and seed script
├── public/                  # Static assets, branding logos, and icons
├── scripts/                 # Environment validation and database connectivity diagnostics
├── src/
│   ├── app/                 # Next.js 16 App Router (Auth, Dashboard modules, API endpoints)
│   ├── components/          # Design system primitives, layout shell, and shared data tables
│   ├── features/            # Business feature slices (auth, jobs, tasks, submissions)
│   ├── lib/                 # Environment parsing, date utilities, constants, formatting
│   ├── proxy.ts             # Next.js 16 coarse routing guard
│   ├── server/              # Server-only logic (Prisma client, auth guards, services, repos)
│   ├── types/               # TypeScript domain interfaces and DTOs
│   └── validations/         # Zod schemas for all client mutations
├── storage/uploads/         # Protected storage root for local file uploads
└── tests/                   # Vitest unit tests and Playwright E2E suites
```

---

## 8. Git Branch & Contribution Strategy

- `main`: Production-ready code only. Direct commits and force pushes are strictly disabled.
- `staging`: Integration testing branch matching Hostinger pre-production.
- `feature/<name>`: Dedicated feature branch created from `staging` or `main`.
- Pull Requests require passing `npm run typecheck`, `npm run lint`, and `npm run test` before merge approval.

---

## 9. Deployment to Hostinger Cloud

Detailed deployment instructions, persistent storage volume mounting, PM2 setup, and Nginx proxy rules are documented in:
[DEPLOYMENT_GUIDE.md](file:///d:/Geeta%20Edu/projects/FMS/docs/DEPLOYMENT_GUIDE.md)

---

## 10. Pending Business Decisions

Certain operational parameters (employee roster, salary denominations, credit point weights, and ROI formulas) are awaiting confirmation from university administration.
For full details, consult:
[PENDING_BUSINESS_DECISIONS.md](file:///d:/Geeta%20Edu/projects/FMS/docs/PENDING_BUSINESS_DECISIONS.md)

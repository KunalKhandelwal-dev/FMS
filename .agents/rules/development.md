---
description: Engineering standards, testing, and contribution protocols
globs: ["**/*.ts", "**/*.tsx", "tests/**/*"]
---

# Development Rules

## 1. TypeScript & Code Quality

- Strict mode is enforced. Avoid `any`. Define strong types for database models and API payloads.
- Run `npm run typecheck` and `npm run lint` before committing any change.
- Format all code with Prettier (`npm run format:check`).

## 2. Testing Standards

- Unit tests (`tests/unit/`) verify utility functions, Zod validation schemas, and permission guards.
- Integration tests (`tests/integration/`) verify server services with mock/isolated DB clients.
- E2E tests (`tests/e2e/`) run via Playwright to ensure critical workflows (login, task navigation) function properly.

## 3. Git & Deployment Discipline

- Never commit real `.env` or credential files.
- Never force push or commit directly to the `main` branch.
- Feature development proceeds via dedicated topic branches.

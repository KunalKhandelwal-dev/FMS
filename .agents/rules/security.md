---
description: Security and authentication guidelines for FMS
globs: ["src/server/auth/**/*", "src/server/guards/**/*", "src/validations/**/*", "src/proxy.ts"]
---

# Security Rules

## 1. Zero Trust on Client Roles

- Never trust role claims, user IDs, or permission scopes passed from client components or query strings.
- All authorization decisions must be validated server-side using `getCurrentUser()` and database lookups in `src/server/auth/guards.ts`.
- `src/proxy.ts` performs preliminary routing protection; deep resource-level security must be enforced in services.

## 2. Credentials & Session Management

- Passwords must be hashed using bcrypt with salt rounds >= 10.
- Authentication tokens/sessions must use secure, HttpOnly, SameSite=Lax (or Strict) cookies.
- No public self-registration: accounts are provisioned solely by authorized administrators.

## 3. Data Segregation & Protection

- `SalaryRecord` and managerial `privateNotes` in `ApprovalReview` must never be queried or serialized in responses sent to non-managerial users (`EMPLOYEE`, `TEAM_LEAD`).
- Prevent IDOR (Insecure Direct Object Reference) by asserting ownership or team hierarchy in every repository fetch.

## 4. File Upload Security

- Validate file extension, MIME type, and size (limit to `MAX_UPLOAD_SIZE_MB`).
- Generate random cryptographic filenames for stored files.
- Files must be served through protected route handlers (`/api/files/[fileId]`) with permission verification, never exposed via direct public directory browsing.

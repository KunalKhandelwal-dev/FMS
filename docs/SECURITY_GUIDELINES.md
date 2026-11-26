# Security Guidelines & Hardening Protocol

# Project: FMS — Faculty Management System

## 1. Authentication & Cookie Security

- **Session Tokens**: Signed via `jose` using HS256 with `AUTH_SECRET` (minimum 32 random bytes).
- **Cookie Attributes**:
  - `HttpOnly`: Strictly true (inaccessible to JavaScript `document.cookie`).
  - `SameSite`: `lax` (prevents cross-site request forgery).
  - `Secure`: Enabled in production (`process.env.NODE_ENV === "production"`).
  - `Path`: `/`
- **Session Duration**: Default 7 days with server-side account status revalidation (`UserStatus.ACTIVE`).

---

## 2. Role-Based Access & Data Segregation

- **No Public Registration**: Accounts are manually created and provisioned by the `MAIN_MANAGER`.
- **Insecure Direct Object Reference (IDOR) Mitigation**: Every repository fetch asserts that the requesting user owns the object, manages the assigned subordinate, or holds `MAIN_MANAGER` privileges.
- **Compensation Data Protection**: `salary_records` is accessible solely via `salaryService` guarded by `UserRole.MAIN_MANAGER`.

---

## 3. File Upload Hardening

- Allowed file extensions and MIME types are strictly verified against an allowlist (PDF, PNG, JPG, JPEG, WEBP, MP4, MOV, ZIP).
- File size is checked before disk writing and capped at `MAX_UPLOAD_SIZE_MB` (default 25 MB).
- File paths are scrubbed using `path.basename` to prevent directory traversal attacks (`../`).
- Files are stored outside the public document root in `storage/uploads/` (or mounted persistent volume) and streamed exclusively through authenticated route handlers.

---

## 4. Database Security

- Database operations use parameterized Prisma queries to eliminate SQL injection risks.
- Secrets (`DATABASE_URL`, `AUTH_SECRET`, `DB_PASSWORD`) are never prefixed with `NEXT_PUBLIC_` and never bundled into client JavaScript.

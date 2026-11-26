# API & Server Action Conventions: FMS

# Project: FMS — Faculty Management System

## 1. Request Handling Conventions

FMS employs two server execution patterns:

1. **Server Actions (`"use server"`)**: The primary mechanism for state mutations (creating jobs, submitting files, approving work, modifying team memberships).
2. **Route Handlers (`src/app/api/.../route.ts`)**: Reserved for non-HTML HTTP endpoints such as binary file downloads, health checks, and external webhooks.

---

## 2. Server Action Protocol

Every Server Action must follow a consistent lifecycle:

```typescript
export async function createJobAction(rawInput: unknown): Promise<ActionResult<JobDto>> {
  // 1. Session & Identity
  const user = await requireAuthenticatedUser();

  // 2. Role / Entity Guard
  requireRole(user, [UserRole.MAIN_MANAGER]);

  // 3. Schema Validation
  const validated = createJobSchema.safeParse(rawInput);
  if (!validated.success) {
    return {
      success: false,
      error: "Validation failed: " + validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  // 4. Service Execution (inside try/catch with transaction if multi-step)
  try {
    const job = await jobService.createJob(user.id, validated.data);
    return { success: true, data: job };
  } catch (error) {
    logger.error("Job creation failed", { userId: user.id, error });
    return { success: false, error: "Failed to create job. Please contact support." };
  }
}
```

---

## 3. Standard Action Response Structure

```typescript
export type ActionResult<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
```

---

## 4. Route Handler Status Codes

- `200 OK`: Successful read or operation.
- `400 Bad Request`: Validation failure.
- `401 Unauthorized`: Session missing or expired.
- `403 Forbidden`: User lacks sufficient role or entity authority.
- `404 Not Found`: Entity does not exist.
- `500 Internal Server Error`: Unhandled application exception (sanitized in production).

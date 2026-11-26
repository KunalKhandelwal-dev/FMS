import { UserRole } from "@prisma/client";

export type Permission =
  | "job:create"
  | "job:assign_deputy"
  | "job:edit_metadata"
  | "job:delete"
  | "task:create"
  | "task:assign"
  | "task:submit"
  | "review:approve"
  | "review:request_revision"
  | "rating:create"
  | "credits:manage"
  | "analytics:department_view"
  | "analytics:team_view"
  | "salary:view"
  | "salary:manage"
  | "user:manage"
  | "audit:view";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  MAIN_MANAGER: [
    "job:create",
    "job:assign_deputy",
    "job:edit_metadata",
    "job:delete",
    "task:create",
    "task:assign",
    "task:submit",
    "review:approve",
    "review:request_revision",
    "rating:create",
    "credits:manage",
    "analytics:department_view",
    "analytics:team_view",
    "salary:view",
    "salary:manage",
    "user:manage",
    "audit:view",
  ],
  DEPUTY_MANAGER: [
    "job:edit_metadata",
    "task:create",
    "task:assign",
    "task:submit",
    "review:approve",
    "review:request_revision",
    "rating:create",
    "analytics:team_view",
  ],
  TEAM_LEAD: ["task:create", "task:submit", "review:approve", "review:request_revision"],
  EMPLOYEE: ["task:submit"],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes(permission);
}

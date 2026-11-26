import { describe, it, expect } from "vitest";
import { hasPermission } from "@/server/auth/permissions";
import { UserRole } from "@prisma/client";

describe("RBAC Permissions Guard", () => {
  it("allows MAIN_MANAGER full management permissions", () => {
    expect(hasPermission(UserRole.MAIN_MANAGER, "job:create")).toBe(true);
    expect(hasPermission(UserRole.MAIN_MANAGER, "salary:view")).toBe(true);
    expect(hasPermission(UserRole.MAIN_MANAGER, "user:manage")).toBe(true);
    expect(hasPermission(UserRole.MAIN_MANAGER, "audit:view")).toBe(true);
  });

  it("restricts DEPUTY_MANAGER from salary and department user management", () => {
    expect(hasPermission(UserRole.DEPUTY_MANAGER, "task:create")).toBe(true);
    expect(hasPermission(UserRole.DEPUTY_MANAGER, "task:assign")).toBe(true);
    expect(hasPermission(UserRole.DEPUTY_MANAGER, "salary:view")).toBe(false);
    expect(hasPermission(UserRole.DEPUTY_MANAGER, "user:manage")).toBe(false);
  });

  it("restricts EMPLOYEE to task submissions only", () => {
    expect(hasPermission(UserRole.EMPLOYEE, "task:submit")).toBe(true);
    expect(hasPermission(UserRole.EMPLOYEE, "job:create")).toBe(false);
    expect(hasPermission(UserRole.EMPLOYEE, "review:approve")).toBe(false);
    expect(hasPermission(UserRole.EMPLOYEE, "salary:view")).toBe(false);
  });
});


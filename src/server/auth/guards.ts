import { UserRole, UserStatus } from "@prisma/client";
import { getSessionFromCookies } from "./session";
import { hasPermission, type Permission } from "./permissions";
import { db } from "@/server/db/client";
import type { SessionUser } from "@/types/auth";

export class AuthenticationError extends Error {
  constructor(message = "Authentication required to perform this action") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message = "You do not have permission to access this resource") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Returns current authenticated session user without throwing.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSessionFromCookies();
  if (!session?.sub) return null;

  return {
    id: session.sub,
    email: session.email,
    fullName: session.fullName,
    role: session.role as UserRole,
    status: session.status as UserStatus,
    departmentId: session.departmentId,
    employeeCode: null,
    avatarUrl: null,
  };
}

/**
 * Requires an authenticated user session.
 */
export async function requireAuthenticatedUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || user.status !== UserStatus.ACTIVE) {
    throw new AuthenticationError("Active authenticated session is required");
  }
  return user;
}

/**
 * Requires user to have one of the specified roles.
 */
export function requireRole(user: SessionUser, allowedRoles: UserRole[]): void {
  if (!allowedRoles.includes(user.role)) {
    throw new AuthorizationError(
      `Access denied. Role '${user.role}' is not authorized. Allowed: ${allowedRoles.join(", ")}`
    );
  }
}

/**
 * Requires user to have a specific permission.
 */
export function requirePermission(user: SessionUser, permission: Permission): void {
  if (!hasPermission(user.role, permission)) {
    throw new AuthorizationError(`Access denied. Missing required permission: '${permission}'`);
  }
}

/**
 * Verifies if user can view or manage a specific Job.
 */
export async function canAccessJob(user: SessionUser, jobId: string): Promise<boolean> {
  if (user.role === UserRole.MAIN_MANAGER) return true;

  const job = await db.job.findUnique({
    where: { id: jobId },
    select: { assignedDeputyId: true, createdById: true },
  });

  if (!job) return false;

  // Deputy assigned or creator
  if (job.assignedDeputyId === user.id || job.createdById === user.id) {
    return true;
  }

  // Check if job contains deliverables assigned to this user
  const hasTask = await db.taskAssignment.findFirst({
    where: {
      deliverable: { jobId },
      assignedToId: user.id,
    },
    select: { id: true },
  });

  return Boolean(hasTask);
}

/**
 * Verifies if user can access or submit to a specific Task.
 */
export async function canAccessTask(user: SessionUser, taskId: string): Promise<boolean> {
  if (user.role === UserRole.MAIN_MANAGER) return true;

  const task = await db.taskAssignment.findUnique({
    where: { id: taskId },
    select: {
      assignedToId: true,
      assignedById: true,
      deliverable: {
        select: {
          job: {
            select: { assignedDeputyId: true },
          },
        },
      },
    },
  });

  if (!task) return false;

  return (
    task.assignedToId === user.id ||
    task.assignedById === user.id ||
    task.deliverable.job.assignedDeputyId === user.id
  );
}

/**
 * Verifies if user can manage another employee.
 */
export async function canManageEmployee(user: SessionUser, targetUserId: string): Promise<boolean> {
  if (user.role === UserRole.MAIN_MANAGER) return true;
  if (user.id === targetUserId) return false;

  // Check direct reporting hierarchy
  const target = await db.user.findUnique({
    where: { id: targetUserId },
    select: { managerId: true },
  });

  return target?.managerId === user.id;
}

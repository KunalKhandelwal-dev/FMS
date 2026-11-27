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
    select: {
      ownerId: true,
      assignedDeputyId: true,
      createdById: true,
      team: {
        select: {
          leadId: true,
        },
      },
    },
  });

  if (!job) return false;

  if (
    job.ownerId === user.id ||
    job.assignedDeputyId === user.id ||
    job.createdById === user.id ||
    job.team?.leadId === user.id
  ) {
    return true;
  }

  // Check if user is assigned to any deliverable or stage or task under this job
  const assignedDeliverable = await db.deliverable.findFirst({
    where: {
      jobId,
      OR: [
        { assignedToId: user.id },
        { shootAssignedToId: user.id },
        { editorAssignedToId: user.id },
        { postAssignedToId: user.id },
        { proofreadAssignedToId: user.id },
        { fitterAssignedToId: user.id },
        { stages: { some: { OR: [{ responsibleUserId: user.id }, { assignedById: user.id }] } } },
        { tasks: { some: { assignedToId: user.id } } },
      ],
    },
    select: { id: true },
  });

  return Boolean(assignedDeliverable);
}

/**
 * Verifies if user can access a specific Deliverable.
 */
export async function canAccessDeliverable(
  user: SessionUser,
  deliverableId: string
): Promise<boolean> {
  if (user.role === UserRole.MAIN_MANAGER) return true;

  const deliverable = await db.deliverable.findUnique({
    where: { id: deliverableId },
    select: {
      assignedToId: true,
      shootAssignedToId: true,
      editorAssignedToId: true,
      postAssignedToId: true,
      proofreadAssignedToId: true,
      fitterAssignedToId: true,
      job: {
        select: {
          ownerId: true,
          assignedDeputyId: true,
          createdById: true,
        },
      },
      stages: {
        select: { responsibleUserId: true, assignedById: true },
      },
      tasks: {
        select: { assignedToId: true },
      },
    },
  });

  if (!deliverable) return false;

  if (
    deliverable.assignedToId === user.id ||
    deliverable.shootAssignedToId === user.id ||
    deliverable.editorAssignedToId === user.id ||
    deliverable.postAssignedToId === user.id ||
    deliverable.proofreadAssignedToId === user.id ||
    deliverable.fitterAssignedToId === user.id ||
    deliverable.job.ownerId === user.id ||
    deliverable.job.assignedDeputyId === user.id ||
    deliverable.job.createdById === user.id
  ) {
    return true;
  }

  if (deliverable.stages.some((s) => s.responsibleUserId === user.id || s.assignedById === user.id)) {
    return true;
  }

  return deliverable.tasks.some((t) => t.assignedToId === user.id);
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
            select: { ownerId: true, assignedDeputyId: true },
          },
        },
      },
    },
  });

  if (!task) return false;

  return (
    task.assignedToId === user.id ||
    task.assignedById === user.id ||
    task.deliverable.job.ownerId === user.id ||
    task.deliverable.job.assignedDeputyId === user.id
  );
}

/**
 * Verifies if user can manage another employee's profile/reporting.
 * Note: Secondary delegation (e.g. Ruhi assigning tasks to Hardik) or
 * independent proofreading (Mandeep on Navneet's team) does NOT grant profile management.
 */
export async function canManageEmployee(user: SessionUser, targetUserId: string): Promise<boolean> {
  if (user.role === UserRole.MAIN_MANAGER) return true;
  if (user.id === targetUserId) return false;

  const target = await db.user.findUnique({
    where: { id: targetUserId },
    select: { managerId: true },
  });

  return target?.managerId === user.id;
}

/**
 * Verifies if an authorized supervisor/lead can assign tasks to a target user.
 * Supports both primary supervisor (managerId) and secondary incharge (secondaryManagerId).
 */
export async function canAssignTaskToUser(user: SessionUser, targetUserId: string): Promise<boolean> {
  if (user.role === UserRole.MAIN_MANAGER) return true;

  const target = await db.user.findUnique({
    where: { id: targetUserId },
    select: {
      status: true,
      managerId: true,
      secondaryManagerId: true,
      teamMemberships: {
        where: { status: "ACTIVE" },
        select: { membershipType: true, team: { select: { leadId: true } } },
      },
    },
  });

  if (!target || target.status !== UserStatus.ACTIVE) return false;
  if (target.managerId === user.id || target.secondaryManagerId === user.id) return true;

  return target.teamMemberships.some(
    (m) => m.team.leadId === user.id && m.membershipType !== "REVIEWER"
  );
}

/**
 * Verifies if user can access restricted salary or ROI configuration data.
 */
export function canAccessSalaryAndRoi(user: SessionUser): boolean {
  return user.role === UserRole.MAIN_MANAGER;
}

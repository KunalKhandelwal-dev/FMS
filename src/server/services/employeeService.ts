import { db } from "@/server/db/client";
import { hashPassword } from "@/server/auth/config";
import { auditService } from "@/server/audit/auditService";
import { AuditAction, UserRole, UserStatus } from "@prisma/client";
import type { CreateEmployeeInput, UpdateEmployeeInput } from "@/validations/employee";

export class EmployeeService {
  async createEmployee(operatorId: string, input: CreateEmployeeInput) {
    const existing = await db.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });
    if (existing) {
      throw new Error(`User with email '${input.email}' already exists`);
    }

    const passwordHash = await hashPassword(input.password);

    const newUser = await db.user.create({
      data: {
        email: input.email.toLowerCase(),
        fullName: input.fullName,
        employeeCode: input.employeeCode || null,
        phone: input.phone || null,
        role: input.role as UserRole,
        status: UserStatus.ACTIVE,
        managerId: input.managerId || null,
        departmentId: input.departmentId || null,
        passwordHash,
      },
    });

    await auditService.log({
      userId: operatorId,
      action: AuditAction.CREATE,
      entityType: "USER",
      entityId: newUser.id,
      details: { email: newUser.email, role: newUser.role },
    });

    return newUser;
  }

  async updateEmployee(operatorId: string, input: UpdateEmployeeInput) {
    const updated = await db.user.update({
      where: { id: input.id },
      data: {
        ...(input.fullName ? { fullName: input.fullName } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.managerId !== undefined ? { managerId: input.managerId } : {}),
        ...(input.role ? { role: input.role as UserRole } : {}),
        ...(input.status ? { status: input.status as UserStatus } : {}),
      },
    });

    await auditService.log({
      userId: operatorId,
      action: AuditAction.UPDATE,
      entityType: "USER",
      entityId: updated.id,
      details: { role: updated.role, status: updated.status },
    });

    return updated;
  }
}

export const employeeService = new EmployeeService();


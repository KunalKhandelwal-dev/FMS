"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedUser, requirePermission } from "@/server/auth/guards";
import { employeeService } from "@/server/services/employeeService";
import { createEmployeeSchema, type CreateEmployeeInput } from "@/validations/employee";
import { db } from "@/server/db/client";
import type { ActionResult } from "@/types/common";

export async function createEmployeeAction(
  rawInput: CreateEmployeeInput & { designation?: string }
): Promise<ActionResult<{ userId: string }>> {
  try {
    const operator = await requireAuthenticatedUser();
    requirePermission(operator, "user:manage");

    const parsed = createEmployeeSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid employee details",
      };
    }

    let departmentId = parsed.data.departmentId || operator.departmentId;
    if (!departmentId) {
      const dept = await db.department.findFirst({ select: { id: true } });
      departmentId = dept?.id || null;
    }

    const created = await employeeService.createEmployee(operator.id, {
      ...parsed.data,
      departmentId,
    });

    if (rawInput.designation) {
      await db.user.update({
        where: { id: created.id },
        data: { designation: rawInput.designation },
      });
    }

    revalidatePath("/employees");
    revalidatePath("/jobs/new");

    return {
      success: true,
      data: { userId: created.id },
      message: `Account created for ${created.fullName}.`,
    };
  } catch (err: unknown) {
    console.error("createEmployeeAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create employee.",
    };
  }
}


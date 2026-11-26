"use server";

import { redirect } from "next/navigation";
import { loginSchema, type LoginInput } from "@/validations/auth";
import { db } from "@/server/db/client";
import { verifyPassword } from "@/server/auth/config";
import { createSessionToken, setSessionCookie, clearSessionCookie } from "@/server/auth/session";
import { auditService } from "@/server/audit/auditService";
import { AuditAction, UserStatus } from "@prisma/client";
import type { ActionResult } from "@/types/common";

export async function loginAction(
  formData: LoginInput
): Promise<ActionResult<{ redirectUrl: string }>> {
  const parsed = loginSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid input",
    };
  }

  const { email, password } = parsed.data;

  try {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { success: false, error: "Invalid university email or password" };
    }

    if (user.status !== UserStatus.ACTIVE) {
      return {
        success: false,
        error: "Your staff account has been deactivated or suspended. Contact administration.",
      };
    }

    const passwordMatches = await verifyPassword(password, user.passwordHash);
    if (!passwordMatches) {
      return { success: false, error: "Invalid university email or password" };
    }

    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
      departmentId: user.departmentId,
      employeeCode: user.employeeCode,
      avatarUrl: user.avatarUrl,
    });

    await setSessionCookie(token);

    await auditService.log({
      userId: user.id,
      action: AuditAction.LOGIN,
      entityType: "AUTH",
      entityId: user.id,
      details: { email: user.email },
    });

    return {
      success: true,
      data: { redirectUrl: "/dashboard" },
    };
  } catch (err: any) {
    console.error("Login action error:", err);
    return {
      success: false,
      error: "Authentication service error. Please try again later.",
    };
  }
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}

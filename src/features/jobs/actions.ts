"use server";

import { revalidatePath } from "next/cache";
import { requireAuthenticatedUser, requirePermission } from "@/server/auth/guards";
import { jobService } from "@/server/services/jobService";
import {
  createContentJobSchema,
  createBrandingJobSchema,
  updateJobSchema,
  type CreateContentJobInput,
  type CreateBrandingJobInput,
  type UpdateJobInput,
} from "@/validations/job";
import { db } from "@/server/db/client";
import type { ActionResult } from "@/types/common";

export async function createContentJobAction(
  rawInput: CreateContentJobInput
): Promise<ActionResult<{ jobId: string }>> {
  try {
    const user = await requireAuthenticatedUser();
    requirePermission(user, "job:create");

    const parsed = createContentJobSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid job input",
      };
    }

    let departmentId = user.departmentId;
    if (!departmentId) {
      const dept = await db.department.findFirst({ select: { id: true } });
      if (!dept) return { success: false, error: "Department not configured." };
      departmentId = dept.id;
    }

    const result = await jobService.createContentJob(user.id, departmentId, parsed.data);

    revalidatePath("/dashboard");
    revalidatePath("/jobs");
    revalidatePath("/my-work");
    revalidatePath("/productivity");

    return {
      success: true,
      data: { jobId: result.job.id },
      message: `Job "${result.job.title}" created with ${result.deliverables.length} deliverable(s).`,
    };
  } catch (err: unknown) {
    console.error("createContentJobAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create job.",
    };
  }
}

export async function updateJobAction(
  rawInput: UpdateJobInput
): Promise<ActionResult<{ jobId: string }>> {
  try {
    const user = await requireAuthenticatedUser();
    requirePermission(user, "job:edit_metadata");

    const parsed = updateJobSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid job update input",
      };
    }

    const updated = await jobService.updateJob(user.id, parsed.data);

    revalidatePath("/dashboard");
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${updated.id}`);

    return { success: true, data: { jobId: updated.id } };
  } catch (err: unknown) {
    console.error("updateJobAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update job.",
    };
  }
}

export async function createBrandingJobAction(
  rawInput: CreateBrandingJobInput
): Promise<ActionResult<{ jobId: string }>> {
  try {
    const user = await requireAuthenticatedUser();
    requirePermission(user, "job:create");

    const parsed = createBrandingJobSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid branding job input",
      };
    }

    let departmentId = user.departmentId;
    if (!departmentId) {
      const dept = await db.department.findFirst({ select: { id: true } });
      if (!dept) return { success: false, error: "Department not configured." };
      departmentId = dept.id;
    }

    const result = await jobService.createBrandingJob(user.id, departmentId, parsed.data);

    revalidatePath("/branding-jobs");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: { jobId: result.job.id },
      message: `Branding job "${result.job.title}" created with 5 workflow stages.`,
    };
  } catch (err: unknown) {
    console.error("createBrandingJobAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create branding job.",
    };
  }
}


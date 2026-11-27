"use server";

import { revalidatePath } from "next/cache";
import { ApprovalStatus } from "@prisma/client";
import { requireAuthenticatedUser } from "@/server/auth/guards";
import { workflowEngine } from "@/server/services/workflowEngine";
import {
  assignWorkflowStageSchema,
  reviewSequentialStageSchema,
  submitStageOutputSchema,
  type AssignWorkflowStageInput,
  type ReviewSequentialStageInput,
  type SubmitStageOutputInput,
} from "@/validations/workflow";
import type { ActionResult } from "@/types/common";

export async function assignWorkflowStageAction(
  rawInput: AssignWorkflowStageInput
): Promise<ActionResult<{ stageId: string }>> {
  try {
    const user = await requireAuthenticatedUser();
    const parsed = assignWorkflowStageSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid stage assignment input",
      };
    }

    const stage = await workflowEngine.assignStage({
      actor: user,
      deliverableId: parsed.data.deliverableId,
      stageKey: parsed.data.stageKey,
      assigneeId: parsed.data.assigneeId,
      dueDate: parsed.data.dueDate,
      overrideDependency: parsed.data.overrideDependency,
    });

    revalidatePath("/dashboard");
    revalidatePath("/jobs");
    revalidatePath("/my-work");
    return { success: true, data: { stageId: stage.id } };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to assign workflow stage.",
    };
  }
}

export async function submitStageOutputAction(
  rawInput: SubmitStageOutputInput
): Promise<ActionResult<{ submissionId: string }>> {
  try {
    const user = await requireAuthenticatedUser();
    const parsed = submitStageOutputSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid stage submission",
      };
    }

    const submission = await workflowEngine.submitStageOutput({
      actor: user,
      deliverableId: parsed.data.deliverableId,
      stageKey: parsed.data.stageKey,
      url: parsed.data.url || null,
      actualDate: parsed.data.actualDate,
      socialPlatform: parsed.data.socialPlatform,
      notes: parsed.data.notes,
    });

    revalidatePath("/dashboard");
    revalidatePath("/my-work");
    revalidatePath("/jobs");
    revalidatePath("/approvals");
    return { success: true, data: { submissionId: submission.id } };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to submit stage output.",
    };
  }
}

export async function reviewSequentialStageAction(
  rawInput: ReviewSequentialStageInput
): Promise<ActionResult<{ reviewId: string }>> {
  try {
    const user = await requireAuthenticatedUser();
    const parsed = reviewSequentialStageSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid review input",
      };
    }

    const review = await workflowEngine.reviewSequentialStage({
      actor: user,
      deliverableId: parsed.data.deliverableId,
      stageKey: parsed.data.stageKey,
      decision: parsed.data.decision as ApprovalStatus,
      comments: parsed.data.comments,
      privateNotes: parsed.data.privateNotes,
      stars: parsed.data.stars,
    });

    revalidatePath("/dashboard");
    revalidatePath("/approvals");
    revalidatePath("/jobs");
    revalidatePath("/my-work");
    return { success: true, data: { reviewId: review.id } };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save review.",
    };
  }
}

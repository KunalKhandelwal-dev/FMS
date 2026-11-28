"use server";

import { revalidatePath } from "next/cache";
import {
  canAccessDeliverable,
  requireAuthenticatedUser,
  requirePermission,
} from "@/server/auth/guards";
import { db } from "@/server/db/client";
import { deliverableService } from "@/server/services/deliverableService";
import { localStorageProvider } from "@/server/storage/localStorageProvider";
import {
  cancelDeliverableSchema,
  submitDeliverableWorkSchema,
  updateContentTrackerSchema,
  type UpdateContentTrackerInput,
} from "@/validations/deliverable";
import type { ActionResult } from "@/types/common";

export async function submitDeliverableWorkAction(
  formData: FormData
): Promise<ActionResult<{ submissionId: string }>> {
  try {
    const user = await requireAuthenticatedUser();
    requirePermission(user, "task:submit");

    const deliverableId = String(formData.get("deliverableId") || "");
    const submissionUrl = String(formData.get("submissionUrl") || "");
    const notes = String(formData.get("notes") || "");
    const file = formData.get("file") as File | null;

    const hasAccess = await canAccessDeliverable(user, deliverableId);
    if (!hasAccess) {
      return { success: false, error: "Access denied: You are not assigned to this deliverable." };
    }

    const parsed = submitDeliverableWorkSchema.safeParse({
      deliverableId,
      submissionUrl,
      notes,
    });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid submission input",
      };
    }

    const hasFile = file && file.size > 0;
    if (!hasFile && !parsed.data.submissionUrl) {
      return {
        success: false,
        error: "Please attach a file or provide a Google Drive / work URL.",
      };
    }

    let fileMetadata:
      | { filePath: string; fileName: string; sizeBytes: number; mimeType: string }
      | undefined;

    if (hasFile) {
      const stored = await localStorageProvider.saveFile(file, file.name, file.type);
      fileMetadata = {
        filePath: stored.storagePath,
        fileName: stored.originalFileName,
        sizeBytes: stored.sizeBytes,
        mimeType: stored.mimeType,
      };
    }

    const submission = await deliverableService.submitWork(user.id, parsed.data, fileMetadata);

    revalidatePath("/my-work");
    revalidatePath("/dashboard");
    revalidatePath("/approvals");
    revalidatePath("/jobs");

    return {
      success: true,
      data: { submissionId: submission.id },
      message: `Work submitted (Version ${submission.version}).`,
    };
  } catch (err: unknown) {
    console.error("submitDeliverableWorkAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to submit work.",
    };
  }
}

export async function updateContentTrackerAction(
  rawInput: UpdateContentTrackerInput
): Promise<ActionResult<{ deliverableId: string }>> {
  try {
    const user = await requireAuthenticatedUser();

    const parsed = updateContentTrackerSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid tracker input",
      };
    }

    const input = parsed.data;

    const existing = await db.deliverable.findUnique({
      where: { id: input.deliverableId },
      select: {
        id: true,
        shootAssignedToId: true,
        editorAssignedToId: true,
        postAssignedToId: true,
        job: {
          select: {
            ownerId: true,
            assignedDeputyId: true,
            team: { select: { leadId: true } },
          },
        },
      },
    });

    if (!existing) {
      return { success: false, error: "Deliverable not found." };
    }

    const canManageAssignments =
      user.role === "MAIN_MANAGER" ||
      existing.job.ownerId === user.id ||
      existing.job.assignedDeputyId === user.id ||
      (!existing.job.ownerId && existing.job.team?.leadId === user.id);

    const isShootAssignee = existing.shootAssignedToId === user.id;
    const isEditorAssignee = existing.editorAssignedToId === user.id;
    const isPostAssignee = existing.postAssignedToId === user.id;

    if (!canManageAssignments && !isShootAssignee && !isEditorAssignee && !isPostAssignee) {
      return {
        success: false,
        error: "Access denied: You do not have permission to update this deliverable tracker.",
      };
    }

    const hasAssignmentFields =
      input.assignedToId !== undefined ||
      input.targetDate !== undefined ||
      input.shootAssignedToId !== undefined ||
      input.shootScheduledDate !== undefined ||
      input.editorAssignedToId !== undefined ||
      input.editScheduledDate !== undefined ||
      input.postAssignedToId !== undefined ||
      input.postScheduledDate !== undefined;

    if (hasAssignmentFields && !canManageAssignments) {
      return {
        success: false,
        error: "Only managers or the job owner/team lead can assign team members or set schedules.",
      };
    }

    if ((input.rawFootageUrl !== undefined || input.shootActualDate !== undefined) && !isShootAssignee) {
      return {
        success: false,
        error: "Only the assigned Shoot / Cameraman can add the raw footage link or shoot completion date.",
      };
    }

    if ((input.approvedVideoUrl !== undefined || input.editActualDate !== undefined) && !isEditorAssignee) {
      return {
        success: false,
        error: "Only the assigned Video Editor can add the approved video link or edit completion date.",
      };
    }

    if ((input.livePostUrl !== undefined || input.postActualDate !== undefined) && !isPostAssignee) {
      return {
        success: false,
        error: "Only the assigned Social Media Publisher can add the live post link or post date.",
      };
    }

    if (input.shootStatus !== undefined && !canManageAssignments && !isShootAssignee) {
      return { success: false, error: "Access denied for shoot status update." };
    }
    if (input.editStatus !== undefined && !canManageAssignments && !isEditorAssignee) {
      return { success: false, error: "Access denied for edit status update." };
    }
    if (input.postStatus !== undefined && !canManageAssignments && !isPostAssignee) {
      return { success: false, error: "Access denied for social publishing status update." };
    }

    const updated = await deliverableService.updateTracker(user.id, input);

    revalidatePath(`/jobs/${updated.jobId}`);
    revalidatePath("/productivity");
    revalidatePath("/dashboard");
    revalidatePath("/my-work");

    return { success: true, data: { deliverableId: updated.id } };
  } catch (err: unknown) {
    console.error("updateContentTrackerAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update tracker.",
    };
  }
}

export async function cancelDeliverableAction(
  deliverableId: string,
  cancellationReason: string
): Promise<ActionResult<{ deliverableId: string }>> {
  try {
    const user = await requireAuthenticatedUser();
    requirePermission(user, "job:edit_metadata");

    const parsed = cancelDeliverableSchema.safeParse({ deliverableId, cancellationReason });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Cancellation reason required",
      };
    }

    const updated = await deliverableService.cancelDeliverable(
      user.id,
      parsed.data.deliverableId,
      parsed.data.cancellationReason
    );

    revalidatePath(`/jobs/${updated.jobId}`);
    revalidatePath("/dashboard");
    revalidatePath("/productivity");

    return { success: true, data: { deliverableId: updated.id } };
  } catch (err: unknown) {
    console.error("cancelDeliverableAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to cancel deliverable.",
    };
  }
}


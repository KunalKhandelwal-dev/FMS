import { db } from "@/server/db/client";
import { auditService } from "@/server/audit/auditService";
import {
  ApprovalStatus,
  AuditAction,
  DeliveryPerformanceStatus,
  StageStatus,
  WorkflowState,
} from "@prisma/client";
import type {
  SubmitDeliverableWorkInput,
  UpdateContentTrackerInput,
} from "@/validations/deliverable";
import { calculateDeliveryStatus } from "@/lib/dates";

export class DeliverableService {
  /**
   * Submits work for a deliverable. Preserves firstSubmittedAt for initial timeliness
   * and maintains full versioned submission history.
   */
  async submitWork(
    userId: string,
    input: SubmitDeliverableWorkInput,
    fileMetadata?: { filePath: string; fileName: string; sizeBytes: number; mimeType: string }
  ) {
    return db.$transaction(async (tx) => {
      const deliverable = await tx.deliverable.findUnique({
        where: { id: input.deliverableId },
        include: { job: { select: { id: true, createdById: true, title: true } } },
      });

      if (!deliverable) {
        throw new Error("Deliverable not found");
      }

      if (deliverable.workflowState === WorkflowState.CANCELLED) {
        throw new Error("Cannot submit work for a cancelled deliverable");
      }

      const existingCount = await tx.workSubmission.count({
        where: { deliverableId: deliverable.id },
      });

      const now = new Date();
      const firstSubmittedAt = deliverable.firstSubmittedAt ?? now;
      const computedDeliveryStatus = calculateDeliveryStatus({
        targetDate: deliverable.targetDate,
        firstSubmittedAt,
        isCancelled: false,
      });

      const submission = await tx.workSubmission.create({
        data: {
          deliverableId: deliverable.id,
          submittedById: userId,
          version: existingCount + 1,
          notes: input.notes || null,
          submissionUrl: input.submissionUrl || null,
          filePath: fileMetadata?.filePath || null,
          fileName: fileMetadata?.fileName || null,
          fileSizeBytes: fileMetadata?.sizeBytes ? BigInt(fileMetadata.sizeBytes) : null,
          mimeType: fileMetadata?.mimeType || null,
          submittedAt: now,
        },
      });

      await tx.deliverable.update({
        where: { id: deliverable.id },
        data: {
          firstSubmittedAt,
          workflowState: WorkflowState.SUBMITTED,
          approvalStatus: ApprovalStatus.PENDING_REVIEW,
          deliveryStatus: computedDeliveryStatus,
          ...(input.submissionUrl && !deliverable.googleDriveUrl
            ? { googleDriveUrl: input.submissionUrl }
            : {}),
        },
      });

      // Notify manager/creator of submission
      await tx.notification.create({
        data: {
          userId: deliverable.job.createdById,
          title: `Work Submitted: ${deliverable.title}`,
          message: `Submission v${submission.version} received for "${deliverable.job.title}". Ready for review.`,
          link: `/jobs/${deliverable.job.id}`,
        },
      });

      return { submission, jobId: deliverable.job.id, deliverableId: deliverable.id, computedDeliveryStatus };
    }, { timeout: 15000, maxWait: 5000 }).then(async (res) => {
      await auditService.log({
        userId,
        jobId: res.jobId,
        action: AuditAction.SUBMIT,
        entityType: "WORK_SUBMISSION",
        entityId: res.submission.id,
        details: {
          deliverableId: res.deliverableId,
          version: res.submission.version,
          deliveryStatus: res.computedDeliveryStatus,
        },
      });
      return res.submission;
    });
  }

  /**
   * Updates Shoot / Video Editor / Social Media Publishing tracker fields.
   */
  async updateTracker(operatorId: string, input: UpdateContentTrackerInput) {
    const deliverable = await db.deliverable.findUnique({
      where: { id: input.deliverableId },
      select: { id: true, jobId: true, firstSubmittedAt: true, workflowState: true },
    });

    if (!deliverable) throw new Error("Deliverable not found");

    const updated = await db.deliverable.update({
      where: { id: input.deliverableId },
      data: {
        ...(input.assignedToId !== undefined ? { assignedToId: input.assignedToId } : {}),
        ...(input.targetDate !== undefined
          ? {
              targetDate: input.targetDate,
              deliveryStatus: calculateDeliveryStatus({
                targetDate: input.targetDate,
                firstSubmittedAt: deliverable.firstSubmittedAt,
                isCancelled: deliverable.workflowState === WorkflowState.CANCELLED,
              }),
            }
          : {}),
        ...(input.shootAssignedToId !== undefined
          ? { shootAssignedToId: input.shootAssignedToId }
          : {}),
        ...(input.shootScheduledDate !== undefined
          ? { shootScheduledDate: input.shootScheduledDate }
          : {}),
        ...(input.shootActualDate !== undefined ? { shootActualDate: input.shootActualDate } : {}),
        ...(input.shootStatus ? { shootStatus: input.shootStatus as StageStatus } : {}),
        ...(input.rawFootageUrl !== undefined ? { rawFootageUrl: input.rawFootageUrl } : {}),
        ...(input.editorAssignedToId !== undefined
          ? { editorAssignedToId: input.editorAssignedToId }
          : {}),
        ...(input.editScheduledDate !== undefined
          ? { editScheduledDate: input.editScheduledDate }
          : {}),
        ...(input.editActualDate !== undefined ? { editActualDate: input.editActualDate } : {}),
        ...(input.editStatus ? { editStatus: input.editStatus as StageStatus } : {}),
        ...(input.approvedVideoUrl !== undefined
          ? { approvedVideoUrl: input.approvedVideoUrl }
          : {}),
        ...(input.postAssignedToId !== undefined
          ? { postAssignedToId: input.postAssignedToId }
          : {}),
        ...(input.postScheduledDate !== undefined
          ? { postScheduledDate: input.postScheduledDate }
          : {}),
        ...(input.postActualDate !== undefined ? { postActualDate: input.postActualDate } : {}),
        ...(input.postStatus ? { postStatus: input.postStatus as StageStatus } : {}),
        ...(input.livePostUrl !== undefined ? { livePostUrl: input.livePostUrl } : {}),
      },
    });

    await auditService.log({
      userId: operatorId,
      jobId: deliverable.jobId,
      action: AuditAction.UPDATE,
      entityType: "DELIVERABLE_TRACKER",
      entityId: deliverable.id,
      details: {
        shootAssignedToId: input.shootAssignedToId,
        editorAssignedToId: input.editorAssignedToId,
        postAssignedToId: input.postAssignedToId,
        livePostUrl: input.livePostUrl,
      },
    });

    return updated;
  }

  /**
   * Cancels a deliverable with an explicit audit reason.
   */
  async cancelDeliverable(operatorId: string, deliverableId: string, reason: string) {
    const updated = await db.deliverable.update({
      where: { id: deliverableId },
      data: {
        workflowState: WorkflowState.CANCELLED,
        deliveryStatus: DeliveryPerformanceStatus.CANCELLED,
        status: StageStatus.CANCELLED,
        cancellationReason: reason,
      },
    });

    await auditService.log({
      userId: operatorId,
      jobId: updated.jobId,
      action: AuditAction.UPDATE,
      entityType: "DELIVERABLE",
      entityId: updated.id,
      details: { action: "CANCELLED", reason },
    });

    return updated;
  }
}

export const deliverableService = new DeliverableService();

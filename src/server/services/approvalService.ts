import { db } from "@/server/db/client";
import { auditService } from "@/server/audit/auditService";
import { AuditAction, ApprovalStatus, TaskAssignmentStatus } from "@prisma/client";
import type { ApprovalReviewInput, PerformanceRatingInput } from "@/validations/approval";

export class ApprovalService {
  async submitReview(reviewerId: string, input: ApprovalReviewInput) {
    return db.$transaction(async (tx) => {
      const review = await tx.approvalReview.create({
        data: {
          deliverableId: input.deliverableId || null,
          taskId: input.taskId || null,
          submissionId: input.submissionId || null,
          reviewerId,
          status: input.status as ApprovalStatus,
          publicFeedback: input.publicFeedback || null,
          privateNotes: input.privateNotes || null,
        },
      });

      // If associated with a task, update task status accordingly
      if (input.taskId) {
        const nextStatus =
          input.status === ApprovalStatus.APPROVED
            ? TaskAssignmentStatus.COMPLETED
            : input.status === ApprovalStatus.REVISION_REQUESTED
              ? TaskAssignmentStatus.REVISION_REQUESTED
              : TaskAssignmentStatus.IN_PROGRESS;

        await tx.taskAssignment.update({
          where: { id: input.taskId },
          data: {
            status: nextStatus,
            completedAt: input.status === ApprovalStatus.APPROVED ? new Date() : null,
          },
        });
      }

      await auditService.log({
        userId: reviewerId,
        action:
          input.status === ApprovalStatus.APPROVED
            ? AuditAction.APPROVE
            : input.status === ApprovalStatus.REVISION_REQUESTED
              ? AuditAction.REQUEST_REVISION
              : AuditAction.REJECT,
        entityType: "APPROVAL_REVIEW",
        entityId: review.id,
        details: {
          status: review.status,
          taskId: input.taskId,
          deliverableId: input.deliverableId,
        },
      });

      return review;
    });
  }

  async recordRating(operatorId: string, input: PerformanceRatingInput) {
    const rating = await db.performanceRating.create({
      data: {
        deliverableId: input.deliverableId,
        givenById: operatorId,
        receivedById: input.receivedById,
        stars: input.stars,
        feedback: input.feedback || null,
        isManagerNote: input.isManagerNote ?? false,
      },
    });

    await auditService.log({
      userId: operatorId,
      action: AuditAction.REVIEW,
      entityType: "PERFORMANCE_RATING",
      entityId: rating.id,
      details: { stars: rating.stars, receivedById: rating.receivedById },
    });

    return rating;
  }
}

export const approvalService = new ApprovalService();

import { db } from "@/server/db/client";
import { auditService } from "@/server/audit/auditService";
import {
  ApprovalStatus,
  AuditAction,
  TaskAssignmentStatus,
  WorkflowState,
} from "@prisma/client";
import type { ApprovalReviewInput, PerformanceRatingInput } from "@/validations/approval";
import { calculateDeliveryStatus } from "@/lib/dates";

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

      let jobIdForAudit: string | null = null;

      // Update Deliverable if linked
      if (input.deliverableId) {
        const deliverable = await tx.deliverable.findUnique({
          where: { id: input.deliverableId },
          include: { job: { select: { id: true, title: true, ownerId: true } } },
        });

        if (deliverable) {
          jobIdForAudit = deliverable.jobId;

          const nextWorkflowState =
            input.status === ApprovalStatus.APPROVED
              ? WorkflowState.APPROVED
              : input.status === ApprovalStatus.REVISION_REQUESTED
              ? WorkflowState.REVISION_REQUESTED
              : WorkflowState.UNDER_REVIEW;

          // Preserve initial timeliness using firstSubmittedAt
          const deliveryStatus = calculateDeliveryStatus({
            targetDate: deliverable.targetDate,
            firstSubmittedAt: deliverable.firstSubmittedAt,
            isCancelled: deliverable.workflowState === WorkflowState.CANCELLED,
          });

          await tx.deliverable.update({
            where: { id: deliverable.id },
            data: {
              approvalStatus: input.status as ApprovalStatus,
              workflowState: nextWorkflowState,
              deliveryStatus,
              completedAt: input.status === ApprovalStatus.APPROVED ? new Date() : null,
            },
          });

          const recipientId = deliverable.assignedToId || deliverable.job.ownerId;

          // Save 1-5 star rating if provided
          if (input.stars && recipientId) {
            await tx.performanceRating.create({
              data: {
                deliverableId: deliverable.id,
                givenById: reviewerId,
                receivedById: recipientId,
                stars: input.stars,
                feedback: input.publicFeedback || null,
                isManagerNote: false,
              },
            });
          }

          if (recipientId) {
            await tx.notification.create({
              data: {
                userId: recipientId,
                title: `Review Update: ${deliverable.title}`,
                message: `Your deliverable "${deliverable.title}" (${deliverable.job.title}) was marked ${input.status.replace(/_/g, " ")}.`,
                link: `/my-work`,
              },
            });
          }
        }
      }

      // If associated with a TaskAssignment, update task status
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

      return { review, jobIdForAudit };
    }, { timeout: 15000, maxWait: 5000 }).then(async ({ review, jobIdForAudit }) => {
      await auditService.log({
        userId: reviewerId,
        jobId: jobIdForAudit,
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
          stars: input.stars ?? null,
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

import { db } from "@/server/db/client";
import { auditService } from "@/server/audit/auditService";
import {
  ApprovalStatus,
  AuditAction,
  TaskAssignmentStatus,
  UserRole,
  UserStatus,
  WorkflowState,
} from "@prisma/client";
import type { ApprovalReviewInput, PerformanceRatingInput } from "@/validations/approval";
import { calculateDeliveryStatus } from "@/lib/dates";

export class ApprovalService {
  async submitReview(
    reviewerId: string,
    input: ApprovalReviewInput,
    reviewerRole?: UserRole
  ) {
    return db.$transaction(async (tx) => {
      const effectiveRole =
        reviewerRole ??
        (
          await tx.user.findUnique({
            where: { id: reviewerId },
            select: { role: true },
          })
        )?.role ??
        UserRole.TEAM_LEAD;

      const isMainManager = effectiveRole === UserRole.MAIN_MANAGER;

      if (input.stars != null && !isMainManager) {
        throw new Error("Only the Main Manager can rate deliverables.");
      }

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
          include: {
            job: { select: { id: true, title: true, ownerId: true } },
            submissions: { select: { id: true }, take: 1 },
          },
        });

        if (deliverable) {
          const hasSubmissionOrOutput =
            deliverable.submissions.length > 0 ||
            Boolean(deliverable.rawFootageUrl) ||
            Boolean(deliverable.approvedVideoUrl) ||
            Boolean(deliverable.googleDriveUrl) ||
            Boolean(deliverable.livePostUrl) ||
            deliverable.workflowState === WorkflowState.SUBMITTED ||
            deliverable.workflowState === WorkflowState.UNDER_REVIEW ||
            deliverable.workflowState === WorkflowState.APPROVED;

          if (!hasSubmissionOrOutput) {
            throw new Error(
              "Review or approval is not available until the assigned person has submitted work."
            );
          }

          jobIdForAudit = deliverable.jobId;

          const nextWorkflowState =
            input.status === ApprovalStatus.APPROVED
              ? isMainManager
                ? WorkflowState.APPROVED
                : WorkflowState.UNDER_REVIEW
              : input.status === ApprovalStatus.REVISION_REQUESTED
              ? WorkflowState.REVISION_REQUESTED
              : WorkflowState.UNDER_REVIEW;

          const nextApprovalStatus =
            input.status === ApprovalStatus.APPROVED && !isMainManager
              ? ApprovalStatus.PENDING_REVIEW
              : (input.status as ApprovalStatus);

          // Preserve initial timeliness using firstSubmittedAt
          const deliveryStatus = calculateDeliveryStatus({
            targetDate: deliverable.targetDate,
            firstSubmittedAt: deliverable.firstSubmittedAt,
            isCancelled: deliverable.workflowState === WorkflowState.CANCELLED,
          });

          await tx.deliverable.update({
            where: { id: deliverable.id },
            data: {
              approvalStatus: nextApprovalStatus,
              workflowState: nextWorkflowState,
              deliveryStatus,
              completedAt:
                input.status === ApprovalStatus.APPROVED && isMainManager ? new Date() : null,
            },
          });

          const recipientId = deliverable.assignedToId || deliverable.job.ownerId;

          // Only Main Manager can create or edit 1-5 star rating
          if (isMainManager && input.stars != null && recipientId) {
            const existingRating = await tx.performanceRating.findFirst({
              where: { deliverableId: deliverable.id, givenById: reviewerId },
              orderBy: { createdAt: "desc" },
            });

            if (existingRating) {
              await tx.performanceRating.update({
                where: { id: existingRating.id },
                data: {
                  stars: input.stars,
                  feedback: input.publicFeedback ?? existingRating.feedback,
                },
              });
            } else {
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
          }

          if (recipientId) {
            const statusText =
              input.status === ApprovalStatus.APPROVED && !isMainManager
                ? "approved by Team Lead (awaiting Main Manager final approval & rating)"
                : `marked ${input.status.replace(/_/g, " ")}`;

            await tx.notification.create({
              data: {
                userId: recipientId,
                title: `Review Update: ${deliverable.title}`,
                message: `Your deliverable "${deliverable.title}" (${deliverable.job.title}) was ${statusText}.`,
                link: `/jobs/${deliverable.jobId}`,
              },
            });
          }

          // When Team Lead approves, notify Main Manager(s) that it is ready for final approval & rating
          if (input.status === ApprovalStatus.APPROVED && !isMainManager) {
            const managers = await tx.user.findMany({
              where: { role: UserRole.MAIN_MANAGER, status: UserStatus.ACTIVE },
              select: { id: true },
            });

            if (managers.length > 0) {
              await tx.notification.createMany({
                data: managers.map((mgr) => ({
                  userId: mgr.id,
                  title: `Ready for Final Approval & Rating: ${deliverable.title}`,
                  message: `Team Lead approved "${deliverable.title}" (${deliverable.job.title}). Please review and award rating.`,
                  link: `/jobs/${deliverable.jobId}`,
                })),
              });
            }
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

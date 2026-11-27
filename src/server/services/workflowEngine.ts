import {
  ApprovalStatus,
  AuditAction,
  DeliverableType,
  StageStatus,
  UserRole,
  WorkflowState,
} from "@prisma/client";
import { db } from "@/server/db/client";
import { auditService } from "@/server/audit/auditService";
import { calculateDeliveryStatus } from "@/lib/dates";
import type { SessionUser } from "@/types/auth";

export type Phase3WorkflowType =
  | "OFFLINE_DESIGN"
  | "RUHI_VIDEO"
  | "YASHPREET_VIDEO"
  | "PHOTOGRAPHY"
  | "CINEMATOGRAPHY"
  | "SOCIAL_PUBLISHING"
  | "INSTALLATION";

export interface StageBlueprint {
  stageKey: string;
  name: string;
  stageOrder: number;
  requiresApproval: boolean;
}

export const WORKFLOW_BLUEPRINTS: Record<Phase3WorkflowType, StageBlueprint[]> = {
  OFFLINE_DESIGN: [
    { stageKey: "DESIGN_DRAFT", name: "Design Draft", stageOrder: 1, requiresApproval: true },
    { stageKey: "PROOFREADING", name: "Mandeep Proofreading", stageOrder: 2, requiresApproval: true },
    { stageKey: "HEAD_REVIEW", name: "Navneet Review", stageOrder: 3, requiresApproval: true },
    { stageKey: "FINAL_APPROVAL", name: "Deepak Final Approval", stageOrder: 4, requiresApproval: true },
    { stageKey: "INSTALLATION", name: "Venue Installation", stageOrder: 5, requiresApproval: false },
  ],
  RUHI_VIDEO: [
    { stageKey: "CINEMATOGRAPHY", name: "Cinematography (Sarvjeet)", stageOrder: 1, requiresApproval: false },
    { stageKey: "VIDEO_EDITING", name: "Video Editing (Vishal Tyagi)", stageOrder: 2, requiresApproval: true },
    { stageKey: "LEAD_REVIEW", name: "Ruhi Review", stageOrder: 3, requiresApproval: true },
    { stageKey: "FINAL_APPROVAL", name: "Deepak Final Approval", stageOrder: 4, requiresApproval: true },
  ],
  YASHPREET_VIDEO: [
    { stageKey: "CINEMATOGRAPHY", name: "Source Footage", stageOrder: 1, requiresApproval: false },
    { stageKey: "VIDEO_EDITING", name: "Video Editing (Aashish)", stageOrder: 2, requiresApproval: true },
    { stageKey: "HEAD_REVIEW", name: "Yashpreet Review", stageOrder: 3, requiresApproval: true },
    { stageKey: "FINAL_APPROVAL", name: "Deepak Final Approval", stageOrder: 4, requiresApproval: true },
  ],
  PHOTOGRAPHY: [
    { stageKey: "PHOTOGRAPHY", name: "Photography (Hardik)", stageOrder: 1, requiresApproval: false },
  ],
  CINEMATOGRAPHY: [
    { stageKey: "CINEMATOGRAPHY", name: "Cinematography (Sarvjeet)", stageOrder: 1, requiresApproval: false },
  ],
  SOCIAL_PUBLISHING: [
    { stageKey: "PROOFREADING", name: "Content Proofreading (Mandeep)", stageOrder: 1, requiresApproval: true },
    { stageKey: "FINAL_APPROVAL", name: "Deepak Final Approval", stageOrder: 2, requiresApproval: true },
    { stageKey: "PUBLISHING", name: "Social Media Publishing (Kajal)", stageOrder: 3, requiresApproval: false },
  ],
  INSTALLATION: [
    { stageKey: "INSTALLATION", name: "Venue Installation (Ankit / Anup)", stageOrder: 1, requiresApproval: false },
  ],
};

export function inferWorkflowType(deliverableType: DeliverableType): Phase3WorkflowType {
  switch (deliverableType) {
    case DeliverableType.CONTENT_MOCKUP:
    case DeliverableType.APPROVED_DESIGN:
    case DeliverableType.PRINT_ORDER_DBMS:
    case DeliverableType.PACK_UPS:
      return "OFFLINE_DESIGN";
    case DeliverableType.SUPPLY_INSTALL:
      return "INSTALLATION";
    case DeliverableType.PHOTOGRAPHY_CLASS:
      return "PHOTOGRAPHY";
    case DeliverableType.PHOTO_POST:
      return "SOCIAL_PUBLISHING";
    case DeliverableType.BYTE_REEL:
    case DeliverableType.STANDARD_REEL:
    case DeliverableType.CHRONOLOGICAL_VIDEO:
    case DeliverableType.PRE_EVENT_PROMO_REEL:
    case DeliverableType.SCRIPTED_CINEMATIC_REEL_VIDEO:
      return "RUHI_VIDEO";
    default:
      return "SOCIAL_PUBLISHING";
  }
}

export class WorkflowEngine {
  /**
   * Checks whether an actor can assign tasks to a target user via primary reporting,
   * secondary reporting (e.g. Hardik under Ruhi), or active team leadership.
   */
  async canAssignToUser(actor: SessionUser, targetUserId: string): Promise<boolean> {
    if (actor.role === UserRole.MAIN_MANAGER) return true;

    const target = await db.user.findUnique({
      where: { id: targetUserId },
      select: {
        status: true,
        managerId: true,
        secondaryManagerId: true,
        teamMemberships: {
          where: { status: "ACTIVE" },
          select: {
            membershipType: true,
            team: { select: { leadId: true } },
          },
        },
      },
    });

    if (!target || target.status !== "ACTIVE") return false;
    if (target.managerId === actor.id || target.secondaryManagerId === actor.id) {
      return true;
    }

    // Team lead can assign to PRIMARY or SHARED members of their led team (not REVIEWER-only Mandeep)
    return target.teamMemberships.some(
      (m) => m.team.leadId === actor.id && m.membershipType !== "REVIEWER"
    );
  }

  /**
   * Assigns a specific workflow stage to an employee, preserving assignedById
   * and enforcing dependency gates (e.g. Aashish editing requires raw footage unless overridden;
   * Kajal publishing requires Deepak final approval).
   */
  async assignStage(params: {
    actor: SessionUser;
    deliverableId: string;
    stageKey: string;
    assigneeId: string;
    dueDate?: Date | null;
    overrideDependency?: boolean;
  }) {
    const { actor, deliverableId, stageKey, assigneeId, dueDate, overrideDependency } = params;

    const deliverable = await db.deliverable.findUnique({
      where: { id: deliverableId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            ownerId: true,
            assignedDeputyId: true,
            team: { select: { leadId: true } },
          },
        },
        stages: { orderBy: { stageOrder: "asc" } },
      },
    });

    if (!deliverable) throw new Error("Deliverable not found");

    const canAssignDirect =
      actor.role === UserRole.TEAM_LEAD ? await this.canAssignToUser(actor, assigneeId) : false;

    const isAuthorizedManager =
      actor.role === UserRole.MAIN_MANAGER ||
      actor.role === UserRole.DEPUTY_MANAGER ||
      deliverable.job.ownerId === actor.id ||
      deliverable.job.assignedDeputyId === actor.id ||
      deliverable.job.team?.leadId === actor.id ||
      canAssignDirect;

    if (!isAuthorizedManager) {
      throw new Error("Access denied: You are not authorized to assign stages on this deliverable.");
    }

    // Mandeep proofreading assignment is allowed for Navneet/Deepak on offline design or social workflows
    if (stageKey !== "PROOFREADING") {
      const canAssign = await this.canAssignToUser(actor, assigneeId);
      if (!canAssign) {
        throw new Error("Access denied: Selected employee is not in your reporting or shared delegation scope.");
      }
    }

    // Dependency gate: Yashpreet Video Editing (Aashish) requires raw footage unless overridden
    if (
      stageKey === "VIDEO_EDITING" &&
      deliverable.workflowType === "YASHPREET_VIDEO" &&
      !deliverable.rawFootageUrl &&
      !overrideDependency
    ) {
      throw new Error(
        "Raw footage must be uploaded before assigning/starting editing unless manager explicitly overrides."
      );
    }

    // Dependency gate: Kajal Social Publishing requires Deepak final approval
    if (stageKey === "PUBLISHING" && deliverable.approvalStatus !== ApprovalStatus.APPROVED) {
      throw new Error(
        "Publishing cannot be assigned as ready before Deepak's final approval is completed."
      );
    }

    return db.$transaction(async (tx) => {
      const existingStage = deliverable.stages.find((s) => s.stageKey === stageKey);
      const stage = existingStage
        ? await tx.deliverableStage.update({
            where: { id: existingStage.id },
            data: {
              responsibleUserId: assigneeId,
              assignedById: actor.id,
              targetDate: dueDate ?? existingStage.targetDate,
              status: StageStatus.IN_PROGRESS,
            },
          })
        : await tx.deliverableStage.create({
            data: {
              deliverableId,
              stageKey,
              name: stageKey.replace(/_/g, " "),
              stageOrder: deliverable.stages.length + 1,
              requiresApproval: !["PHOTOGRAPHY", "CINEMATOGRAPHY", "INSTALLATION", "PUBLISHING"].includes(
                stageKey
              ),
              responsibleUserId: assigneeId,
              assignedById: actor.id,
              targetDate: dueDate ?? deliverable.targetDate,
              status: StageStatus.IN_PROGRESS,
            },
          });

      // Mirror key stage fields on Deliverable for fast dashboard queries
      const deliverableUpdate: Record<string, unknown> = {};
      if (stageKey === "CINEMATOGRAPHY" || stageKey === "PHOTOGRAPHY") {
        deliverableUpdate.shootAssignedToId = assigneeId;
        if (dueDate) deliverableUpdate.shootScheduledDate = dueDate;
        deliverableUpdate.shootStatus = StageStatus.IN_PROGRESS;
      } else if (stageKey === "VIDEO_EDITING") {
        deliverableUpdate.editorAssignedToId = assigneeId;
        if (dueDate) deliverableUpdate.editScheduledDate = dueDate;
        deliverableUpdate.editStatus = StageStatus.IN_PROGRESS;
      } else if (stageKey === "PUBLISHING") {
        deliverableUpdate.postAssignedToId = assigneeId;
        if (dueDate) deliverableUpdate.postScheduledDate = dueDate;
        deliverableUpdate.postStatus = StageStatus.IN_PROGRESS;
      } else if (stageKey === "PROOFREADING") {
        deliverableUpdate.proofreadAssignedToId = assigneeId;
        deliverableUpdate.proofreadStatus = ApprovalStatus.PENDING_REVIEW;
      } else if (stageKey === "INSTALLATION") {
        deliverableUpdate.fitterAssignedToId = assigneeId;
        if (dueDate) deliverableUpdate.installScheduledDate = dueDate;
        deliverableUpdate.installStatus = StageStatus.IN_PROGRESS;
      } else if (stageKey === "DESIGN_DRAFT") {
        deliverableUpdate.assignedToId = assigneeId;
        if (dueDate) deliverableUpdate.targetDate = dueDate;
      }

      if (Object.keys(deliverableUpdate).length > 0) {
        await tx.deliverable.update({
          where: { id: deliverableId },
          data: deliverableUpdate,
        });
      }

      await tx.notification.create({
        data: {
          userId: assigneeId,
          title: `New ${stageKey.replace(/_/g, " ")} Assignment`,
          message: `${actor.fullName} assigned you "${deliverable.title}" (${deliverable.job.title}).`,
          link: `/jobs/${deliverable.jobId}`,
        },
      });

      return { stage, jobId: deliverable.jobId };
    }).then(async ({ stage, jobId }) => {
      await auditService.log({
        userId: actor.id,
        jobId,
        action: AuditAction.ASSIGN,
        entityType: "STAGE_ASSIGNMENT",
        entityId: stage.id,
        details: {
          deliverableId,
          stageKey,
          assignedById: actor.id,
          assignedToId: assigneeId,
        },
      });
      return stage;
    });
  }

  /**
   * Submits work for a specific stage (Photography, Cinematography, Design, Editing, Installation, Publishing).
   * Photography, Cinematography, and Installation complete without mandatory approval.
   */
  async submitStageOutput(params: {
    actor: SessionUser;
    deliverableId: string;
    stageKey: string;
    url?: string | null;
    actualDate?: Date | null;
    socialPlatform?: string | null;
    notes?: string | null;
  }) {
    const { actor, deliverableId, stageKey, url, actualDate, socialPlatform, notes } = params;

    const deliverable = await db.deliverable.findUnique({
      where: { id: deliverableId },
      include: {
        job: { select: { id: true, title: true, ownerId: true, assignedDeputyId: true } },
        stages: { orderBy: { stageOrder: "asc" } },
        submissions: { orderBy: { version: "desc" }, take: 1 },
      },
    });

    if (!deliverable) throw new Error("Deliverable not found");

    const stage = deliverable.stages.find((s) => s.stageKey === stageKey);
    const isAssigned =
      stage?.responsibleUserId === actor.id ||
      (stageKey === "DESIGN_DRAFT" && deliverable.assignedToId === actor.id) ||
      ((stageKey === "PHOTOGRAPHY" || stageKey === "CINEMATOGRAPHY") &&
        deliverable.shootAssignedToId === actor.id) ||
      (stageKey === "VIDEO_EDITING" && deliverable.editorAssignedToId === actor.id) ||
      (stageKey === "PUBLISHING" && deliverable.postAssignedToId === actor.id) ||
      (stageKey === "INSTALLATION" && deliverable.fitterAssignedToId === actor.id);

    if (!isAssigned && actor.role !== UserRole.MAIN_MANAGER) {
      throw new Error("Access denied: You are not assigned to this workflow stage.");
    }

    if (stageKey === "PUBLISHING" && deliverable.approvalStatus !== ApprovalStatus.APPROVED) {
      throw new Error("Content must be approved by Deepak before it can be marked published.");
    }

    if (stageKey === "PUBLISHING" && !url?.trim()) {
      throw new Error("A live post URL is required to complete social media publishing.");
    }

    const now = actualDate ?? new Date();
    const nextVersion = (deliverable.submissions[0]?.version ?? 0) + 1;
    const isDirectCompletion = ["PHOTOGRAPHY", "CINEMATOGRAPHY", "INSTALLATION", "PUBLISHING"].includes(
      stageKey
    );

    const firstSubmittedAt = deliverable.firstSubmittedAt ?? now;
    const computedDeliveryStatus = calculateDeliveryStatus({
      targetDate: deliverable.targetDate,
      firstSubmittedAt,
      isCancelled: deliverable.workflowState === WorkflowState.CANCELLED,
    });

    const stagePerformance =
      stage?.targetDate && now > stage.targetDate
        ? StageStatus.LATE_COMPLETED
        : StageStatus.COMPLETED_ON_TIME;

    return db.$transaction(async (tx) => {
      const submission = await tx.workSubmission.create({
        data: {
          deliverableId,
          stageId: stage?.id ?? null,
          submittedById: actor.id,
          version: nextVersion,
          submissionUrl: url?.trim() || null,
          notes: notes?.trim() || null,
          submittedAt: now,
        },
      });

      if (stage) {
        await tx.deliverableStage.update({
          where: { id: stage.id },
          data: {
            status: stagePerformance,
            driveUrl: url?.trim() || stage.driveUrl,
            completedAt: now,
            approvalStatus: isDirectCompletion
              ? ApprovalStatus.NOT_INITIATED
              : ApprovalStatus.PENDING_REVIEW,
          },
        });
      }

      const updateData: Record<string, unknown> = {
        firstSubmittedAt,
        deliveryStatus: computedDeliveryStatus,
      };

      if (stageKey === "PHOTOGRAPHY") {
        updateData.rawFootageUrl = url?.trim() || deliverable.rawFootageUrl;
        updateData.shootActualDate = now;
        updateData.shootStatus = stagePerformance;
        // Photography does NOT require mandatory approval
        updateData.workflowState = WorkflowState.COMPLETED;
        updateData.completedAt = now;
      } else if (stageKey === "CINEMATOGRAPHY") {
        updateData.rawFootageUrl = url?.trim() || deliverable.rawFootageUrl;
        updateData.shootActualDate = now;
        updateData.shootStatus = stagePerformance;
        // Cinematography output does NOT require mandatory approval
        if (deliverable.workflowType === "CINEMATOGRAPHY") {
          updateData.workflowState = WorkflowState.COMPLETED;
          updateData.completedAt = now;
        }
      } else if (stageKey === "VIDEO_EDITING") {
        updateData.approvedVideoUrl = url?.trim() || deliverable.approvedVideoUrl;
        updateData.editActualDate = now;
        updateData.editStatus = stagePerformance;
        updateData.workflowState = WorkflowState.SUBMITTED;
        updateData.approvalStatus = ApprovalStatus.PENDING_REVIEW;
      } else if (stageKey === "DESIGN_DRAFT") {
        updateData.googleDriveUrl = url?.trim() || deliverable.googleDriveUrl;
        updateData.workflowState = WorkflowState.SUBMITTED;
        updateData.approvalStatus = ApprovalStatus.PENDING_REVIEW;
        updateData.proofreadStatus = ApprovalStatus.PENDING_REVIEW;
      } else if (stageKey === "INSTALLATION") {
        updateData.installProofUrl = url?.trim() || deliverable.installProofUrl;
        updateData.installActualDate = now;
        updateData.installStatus = stagePerformance;
        updateData.workflowState = WorkflowState.COMPLETED;
        updateData.completedAt = now;
      } else if (stageKey === "PUBLISHING") {
        updateData.livePostUrl = url?.trim() || deliverable.livePostUrl;
        updateData.postActualDate = now;
        updateData.postStatus = stagePerformance;
        if (socialPlatform) updateData.socialPlatform = socialPlatform;
        updateData.workflowState = WorkflowState.PUBLISHED;
        updateData.completedAt = now;
      }

      await tx.deliverable.update({
        where: { id: deliverableId },
        data: updateData,
      });

      const notifyUserId = stage?.assignedById || deliverable.job.ownerId || deliverable.job.assignedDeputyId;
      if (notifyUserId && notifyUserId !== actor.id) {
        await tx.notification.create({
          data: {
            userId: notifyUserId,
            title: `${stageKey.replace(/_/g, " ")} Submitted`,
            message: `${actor.fullName} submitted "${deliverable.title}" (${deliverable.job.title}).`,
            link: `/jobs/${deliverable.jobId}`,
          },
        });
      }

      return { submission, jobId: deliverable.jobId };
    }).then(async ({ submission, jobId }) => {
      await auditService.log({
        userId: actor.id,
        jobId,
        action: AuditAction.SUBMIT,
        entityType: "WORK_SUBMISSION",
        entityId: submission.id,
        details: { deliverableId, stageKey, version: submission.version },
      });
      return submission;
    });
  }

  /**
   * Sequential approval enforcement:
   * - Never allows self-approval.
   * - Enforces stage order (e.g. Mandeep -> Navneet -> Deepak for OFFLINE_DESIGN;
   *   Ruhi/Yashpreet -> Deepak for edited video).
   * - Records previousStatus on ApprovalReview.
   */
  async reviewSequentialStage(params: {
    actor: SessionUser;
    deliverableId: string;
    stageKey: string;
    decision: ApprovalStatus;
    comments?: string | null;
    privateNotes?: string | null;
    stars?: number | null;
  }) {
    const { actor, deliverableId, stageKey, decision, comments, privateNotes, stars } = params;

    if (stars != null && actor.role !== UserRole.MAIN_MANAGER) {
      throw new Error("Only the Main Manager (Deepak) can award or edit 1-5 star ratings.");
    }

    const deliverable = await db.deliverable.findUnique({
      where: { id: deliverableId },
      include: {
        job: { select: { id: true, title: true, ownerId: true, assignedDeputyId: true } },
        stages: { orderBy: { stageOrder: "asc" } },
        submissions: { orderBy: { submittedAt: "desc" }, take: 1 },
      },
    });

    if (!deliverable) throw new Error("Deliverable not found");

    const latestSubmission = deliverable.submissions[0];
    if (latestSubmission && latestSubmission.submittedById === actor.id) {
      throw new Error("Self-approval is not allowed: You cannot approve your own submission.");
    }

    const stage = deliverable.stages.find((s) => s.stageKey === stageKey);

    // Sequential gate checks
    if (stageKey === "HEAD_REVIEW" && deliverable.workflowType === "OFFLINE_DESIGN") {
      if (deliverable.proofreadStatus !== ApprovalStatus.APPROVED) {
        throw new Error("Mandatory proofreading by Mandeep must be approved before Navneet's review.");
      }
    }

    if (stageKey === "FINAL_APPROVAL") {
      if (actor.role !== UserRole.MAIN_MANAGER) {
        throw new Error("Only Deepak (Main Manager) can perform final approval.");
      }
      if (deliverable.workflowType === "OFFLINE_DESIGN") {
        const navneetStage = deliverable.stages.find((s) => s.stageKey === "HEAD_REVIEW");
        if (navneetStage && navneetStage.approvalStatus !== ApprovalStatus.APPROVED) {
          throw new Error("Navneet's review must be approved before Deepak's final approval.");
        }
      }
      if (
        deliverable.workflowType === "RUHI_VIDEO" ||
        deliverable.workflowType === "YASHPREET_VIDEO"
      ) {
        const leadKey = deliverable.workflowType === "RUHI_VIDEO" ? "LEAD_REVIEW" : "HEAD_REVIEW";
        const leadStage = deliverable.stages.find((s) => s.stageKey === leadKey);
        if (leadStage && leadStage.approvalStatus !== ApprovalStatus.APPROVED) {
          throw new Error("Team Lead/Head approval is required before Deepak's final approval.");
        }
      }
    }

    return db.$transaction(async (tx) => {
      const previousStatus = stage?.approvalStatus ?? deliverable.approvalStatus;

      const review = await tx.approvalReview.create({
        data: {
          deliverableId,
          stageId: stage?.id ?? null,
          submissionId: latestSubmission?.id ?? null,
          reviewerId: actor.id,
          status: decision,
          previousStatus,
          publicFeedback: comments?.trim() || null,
          privateNotes: privateNotes?.trim() || null,
        },
      });

      if (stage) {
        await tx.deliverableStage.update({
          where: { id: stage.id },
          data: {
            approvalStatus: decision,
            completedAt: decision === ApprovalStatus.APPROVED ? new Date() : null,
          },
        });
      }

      const deliverableUpdate: Record<string, unknown> = {};
      if (stageKey === "PROOFREADING") {
        deliverableUpdate.proofreadStatus = decision;
        deliverableUpdate.proofreadCompletedAt =
          decision === ApprovalStatus.APPROVED ? new Date() : null;
        deliverableUpdate.workflowState =
          decision === ApprovalStatus.REVISION_REQUESTED
            ? WorkflowState.REVISION_REQUESTED
            : WorkflowState.UNDER_REVIEW;
      } else if (stageKey === "HEAD_REVIEW" || stageKey === "LEAD_REVIEW") {
        deliverableUpdate.workflowState =
          decision === ApprovalStatus.REVISION_REQUESTED
            ? WorkflowState.REVISION_REQUESTED
            : WorkflowState.UNDER_REVIEW;
        deliverableUpdate.approvalStatus =
          decision === ApprovalStatus.APPROVED ? ApprovalStatus.PENDING_REVIEW : decision;
      } else if (stageKey === "FINAL_APPROVAL") {
        deliverableUpdate.approvalStatus = decision;
        deliverableUpdate.workflowState =
          decision === ApprovalStatus.APPROVED
            ? WorkflowState.APPROVED
            : decision === ApprovalStatus.REVISION_REQUESTED
            ? WorkflowState.REVISION_REQUESTED
            : WorkflowState.UNDER_REVIEW;
        deliverableUpdate.completedAt =
          decision === ApprovalStatus.APPROVED ? new Date() : null;
      }

      if (Object.keys(deliverableUpdate).length > 0) {
        await tx.deliverable.update({
          where: { id: deliverableId },
          data: deliverableUpdate,
        });
      }

      const recipientId = deliverable.assignedToId || deliverable.job.ownerId;
      if (actor.role === UserRole.MAIN_MANAGER && stars != null && recipientId) {
        const existingRating = await tx.performanceRating.findFirst({
          where: { deliverableId, givenById: actor.id },
          orderBy: { createdAt: "desc" },
        });
        if (existingRating) {
          await tx.performanceRating.update({
            where: { id: existingRating.id },
            data: { stars, feedback: comments?.trim() || existingRating.feedback },
          });
        } else {
          await tx.performanceRating.create({
            data: {
              deliverableId,
              givenById: actor.id,
              receivedById: recipientId,
              stars,
              feedback: comments?.trim() || null,
            },
          });
        }
      }

      return { review, jobId: deliverable.jobId };
    }).then(async ({ review, jobId }) => {
      await auditService.log({
        userId: actor.id,
        jobId,
        action:
          decision === ApprovalStatus.APPROVED
            ? AuditAction.APPROVE
            : decision === ApprovalStatus.REVISION_REQUESTED
            ? AuditAction.REQUEST_REVISION
            : AuditAction.REJECT,
        entityType: "APPROVAL_REVIEW",
        entityId: review.id,
        details: { deliverableId, stageKey, decision, stars: stars ?? null },
      });
      return review;
    });
  }
}

export const workflowEngine = new WorkflowEngine();

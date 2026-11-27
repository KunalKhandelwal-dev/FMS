import { db } from "@/server/db/client";
import { auditService } from "@/server/audit/auditService";
import { ApprovalStatus, AuditAction, StageStatus } from "@prisma/client";
import type { UpdateBrandingStageInput } from "@/validations/branding";

export class BrandingService {
  async listBrandingJobs() {
    return db.job.findMany({
      where: { jobType: "BRANDING_PRODUCTION" },
      include: {
        owner: { select: { id: true, fullName: true, designation: true } },
        deliverables: {
          include: {
            stages: {
              orderBy: { stageOrder: "asc" },
              include: {
                responsibleUser: { select: { id: true, fullName: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getBrandingJobById(jobId: string) {
    return db.job.findFirst({
      where: { id: jobId, jobType: "BRANDING_PRODUCTION" },
      include: {
        owner: { select: { id: true, fullName: true, email: true, designation: true } },
        createdBy: { select: { id: true, fullName: true } },
        deliverables: {
          include: {
            stages: {
              orderBy: { stageOrder: "asc" },
              include: {
                responsibleUser: { select: { id: true, fullName: true, designation: true } },
              },
            },
          },
        },
      },
    });
  }

  async updateStage(operatorId: string, input: UpdateBrandingStageInput) {
    const stage = await db.deliverableStage.findUnique({
      where: { id: input.stageId },
      include: { deliverable: { select: { jobId: true } } },
    });
    if (!stage) throw new Error("Workflow stage not found");

    const isDone =
      input.status === StageStatus.COMPLETED_ON_TIME ||
      input.status === StageStatus.LATE_COMPLETED;

    const updated = await db.deliverableStage.update({
      where: { id: input.stageId },
      data: {
        ...(input.responsibleUserId !== undefined
          ? { responsibleUserId: input.responsibleUserId }
          : {}),
        status: input.status as StageStatus,
        ...(input.approvalStatus ? { approvalStatus: input.approvalStatus as ApprovalStatus } : {}),
        ...(input.driveUrl !== undefined ? { driveUrl: input.driveUrl } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        completedAt: isDone ? new Date() : null,
      },
    });

    await auditService.log({
      userId: operatorId,
      jobId: stage.deliverable.jobId,
      action: AuditAction.UPDATE,
      entityType: "BRANDING_STAGE",
      entityId: stage.id,
      details: {
        stageName: stage.name,
        status: updated.status,
        responsibleUserId: updated.responsibleUserId,
      },
    });

    return updated;
  }

  async allocateCredits(
    operatorId: string,
    input: {
      deliverableId: string;
      contentCredits?: number | null;
      jobOwnerCredits?: number | null;
      creditsAllocated?: number | null;
    }
  ) {
    return db.$transaction(async (tx) => {
      const deliverable = await tx.deliverable.findUnique({
        where: { id: input.deliverableId },
        include: { job: { select: { id: true, title: true, ownerId: true } } },
      });
      if (!deliverable) throw new Error("Deliverable not found");

      const updated = await tx.deliverable.update({
        where: { id: deliverable.id },
        data: {
          ...(input.contentCredits !== undefined ? { contentCredits: input.contentCredits } : {}),
          ...(input.jobOwnerCredits !== undefined
            ? { jobOwnerCredits: input.jobOwnerCredits }
            : {}),
          ...(input.creditsAllocated !== undefined
            ? { creditsAllocated: input.creditsAllocated }
            : {}),
        },
      });

      if (input.jobOwnerCredits && input.jobOwnerCredits > 0 && deliverable.job.ownerId) {
        await tx.creditLedgerEntry.create({
          data: {
            userId: deliverable.job.ownerId,
            assignedById: operatorId,
            deliverableId: deliverable.id,
            creditType: "JOB_OWNER_CREDITS",
            creditsEarned: input.jobOwnerCredits,
            reason: `Branding Job Owner Credits for "${deliverable.job.title}"`,
            source: deliverable.job.id,
          },
        });
      }

      await auditService.log({
        userId: operatorId,
        jobId: deliverable.job.id,
        action: AuditAction.UPDATE,
        entityType: "BRANDING_CREDITS",
        entityId: deliverable.id,
        details: input,
      });

      return updated;
    });
  }
}

export const brandingService = new BrandingService();


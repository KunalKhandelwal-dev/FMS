import { db } from "@/server/db/client";
import { auditService } from "@/server/audit/auditService";
import {
  AuditAction,
  DeliverableType,
  DeliveryPerformanceStatus,
  JobPriority,
  JobStatus,
  JobType,
  WorkflowState,
} from "@prisma/client";
import type {
  CreateContentJobInput,
  CreateBrandingJobInput,
  UpdateJobInput,
} from "@/validations/job";
import { DELIVERABLE_TYPE_LABELS } from "@/lib/constants";
import { addDays, calculateDeliveryStatus } from "@/lib/dates";

export class JobService {
  /**
   * Transactionally creates a Content Creation Job with multiple deliverables
   * and individual target dates, assigning the accountable Job Owner / Team Lead.
   */
  async createContentJob(creatorId: string, departmentId: string, input: CreateContentJobInput) {
    const result = await db.$transaction(
      async (tx) => {
        const owner = await tx.user.findUnique({
          where: { id: input.ownerId },
          select: {
            id: true,
            fullName: true,
            teamMemberships: { select: { teamId: true }, take: 1 },
          },
        });

        if (!owner) {
          throw new Error("Selected Job Owner does not exist.");
        }

        const job = await tx.job.create({
          data: {
            title: input.title,
            description: input.description || null,
            jobDate: input.jobDate,
            jobType: JobType.CONTENT_CREATION,
            category: input.category,
            priority: input.priority as JobPriority,
            status: JobStatus.ASSIGNED,
            departmentId,
            teamId: owner.teamMemberships[0]?.teamId || null,
            createdById: creatorId,
            ownerId: owner.id,
            targetDate:
              input.deliverables.length > 0
                ? new Date(
                    Math.max(...input.deliverables.map((d) => new Date(d.targetDate).getTime()))
                  )
                : null,
          },
        });

        const createdDeliverables = await Promise.all(
          input.deliverables.map((item) => {
            const defaultTitle =
              item.title && item.title.length > 0
                ? item.title
                : DELIVERABLE_TYPE_LABELS[item.deliverableType] || item.deliverableType;

            return tx.deliverable.create({
              data: {
                jobId: job.id,
                title: defaultTitle,
                deliverableType: item.deliverableType as DeliverableType,
                assignedToId: owner.id,
                targetDate: item.targetDate,
                workflowState: WorkflowState.ASSIGNED,
                deliveryStatus: calculateDeliveryStatus({
                  targetDate: item.targetDate,
                  firstSubmittedAt: null,
                }),
              },
            });
          })
        );

        await tx.notification.create({
          data: {
            userId: owner.id,
            title: `New Job Assigned: ${job.title}`,
            message: `You have been assigned as Job Owner for "${job.title}" (${input.category}) with ${createdDeliverables.length} deliverable(s).`,
            link: `/jobs/${job.id}`,
          },
        });

        return { job, deliverables: createdDeliverables, ownerId: owner.id };
      },
      { timeout: 15000, maxWait: 5000 }
    );

    await auditService.log({
      userId: creatorId,
      jobId: result.job.id,
      action: AuditAction.CREATE,
      entityType: "JOB",
      entityId: result.job.id,
      details: {
        title: result.job.title,
        category: result.job.category,
        ownerId: result.ownerId,
        deliverableCount: result.deliverables.length,
      },
    });

    return { job: result.job, deliverables: result.deliverables };
  }

  /**
   * Transactionally creates a Branding & Production Job with its 5 configurable stages.
   */
  async createBrandingJob(creatorId: string, departmentId: string, input: CreateBrandingJobInput) {
    const result = await db.$transaction(
      async (tx) => {
        const owner = await tx.user.findUnique({
          where: { id: input.ownerId },
          select: {
            id: true,
            fullName: true,
            teamMemberships: { select: { teamId: true }, take: 1 },
          },
        });
        if (!owner) {
          throw new Error("Selected Job Owner does not exist.");
        }

        const now = new Date();
        const job = await tx.job.create({
          data: {
            title: input.title,
            description: input.description || null,
            jobDate: now,
            eventDate: input.eventDate,
            venue: input.venue,
            organizer: input.organizer,
            jobType: JobType.BRANDING_PRODUCTION,
            category: "Branding & Production",
            priority: JobPriority.MEDIUM,
            status: JobStatus.ASSIGNED,
            departmentId,
            teamId: owner.teamMemberships[0]?.teamId || null,
            createdById: creatorId,
            ownerId: owner.id,
            targetDate: addDays(now, 4, input.workingDaysOnly),
          },
        });

        const mockupSpecialist = await tx.user.findFirst({
          where: {
            status: "ACTIVE",
            designation: { contains: "Mockup" },
          },
          select: { id: true },
        });

        const deliverable = await tx.deliverable.create({
          data: {
            jobId: job.id,
            title: `${input.title} — Production Deliverable`,
            deliverableType: DeliverableType.CONTENT_MOCKUP,
            assignedToId: owner.id,
            targetDate: addDays(now, 4, input.workingDaysOnly),
            workflowState: WorkflowState.ASSIGNED,
            deliveryStatus: DeliveryPerformanceStatus.PENDING,
          },
        });

        const stageDefinitions = [
          {
            name: "Content / Mockup",
            stageOrder: 1,
            offsetDays: 1,
            responsibleUserId: mockupSpecialist?.id || owner.id,
          },
          {
            name: "Approved Design",
            stageOrder: 2,
            offsetDays: 2,
            responsibleUserId: owner.id,
          },
          {
            name: "Print Orders, Mailing Design, DBMS",
            stageOrder: 3,
            offsetDays: 3,
            responsibleUserId: owner.id,
          },
          {
            name: "Supply & Install",
            stageOrder: 4,
            offsetDays: 4,
            responsibleUserId: owner.id,
          },
          {
            name: "Pack-ups",
            stageOrder: 5,
            offsetDays: 4,
            responsibleUserId: owner.id,
          },
        ];

        await Promise.all(
          stageDefinitions.map((s) =>
            tx.deliverableStage.create({
              data: {
                deliverableId: deliverable.id,
                name: s.name,
                stageOrder: s.stageOrder,
                responsibleUserId: s.responsibleUserId,
                targetDate: addDays(now, s.offsetDays, input.workingDaysOnly),
              },
            })
          )
        );

        return { job, deliverable, ownerId: owner.id };
      },
      { timeout: 15000, maxWait: 5000 }
    );

    await auditService.log({
      userId: creatorId,
      jobId: result.job.id,
      action: AuditAction.CREATE,
      entityType: "BRANDING_JOB",
      entityId: result.job.id,
      details: {
        title: result.job.title,
        venue: result.job.venue,
        organizer: result.job.organizer,
        ownerId: result.ownerId,
        workingDaysOnly: input.workingDaysOnly,
      },
    });

    return { job: result.job, deliverable: result.deliverable };
  }

  async updateJob(operatorId: string, input: UpdateJobInput) {
    const existing = await db.job.findUnique({ where: { id: input.id } });
    if (!existing) throw new Error("Job not found");

    const updated = await db.job.update({
      where: { id: input.id },
      data: {
        ...(input.title ? { title: input.title } : {}),
        ...(input.jobDate ? { jobDate: input.jobDate } : {}),
        ...(input.category ? { category: input.category } : {}),
        ...(input.ownerId ? { ownerId: input.ownerId } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.priority ? { priority: input.priority as JobPriority } : {}),
        ...(input.status ? { status: input.status as JobStatus } : {}),
      },
    });

    await auditService.log({
      userId: operatorId,
      jobId: updated.id,
      action: AuditAction.UPDATE,
      entityType: "JOB",
      entityId: updated.id,
      details: { previous: existing.title, updated: updated.title, status: updated.status },
    });

    return updated;
  }
}

export const jobService = new JobService();

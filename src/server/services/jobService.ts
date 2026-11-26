import { db } from "@/server/db/client";
import { auditService } from "@/server/audit/auditService";
import { AuditAction, JobPriority, JobStatus, JobType } from "@prisma/client";
import type { CreateJobInput } from "@/validations/job";

export class JobService {
  async createJob(creatorId: string, departmentId: string, input: CreateJobInput) {
    return db.$transaction(async (tx) => {
      const job = await tx.job.create({
        data: {
          title: input.title,
          code: input.code || null,
          description: input.description || null,
          jobType: input.jobType as JobType,
          category: input.category || null,
          priority: input.priority as JobPriority,
          status: JobStatus.DRAFT,
          departmentId,
          createdById: creatorId,
          assignedDeputyId: input.assignedDeputyId || null,
          teamId: input.teamId || null,
          eventDate: input.eventDate || null,
          venue: input.venue || null,
          organizer: input.organizer || null,
          targetDate: input.targetDate || null,
        },
      });

      await auditService.log({
        userId: creatorId,
        jobId: job.id,
        action: AuditAction.CREATE,
        entityType: "JOB",
        entityId: job.id,
        details: { title: job.title, jobType: job.jobType },
      });

      return job;
    });
  }

  async assignDeputy(operatorId: string, jobId: string, deputyId: string) {
    const updated = await db.job.update({
      where: { id: jobId },
      data: {
        assignedDeputyId: deputyId,
        status: JobStatus.ASSIGNED,
      },
    });

    await auditService.log({
      userId: operatorId,
      jobId,
      action: AuditAction.ASSIGN,
      entityType: "JOB",
      entityId: jobId,
      details: { assignedDeputyId: deputyId },
    });

    return updated;
  }
}

export const jobService = new JobService();


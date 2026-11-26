import { db } from "@/server/db/client";
import type { JobStatus, JobType } from "@prisma/client";

export class JobRepository {
  async list(filters?: {
    status?: JobStatus;
    jobType?: JobType;
    assignedDeputyId?: string;
    teamId?: string;
  }) {
    return db.job.findMany({
      where: {
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.jobType ? { jobType: filters.jobType } : {}),
        ...(filters?.assignedDeputyId ? { assignedDeputyId: filters.assignedDeputyId } : {}),
        ...(filters?.teamId ? { teamId: filters.teamId } : {}),
      },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
        assignedDeputy: {
          select: { id: true, fullName: true, email: true },
        },
        team: {
          select: { id: true, name: true },
        },
        _count: {
          select: { deliverables: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return db.job.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, fullName: true, email: true } },
        assignedDeputy: { select: { id: true, fullName: true, email: true } },
        team: true,
        deliverables: {
          include: {
            stages: true,
            tasks: {
              include: {
                assignedTo: { select: { id: true, fullName: true } },
              },
            },
            ratings: true,
          },
        },
      },
    });
  }
}

export const jobRepository = new JobRepository();


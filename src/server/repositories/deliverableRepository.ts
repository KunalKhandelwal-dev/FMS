import { db } from "@/server/db/client";
import type { DeliverableType, StageStatus } from "@prisma/client";

export class DeliverableRepository {
  async listByJob(jobId: string) {
    return db.deliverable.findMany({
      where: { jobId },
      include: {
        stages: { orderBy: { stageOrder: "asc" } },
        tasks: {
          include: {
            assignedTo: { select: { id: true, fullName: true } },
          },
        },
        ratings: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async findById(id: string) {
    return db.deliverable.findUnique({
      where: { id },
      include: {
        job: {
          select: { id: true, title: true, assignedDeputyId: true, createdById: true },
        },
        stages: { orderBy: { stageOrder: "asc" } },
        tasks: {
          include: {
            assignedTo: { select: { id: true, fullName: true } },
            submissions: true,
          },
        },
        ratings: {
          include: {
            givenBy: { select: { id: true, fullName: true } },
            receivedBy: { select: { id: true, fullName: true } },
          },
        },
        reviews: {
          include: {
            reviewer: { select: { id: true, fullName: true } },
          },
          orderBy: { reviewedAt: "desc" },
        },
      },
    });
  }
}

export const deliverableRepository = new DeliverableRepository();


import { db } from "@/server/db/client";
import type { TaskAssignmentStatus } from "@prisma/client";

export class TaskRepository {
  async listForUser(userId: string, status?: TaskAssignmentStatus) {
    return db.taskAssignment.findMany({
      where: {
        assignedToId: userId,
        ...(status ? { status } : {}),
      },
      include: {
        assignedBy: { select: { id: true, fullName: true } },
        deliverable: {
          include: {
            job: { select: { id: true, title: true, priority: true } },
          },
        },
        submissions: {
          orderBy: { submittedAt: "desc" },
          take: 1,
        },
      },
      orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
    });
  }

  async findById(id: string) {
    return db.taskAssignment.findUnique({
      where: { id },
      include: {
        assignedBy: { select: { id: true, fullName: true, email: true } },
        assignedTo: { select: { id: true, fullName: true, email: true } },
        deliverable: {
          include: {
            job: true,
          },
        },
        submissions: {
          include: {
            submittedBy: { select: { id: true, fullName: true } },
            reviews: {
              include: {
                reviewer: { select: { id: true, fullName: true } },
              },
            },
          },
          orderBy: { submittedAt: "desc" },
        },
      },
    });
  }
}

export const taskRepository = new TaskRepository();


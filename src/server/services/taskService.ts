import { db } from "@/server/db/client";
import { auditService } from "@/server/audit/auditService";
import { AuditAction, TaskAssignmentStatus } from "@prisma/client";
import type { CreateTaskInput, SubmitWorkInput } from "@/validations/task";

export class TaskService {
  async createTask(assignerId: string, input: CreateTaskInput) {
    const task = await db.taskAssignment.create({
      data: {
        deliverableId: input.deliverableId,
        stageId: input.stageId || null,
        title: input.title,
        instructions: input.instructions || null,
        roleTag: input.roleTag || null,
        assignedById: assignerId,
        assignedToId: input.assignedToId,
        scheduledStartDate: input.scheduledStartDate || null,
        deadline: input.deadline || null,
        status: TaskAssignmentStatus.PENDING,
      },
    });

    await auditService.log({
      userId: assignerId,
      action: AuditAction.ASSIGN,
      entityType: "TASK_ASSIGNMENT",
      entityId: task.id,
      details: {
        assignedToId: task.assignedToId,
        deliverableId: task.deliverableId,
      },
    });

    return task;
  }

  async submitWork(
    userId: string,
    input: SubmitWorkInput,
    fileMetadata?: { filePath: string; fileName: string; sizeBytes: number; mimeType: string }
  ) {
    return db.$transaction(async (tx) => {
      // Find latest version
      const existingCount = await tx.workSubmission.count({
        where: { taskId: input.taskId },
      });

      const submission = await tx.workSubmission.create({
        data: {
          taskId: input.taskId,
          submittedById: userId,
          version: existingCount + 1,
          notes: input.notes || null,
          submissionUrl: input.submissionUrl || null,
          filePath: fileMetadata?.filePath || null,
          fileName: fileMetadata?.fileName || null,
          fileSizeBytes: fileMetadata?.sizeBytes ? BigInt(fileMetadata.sizeBytes) : null,
          mimeType: fileMetadata?.mimeType || null,
        },
      });

      // Update task status to SUBMITTED
      await tx.taskAssignment.update({
        where: { id: input.taskId },
        data: { status: TaskAssignmentStatus.SUBMITTED },
      });

      await auditService.log({
        userId,
        action: AuditAction.SUBMIT,
        entityType: "WORK_SUBMISSION",
        entityId: submission.id,
        details: { taskId: input.taskId, version: submission.version },
      });

      return submission;
    });
  }
}

export const taskService = new TaskService();


import type { TaskAssignmentStatus, ApprovalStatus } from "@prisma/client";

export interface TaskSummary {
  id: string;
  deliverableId: string;
  deliverableTitle: string;
  title: string;
  instructions: string | null;
  roleTag: string | null;
  status: TaskAssignmentStatus;
  assignedByName: string;
  assignedToName: string;
  scheduledStartDate: Date | null;
  actualStartDate: Date | null;
  deadline: Date | null;
  completedAt: Date | null;
  submissionCount: number;
  latestApprovalStatus: ApprovalStatus | null;
}


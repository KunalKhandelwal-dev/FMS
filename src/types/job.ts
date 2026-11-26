import type {
  JobType,
  JobPriority,
  JobStatus,
  DeliverableType,
  StageStatus,
  ApprovalStatus,
} from "@prisma/client";

export interface JobSummary {
  id: string;
  title: string;
  code: string | null;
  jobType: JobType;
  category: string | null;
  priority: JobPriority;
  status: JobStatus;
  venue: string | null;
  organizer: string | null;
  eventDate: Date | null;
  targetDate: Date | null;
  createdByName: string;
  assignedDeputyName: string | null;
  deliverablesCount: number;
  createdAt: Date;
}

export interface DeliverableSummary {
  id: string;
  jobId: string;
  title: string;
  deliverableType: DeliverableType;
  status: StageStatus;
  approvalStatus: ApprovalStatus;
  targetDate: Date | null;
  googleDriveUrl: string | null;
  rawFootageUrl: string | null;
  approvedVideoUrl: string | null;
  livePostUrl: string | null;
}

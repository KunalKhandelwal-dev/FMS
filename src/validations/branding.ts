import { z } from "zod";

export const updateBrandingStageSchema = z.object({
  stageId: z.string().min(1),
  responsibleUserId: z.string().optional().nullable(),
  status: z.enum([
    "NOT_INITIATED",
    "IN_PROGRESS",
    "COMPLETED_ON_TIME",
    "LATE_COMPLETED",
    "NOT_DONE",
    "CANCELLED",
  ]),
  approvalStatus: z
    .enum(["NOT_INITIATED", "PENDING_REVIEW", "APPROVED", "REVISION_REQUESTED", "REJECTED"])
    .optional(),
  driveUrl: z.string().trim().url().optional().or(z.literal("")).nullable(),
  notes: z.string().trim().optional().nullable(),
});

export type UpdateBrandingStageInput = z.infer<typeof updateBrandingStageSchema>;

export const allocateBrandingCreditsSchema = z.object({
  deliverableId: z.string().min(1),
  contentCredits: z.coerce.number().min(0).optional().nullable(),
  jobOwnerCredits: z.coerce.number().min(0).optional().nullable(),
  creditsAllocated: z.coerce.number().min(0).optional().nullable(),
});


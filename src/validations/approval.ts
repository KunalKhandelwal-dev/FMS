import { z } from "zod";

export const approvalReviewSchema = z.object({
  deliverableId: z.string().optional().nullable(),
  taskId: z.string().optional().nullable(),
  submissionId: z.string().optional().nullable(),
  status: z.enum(["APPROVED", "REVISION_REQUESTED", "REJECTED"]),
  stars: z.number().int().min(1).max(5).optional().nullable(),
  publicFeedback: z.string().trim().optional().nullable(),
  privateNotes: z.string().trim().optional().nullable(),
});

export type ApprovalReviewInput = z.infer<typeof approvalReviewSchema>;

export const performanceRatingSchema = z.object({
  deliverableId: z.string().min(1),
  receivedById: z.string().min(1),
  stars: z.number().int().min(1).max(5),
  feedback: z.string().trim().optional().nullable(),
  isManagerNote: z.boolean().default(false),
});

export type PerformanceRatingInput = z.infer<typeof performanceRatingSchema>;

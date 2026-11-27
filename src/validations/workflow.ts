import { z } from "zod";

export const assignWorkflowStageSchema = z.object({
  deliverableId: z.string().min(1),
  stageKey: z.string().min(1),
  assigneeId: z.string().min(1),
  dueDate: z.coerce.date().optional().nullable(),
  overrideDependency: z.boolean().optional(),
});

export type AssignWorkflowStageInput = z.infer<typeof assignWorkflowStageSchema>;

export const submitStageOutputSchema = z.object({
  deliverableId: z.string().min(1),
  stageKey: z.string().min(1),
  url: z.string().trim().url("Please enter a valid URL").optional().or(z.literal("")).nullable(),
  actualDate: z.coerce.date().optional().nullable(),
  socialPlatform: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
});

export type SubmitStageOutputInput = z.infer<typeof submitStageOutputSchema>;

export const reviewSequentialStageSchema = z.object({
  deliverableId: z.string().min(1),
  stageKey: z.string().min(1),
  decision: z.enum(["APPROVED", "REVISION_REQUESTED", "REJECTED"]),
  comments: z.string().trim().optional().nullable(),
  privateNotes: z.string().trim().optional().nullable(),
  stars: z.number().int().min(1).max(5).optional().nullable(),
});

export type ReviewSequentialStageInput = z.infer<typeof reviewSequentialStageSchema>;

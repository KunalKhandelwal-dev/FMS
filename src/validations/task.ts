import { z } from "zod";

export const createTaskSchema = z.object({
  deliverableId: z.string().min(1, "Deliverable is required"),
  stageId: z.string().optional().nullable(),
  title: z.string().trim().min(3, "Task title is required"),
  instructions: z.string().trim().optional().nullable(),
  roleTag: z.string().trim().optional().nullable(), // CAMERAMAN, VIDEO_EDITOR, DESIGNER, etc.
  assignedToId: z.string().min(1, "Assignee is required"),
  scheduledStartDate: z.coerce.date().optional().nullable(),
  deadline: z.coerce.date().optional().nullable(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const submitWorkSchema = z.object({
  taskId: z.string().min(1),
  notes: z.string().trim().optional(),
  submissionUrl: z
    .string()
    .trim()
    .url("Must be a valid URL (e.g. Google Drive link)")
    .optional()
    .or(z.literal("")),
});

export type SubmitWorkInput = z.infer<typeof submitWorkSchema>;

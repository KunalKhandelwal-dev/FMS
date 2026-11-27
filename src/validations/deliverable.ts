import { z } from "zod";

export const createDeliverableSchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  title: z.string().trim().min(2, "Deliverable title is required"),
  description: z.string().trim().optional().nullable(),
  deliverableType: z.enum([
    "PHOTO_POST",
    "BYTE_REEL",
    "STANDARD_REEL",
    "CHRONOLOGICAL_VIDEO",
    "LIVE_STORY",
    "PHOTOGRAPHY_CLASS",
    "PRE_EVENT_PROMO_REEL",
    "SCRIPTED_CINEMATIC_REEL_VIDEO",
    "CONTENT_MOCKUP",
    "APPROVED_DESIGN",
    "PRINT_ORDER_DBMS",
    "SUPPLY_INSTALL",
    "PACK_UPS",
    "OTHER",
  ]),
  assignedToId: z.string().optional().nullable(),
  targetDate: z.coerce.date().optional().nullable(),
  googleDriveUrl: z.string().trim().url().optional().or(z.literal("")).nullable(),
});

export type CreateDeliverableInput = z.infer<typeof createDeliverableSchema>;

export const submitDeliverableWorkSchema = z.object({
  deliverableId: z.string().min(1, "Deliverable ID is required"),
  submissionUrl: z
    .string()
    .trim()
    .url("Please enter a valid URL (e.g. https://drive.google.com/...)")
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().optional(),
});

export type SubmitDeliverableWorkInput = z.infer<typeof submitDeliverableWorkSchema>;

export const updateContentTrackerSchema = z.object({
  deliverableId: z.string().min(1),
  assignedToId: z.string().optional().nullable(),
  targetDate: z.coerce.date().optional().nullable(),

  // Shoot / Cameraman
  shootAssignedToId: z.string().optional().nullable(),
  shootScheduledDate: z.coerce.date().optional().nullable(),
  shootActualDate: z.coerce.date().optional().nullable(),
  shootStatus: z
    .enum([
      "NOT_INITIATED",
      "IN_PROGRESS",
      "COMPLETED_ON_TIME",
      "LATE_COMPLETED",
      "NOT_DONE",
      "CANCELLED",
    ])
    .optional(),
  rawFootageUrl: z.string().trim().url().optional().or(z.literal("")).nullable(),

  // Video Editor
  editorAssignedToId: z.string().optional().nullable(),
  editScheduledDate: z.coerce.date().optional().nullable(),
  editActualDate: z.coerce.date().optional().nullable(),
  editStatus: z
    .enum([
      "NOT_INITIATED",
      "IN_PROGRESS",
      "COMPLETED_ON_TIME",
      "LATE_COMPLETED",
      "NOT_DONE",
      "CANCELLED",
    ])
    .optional(),
  approvedVideoUrl: z.string().trim().url().optional().or(z.literal("")).nullable(),

  // Social Media Publishing
  postAssignedToId: z.string().optional().nullable(),
  postScheduledDate: z.coerce.date().optional().nullable(),
  postActualDate: z.coerce.date().optional().nullable(),
  postStatus: z
    .enum([
      "NOT_INITIATED",
      "IN_PROGRESS",
      "COMPLETED_ON_TIME",
      "LATE_COMPLETED",
      "NOT_DONE",
      "CANCELLED",
    ])
    .optional(),
  livePostUrl: z.string().trim().url().optional().or(z.literal("")).nullable(),
});

export type UpdateContentTrackerInput = z.infer<typeof updateContentTrackerSchema>;

export const cancelDeliverableSchema = z.object({
  deliverableId: z.string().min(1),
  cancellationReason: z
    .string()
    .trim()
    .min(3, "Please provide a reason for cancelling this deliverable"),
});

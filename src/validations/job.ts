import { z } from "zod";
import { JOB_CATEGORIES } from "@/lib/constants";

export const deliverableSelectionSchema = z.object({
  deliverableType: z.enum([
    "PHOTO_POST",
    "BYTE_REEL",
    "STANDARD_REEL",
    "CHRONOLOGICAL_VIDEO",
    "LIVE_STORY",
    "PHOTOGRAPHY_CLASS",
    "PRE_EVENT_PROMO_REEL",
    "SCRIPTED_CINEMATIC_REEL_VIDEO",
  ]),
  targetDate: z.coerce.date({ required_error: "Target date is required for each deliverable" }),
  title: z.string().trim().optional(),
});

export const createContentJobSchema = z.object({
  jobDate: z.coerce.date({ required_error: "Job date is required" }),
  category: z.enum(JOB_CATEGORIES, {
    errorMap: () => ({ message: "Please select a valid Job Type" }),
  }),
  title: z.string().trim().min(2, "Job / Activity Name must be at least 2 characters"),
  ownerId: z.string().min(1, "Please select an accountable Job Owner / Team Lead"),
  description: z.string().trim().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  deliverables: z
    .array(deliverableSelectionSchema)
    .min(1, "Select at least one deliverable with a target date"),
});

export type CreateContentJobInput = z.infer<typeof createContentJobSchema>;

export const updateJobSchema = z.object({
  id: z.string().min(1),
  jobDate: z.coerce.date().optional(),
  category: z.enum(JOB_CATEGORIES).optional(),
  title: z.string().trim().min(2).optional(),
  ownerId: z.string().min(1).optional(),
  description: z.string().trim().optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z
    .enum(["DRAFT", "ASSIGNED", "IN_PROGRESS", "UNDER_REVIEW", "COMPLETED", "CANCELLED", "ON_HOLD"])
    .optional(),
});

export type UpdateJobInput = z.infer<typeof updateJobSchema>;

export const createBrandingJobSchema = z.object({
  title: z.string().trim().min(2, "Job / Event Name is required"),
  eventDate: z.coerce.date({ required_error: "Event date is required" }),
  venue: z.string().trim().min(2, "Venue is required"),
  organizer: z.string().trim().min(2, "Organiser is required"),
  ownerId: z.string().min(1, "Job Owner is required"),
  description: z.string().trim().optional().nullable(),
  workingDaysOnly: z.boolean().default(false),
});

export type CreateBrandingJobInput = z.infer<typeof createBrandingJobSchema>;

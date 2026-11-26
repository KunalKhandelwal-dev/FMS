import { z } from "zod";

export const createJobSchema = z.object({
  title: z.string().trim().min(3, "Job title must be at least 3 characters"),
  code: z.string().trim().optional(),
  description: z.string().trim().optional(),
  jobType: z
    .enum(["CONTENT_CREATION", "BRANDING_PRODUCTION", "CUSTOM"])
    .default("CONTENT_CREATION"),
  category: z.string().trim().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  assignedDeputyId: z.string().optional().nullable(),
  teamId: z.string().optional().nullable(),
  eventDate: z.coerce.date().optional().nullable(),
  venue: z.string().trim().optional().nullable(),
  organizer: z.string().trim().optional().nullable(),
  targetDate: z.coerce.date().optional().nullable(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

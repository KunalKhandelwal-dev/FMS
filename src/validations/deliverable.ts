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
  targetDate: z.coerce.date().optional().nullable(),
  googleDriveUrl: z.string().trim().url().optional().or(z.literal("")).nullable(),
});

export type CreateDeliverableInput = z.infer<typeof createDeliverableSchema>;


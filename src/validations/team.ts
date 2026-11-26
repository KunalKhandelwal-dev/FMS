import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().trim().min(2, "Team name is required"),
  code: z.string().trim().optional(),
  description: z.string().trim().optional(),
  departmentId: z.string().min(1, "Department association is required"),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export const addTeamMemberSchema = z.object({
  teamId: z.string().min(1),
  userId: z.string().min(1),
  teamRole: z.enum(["LEAD", "MEMBER", "SPECIALIST"]).default("MEMBER"),
});

export type AddTeamMemberInput = z.infer<typeof addTeamMemberSchema>;


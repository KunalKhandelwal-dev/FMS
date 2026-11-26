import { z } from "zod";

export const createEmployeeSchema = z.object({
  email: z.string().trim().email("Valid university email required"),
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  employeeCode: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  role: z.enum(["MAIN_MANAGER", "DEPUTY_MANAGER", "TEAM_LEAD", "EMPLOYEE"]).default("EMPLOYEE"),
  managerId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  password: z.string().min(8, "Temporary password must be at least 8 characters"),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = z.object({
  id: z.string(),
  fullName: z.string().trim().min(2).optional(),
  phone: z.string().trim().optional().nullable(),
  managerId: z.string().optional().nullable(),
  role: z.enum(["MAIN_MANAGER", "DEPUTY_MANAGER", "TEAM_LEAD", "EMPLOYEE"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
});

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;


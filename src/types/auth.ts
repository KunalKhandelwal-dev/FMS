import type { UserRole, UserStatus } from "@prisma/client";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  departmentId: string | null;
  employeeCode: string | null;
  avatarUrl: string | null;
}

export interface AuthSession {
  user: SessionUser;
  expires: string;
}

export type RoleName = "MAIN_MANAGER" | "DEPUTY_MANAGER" | "TEAM_LEAD" | "EMPLOYEE";


import type { UserRole, UserStatus, TeamRole } from "@prisma/client";

export interface EmployeeProfile {
  id: string;
  email: string;
  fullName: string;
  employeeCode: string | null;
  role: UserRole;
  status: UserStatus;
  phone: string | null;
  avatarUrl: string | null;
  departmentName: string | null;
  managerName: string | null;
  teamMemberships: {
    teamId: string;
    teamName: string;
    teamRole: TeamRole;
  }[];
  createdAt: Date;
}


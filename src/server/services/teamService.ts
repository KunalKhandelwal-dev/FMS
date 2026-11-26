import { db } from "@/server/db/client";
import { auditService } from "@/server/audit/auditService";
import { AuditAction, TeamRole } from "@prisma/client";
import type { CreateTeamInput, AddTeamMemberInput } from "@/validations/team";

export class TeamService {
  async createTeam(operatorId: string, input: CreateTeamInput) {
    const team = await db.team.create({
      data: {
        name: input.name,
        code: input.code || null,
        description: input.description || null,
        departmentId: input.departmentId,
      },
    });

    await auditService.log({
      userId: operatorId,
      action: AuditAction.CREATE,
      entityType: "TEAM",
      entityId: team.id,
      details: { name: team.name },
    });

    return team;
  }

  async addMember(operatorId: string, input: AddTeamMemberInput) {
    const membership = await db.teamMembership.upsert({
      where: {
        userId_teamId: {
          userId: input.userId,
          teamId: input.teamId,
        },
      },
      update: {
        teamRole: input.teamRole as TeamRole,
      },
      create: {
        userId: input.userId,
        teamId: input.teamId,
        teamRole: input.teamRole as TeamRole,
      },
    });

    await auditService.log({
      userId: operatorId,
      action: AuditAction.ASSIGN,
      entityType: "TEAM_MEMBERSHIP",
      entityId: membership.id,
      details: { teamId: input.teamId, userId: input.userId, role: input.teamRole },
    });

    return membership;
  }
}

export const teamService = new TeamService();


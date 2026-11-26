import { db } from "@/server/db/client";

export class TeamRepository {
  async listByDepartment(departmentId?: string) {
    return db.team.findMany({
      where: departmentId ? { departmentId } : {},
      include: {
        department: true,
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                role: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: { jobs: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  async findById(id: string) {
    return db.team.findUnique({
      where: { id },
      include: {
        department: true,
        memberships: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true, role: true },
            },
          },
        },
      },
    });
  }
}

export const teamRepository = new TeamRepository();


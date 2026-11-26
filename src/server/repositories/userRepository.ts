import { db } from "@/server/db/client";
import type { User, UserRole, UserStatus } from "@prisma/client";

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return db.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string) {
    return db.user.findUnique({
      where: { id },
      include: {
        department: true,
        manager: {
          select: { id: true, fullName: true, email: true },
        },
        teamMemberships: {
          include: { team: true },
        },
      },
    });
  }

  async list(filters?: { role?: UserRole; status?: UserStatus; departmentId?: string }) {
    return db.user.findMany({
      where: {
        ...(filters?.role ? { role: filters.role } : {}),
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.departmentId ? { departmentId: filters.departmentId } : {}),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        employeeCode: true,
        role: true,
        status: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
        manager: {
          select: { id: true, fullName: true },
        },
        teamMemberships: {
          select: {
            teamRole: true,
            team: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { fullName: "asc" },
    });
  }
}

export const userRepository = new UserRepository();


import { ApprovalStatus, StageStatus, UserRole, WorkflowState } from "@prisma/client";
import { db } from "@/server/db/client";
import type { SessionUser } from "@/types/auth";

export type DashboardPersona =
  | "DEEPAK"
  | "NAVNEET"
  | "YASHPREET"
  | "RUHI"
  | "MANDEEP"
  | "DESIGNER"
  | "FITTER"
  | "PHOTOGRAPHER"
  | "CINEMATOGRAPHER"
  | "VIDEO_EDITOR"
  | "SOCIAL_MEDIA";

export async function resolveDashboardPersona(user: SessionUser): Promise<DashboardPersona> {
  if (user.role === UserRole.MAIN_MANAGER) return "DEEPAK";

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: {
      designation: true,
      email: true,
      teamMemberships: {
        where: { status: "ACTIVE", isPrimary: true },
        select: { team: { select: { code: true } } },
      },
    },
  });

  const designation = (dbUser?.designation || "").toLowerCase();
  const teamCode = dbUser?.teamMemberships[0]?.team.code || "";

  if (user.role === UserRole.DEPUTY_MANAGER) {
    if (designation.includes("offline") || teamCode === "TEAM-BRANDING") return "NAVNEET";
    return "YASHPREET";
  }

  if (user.role === UserRole.TEAM_LEAD) return "RUHI";

  if (designation.includes("proofread") || designation.includes("content writer")) return "MANDEEP";
  if (designation.includes("designer")) return "DESIGNER";
  if (designation.includes("fitter")) return "FITTER";
  if (designation.includes("photographer")) return "PHOTOGRAPHER";
  if (designation.includes("cinematographer")) return "CINEMATOGRAPHER";
  if (designation.includes("editor")) return "VIDEO_EDITOR";
  if (designation.includes("social")) return "SOCIAL_MEDIA";

  return "DESIGNER";
}

export async function getRoleDashboardData(user: SessionUser) {
  const persona = await resolveDashboardPersona(user);

  const deliverableInclude = {
    job: {
      select: {
        id: true,
        title: true,
        category: true,
        venue: true,
        eventDate: true,
        jobDate: true,
        owner: { select: { id: true, fullName: true } },
        team: { select: { id: true, name: true, code: true } },
      },
    },
    assignedTo: { select: { id: true, fullName: true } },
    shootAssignedTo: { select: { id: true, fullName: true } },
    editorAssignedTo: { select: { id: true, fullName: true } },
    postAssignedTo: { select: { id: true, fullName: true } },
    proofreadAssignedTo: { select: { id: true, fullName: true } },
    fitterAssignedTo: { select: { id: true, fullName: true } },
    ratings: { orderBy: { createdAt: "desc" as const }, take: 1 },
    submissions: {
      orderBy: { submittedAt: "desc" as const },
      take: 3,
      include: { submittedBy: { select: { id: true, fullName: true } } },
    },
    reviews: {
      orderBy: { reviewedAt: "desc" as const },
      take: 3,
      include: { reviewer: { select: { id: true, fullName: true, role: true } } },
    },
    stages: {
      orderBy: { stageOrder: "asc" as const },
      include: {
        responsibleUser: { select: { id: true, fullName: true } },
        assignedBy: { select: { id: true, fullName: true } },
      },
    },
  };

  if (persona === "DEEPAK") {
    const [deliverables, recentLogs, activeStaff] = await Promise.all([
      db.deliverable.findMany({
        include: deliverableInclude,
        orderBy: { updatedAt: "desc" },
        take: 100,
      }),
      db.activityLog.findMany({
        include: {
          user: { select: { fullName: true } },
          job: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 15,
      }),
      db.user.findMany({
        where: { status: "ACTIVE", role: { not: UserRole.MAIN_MANAGER } },
        select: {
          id: true,
          fullName: true,
          designation: true,
          role: true,
          teamMemberships: {
            where: { status: "ACTIVE" },
            select: { team: { select: { code: true, name: true } }, isPrimary: true },
          },
        },
        orderBy: { fullName: "asc" },
      }),
    ]);

    return {
      persona,
      deliverables,
      recentLogs,
      activeStaff,
    };
  }

  if (persona === "NAVNEET") {
    const [deliverables, teamMembers] = await Promise.all([
      db.deliverable.findMany({
        where: {
          OR: [
            { job: { ownerId: user.id } },
            { job: { assignedDeputyId: user.id } },
            { job: { team: { code: "TEAM-BRANDING" } } },
          ],
        },
        include: deliverableInclude,
        orderBy: { updatedAt: "desc" },
      }),
      db.user.findMany({
        where: {
          status: "ACTIVE",
          managerId: user.id,
        },
        select: { id: true, fullName: true, designation: true },
        orderBy: { fullName: "asc" },
      }),
    ]);

    return { persona, deliverables, teamMembers };
  }

  if (persona === "YASHPREET") {
    const [deliverables, teamMembers] = await Promise.all([
      db.deliverable.findMany({
        where: {
          OR: [
            { job: { ownerId: user.id } },
            { job: { assignedDeputyId: user.id } },
            { job: { team: { code: "TEAM-ONLINE" } } },
            { stages: { some: { assignedById: user.id } } },
          ],
        },
        include: deliverableInclude,
        orderBy: { updatedAt: "desc" },
      }),
      db.user.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { managerId: user.id },
            { secondaryManagerId: user.id },
            { teamMemberships: { some: { status: "ACTIVE", team: { code: "TEAM-ONLINE" } } } },
          ],
        },
        select: { id: true, fullName: true, designation: true },
        orderBy: { fullName: "asc" },
      }),
    ]);

    return { persona, deliverables, teamMembers };
  }

  if (persona === "RUHI") {
    const [deliverables, teamMembers] = await Promise.all([
      db.deliverable.findMany({
        where: {
          OR: [
            { job: { ownerId: user.id } },
            { job: { team: { code: "TEAM-CONTENT" } } },
            { stages: { some: { assignedById: user.id } } },
          ],
        },
        include: deliverableInclude,
        orderBy: { updatedAt: "desc" },
      }),
      db.user.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { managerId: user.id },
            { secondaryManagerId: user.id },
            { teamMemberships: { some: { status: "ACTIVE", team: { code: "TEAM-CONTENT" } } } },
          ],
        },
        select: { id: true, fullName: true, designation: true },
        orderBy: { fullName: "asc" },
      }),
    ]);

    return { persona, deliverables, teamMembers };
  }

  if (persona === "MANDEEP") {
    const deliverables = await db.deliverable.findMany({
      where: {
        OR: [
          { proofreadAssignedToId: user.id },
          { workflowType: "OFFLINE_DESIGN" },
          { stages: { some: { stageKey: "PROOFREADING" } } },
        ],
      },
      include: deliverableInclude,
      orderBy: { updatedAt: "desc" },
    });

    return { persona, deliverables };
  }

  if (persona === "SOCIAL_MEDIA") {
    const deliverables = await db.deliverable.findMany({
      where: {
        OR: [
          { postAssignedToId: user.id },
          {
            approvalStatus: ApprovalStatus.APPROVED,
            workflowState: { in: [WorkflowState.APPROVED, WorkflowState.PUBLISHED] },
          },
        ],
      },
      include: deliverableInclude,
      orderBy: { updatedAt: "desc" },
    });

    return { persona, deliverables };
  }

  // Specialist employee queries: strictly scoped to their own assignments
  const deliverables = await db.deliverable.findMany({
    where: {
      OR: [
        { assignedToId: user.id },
        { shootAssignedToId: user.id },
        { editorAssignedToId: user.id },
        { fitterAssignedToId: user.id },
        { stages: { some: { responsibleUserId: user.id } } },
      ],
    },
    include: deliverableInclude,
    orderBy: { updatedAt: "desc" },
  });

  return { persona, deliverables, StageStatus, WorkflowState };
}

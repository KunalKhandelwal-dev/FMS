import { describe, it, expect, afterAll } from "vitest";
import { ApprovalStatus, DeliverableType, JobType, UserRole, WorkflowState } from "@prisma/client";
import { db } from "@/server/db/client";
import { workflowEngine } from "@/server/services/workflowEngine";
import { resolveDashboardPersona } from "@/server/services/dashboardService";
import { canAccessDeliverable, canAccessSalaryAndRoi, canManageEmployee } from "@/server/auth/guards";
import type { SessionUser } from "@/types/auth";

function toSessionUser(u: {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  departmentId: string | null;
}): SessionUser {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    status: u.status,
    departmentId: u.departmentId,
    employeeCode: null,
    avatarUrl: null,
  };
}

describe("Phase 3 Organizational Workflows & Security", () => {
  const createdJobIds: string[] = [];

  afterAll(async () => {
    if (createdJobIds.length > 0) {
      await db.activityLog.deleteMany({ where: { jobId: { in: createdJobIds } } });
      await db.job.deleteMany({ where: { id: { in: createdJobIds } } });
    }
    await db.$disconnect();
  });

  it("verifies Test A-G: Offline Design, Installation, Ruhi & Yashpreet Video, Shared Hardik Photography, Publishing, and Security", async () => {
    const users = await db.user.findMany({ where: { status: "ACTIVE" } });
    const byEmail = new Map(users.map((u) => [u.email, u]));
    const dept = await db.department.findFirstOrThrow();

    const deepak = toSessionUser(byEmail.get("admin@geetauniversity.edu.in")!);
    const navneet = toSessionUser(byEmail.get("navneet.demo@fms.local")!);
    const yashpreet = toSessionUser(byEmail.get("yash.demo@fms.local")!);
    const ruhi = toSessionUser(byEmail.get("ruhi.demo@fms.local")!);
    const mandeep = toSessionUser(byEmail.get("mandeep.demo@fms.local")!);
    const vishal = toSessionUser(byEmail.get("vishal.demo@fms.local")!);
    const rajesh = toSessionUser(byEmail.get("rajesh.demo@fms.local")!);
    const ankit = toSessionUser(byEmail.get("ankit.demo@fms.local")!);
    const hardik = toSessionUser(byEmail.get("hardik.demo@fms.local")!);
    const sarvjeet = toSessionUser(byEmail.get("sarvjeet.demo@fms.local")!);
    const vishalTyagi = toSessionUser(byEmail.get("vishaltyagi.demo@fms.local")!);
    const aashish = toSessionUser(byEmail.get("aashish.demo@fms.local")!);
    const kajal = toSessionUser(byEmail.get("kajal.demo@fms.local")!);

    // TEST H: Verify role-specific dashboard personas
    expect(await resolveDashboardPersona(deepak)).toBe("DEEPAK");
    expect(await resolveDashboardPersona(navneet)).toBe("NAVNEET");
    expect(await resolveDashboardPersona(yashpreet)).toBe("YASHPREET");
    expect(await resolveDashboardPersona(ruhi)).toBe("RUHI");
    expect(await resolveDashboardPersona(mandeep)).toBe("MANDEEP");
    expect(await resolveDashboardPersona(vishal)).toBe("DESIGNER");
    expect(await resolveDashboardPersona(ankit)).toBe("FITTER");
    expect(await resolveDashboardPersona(hardik)).toBe("PHOTOGRAPHER");
    expect(await resolveDashboardPersona(sarvjeet)).toBe("CINEMATOGRAPHER");
    expect(await resolveDashboardPersona(aashish)).toBe("VIDEO_EDITOR");
    expect(await resolveDashboardPersona(vishalTyagi)).toBe("VIDEO_EDITOR");
    expect(await resolveDashboardPersona(kajal)).toBe("SOCIAL_MEDIA");

    // TEST G: Security boundaries
    expect(canAccessSalaryAndRoi(navneet)).toBe(false);
    expect(canAccessSalaryAndRoi(deepak)).toBe(true);
    expect(await canManageEmployee(navneet, mandeep.id)).toBe(false);
    expect(await canManageEmployee(deepak, mandeep.id)).toBe(true);

    // TEST A & B: Offline Design (Mandeep -> Navneet -> Deepak) + Installation (Ankit)
    const offlineJob = await db.job.create({
      data: {
        title: "Phase 3 Test Offline Banner",
        jobType: JobType.BRANDING_PRODUCTION,
        departmentId: dept.id,
        createdById: deepak.id,
        ownerId: navneet.id,
        assignedDeputyId: navneet.id,
        deliverables: {
          create: {
            title: "Main Stage Banner",
            deliverableType: DeliverableType.APPROVED_DESIGN,
            workflowType: "OFFLINE_DESIGN",
          },
        },
      },
      include: { deliverables: true },
    });
    createdJobIds.push(offlineJob.id);
    const banner = offlineJob.deliverables[0];

    await workflowEngine.assignStage({
      actor: navneet,
      deliverableId: banner.id,
      stageKey: "DESIGN_DRAFT",
      assigneeId: vishal.id,
    });
    expect(await canAccessDeliverable(rajesh, banner.id)).toBe(false);

    await workflowEngine.submitStageOutput({
      actor: vishal,
      deliverableId: banner.id,
      stageKey: "DESIGN_DRAFT",
      url: "https://drive.google.com/banner-v1",
    });

    // Cannot skip Mandeep proofreading!
    await expect(
      workflowEngine.reviewSequentialStage({
        actor: navneet,
        deliverableId: banner.id,
        stageKey: "HEAD_REVIEW",
        decision: ApprovalStatus.APPROVED,
      })
    ).rejects.toThrow(/proofreading/i);

    await workflowEngine.reviewSequentialStage({
      actor: mandeep,
      deliverableId: banner.id,
      stageKey: "PROOFREADING",
      decision: ApprovalStatus.APPROVED,
      comments: "Copy verified",
    });

    await workflowEngine.reviewSequentialStage({
      actor: navneet,
      deliverableId: banner.id,
      stageKey: "HEAD_REVIEW",
      decision: ApprovalStatus.APPROVED,
    });

    // Only Deepak can rate & do final approval
    await expect(
      workflowEngine.reviewSequentialStage({
        actor: navneet,
        deliverableId: banner.id,
        stageKey: "FINAL_APPROVAL",
        decision: ApprovalStatus.APPROVED,
        stars: 5,
      })
    ).rejects.toThrow(/Main Manager/i);

    await workflowEngine.reviewSequentialStage({
      actor: deepak,
      deliverableId: banner.id,
      stageKey: "FINAL_APPROVAL",
      decision: ApprovalStatus.APPROVED,
      stars: 5,
    });

    // TEST B: Ankit installation
    await workflowEngine.assignStage({
      actor: navneet,
      deliverableId: banner.id,
      stageKey: "INSTALLATION",
      assigneeId: ankit.id,
    });
    await workflowEngine.submitStageOutput({
      actor: ankit,
      deliverableId: banner.id,
      stageKey: "INSTALLATION",
      url: "https://drive.google.com/install-proof",
    });

    // TEST E: Shared Resource Hardik (assigned by both Yashpreet and Ruhi)
    const photoJob = await db.job.create({
      data: {
        title: "Phase 3 Photo Coverage",
        jobType: JobType.CONTENT_CREATION,
        departmentId: dept.id,
        createdById: deepak.id,
        ownerId: ruhi.id,
        deliverables: {
          create: [
            { title: "Ruhi Photo Set", deliverableType: DeliverableType.PHOTOGRAPHY_CLASS, workflowType: "PHOTOGRAPHY" },
            { title: "Yashpreet Photo Set", deliverableType: DeliverableType.PHOTOGRAPHY_CLASS, workflowType: "PHOTOGRAPHY" },
          ],
        },
      },
      include: { deliverables: true },
    });
    createdJobIds.push(photoJob.id);

    await workflowEngine.assignStage({
      actor: ruhi,
      deliverableId: photoJob.deliverables[0].id,
      stageKey: "PHOTOGRAPHY",
      assigneeId: hardik.id,
    });
    await workflowEngine.assignStage({
      actor: yashpreet,
      deliverableId: photoJob.deliverables[1].id,
      stageKey: "PHOTOGRAPHY",
      assigneeId: hardik.id,
    });

    await workflowEngine.submitStageOutput({
      actor: hardik,
      deliverableId: photoJob.deliverables[0].id,
      stageKey: "PHOTOGRAPHY",
      url: "https://drive.google.com/hardik-photos",
    });
    const completedPhoto = await db.deliverable.findUniqueOrThrow({
      where: { id: photoJob.deliverables[0].id },
    });
    expect(completedPhoto.workflowState).toBe(WorkflowState.COMPLETED);

    // TEST C & D & F: Video + Publishing Gate
    const videoJob = await db.job.create({
      data: {
        title: "Phase 3 Video & Publishing",
        jobType: JobType.CONTENT_CREATION,
        departmentId: dept.id,
        createdById: deepak.id,
        ownerId: yashpreet.id,
        deliverables: {
          create: {
            title: "Campus Highlight Reel",
            deliverableType: DeliverableType.STANDARD_REEL,
            workflowType: "YASHPREET_VIDEO",
          },
        },
      },
      include: { deliverables: true },
    });
    createdJobIds.push(videoJob.id);
    const reel = videoJob.deliverables[0];

    // Dependency gate: cannot assign Aashish before raw footage unless overridden
    await expect(
      workflowEngine.assignStage({
        actor: yashpreet,
        deliverableId: reel.id,
        stageKey: "VIDEO_EDITING",
        assigneeId: aashish.id,
      })
    ).rejects.toThrow(/Raw footage/i);

    await workflowEngine.assignStage({
      actor: ruhi,
      deliverableId: reel.id,
      stageKey: "CINEMATOGRAPHY",
      assigneeId: sarvjeet.id,
    });
    await workflowEngine.submitStageOutput({
      actor: sarvjeet,
      deliverableId: reel.id,
      stageKey: "CINEMATOGRAPHY",
      url: "https://drive.google.com/raw-footage",
    });

    await workflowEngine.assignStage({
      actor: yashpreet,
      deliverableId: reel.id,
      stageKey: "VIDEO_EDITING",
      assigneeId: aashish.id,
    });
    await workflowEngine.submitStageOutput({
      actor: aashish,
      deliverableId: reel.id,
      stageKey: "VIDEO_EDITING",
      url: "https://drive.google.com/edited-reel",
    });

    // Kajal publishing blocked before Deepak approval
    await expect(
      workflowEngine.assignStage({
        actor: yashpreet,
        deliverableId: reel.id,
        stageKey: "PUBLISHING",
        assigneeId: kajal.id,
      })
    ).rejects.toThrow(/Deepak/i);

    await workflowEngine.reviewSequentialStage({
      actor: yashpreet,
      deliverableId: reel.id,
      stageKey: "HEAD_REVIEW",
      decision: ApprovalStatus.APPROVED,
    });
    await workflowEngine.reviewSequentialStage({
      actor: deepak,
      deliverableId: reel.id,
      stageKey: "FINAL_APPROVAL",
      decision: ApprovalStatus.APPROVED,
      stars: 4,
    });

    await workflowEngine.assignStage({
      actor: yashpreet,
      deliverableId: reel.id,
      stageKey: "PUBLISHING",
      assigneeId: kajal.id,
    });
    await workflowEngine.submitStageOutput({
      actor: kajal,
      deliverableId: reel.id,
      stageKey: "PUBLISHING",
      url: "https://instagram.com/reel/123",
      socialPlatform: "Instagram",
    });
    const publishedReel = await db.deliverable.findUniqueOrThrow({ where: { id: reel.id } });
    expect(publishedReel.workflowState).toBe(WorkflowState.PUBLISHED);
  }, 120000);
});

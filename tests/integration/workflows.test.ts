import { describe, it, expect, afterAll } from "vitest";
import { db } from "@/server/db/client";
import { jobService } from "@/server/services/jobService";
import { deliverableService } from "@/server/services/deliverableService";
import { approvalService } from "@/server/services/approvalService";
import { brandingService } from "@/server/services/brandingService";
import { analyticsService } from "@/server/services/analyticsService";
import { canAccessDeliverable, canAccessSalaryAndRoi } from "@/server/auth/guards";
import { UserRole, UserStatus } from "@prisma/client";

const createdJobIds: string[] = [];

describe("Phase 2 End-to-End Service Workflows", () => {
  afterAll(async () => {
    // Clean up test jobs created during integration run
    if (createdJobIds.length > 0) {
      await db.job.deleteMany({
        where: { id: { in: createdJobIds } },
      });
    }
    await db.$disconnect();
  });

  it("executes Tests 1-7 against live database cleanly", async () => {
    const dept = await db.department.findFirst();
    const manager = await db.user.findFirst({ where: { role: UserRole.MAIN_MANAGER } });
    const yash = await db.user.findFirst({ where: { fullName: "Yash" } });
    const arjun = await db.user.findFirst({ where: { fullName: "Arjun" } });

    if (!dept || !manager || !yash || !arjun) {
      throw new Error("Seeded department/users missing; run db:seed first.");
    }

    // TEST 1: Manager creates job "NexHack" with 3 deliverables & separate target dates
    const futureDate1 = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    const futureDate2 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const futureDate3 = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);

    const created = await jobService.createContentJob(manager.id, dept.id, {
      jobDate: new Date(),
      category: "Events",
      title: "NexHack Integration Test",
      ownerId: yash.id,
      priority: "HIGH",
      deliverables: [
        { deliverableType: "PHOTO_POST", targetDate: futureDate1 },
        { deliverableType: "STANDARD_REEL", targetDate: futureDate2 },
        { deliverableType: "CHRONOLOGICAL_VIDEO", targetDate: futureDate3 },
      ],
    });
    createdJobIds.push(created.job.id);

    expect(created.job.title).toBe("NexHack Integration Test");
    expect(created.deliverables).toHaveLength(3);

    const photoPost = created.deliverables[0];

    // TEST 2: Yash submits Photo Post with Google Drive URL
    const submission = await deliverableService.submitWork(yash.id, {
      deliverableId: photoPost.id,
      submissionUrl: "https://drive.google.com/sample-nexhack-photos",
      notes: "Uploaded event photo set",
    });
    expect(submission.submittedById).toBe(yash.id);
    expect(submission.version).toBe(1);

    // TEST 3: Manager rates 4/5 and approves
    const review = await approvalService.submitReview(manager.id, {
      deliverableId: photoPost.id,
      submissionId: submission.id,
      status: "APPROVED",
      stars: 4,
      publicFeedback: "Great coverage!",
    });
    expect(review.reviewerId).toBe(manager.id);
    expect(review.status).toBe("APPROVED");

    const updatedPhotoPost = await db.deliverable.findUnique({
      where: { id: photoPost.id },
      include: { ratings: true, submissions: true },
    });
    expect(updatedPhotoPost?.deliveryStatus).toBe("COMPLETED_ON_TIME");
    expect(updatedPhotoPost?.ratings[0]?.stars).toBe(4);
    expect(updatedPhotoPost?.submissions).toHaveLength(1);

    // TEST 4: Employee Arjun (not assigned) attempts to access Yash's deliverable -> denied
    const arjunAccess = await canAccessDeliverable(
      {
        id: arjun.id,
        email: arjun.email,
        fullName: arjun.fullName,
        role: arjun.role,
        status: UserStatus.ACTIVE,
        departmentId: dept.id,
        employeeCode: null,
        avatarUrl: null,
      },
      photoPost.id
    );
    expect(arjunAccess).toBe(false);

    // TEST 5: Employee attempts to access ROI/salary -> denied
    expect(
      canAccessSalaryAndRoi({
        id: arjun.id,
        email: arjun.email,
        fullName: arjun.fullName,
        role: UserRole.EMPLOYEE,
        status: UserStatus.ACTIVE,
        departmentId: dept.id,
        employeeCode: null,
        avatarUrl: null,
      })
    ).toBe(false);

    // TEST 6: Productivity report reflects created job
    const prod = await analyticsService.getProductivityReport({ teamLeadId: yash.id });
    expect(prod.metrics.totalProductsCreated).toBeGreaterThanOrEqual(1);

    // TEST 7: Branding & Production job with 5 stages
    const brandingCreated = await jobService.createBrandingJob(manager.id, dept.id, {
      title: "Convocation Stage Branding Test",
      eventDate: futureDate3,
      venue: "Main Auditorium",
      organizer: "Academic Affairs",
      ownerId: yash.id,
      workingDaysOnly: false,
    });
    createdJobIds.push(brandingCreated.job.id);

    const brandingJob = await brandingService.getBrandingJobById(brandingCreated.job.id);
    expect(brandingJob?.deliverables[0]?.stages).toHaveLength(5);
  }, 30000);
});

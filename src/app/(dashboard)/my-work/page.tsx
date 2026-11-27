import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/guards";
import { db } from "@/server/db/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { MyWorkClient } from "@/features/my-work/MyWorkClient";
import { calculateDeliveryStatus } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function MyWorkPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const deliverables = await db.deliverable.findMany({
    where: {
      OR: [
        { assignedToId: user.id },
        { shootAssignedToId: user.id },
        { editorAssignedToId: user.id },
        { postAssignedToId: user.id },
        { job: { ownerId: user.id } },
      ],
    },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          category: true,
          description: true,
          jobDate: true,
        },
      },
      ratings: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      submissions: {
        orderBy: { submittedAt: "desc" },
      },
      reviews: {
        orderBy: { reviewedAt: "desc" },
        include: {
          reviewer: { select: { fullName: true } },
        },
      },
    },
    orderBy: [{ targetDate: "asc" }, { createdAt: "desc" }],
  });

  const items = deliverables.map((d) => ({
    id: d.id,
    jobId: d.job.id,
    jobTitle: d.job.title,
    jobCategory: d.job.category,
    jobDescription: d.job.description,
    assignedDate: d.job.jobDate,
    deliverableType: d.deliverableType,
    title: d.title,
    targetDate: d.targetDate,
    workflowState: d.workflowState,
    deliveryStatus: calculateDeliveryStatus({
      targetDate: d.targetDate,
      firstSubmittedAt: d.firstSubmittedAt,
      isCancelled: d.workflowState === "CANCELLED",
    }),
    approvalStatus: d.approvalStatus,
    latestRating: d.ratings[0]?.stars ?? null,
    submissions: d.submissions.map((s) => ({
      id: s.id,
      version: s.version,
      submittedAt: s.submittedAt,
      submissionUrl: s.submissionUrl,
      fileName: s.fileName,
      filePath: s.filePath,
      notes: s.notes,
    })),
    reviews: d.reviews.map((r) => ({
      id: r.id,
      status: r.status,
      reviewerName: r.reviewer.fullName,
      publicFeedback: r.publicFeedback,
      reviewedAt: r.reviewedAt,
    })),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Work"
        description="View your assigned deliverables, target dates, submission history, and feedback."
      />
      <MyWorkClient items={items} />
    </div>
  );
}


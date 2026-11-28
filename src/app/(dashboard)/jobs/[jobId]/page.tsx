import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { canAccessJob, getCurrentUser } from "@/server/auth/guards";
import { db } from "@/server/db/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobDeliverablesSection } from "@/features/jobs/JobDeliverablesSection";
import { formatDate } from "@/lib/dates";
import { calculateDeliveryStatus } from "@/lib/dates";
import { ArrowLeft, Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { jobId } = await params;

  const allowed = await canAccessJob(user, jobId);
  if (!allowed) {
    return (
      <div className="p-8 rounded-lg border border-rose-200 bg-rose-50 text-[#E11D48] text-sm">
        Access denied: You do not have permission to view this job.
      </div>
    );
  }

  const [job, employees] = await Promise.all([
    db.job.findUnique({
      where: { id: jobId },
      include: {
        createdBy: { select: { id: true, fullName: true } },
        owner: { select: { id: true, fullName: true, designation: true, email: true } },
        team: { select: { id: true, name: true, leadId: true } },
        deliverables: {
          include: {
            assignedTo: { select: { id: true, fullName: true } },
            shootAssignedTo: { select: { id: true, fullName: true } },
            editorAssignedTo: { select: { id: true, fullName: true } },
            postAssignedTo: { select: { id: true, fullName: true } },
            ratings: { orderBy: { createdAt: "desc" }, take: 1 },
            submissions: {
              orderBy: { submittedAt: "desc" },
              include: {
                submittedBy: { select: { id: true, fullName: true } },
              },
            },
            reviews: {
              orderBy: { reviewedAt: "desc" },
              include: {
                reviewer: { select: { id: true, fullName: true } },
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    db.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, fullName: true, designation: true },
      orderBy: { fullName: "asc" },
    }),
  ]);

  if (!job) notFound();

  const canReview =
    user.role === "MAIN_MANAGER" || user.role === "DEPUTY_MANAGER" || user.role === "TEAM_LEAD";
  const canEdit = user.role === "MAIN_MANAGER" || user.role === "DEPUTY_MANAGER";
  const isManagerView = user.role === "MAIN_MANAGER" || user.role === "DEPUTY_MANAGER";

  const serializedDeliverables = job.deliverables.map((d) => ({
    id: d.id,
    title: d.title,
    deliverableType: d.deliverableType,
    assignedToId: d.assignedToId,
    assignedToName: d.assignedTo?.fullName || job.owner?.fullName || "Unassigned",
    targetDate: d.targetDate,
    firstSubmittedAt: d.firstSubmittedAt,
    workflowState: d.workflowState,
    deliveryStatus: calculateDeliveryStatus({
      targetDate: d.targetDate,
      firstSubmittedAt: d.firstSubmittedAt,
      isCancelled: d.workflowState === "CANCELLED",
    }),
    approvalStatus: d.approvalStatus,
    shootAssignedToId: d.shootAssignedToId,
    shootAssignedToName: d.shootAssignedTo?.fullName || null,
    shootScheduledDate: d.shootScheduledDate,
    shootActualDate: d.shootActualDate,
    shootStatus: d.shootStatus,
    rawFootageUrl: d.rawFootageUrl,
    editorAssignedToId: d.editorAssignedToId,
    editorAssignedToName: d.editorAssignedTo?.fullName || null,
    editScheduledDate: d.editScheduledDate,
    editActualDate: d.editActualDate,
    editStatus: d.editStatus,
    approvedVideoUrl: d.approvedVideoUrl,
    postAssignedToId: d.postAssignedToId,
    postAssignedToName: d.postAssignedTo?.fullName || null,
    postScheduledDate: d.postScheduledDate,
    postActualDate: d.postActualDate,
    postStatus: d.postStatus,
    livePostUrl: d.livePostUrl,
    latestRating: d.ratings[0]?.stars ?? null,
    submissions: d.submissions.map((s) => ({
      id: s.id,
      version: s.version,
      submittedByName: s.submittedBy.fullName,
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
      // Never leak private managerial notes to ordinary employees
      privateNotes: isManagerView ? r.privateNotes : null,
      reviewedAt: r.reviewedAt,
    })),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={job.title}
        description={`${job.category || job.jobType.replace(/_/g, " ")} • Created ${formatDate(job.jobDate)}`}
        action={
          <div className="flex items-center gap-2">
            <Link href="/jobs">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Back to Jobs
              </Button>
            </Link>
            {canEdit && (
              <Link href={`/jobs/${job.id}/edit`}>
                <Button variant="secondary" size="sm">
                  <Pencil className="w-3.5 h-3.5 mr-1.5" />
                  Edit Job
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Job Information & Owner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Job Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-[#64748B]">Job Date</p>
              <p className="font-medium text-[#202638] mt-0.5">{formatDate(job.jobDate)}</p>
            </div>
            <div>
              <p className="text-[#64748B]">Job Type</p>
              <p className="font-medium text-[#202638] mt-0.5">{job.category || job.jobType}</p>
            </div>
            <div>
              <p className="text-[#64748B]">Priority</p>
              <p className="font-medium text-[#202638] mt-0.5">{job.priority}</p>
            </div>
            <div>
              <p className="text-[#64748B]">Assigned By</p>
              <p className="font-medium text-[#202638] mt-0.5">{job.createdBy.fullName}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[#64748B]">Instructions / Description</p>
              <p className="text-[#202638] mt-0.5">{job.description || "No additional notes"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Accountable Owner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div>
              <p className="text-[#64748B]">Owner / Team Lead</p>
              <p className="text-sm font-semibold text-[#4F46E5] mt-0.5">
                {job.owner?.fullName || "Unassigned"}
              </p>
              {job.owner?.designation && (
                <p className="text-[#64748B]">{job.owner.designation}</p>
              )}
            </div>
            <div>
              <p className="text-[#64748B]">Team</p>
              <p className="font-medium text-[#202638] mt-0.5">
                {job.team?.name || "Departmental"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deliverables & Production Tracker */}
      <JobDeliverablesSection
        deliverables={serializedDeliverables}
        employees={employees}
        currentUserId={user.id}
        canReview={canReview}
        canRate={user.role === "MAIN_MANAGER"}
        canManageTracker={
          user.role === "MAIN_MANAGER" ||
          job.ownerId === user.id ||
          job.assignedDeputyId === user.id ||
          (!job.ownerId && job.team?.leadId === user.id)
        }
      />
    </div>
  );
}


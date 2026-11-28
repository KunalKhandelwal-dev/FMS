import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { canAccessJob, getCurrentUser } from "@/server/auth/guards";
import { brandingService } from "@/server/services/brandingService";
import { db } from "@/server/db/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrandingStagesClient } from "@/features/branding/BrandingStagesClient";
import { formatDate, formatDateTime } from "@/lib/dates";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BrandingJobDetailPage({
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
        Access denied: You do not have permission to view this branding job.
      </div>
    );
  }

  const [job, employees] = await Promise.all([
    brandingService.getBrandingJobById(jobId),
    db.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
    }),
  ]);

  if (!job) notFound();

  const deliverable = job.deliverables[0];
  const stages =
    deliverable?.stages.map((s) => ({
      id: s.id,
      name: s.name,
      stageOrder: s.stageOrder,
      status: s.status,
      approvalStatus: s.approvalStatus,
      responsibleUserId: s.responsibleUserId,
      responsibleUserName: s.responsibleUser?.fullName || "Unassigned",
      targetDate: s.targetDate,
      completedAt: s.completedAt,
      driveUrl: s.driveUrl,
      notes: s.notes,
    })) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={job.title}
        description={`Branding & Production Job • Auto Created ${formatDateTime(job.createdAt)}`}
        action={
          <Link href="/branding-jobs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back to Branding Jobs
            </Button>
          </Link>
        }
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Job Master Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
          <div>
            <p className="text-[#64748B]">Event Date</p>
            <p className="font-medium text-[#202638] mt-0.5">{formatDate(job.eventDate)}</p>
          </div>
          <div>
            <p className="text-[#64748B]">Venue</p>
            <p className="font-medium text-[#202638] mt-0.5">{job.venue || "—"}</p>
          </div>
          <div>
            <p className="text-[#64748B]">Organiser</p>
            <p className="font-medium text-[#202638] mt-0.5">{job.organizer || "—"}</p>
          </div>
          <div>
            <p className="text-[#64748B]">Job Owner</p>
            <p className="font-semibold text-[#4F46E5] mt-0.5">
              {job.owner?.fullName || "Unassigned"}
            </p>
          </div>
          <div>
            <p className="text-[#64748B]">Created By</p>
            <p className="font-medium text-[#202638] mt-0.5">{job.createdBy.fullName}</p>
          </div>
        </CardContent>
      </Card>

      {deliverable && (
        <BrandingStagesClient
          deliverableId={deliverable.id}
          stages={stages}
          employees={employees}
          credits={{
            contentCredits: deliverable.contentCredits ? Number(deliverable.contentCredits) : null,
            jobOwnerCredits: deliverable.jobOwnerCredits
              ? Number(deliverable.jobOwnerCredits)
              : null,
            creditsAllocated: deliverable.creditsAllocated
              ? Number(deliverable.creditsAllocated)
              : null,
          }}
          canManageCredits={user.role === "MAIN_MANAGER"}
          currentUserId={user.id}
          canAssignStages={
            user.role === "MAIN_MANAGER" ||
            job.ownerId === user.id ||
            job.assignedDeputyId === user.id
          }
        />
      )}
    </div>
  );
}


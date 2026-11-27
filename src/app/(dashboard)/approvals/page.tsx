import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, requirePermission } from "@/server/auth/guards";
import { db } from "@/server/db/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { DELIVERABLE_TYPE_LABELS } from "@/lib/constants";
import { formatDate, formatDateTime, calculateDeliveryStatus } from "@/lib/dates";
import { ArrowRight, FileCheck2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  requirePermission(user, "review:approve");

  const pendingDeliverables = await db.deliverable.findMany({
    where: {
      workflowState: { in: ["SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED"] },
      ...(user.role !== "MAIN_MANAGER"
        ? {
            job: {
              OR: [
                { ownerId: user.id },
                { assignedDeputyId: user.id },
                { team: { leadId: user.id } },
              ],
            },
          }
        : {}),
    },
    include: {
      job: { select: { id: true, title: true, category: true } },
      assignedTo: { select: { fullName: true } },
      reviews: {
        orderBy: { reviewedAt: "desc" },
        take: 1,
        include: { reviewer: { select: { fullName: true, role: true } } },
      },
      submissions: {
        orderBy: { submittedAt: "desc" },
        take: 1,
        include: { submittedBy: { select: { fullName: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approvals &amp; Review Queue"
        description="Review submitted deliverables, verify timeliness, award 1–5 star ratings, or request revisions."
      />

      {pendingDeliverables.length === 0 ? (
        <EmptyState
          icon={<FileCheck2 className="w-6 h-6 text-[#64748B]" />}
          title="All Caught Up"
          description="No deliverables are currently awaiting review."
        />
      ) : (
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
          <div className="divide-y divide-[#E5E7EB]">
            {pendingDeliverables.map((d) => {
              const latest = d.submissions[0];
              const latestReview = d.reviews[0];
              const teamLeadApproved =
                d.workflowState === "UNDER_REVIEW" &&
                latestReview?.status === "APPROVED" &&
                latestReview.reviewer.role !== "MAIN_MANAGER";
              const deliveryStatus = calculateDeliveryStatus({
                targetDate: d.targetDate,
                firstSubmittedAt: d.firstSubmittedAt,
                isCancelled: false,
              });
              return (
                <div
                  key={d.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F7F8FC]"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[#202638]">
                        {d.job.title} — {DELIVERABLE_TYPE_LABELS[d.deliverableType] || d.title}
                      </span>
                      <StatusBadge type="workflow" status={d.workflowState} />
                      <StatusBadge type="delivery" status={deliveryStatus} />
                      {teamLeadApproved && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                          Approved by {latestReview.reviewer.fullName} • Awaiting Main Manager Rating
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">
                      Submitted by{" "}
                      <span className="font-medium text-[#202638]">
                        {latest?.submittedBy.fullName || d.assignedTo?.fullName || "Staff"}
                      </span>{" "}
                      • Target: {formatDate(d.targetDate)} • Submitted:{" "}
                      {formatDateTime(latest?.submittedAt || d.firstSubmittedAt)}
                    </p>
                  </div>

                  <Link
                    href={`/jobs/${d.jobId}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#4F46E5] text-white text-xs font-medium hover:bg-[#4338CA] shrink-0"
                  >
                    {user.role === "MAIN_MANAGER" ? "Open & Rate" : "Open & Review"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

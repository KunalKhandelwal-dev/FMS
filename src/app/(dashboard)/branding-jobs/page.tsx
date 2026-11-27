import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/guards";
import { brandingService } from "@/server/services/brandingService";
import { db } from "@/server/db/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CreateBrandingJobButton } from "@/features/branding/CreateBrandingJobButton";
import { formatDate } from "@/lib/dates";
import { ArrowRight, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BrandingJobsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [jobs, employees] = await Promise.all([
    brandingService.listBrandingJobs(),
    db.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, fullName: true, designation: true },
      orderBy: { fullName: "asc" },
    }),
  ]);

  const canCreate = user.role === "MAIN_MANAGER";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branding &amp; Production Jobs"
        description="Manage physical event branding, mockups, approved designs, print orders, supply/install, and pack-ups."
        action={canCreate ? <CreateBrandingJobButton employees={employees} /> : undefined}
      />

      {jobs.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-6 h-6 text-[#64748B]" />}
          title="No Branding Jobs Created"
          description="Create a branding & production job to initialize the 5-stage event workflow."
        />
      ) : (
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#202638]">
              <thead className="bg-[#F1F3F9] text-xs font-medium text-[#64748B] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-4 py-3">Job / Event Name</th>
                  <th className="px-4 py-3">Event Date</th>
                  <th className="px-4 py-3">Venue &amp; Organiser</th>
                  <th className="px-4 py-3">Job Owner</th>
                  <th className="px-4 py-3">Stages Completed</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {jobs.map((job) => {
                  const stages = job.deliverables[0]?.stages || [];
                  const completed = stages.filter(
                    (s) => s.status === "COMPLETED_ON_TIME" || s.status === "LATE_COMPLETED"
                  ).length;
                  return (
                    <tr key={job.id} className="hover:bg-[#F7F8FC]">
                      <td className="px-4 py-3 font-medium">
                        <Link href={`/branding-jobs/${job.id}`} className="hover:text-[#4F46E5]">
                          {job.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748B]">
                        {formatDate(job.eventDate)}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748B]">
                        {job.venue || "—"} • {job.organizer || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium">
                        {job.owner?.fullName || "Unassigned"}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <StatusBadge
                          type="workflow"
                          status={completed === 5 ? "APPROVED" : "IN_PROGRESS"}
                        />
                        <span className="ml-2 text-[#64748B]">
                          {completed} / {stages.length}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/branding-jobs/${job.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#4F46E5] hover:underline"
                        >
                          Manage Stages
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


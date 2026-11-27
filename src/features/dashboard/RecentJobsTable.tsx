"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDate } from "@/lib/dates";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export interface RecentJobRow {
  id: string;
  jobDate: Date | string;
  title: string;
  jobType: string;
  category: string | null;
  ownerName: string;
  totalDeliverables: number;
  completedCount: number;
  pendingCount: number;
  status: string;
}

export function RecentJobsTable({ jobs }: { jobs: RecentJobRow[] }) {
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(jobs.length / pageSize));
  const paginated = jobs.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#202638]">Recent Jobs</h2>
          <p className="text-xs text-[#64748B]">
            Showing {jobs.length} job{jobs.length === 1 ? "" : "s"} matching current filters
          </p>
        </div>
        <Link href="/jobs" className="text-xs font-medium text-[#4F46E5] hover:text-[#4338CA]">
          View All Jobs
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#202638]">
          <thead className="bg-[#F1F3F9] text-xs font-medium text-[#64748B] border-b border-[#E5E7EB]">
            <tr>
              <th className="px-4 py-3">Job Date</th>
              <th className="px-4 py-3">Job / Activity Name</th>
              <th className="px-4 py-3">Job Type</th>
              <th className="px-4 py-3">Job Owner</th>
              <th className="px-4 py-3 text-center">Deliverables</th>
              <th className="px-4 py-3 text-center">Completed</th>
              <th className="px-4 py-3 text-center">Pending</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-xs text-[#64748B]">
                  No jobs created yet. Click &ldquo;New Job&rdquo; to assign work.
                </td>
              </tr>
            ) : (
              paginated.map((job) => (
                <tr key={job.id} className="hover:bg-[#F7F8FC] transition-colors">
                  <td className="px-4 py-3 text-xs text-[#64748B] whitespace-nowrap">
                    {formatDate(job.jobDate)}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#202638]">
                    <Link
                      href={
                        job.jobType === "BRANDING_PRODUCTION"
                          ? `/branding-jobs/${job.id}`
                          : `/jobs/${job.id}`
                      }
                      className="hover:text-[#4F46E5]"
                    >
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#64748B]">
                    {job.category || job.jobType.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#202638]">{job.ownerName}</td>
                  <td className="px-4 py-3 text-xs text-center tabular-nums">
                    {job.totalDeliverables}
                  </td>
                  <td className="px-4 py-3 text-xs text-center tabular-nums text-blue-700 font-medium">
                    {job.completedCount}
                  </td>
                  <td className="px-4 py-3 text-xs text-center tabular-nums text-[#64748B]">
                    {job.pendingCount}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      type="workflow"
                      status={job.status === "COMPLETED" ? "APPROVED" : "ASSIGNED"}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={
                        job.jobType === "BRANDING_PRODUCTION"
                          ? `/branding-jobs/${job.id}`
                          : `/jobs/${job.id}`
                      }
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#4F46E5] hover:text-[#4338CA]"
                    >
                      Open
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#64748B]">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


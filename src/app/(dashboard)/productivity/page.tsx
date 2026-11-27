import { redirect } from "next/navigation";
import { getCurrentUser, requirePermission } from "@/server/auth/guards";
import { analyticsService } from "@/server/services/analyticsService";
import { db } from "@/server/db/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProductivityFilters } from "@/features/productivity/ProductivityFilters";
import {
  CONTENT_DELIVERABLE_TYPES,
  JOB_CATEGORIES,
  JOB_CATEGORY_ALIASES,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

const VIDEO_EDITOR_TYPES = [
  { value: "BYTE_REEL", label: "Byte Reel" },
  { value: "STANDARD_REEL", label: "Standard Reel" },
  { value: "CHRONOLOGICAL_VIDEO", label: "Chronological Video" },
  { value: "PRE_EVENT_PROMO_REEL", label: "Pre-Event Promotional Reel" },
  { value: "SCRIPTED_CINEMATIC_REEL_VIDEO", label: "Scripted Cinematic Reel/Video" },
] as const;

export default async function ProductivityPage({
  searchParams,
}: {
  searchParams: Promise<{
    fromDate?: string;
    toDate?: string;
    teamLeadId?: string;
    category?: string;
  }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  requirePermission(user, "analytics:team_view");

  const params = await searchParams;

  const [report, teamLeads] = await Promise.all([
    analyticsService.getProductivityReport({
      fromDate: params.fromDate,
      toDate: params.toDate,
      teamLeadId: params.teamLeadId,
      category: params.category,
    }),
    db.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Creation Team — Productivity Dashboard"
        description="Track products created, deliverable timeliness, cameraman output, and video editor throughput."
      />

      <ProductivityFilters teamLeads={teamLeads} />

      {/* Top Grid: Performance Metrics, Deliverable Types, Job Types */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Performance Metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Products created vs individual deliverables assigned
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-[#F1F3F9] text-xs text-[#64748B] border-y border-[#E5E7EB]">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Metric</th>
                  <th className="px-4 py-2.5 text-right font-medium">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-xs">
                <tr>
                  <td className="px-4 py-2.5 font-medium text-[#202638]">
                    Total Products Created (Jobs)
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                    {report.metrics.totalProductsCreated}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-[#202638]">
                    Total Deliverables Assigned
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums">
                    {report.metrics.totalDeliverablesAssigned}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-blue-700 font-medium">Completed On Time</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-blue-700 tabular-nums">
                    {report.metrics.completedOnTime}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-[#E11D48] font-medium">Late Completed</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-[#E11D48] tabular-nums">
                    {report.metrics.lateCompleted}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-[#64748B] font-medium">Not done till date</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-[#64748B] tabular-nums">
                    {report.metrics.notDoneTillDate}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-gray-500 font-medium">Cancelled</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-gray-500 tabular-nums">
                    {report.metrics.cancelled}
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Deliverable Type Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Deliverable Type Breakdown</CardTitle>
            <CardDescription>Count of deliverables assigned by format</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-[#F1F3F9] text-xs text-[#64748B] border-y border-[#E5E7EB]">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Deliverable Type</th>
                  <th className="px-4 py-2.5 text-right font-medium">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-xs">
                {CONTENT_DELIVERABLE_TYPES.map((dt) => (
                  <tr key={dt.value}>
                    <td className="px-4 py-2 text-[#202638]">{dt.label}</td>
                    <td className="px-4 py-2 text-right font-semibold tabular-nums">
                      {report.deliverableTypeCounts[dt.value] || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Job Type Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Job Type Breakdown</CardTitle>
            <CardDescription>Products created per category</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-[#F1F3F9] text-xs text-[#64748B] border-y border-[#E5E7EB]">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Job Type</th>
                  <th className="px-4 py-2.5 text-right font-medium">Products Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-xs">
                {JOB_CATEGORIES.map((cat) => (
                  <tr key={cat}>
                    <td className="px-4 py-2 text-[#202638]">
                      {cat}
                      {JOB_CATEGORY_ALIASES[cat] && (
                        <span className="text-[10px] text-[#64748B] block">
                          ({JOB_CATEGORY_ALIASES[cat]})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold tabular-nums">
                      {report.jobTypeCounts[cat] || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Cameraman Productivity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Cameraman Productivity</CardTitle>
          <CardDescription>
            Assignments by cameraman across content deliverable types
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {report.cameramanProductivity.length === 0 ? (
            <p className="p-6 text-center text-xs text-[#64748B]">
              No cameraman shoot assignments recorded in this period.
            </p>
          ) : (
            <table className="w-full text-xs text-[#202638]">
              <thead className="bg-[#F1F3F9] text-[#64748B] border-y border-[#E5E7EB]">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Deliverable Type</th>
                  {report.cameramanProductivity.map((cam) => (
                    <th key={cam.id} className="px-4 py-2.5 text-right font-medium">
                      {cam.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {CONTENT_DELIVERABLE_TYPES.map((dt) => (
                  <tr key={dt.value}>
                    <td className="px-4 py-2 font-medium">{dt.label}</td>
                    {report.cameramanProductivity.map((cam) => (
                      <td key={cam.id} className="px-4 py-2 text-right tabular-nums">
                        {cam.counts[dt.value] || 0}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-[#F7F8FC] font-semibold">
                  <td className="px-4 py-2.5">Total</td>
                  {report.cameramanProductivity.map((cam) => (
                    <td key={cam.id} className="px-4 py-2.5 text-right text-[#4F46E5] tabular-nums">
                      {cam.total}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Video Editor Productivity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Video Editor Productivity</CardTitle>
          <CardDescription>
            Assignments by video editor across edited deliverable formats
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {report.editorProductivity.length === 0 ? (
            <p className="p-6 text-center text-xs text-[#64748B]">
              No video editor assignments recorded in this period.
            </p>
          ) : (
            <table className="w-full text-xs text-[#202638]">
              <thead className="bg-[#F1F3F9] text-[#64748B] border-y border-[#E5E7EB]">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Deliverable Type</th>
                  {report.editorProductivity.map((ed) => (
                    <th key={ed.id} className="px-4 py-2.5 text-right font-medium">
                      {ed.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {VIDEO_EDITOR_TYPES.map((dt) => (
                  <tr key={dt.value}>
                    <td className="px-4 py-2 font-medium">{dt.label}</td>
                    {report.editorProductivity.map((ed) => (
                      <td key={ed.id} className="px-4 py-2 text-right tabular-nums">
                        {ed.counts[dt.value] || 0}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-[#F7F8FC] font-semibold">
                  <td className="px-4 py-2.5">Total</td>
                  {report.editorProductivity.map((ed) => (
                    <td key={ed.id} className="px-4 py-2.5 text-right text-[#7C3AED] tabular-nums">
                      {ed.total}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


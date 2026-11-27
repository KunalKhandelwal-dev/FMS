import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser, requirePermission } from "@/server/auth/guards";
import { db } from "@/server/db/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { DELIVERABLE_TYPE_LABELS } from "@/lib/constants";
import { calculateDeliveryStatus, formatDate } from "@/lib/dates";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  requirePermission(user, "analytics:team_view");

  const { employeeId } = await params;

  const employee = await db.user.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      fullName: true,
      email: true,
      designation: true,
      role: true,
      status: true,
      manager: { select: { fullName: true } },
      teamMemberships: { select: { team: { select: { name: true } } } },
      assignedDeliverables: {
        include: {
          job: { select: { id: true, title: true, category: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      performanceRatingsReceived: {
        select: { stars: true },
      },
    },
  });

  if (!employee) notFound();

  const avgRating =
    employee.performanceRatingsReceived.length > 0
      ? (
          employee.performanceRatingsReceived.reduce((s, r) => s + r.stars, 0) /
          employee.performanceRatingsReceived.length
        ).toFixed(1)
      : "—";

  return (
    <div className="space-y-6">
      <PageHeader
        title={employee.fullName}
        description={`${employee.designation || employee.role.replace(/_/g, " ")} • ${employee.email}`}
        action={
          <Link href="/employees">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back to Employees
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-[#64748B]">Team(s)</p>
          <p className="text-sm font-semibold text-[#202638] mt-1">
            {employee.teamMemberships.map((m) => m.team.name).join(", ") || "Unassigned"}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-[#64748B]">Reports To</p>
          <p className="text-sm font-semibold text-[#202638] mt-1">
            {employee.manager?.fullName || "—"}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-[#64748B]">Assigned Deliverables</p>
          <p className="text-xl font-semibold text-[#4F46E5] mt-1">
            {employee.assignedDeliverables.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-[#64748B]">Average Rating</p>
          <p className="text-xl font-semibold text-[#202638] mt-1">{avgRating} / 5</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Deliverables</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-[#202638]">
            <thead className="bg-[#F1F3F9] text-[#64748B] border-y border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-2.5 font-medium">Job</th>
                <th className="px-4 py-2.5 font-medium">Deliverable</th>
                <th className="px-4 py-2.5 font-medium">Target Date</th>
                <th className="px-4 py-2.5 font-medium">Workflow</th>
                <th className="px-4 py-2.5 font-medium">Timeliness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {employee.assignedDeliverables.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#64748B]">
                    No deliverables assigned yet.
                  </td>
                </tr>
              ) : (
                employee.assignedDeliverables.map((d) => {
                  const ds = calculateDeliveryStatus({
                    targetDate: d.targetDate,
                    firstSubmittedAt: d.firstSubmittedAt,
                    isCancelled: d.workflowState === "CANCELLED",
                  });
                  return (
                    <tr key={d.id} className="hover:bg-[#F7F8FC]">
                      <td className="px-4 py-2.5 font-medium">
                        <Link href={`/jobs/${d.job.id}`} className="text-[#4F46E5] hover:underline">
                          {d.job.title}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5">
                        {DELIVERABLE_TYPE_LABELS[d.deliverableType] || d.title}
                      </td>
                      <td className="px-4 py-2.5 text-[#64748B]">{formatDate(d.targetDate)}</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge type="workflow" status={d.workflowState} />
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge type="delivery" status={ds} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}


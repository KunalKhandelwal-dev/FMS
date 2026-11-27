import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, requirePermission } from "@/server/auth/guards";
import { db } from "@/server/db/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { CreateEmployeeButton } from "@/features/employees/CreateEmployeeButton";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  requirePermission(user, "analytics:team_view");

  const employees = await db.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      designation: true,
      role: true,
      status: true,
      employeeCode: true,
      manager: { select: { fullName: true } },
      teamMemberships: {
        select: { team: { select: { name: true } } },
      },
      _count: {
        select: { assignedDeliverables: true },
      },
    },
    orderBy: { fullName: "asc" },
  });

  const canManage = user.role === "MAIN_MANAGER";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team &amp; Employees"
        description="Department staff directory, reporting hierarchy, team assignments, and active workload."
        action={canManage ? <CreateEmployeeButton /> : undefined}
      />

      <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#202638]">
            <thead className="bg-[#F1F3F9] text-xs font-medium text-[#64748B] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Team(s)</th>
                <th className="px-4 py-3">Reports To</th>
                <th className="px-4 py-3 text-center">Assigned Deliverables</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#F7F8FC]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#202638]">{emp.fullName}</p>
                    <p className="text-xs text-[#64748B]">{emp.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#64748B]">
                    {emp.designation || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <Badge variant="indigo">{emp.role.replace(/_/g, " ")}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#64748B]">
                    {emp.teamMemberships.map((m) => m.team.name).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#64748B]">
                    {emp.manager?.fullName || "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-center tabular-nums font-medium">
                    {emp._count.assignedDeliverables}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <Badge variant={emp.status === "ACTIVE" ? "blue" : "rose"}>
                      {emp.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/employees/${emp.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#4F46E5] hover:underline"
                    >
                      View
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

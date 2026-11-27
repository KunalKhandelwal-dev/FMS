import { redirect } from "next/navigation";
import { canAccessSalaryAndRoi, getCurrentUser } from "@/server/auth/guards";
import { roiService } from "@/server/services/roiService";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RoiPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (!canAccessSalaryAndRoi(user)) {
    return (
      <div className="p-8 rounded-lg border border-rose-200 bg-rose-50 text-[#E11D48] text-sm">
        Access denied: ROI and salary records are restricted to authorized Main Manager accounts.
      </div>
    );
  }

  const roiData = await roiService.getRoiOverview();

  return (
    <div className="space-y-6">
      <PageHeader
        title="ROI &amp; Credit Analysis"
        description="Departmental Team ROI and Individual ROI connected to live database records."
      />

      {/* Policy Notice Banner */}
      <div className="rounded-lg border border-indigo-200 bg-indigo-50/70 p-4 text-[#202638]">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#4F46E5] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">ROI Status: Calculation not configured</h4>
              <Badge variant="indigo">Policy Pending</Badge>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Team ROI (target &ge; 1) and Individual ROI (Credits Earned / Salary Taken) are
              connected to live teams, employees, credit ledger entries, and restricted salary
              records. Numeric ROI values will remain disabled (&ldquo;Calculation not
              configured&rdquo;) until official deliverable credit values and output weights are
              ratified in <span className="font-medium text-[#202638]">docs/PENDING_BUSINESS_DECISIONS.md</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Team ROI Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Team ROI Calculator</CardTitle>
          <CardDescription>
            Live teams loaded from database • Target benchmark: Team ROI &ge; 1
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-[#202638]">
            <thead className="bg-[#F1F3F9] text-[#64748B] border-y border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3 font-medium">Team</th>
                <th className="px-4 py-3 font-medium">Members</th>
                <th className="px-4 py-3 font-medium">No. of Working Days</th>
                <th className="px-4 py-3 font-medium">Approved Outputs</th>
                <th className="px-4 py-3 font-medium">Total Weighted Outputs</th>
                <th className="px-4 py-3 font-medium">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {roiData.teamRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#64748B]">
                    No active teams found in database.
                  </td>
                </tr>
              ) : (
                roiData.teamRows.map((team) => (
                  <tr key={team.id} className="hover:bg-[#F7F8FC]">
                    <td className="px-4 py-3 font-semibold">{team.name}</td>
                    <td className="px-4 py-3 tabular-nums">{team.memberCount}</td>
                    <td className="px-4 py-3 text-[#64748B]">Pending formula</td>
                    <td className="px-4 py-3 tabular-nums">{team.completedOutputs}</td>
                    <td className="px-4 py-3 text-[#64748B]">Calculation not configured</td>
                    <td className="px-4 py-3">
                      <Badge variant="slate">{team.roiStatus}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Individual ROI Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Individual ROI</CardTitle>
          <CardDescription>
            Stated formula: Individual ROI = Credits Earned / Salary Taken (Main Manager access only)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs text-[#202638]">
            <thead className="bg-[#F1F3F9] text-[#64748B] border-y border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3 font-medium">Employee Name</th>
                <th className="px-4 py-3 font-medium">Designation</th>
                <th className="px-4 py-3 font-medium">Credits Earned</th>
                <th className="px-4 py-3 font-medium">Salary Taken</th>
                <th className="px-4 py-3 font-medium">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {roiData.individualRows.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#F7F8FC]">
                  <td className="px-4 py-3 font-semibold">{emp.fullName}</td>
                  <td className="px-4 py-3 text-[#64748B]">{emp.designation}</td>
                  <td className="px-4 py-3 tabular-nums">{emp.creditsEarned}</td>
                  <td className="px-4 py-3 text-[#64748B]">
                    {emp.salaryTaken !== null ? `₹${emp.salaryTaken.toLocaleString("en-IN")}` : "Not configured"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="slate">{emp.roiStatus}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

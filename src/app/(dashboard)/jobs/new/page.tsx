import { redirect } from "next/navigation";
import { getCurrentUser, requirePermission } from "@/server/auth/guards";
import { db } from "@/server/db/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { CreateJobForm } from "@/features/jobs/CreateJobForm";

export const dynamic = "force-dynamic";

export default async function CreateJobPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  requirePermission(user, "job:create");

  const rawEmployees = await db.user.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      fullName: true,
      designation: true,
      role: true,
      teamMemberships: {
        select: {
          team: { select: { name: true } },
        },
      },
    },
    orderBy: { fullName: "asc" },
  });

  const employees = rawEmployees.map((e) => ({
    id: e.id,
    fullName: e.fullName,
    designation: e.designation,
    role: e.role,
    teams: e.teamMemberships.map((m) => m.team.name),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create New Job"
        description="Assign a content creation job, select an accountable owner, and configure deliverable target dates."
      />
      <CreateJobForm employees={employees} />
    </div>
  );
}


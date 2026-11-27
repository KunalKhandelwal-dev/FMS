import { notFound, redirect } from "next/navigation";
import { getCurrentUser, requirePermission } from "@/server/auth/guards";
import { db } from "@/server/db/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { EditJobForm } from "@/features/jobs/EditJobForm";

export const dynamic = "force-dynamic";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  requirePermission(user, "job:edit_metadata");

  const { jobId } = await params;

  const [job, employees] = await Promise.all([
    db.job.findUnique({ where: { id: jobId } }),
    db.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, fullName: true, designation: true, role: true },
      orderBy: { fullName: "asc" },
    }),
  ]);

  if (!job) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={`Edit Job: ${job.title}`} description="Update job metadata and owner." />
      <EditJobForm
        job={{
          id: job.id,
          title: job.title,
          category: job.category || "Events",
          ownerId: job.ownerId || "",
          description: job.description || "",
          priority: job.priority,
        }}
        employees={employees}
      />
    </div>
  );
}


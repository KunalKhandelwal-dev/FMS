import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/guards";
import { analyticsService } from "@/server/services/analyticsService";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { RecentJobsTable } from "@/features/dashboard/RecentJobsTable";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const data = await analyticsService.getManagerDashboardData({
    search: params.search,
    category: params.category,
    ...(user.role === "EMPLOYEE" ? { ownerId: user.id } : {}),
  });

  const canCreate = user.role === "MAIN_MANAGER";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs & Deliverables"
        description="Track departmental jobs, accountable owners, deliverable counts, and completion progress."
        action={
          canCreate ? (
            <Link href="/jobs/new">
              <Button variant="primary" size="md">
                <Plus className="w-4 h-4 mr-1.5" />
                Create New Job
              </Button>
            </Link>
          ) : undefined
        }
      />

      <RecentJobsTable jobs={data.recentJobs} />
    </div>
  );
}

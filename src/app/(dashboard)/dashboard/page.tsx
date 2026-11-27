import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/guards";
import { analyticsService } from "@/server/services/analyticsService";
import { db } from "@/server/db/client";
import { Button } from "@/components/ui/button";
import { PerformanceSummaryCards } from "@/features/dashboard/PerformanceSummaryCards";
import { DashboardFilters } from "@/features/dashboard/DashboardFilters";
import { RecentJobsTable } from "@/features/dashboard/RecentJobsTable";
import { DashboardCharts } from "@/features/dashboard/DashboardCharts";
import { PendingActionsPanel } from "@/features/dashboard/PendingActionsPanel";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    fromDate?: string;
    toDate?: string;
    ownerId?: string;
    category?: string;
  }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Employees without manager privileges are directed to their My Work portal
  if (user.role === "EMPLOYEE") {
    redirect("/my-work");
  }

  const params = await searchParams;
  const firstName = user.fullName.split(" ")[0] || user.fullName;

  const [dashboardData, activeEmployees] = await Promise.all([
    analyticsService.getManagerDashboardData({
      search: params.search,
      fromDate: params.fromDate,
      toDate: params.toDate,
      ownerId: params.ownerId,
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
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#202638] tracking-tight">
            Good morning, {firstName}
          </h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Here&apos;s an overview of your department&apos;s work and performance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/jobs/new">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4 mr-1.5" />
              Create New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <DashboardFilters owners={activeEmployees} />

      {/* A. Performance Summary Cards */}
      <PerformanceSummaryCards summary={dashboardData.summary} />

      {/* B. Recent Jobs Table */}
      <RecentJobsTable jobs={dashboardData.recentJobs} />

      {/* C. Productivity Overview Charts */}
      <DashboardCharts charts={dashboardData.charts} />

      {/* D. Pending Actions */}
      <PendingActionsPanel pendingActions={dashboardData.pendingActions} />
    </div>
  );
}

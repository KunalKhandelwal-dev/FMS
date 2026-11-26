import { db } from "@/server/db/client";
import { StageStatus, TaskAssignmentStatus } from "@prisma/client";

export class AnalyticsService {
  /**
   * Aggregates department-wide or team-wide task & deliverable productivity metrics.
   */
  async getProductivityMetrics(teamId?: string) {
    const deliverables = await db.deliverable.findMany({
      where: teamId ? { job: { teamId } } : {},
      select: {
        id: true,
        deliverableType: true,
        status: true,
        targetDate: true,
        completedAt: true,
      },
    });

    const total = deliverables.length;
    const completedOnTime = deliverables.filter(
      (d) => d.status === StageStatus.COMPLETED_ON_TIME
    ).length;
    const completedLate = deliverables.filter(
      (d) => d.status === StageStatus.LATE_COMPLETED
    ).length;
    const notInitiated = deliverables.filter((d) => d.status === StageStatus.NOT_INITIATED).length;
    const inProgress = deliverables.filter((d) => d.status === StageStatus.IN_PROGRESS).length;
    const cancelled = deliverables.filter((d) => d.status === StageStatus.CANCELLED).length;

    // Output by deliverable type
    const byType: Record<string, number> = {};
    for (const d of deliverables) {
      byType[d.deliverableType] = (byType[d.deliverableType] || 0) + 1;
    }

    return {
      total,
      completedOnTime,
      completedLate,
      notInitiated,
      inProgress,
      cancelled,
      onTimeRate: total > 0 ? Math.round((completedOnTime / total) * 100) : 0,
      byType,
    };
  }

  /**
   * Retrieves role-specific productivity (e.g. CAMERAMAN, VIDEO_EDITOR).
   */
  async getSpecialistMetrics(roleTag: string) {
    return db.taskAssignment.groupBy({
      by: ["assignedToId", "status"],
      where: { roleTag },
      _count: { id: true },
    });
  }

  /**
   * Retrieves ROI calculations safely.
   * Marked as NOT CONFIGURED until approved business formulas are delivered.
   */
  async getRoiStatus() {
    return {
      isConfigured: false,
      message:
        "ROI calculation models are awaiting formal policy confirmation from university leadership. Refer to docs/PENDING_BUSINESS_DECISIONS.md.",
      configurableParametersPending: [
        "Base credit points per deliverable",
        "Complexity weights",
        "Salary denominator evaluation period",
        "Target team benchmark",
      ],
    };
  }
}

export const analyticsService = new AnalyticsService();

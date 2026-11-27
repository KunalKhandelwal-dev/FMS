import { db } from "@/server/db/client";
import {
  DeliveryPerformanceStatus,
  JobType,
  WorkflowState,
} from "@prisma/client";
import { calculateDeliveryStatus, getKolkataEndOfDay, getKolkataStartOfDay } from "@/lib/dates";
import {
  CONTENT_DELIVERABLE_TYPES,
  DELIVERABLE_TYPE_LABELS,
  JOB_CATEGORIES,
} from "@/lib/constants";

export interface DashboardFilterParams {
  fromDate?: string;
  toDate?: string;
  ownerId?: string;
  category?: string;
  search?: string;
  jobType?: JobType;
}

export class AnalyticsService {
  /**
   * Computes live Manager Dashboard KPIs, Charts, Pending Actions, and Recent Jobs.
   */
  async getManagerDashboardData(filters: DashboardFilterParams = {}) {
    const jobWhere: Record<string, unknown> = {};

    if (filters.fromDate || filters.toDate) {
      jobWhere.jobDate = {
        ...(filters.fromDate ? { gte: getKolkataStartOfDay(filters.fromDate) } : {}),
        ...(filters.toDate ? { lte: getKolkataEndOfDay(filters.toDate) } : {}),
      };
    }
    if (filters.ownerId) {
      jobWhere.ownerId = filters.ownerId;
    }
    if (filters.category) {
      jobWhere.category = filters.category;
    }
    if (filters.jobType) {
      jobWhere.jobType = filters.jobType;
    }
    if (filters.search) {
      jobWhere.title = { contains: filters.search };
    }

    const jobs = await db.job.findMany({
      where: jobWhere,
      include: {
        owner: { select: { id: true, fullName: true, designation: true } },
        createdBy: { select: { id: true, fullName: true } },
        deliverables: {
          include: {
            assignedTo: { select: { id: true, fullName: true } },
            submissions: {
              orderBy: { submittedAt: "desc" },
              take: 1,
              include: {
                submittedBy: { select: { id: true, fullName: true } },
              },
            },
          },
        },
      },
      orderBy: { jobDate: "desc" },
    });

    let totalDeliverablesAssigned = 0;
    let completedOnTime = 0;
    let lateCompleted = 0;
    let notDoneTillDate = 0;
    let cancelled = 0;
    let awaitingReview = 0;

    const byTypeMap: Record<string, number> = {};
    const byCategoryMap: Record<string, number> = {};
    const workloadMap: Record<string, { name: string; total: number; completed: number }> = {};
    const monthlyMap: Record<string, { month: string; onTime: number; late: number }> = {};

    const awaitingReviewItems: Array<{
      id: string;
      title: string;
      jobId: string;
      jobTitle: string;
      employeeName: string;
      submittedAt: Date | null;
    }> = [];

    const overdueItems: Array<{
      id: string;
      title: string;
      jobId: string;
      jobTitle: string;
      employeeName: string;
      targetDate: Date | null;
    }> = [];

    const revisionItems: Array<{
      id: string;
      title: string;
      jobId: string;
      jobTitle: string;
      employeeName: string;
    }> = [];

    const recentSubmissions: Array<{
      id: string;
      deliverableId: string;
      deliverableTitle: string;
      jobId: string;
      jobTitle: string;
      submittedByName: string;
      submittedAt: Date;
    }> = [];

    const recentJobs = jobs.map((job) => {
      const cat = job.category || "Uncategorized";
      byCategoryMap[cat] = (byCategoryMap[cat] || 0) + 1;

      const ownerName = job.owner?.fullName || "Unassigned";
      if (!workloadMap[ownerName]) {
        workloadMap[ownerName] = { name: ownerName, total: 0, completed: 0 };
      }

      let jobCompletedCount = 0;
      let jobPendingCount = 0;

      for (const d of job.deliverables) {
        totalDeliverablesAssigned++;
        workloadMap[ownerName].total++;

        const effectiveStatus = calculateDeliveryStatus({
          targetDate: d.targetDate,
          firstSubmittedAt: d.firstSubmittedAt,
          isCancelled: d.workflowState === WorkflowState.CANCELLED,
        });

        byTypeMap[d.deliverableType] = (byTypeMap[d.deliverableType] || 0) + 1;

        const monthKey = new Intl.DateTimeFormat("en-US", {
          month: "short",
          year: "2-digit",
        }).format(job.jobDate);
        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = { month: monthKey, onTime: 0, late: 0 };
        }

        if (effectiveStatus === DeliveryPerformanceStatus.COMPLETED_ON_TIME) {
          completedOnTime++;
          monthlyMap[monthKey].onTime++;
        } else if (effectiveStatus === DeliveryPerformanceStatus.LATE_COMPLETED) {
          lateCompleted++;
          monthlyMap[monthKey].late++;
        } else if (effectiveStatus === DeliveryPerformanceStatus.NOT_DONE_TILL_DATE) {
          notDoneTillDate++;
          overdueItems.push({
            id: d.id,
            title: d.title,
            jobId: job.id,
            jobTitle: job.title,
            employeeName: d.assignedTo?.fullName || ownerName,
            targetDate: d.targetDate,
          });
        } else if (effectiveStatus === DeliveryPerformanceStatus.CANCELLED) {
          cancelled++;
        }

        if (
          d.workflowState === WorkflowState.SUBMITTED ||
          d.workflowState === WorkflowState.UNDER_REVIEW
        ) {
          awaitingReview++;
          awaitingReviewItems.push({
            id: d.id,
            title: d.title,
            jobId: job.id,
            jobTitle: job.title,
            employeeName: d.submissions[0]?.submittedBy.fullName || ownerName,
            submittedAt: d.submissions[0]?.submittedAt || d.firstSubmittedAt,
          });
        }

        if (d.workflowState === WorkflowState.REVISION_REQUESTED) {
          revisionItems.push({
            id: d.id,
            title: d.title,
            jobId: job.id,
            jobTitle: job.title,
            employeeName: d.assignedTo?.fullName || ownerName,
          });
        }

        if (d.submissions[0]) {
          recentSubmissions.push({
            id: d.submissions[0].id,
            deliverableId: d.id,
            deliverableTitle: d.title,
            jobId: job.id,
            jobTitle: job.title,
            submittedByName: d.submissions[0].submittedBy.fullName,
            submittedAt: d.submissions[0].submittedAt,
          });
        }

        if (d.workflowState === WorkflowState.APPROVED) {
          jobCompletedCount++;
          workloadMap[ownerName].completed++;
        } else if (d.workflowState !== WorkflowState.CANCELLED) {
          jobPendingCount++;
        }
      }

      return {
        id: job.id,
        jobDate: job.jobDate,
        title: job.title,
        jobType: job.jobType,
        category: job.category,
        ownerName,
        totalDeliverables: job.deliverables.length,
        completedCount: jobCompletedCount,
        pendingCount: jobPendingCount,
        status: job.status,
      };
    });

    recentSubmissions.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());

    return {
      summary: {
        totalJobsCreated: jobs.length,
        totalDeliverablesAssigned,
        completedOnTime,
        lateCompleted,
        notDoneTillDate,
        cancelled,
        awaitingReview,
      },
      recentJobs,
      charts: {
        onTimeVsLate: [
          { name: "On Time", value: completedOnTime },
          { name: "Late", value: lateCompleted },
          { name: "Overdue", value: notDoneTillDate },
          { name: "Cancelled", value: cancelled },
        ],
        byDeliverableType: Object.entries(byTypeMap).map(([type, count]) => ({
          name: DELIVERABLE_TYPE_LABELS[type] || type,
          count,
        })),
        byCategory: Object.entries(byCategoryMap).map(([name, count]) => ({
          name,
          count,
        })),
        workloadByOwner: Object.values(workloadMap),
        monthlyTrend: Object.values(monthlyMap),
      },
      pendingActions: {
        awaitingReviewItems: awaitingReviewItems.slice(0, 6),
        overdueItems: overdueItems.slice(0, 6),
        revisionItems: revisionItems.slice(0, 6),
        recentSubmissions: recentSubmissions.slice(0, 6),
      },
    };
  }

  /**
   * Generates the Content Creation Team Productivity Dashboard data
   * matching the departmental tracker structure (Deliverable Type, Job Type,
   * Cameraman Productivity, Video Editor Productivity).
   */
  async getProductivityReport(filters: {
    fromDate?: string;
    toDate?: string;
    teamLeadId?: string;
    category?: string;
  }) {
    const jobWhere: Record<string, unknown> = {
      jobType: JobType.CONTENT_CREATION,
    };

    if (filters.fromDate || filters.toDate) {
      jobWhere.jobDate = {
        ...(filters.fromDate ? { gte: getKolkataStartOfDay(filters.fromDate) } : {}),
        ...(filters.toDate ? { lte: getKolkataEndOfDay(filters.toDate) } : {}),
      };
    }
    if (filters.teamLeadId) {
      jobWhere.ownerId = filters.teamLeadId;
    }
    if (filters.category) {
      jobWhere.category = filters.category;
    }

    const jobs = await db.job.findMany({
      where: jobWhere,
      include: {
        deliverables: {
          include: {
            shootAssignedTo: { select: { id: true, fullName: true } },
            editorAssignedTo: { select: { id: true, fullName: true } },
          },
        },
      },
    });

    let totalDeliverablesAssigned = 0;
    let completedOnTime = 0;
    let lateCompleted = 0;
    let notDoneTillDate = 0;
    let cancelled = 0;

    const deliverableTypeCounts: Record<string, number> = {};
    for (const dt of CONTENT_DELIVERABLE_TYPES) {
      deliverableTypeCounts[dt.value] = 0;
    }

    const jobTypeCounts: Record<string, number> = {};
    for (const cat of JOB_CATEGORIES) {
      jobTypeCounts[cat] = 0;
    }

    const cameramanMap: Record<
      string,
      { id: string; name: string; counts: Record<string, number>; total: number }
    > = {};

    const editorMap: Record<
      string,
      { id: string; name: string; counts: Record<string, number>; total: number }
    > = {};

    for (const job of jobs) {
      if (job.category && jobTypeCounts[job.category] !== undefined) {
        jobTypeCounts[job.category]++;
      }

      for (const d of job.deliverables) {
        totalDeliverablesAssigned++;

        if (deliverableTypeCounts[d.deliverableType] !== undefined) {
          deliverableTypeCounts[d.deliverableType]++;
        }

        const effectiveStatus = calculateDeliveryStatus({
          targetDate: d.targetDate,
          firstSubmittedAt: d.firstSubmittedAt,
          isCancelled: d.workflowState === WorkflowState.CANCELLED,
        });

        if (effectiveStatus === DeliveryPerformanceStatus.COMPLETED_ON_TIME) completedOnTime++;
        else if (effectiveStatus === DeliveryPerformanceStatus.LATE_COMPLETED) lateCompleted++;
        else if (effectiveStatus === DeliveryPerformanceStatus.NOT_DONE_TILL_DATE)
          notDoneTillDate++;
        else if (effectiveStatus === DeliveryPerformanceStatus.CANCELLED) cancelled++;

        if (d.shootAssignedTo) {
          if (!cameramanMap[d.shootAssignedTo.id]) {
            cameramanMap[d.shootAssignedTo.id] = {
              id: d.shootAssignedTo.id,
              name: d.shootAssignedTo.fullName,
              counts: {},
              total: 0,
            };
          }
          cameramanMap[d.shootAssignedTo.id].counts[d.deliverableType] =
            (cameramanMap[d.shootAssignedTo.id].counts[d.deliverableType] || 0) + 1;
          cameramanMap[d.shootAssignedTo.id].total++;
        }

        if (d.editorAssignedTo) {
          if (!editorMap[d.editorAssignedTo.id]) {
            editorMap[d.editorAssignedTo.id] = {
              id: d.editorAssignedTo.id,
              name: d.editorAssignedTo.fullName,
              counts: {},
              total: 0,
            };
          }
          editorMap[d.editorAssignedTo.id].counts[d.deliverableType] =
            (editorMap[d.editorAssignedTo.id].counts[d.deliverableType] || 0) + 1;
          editorMap[d.editorAssignedTo.id].total++;
        }
      }
    }

    return {
      metrics: {
        totalProductsCreated: jobs.length,
        totalDeliverablesAssigned,
        completedOnTime,
        lateCompleted,
        notDoneTillDate,
        cancelled,
      },
      deliverableTypeCounts,
      jobTypeCounts,
      cameramanProductivity: Object.values(cameramanMap).sort((a, b) => b.total - a.total),
      editorProductivity: Object.values(editorMap).sort((a, b) => b.total - a.total),
    };
  }
}

export const analyticsService = new AnalyticsService();

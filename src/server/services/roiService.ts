import { db } from "@/server/db/client";
import { getKolkataEndOfDay, getKolkataStartOfDay } from "@/lib/dates";

export class RoiService {
  /**
   * Returns Team ROI & Individual ROI data connected to real database records.
   * Calculations remain marked "Calculation not configured" until official
   * department formulas and credit weights are confirmed.
   */
  async getRoiOverview(filters?: { fromDate?: string; toDate?: string }) {
    const dateFilter =
      filters?.fromDate || filters?.toDate
        ? {
            ...(filters.fromDate ? { gte: getKolkataStartOfDay(filters.fromDate) } : {}),
            ...(filters.toDate ? { lte: getKolkataEndOfDay(filters.toDate) } : {}),
          }
        : undefined;

    const [teams, employees, creditRules, salaryRecordsCount] = await Promise.all([
      db.team.findMany({
        where: { isActive: true },
        include: {
          lead: { select: { id: true, fullName: true } },
          _count: { select: { memberships: true, jobs: true } },
          jobs: {
            where: dateFilter ? { jobDate: dateFilter } : {},
            include: {
              deliverables: {
                select: { id: true, workflowState: true, deliveryStatus: true },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      }),
      db.user.findMany({
        where: { status: "ACTIVE", role: { not: "MAIN_MANAGER" } },
        select: {
          id: true,
          fullName: true,
          designation: true,
          creditLedgerEntries: {
            where: dateFilter ? { awardedAt: dateFilter } : {},
            select: { creditsEarned: true },
          },
          salaryRecords: {
            orderBy: [{ effectiveYear: "desc" }, { effectiveMonth: "desc" }],
            take: 1,
            select: { amount: true, currency: true, effectiveMonth: true, effectiveYear: true },
          },
        },
        orderBy: { fullName: "asc" },
      }),
      db.creditRule.findMany({
        where: { isActive: true },
        orderBy: { deliverableType: "asc" },
      }),
      db.salaryRecord.count(),
    ]);

    const teamRows = teams.map((t) => {
      const completedDeliverables = t.jobs.reduce(
        (acc, job) =>
          acc + job.deliverables.filter((d) => d.workflowState === "APPROVED").length,
        0
      );

      return {
        id: t.id,
        name: t.name,
        leadName: t.lead?.fullName || "—",
        memberCount: t._count.memberships,
        completedOutputs: completedDeliverables,
        workingDays: null as number | null,
        weightedOutputs: null as number | null,
        roiStatus: "Calculation not configured",
      };
    });

    const individualRows = employees.map((emp) => {
      const creditsEarned = emp.creditLedgerEntries.reduce(
        (sum, entry) => sum + Number(entry.creditsEarned),
        0
      );
      const latestSalary = emp.salaryRecords[0] ? Number(emp.salaryRecords[0].amount) : null;

      return {
        id: emp.id,
        fullName: emp.fullName,
        designation: emp.designation || "Team Member",
        creditsEarned,
        salaryTaken: latestSalary,
        roiStatus: "Calculation not configured",
      };
    });

    return {
      isConfigured: false,
      statusMessage: "Calculation not configured",
      teamRows,
      individualRows,
      creditRulesCount: creditRules.length,
      salaryRecordsCount,
    };
  }
}

export const roiService = new RoiService();


import { Card, CardContent } from "@/components/ui/card";
import {
  Briefcase,
  Package,
  CheckCircle2,
  ClockAlert,
  AlertCircle,
  Ban,
  FileCheck2,
} from "lucide-react";

interface SummaryMetrics {
  totalJobsCreated: number;
  totalDeliverablesAssigned: number;
  completedOnTime: number;
  lateCompleted: number;
  notDoneTillDate: number;
  cancelled: number;
  awaitingReview: number;
}

export function PerformanceSummaryCards({ summary }: { summary: SummaryMetrics }) {
  const cards = [
    {
      label: "Total Jobs Created",
      value: summary.totalJobsCreated,
      icon: Briefcase,
      accent: "text-[#4F46E5] bg-indigo-50",
    },
    {
      label: "Deliverables Assigned",
      value: summary.totalDeliverablesAssigned,
      icon: Package,
      accent: "text-[#7C3AED] bg-violet-50",
    },
    {
      label: "Completed On Time",
      value: summary.completedOnTime,
      icon: CheckCircle2,
      accent: "text-blue-700 bg-blue-50",
    },
    {
      label: "Late Completed",
      value: summary.lateCompleted,
      icon: ClockAlert,
      accent: "text-[#E11D48] bg-rose-50",
    },
    {
      label: "Not Done Till Date",
      value: summary.notDoneTillDate,
      icon: AlertCircle,
      accent: "text-slate-700 bg-slate-100",
    },
    {
      label: "Cancelled",
      value: summary.cancelled,
      icon: Ban,
      accent: "text-gray-600 bg-gray-100",
    },
    {
      label: "Awaiting Review",
      value: summary.awaitingReview,
      icon: FileCheck2,
      accent: "text-[#4F46E5] bg-indigo-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.label} className="p-4">
            <CardContent className="p-0 flex flex-col justify-between h-full gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#64748B] leading-tight">
                  {c.label}
                </span>
                <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${c.accent}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-[#202638] tabular-nums">{c.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}


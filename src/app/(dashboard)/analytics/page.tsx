import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Productivity & Analytics"
        description="Delivery punctuality, cameraman and video editor turnaround metrics, and category volume."
      />

      <EmptyState
        icon={<BarChart3 className="w-8 h-8 text-[#0A1F44]" />}
        title="Analytics Pipeline Ready"
        description="Productivity dashboards will compute live metrics as jobs, shoot records, and edit submissions are completed and reviewed."
      />
    </div>
  );
}


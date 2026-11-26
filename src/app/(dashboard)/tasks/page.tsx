import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { CheckSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Task Assignments & Work Breakdown"
        description="Individual shoot assignments, editing queues, design mockups, and execution timelines."
        action={
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Assign New Task
          </Button>
        }
      />

      <EmptyState
        icon={<CheckSquare className="w-8 h-8 text-[#0A1F44]" />}
        title="No Tasks Assigned"
        description="There are currently no active tasks assigned to you or your team. Once deliverables are broken down into work items, they will appear here."
      />
    </div>
  );
}


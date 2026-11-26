import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { FileCheck2 } from "lucide-react";

export default function ApprovalsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Approvals & Revisions"
        description="Review submitted footage, edited videos, design mockups, and author quality feedback."
      />

      <EmptyState
        icon={<FileCheck2 className="w-8 h-8 text-[#0A1F44]" />}
        title="No Submissions Awaiting Approval"
        description="All work submissions are currently up to date. When team members submit drafts or raw footage links, they will populate this queue for sign-off."
      />
    </div>
  );
}


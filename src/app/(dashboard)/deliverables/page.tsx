import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DeliverablesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Deliverables"
        description="Track reels, photo posts, physical banners, mockups, and stage progress across all jobs."
        action={
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Deliverable
          </Button>
        }
      />

      <EmptyState
        icon={<Package className="w-8 h-8 text-[#0A1F44]" />}
        title="No Deliverables Found"
        description="Deliverables represent concrete creative outputs (e.g. Standard Reel, Byte Reel, Event Mockup, Pack-up). Create a job first to add deliverables."
      />
    </div>
  );
}


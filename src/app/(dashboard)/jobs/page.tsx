import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Jobs & Campaigns"
        description="Track overarching university events, promotional campaigns, and branding initiatives."
        action={
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Master Job
          </Button>
        }
      />

      <EmptyState
        icon={<Briefcase className="w-8 h-8 text-[#0A1F44]" />}
        title="No Jobs Registered"
        description="No master campaigns or campus events have been created yet. Main Managers can register jobs and assign them to Deputy Managers for execution."
        action={
          <Button variant="primary" size="sm">
            Register First Job
          </Button>
        }
      />
    </div>
  );
}


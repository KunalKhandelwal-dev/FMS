import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Network, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TeamsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Teams & Units"
        description="Configure deputy-manager-led operational teams, creative cells, and member distribution."
        action={
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Create Production Unit
          </Button>
        }
      />

      <EmptyState
        icon={<Network className="w-8 h-8 text-[#0A1F44]" />}
        title="No Production Teams Configured"
        description="Teams such as Creative Content, Video Production, and Branding Logistics are pending final confirmation. Teams can be defined dynamically without code alterations."
        action={
          <Button variant="outline" size="sm">
            Configure Initial Teams
          </Button>
        }
      />
    </div>
  );
}


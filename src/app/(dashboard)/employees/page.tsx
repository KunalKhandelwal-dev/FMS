import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Employees & Staff"
        description="Manage branding department personnel, supervisor reporting chains, and account status."
        action={
          <Button variant="primary" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Staff Member
          </Button>
        }
      />

      <EmptyState
        icon={<Users className="w-8 h-8 text-[#0A1F44]" />}
        title="No Staff Records Found"
        description="The official department employee list and reporting hierarchy have not yet been provisioned. Accounts can be created by the Main Manager or imported upon roster sign-off."
        action={
          <Button variant="outline" size="sm">
            Import Department Roster
          </Button>
        }
      />
    </div>
  );
}


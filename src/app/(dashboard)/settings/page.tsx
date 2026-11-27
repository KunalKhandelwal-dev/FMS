import { redirect } from "next/navigation";
import { getCurrentUser, requireRole } from "@/server/auth/guards";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Sliders } from "lucide-react";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  requireRole(user, ["MAIN_MANAGER"]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        description="Departmental workflow configuration, security policy, and business rule controls."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#4F46E5]" />
              <CardTitle>Workflow Configuration</CardTitle>
            </div>
            <CardDescription>Active production pipelines and turnaround rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-[#64748B]">
            <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
              <span className="font-medium text-[#202638]">Content Creation Pipeline</span>
              <Badge variant="blue">Active</Badge>
            </div>
            <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
              <span className="font-medium text-[#202638]">Branding &amp; Production (5-Stage)</span>
              <Badge variant="blue">Active</Badge>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium text-[#202638]">Deadline Timezone</span>
              <Badge variant="indigo">Asia/Kolkata</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#4F46E5]" />
              <CardTitle>Security &amp; Access Control</CardTitle>
            </div>
            <CardDescription>Server-side authorization and audit trail enforcement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-[#64748B]">
            <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
              <span className="font-medium text-[#202638]">Role-Based Access Control</span>
              <Badge variant="blue">Enforced Server-Side</Badge>
            </div>
            <div className="flex justify-between py-2 border-b border-[#E5E7EB]">
              <span className="font-medium text-[#202638]">Session Storage</span>
              <Badge variant="blue">HttpOnly Cookie (HS256)</Badge>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium text-[#202638]">Audit History</span>
              <Badge variant="indigo">Append-Only</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

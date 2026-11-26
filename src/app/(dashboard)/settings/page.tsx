import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Shield, Sliders } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Department & System Settings"
        description="System configuration, security settings, and departmental workflow policies."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#0A1F44]" />
              <CardTitle>Workflow Engine Settings</CardTitle>
            </div>
            <CardDescription>
              Configure default turnaround times and required sign-offs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-medium text-slate-700">Content Creation Workflow</span>
              <span className="text-emerald-700 font-semibold">Active Template</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-medium text-slate-700">Branding & Production (5-Stage)</span>
              <span className="text-emerald-700 font-semibold">Active Template</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium text-slate-700">Turnaround Day Counting</span>
              <span className="text-amber-700 font-semibold">
                Pending Calendar vs. Working Days
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#0A1F44]" />
              <CardTitle>Security & Access Control</CardTitle>
            </div>
            <CardDescription>Role definitions and active authorization controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-medium text-slate-700">Database Role Guard</span>
              <span className="text-emerald-700 font-semibold">Enforced Server-Side</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="font-medium text-slate-700">Session Security</span>
              <span className="text-emerald-700 font-semibold">HttpOnly Cookie (HS256)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium text-slate-700">Team Lead Role Tier</span>
              <span className="text-amber-700 font-semibold">
                Configurable (Pending Confirmation)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

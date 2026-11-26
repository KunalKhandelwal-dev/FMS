import { getCurrentUser } from "@/server/auth/guards";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Briefcase, CheckSquare, Clock, Users, ArrowUpRight, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Overview"
        description={`Welcome back, ${user?.fullName || "Staff Member"}. Operational summary for Geeta University Branding Department.`}
      />

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Active Jobs</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#0A1F44]">
              <Briefcase className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0A1F44]">0</div>
            <p className="text-xs text-slate-500 mt-1">Pending job initialization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Reviews</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-[#E8871A]">
              <Clock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0A1F44]">0</div>
            <p className="text-xs text-slate-500 mt-1">Submissions awaiting sign-off</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Active Tasks</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CheckSquare className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0A1F44]">0</div>
            <p className="text-xs text-slate-500 mt-1">Assignments in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-600">Department Teams</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-700">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0A1F44]">0</div>
            <p className="text-xs text-slate-500 mt-1">Configured production cells</p>
          </CardContent>
        </Card>
      </div>

      {/* Operational Modules Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Production Pipelines</CardTitle>
            <CardDescription>
              Direct access to the Branding Department&apos;s two primary workflows
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/jobs"
              className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 hover:border-[#0A1F44] hover:bg-slate-50 transition-colors group"
            >
              <div>
                <p className="text-sm font-semibold text-[#0A1F44]">Content Creation Pipeline</p>
                <p className="text-xs text-slate-500">
                  Shoot scheduling, raw footage, video editing, and social publishing
                </p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#0A1F44]" />
            </Link>

            <Link
              href="/jobs"
              className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 hover:border-[#0A1F44] hover:bg-slate-50 transition-colors group"
            >
              <div>
                <p className="text-sm font-semibold text-[#0A1F44]">
                  Branding & Production Pipeline
                </p>
                <p className="text-xs text-slate-500">
                  5-stage mockup, approved design, print orders, installation, and pack-ups
                </p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#0A1F44]" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Policy & Governance Notice</CardTitle>
            <CardDescription>System configuration and business rules state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
              <ShieldAlert className="w-4 h-4 text-[#E8871A] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-950">Pending Policy Decisions</p>
                <p className="text-amber-800 mt-0.5">
                  The employee directory, team distribution, credit values, and ROI models are
                  awaiting final confirmation from university leadership. No fabricated figures are
                  calculated.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

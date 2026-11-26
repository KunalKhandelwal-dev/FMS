import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert, Settings2, FileText } from "lucide-react";
import Link from "next/link";

export default function RoiPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Credits & ROI Analysis"
        description="Departmental output weighting, credit ledger, and executive return on investment models."
      />

      {/* Prominent Policy Warning Banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-5 text-amber-950">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#E8871A] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold text-sm text-amber-950">
              ROI Calculation Status: NOT CONFIGURED / PENDING CONFIRMATION
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              In accordance with university engineering rules, FMS strictly prohibits display of
              fabricated financial calculations. The credit base values per deliverable, output
              complexity weights, and salary evaluation denominators have not been formally
              confirmed by university leadership.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurable Credit Rules</CardTitle>
            <CardDescription>
              Policy table mapping deliverable types to baseline credits and complexity multipliers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-500 leading-relaxed">
              Rules can be created and adjusted dynamically in the database (`credit_rules` table)
              once approved by the Main Manager without requiring code changes.
            </p>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <span className="font-semibold text-[#0A1F44]">
                Preliminary Formula Stated in Sheets:
              </span>
              <p className="font-mono mt-1 text-slate-700">
                Individual ROI = Credits Earned / Salary Taken
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Policy Items</CardTitle>
            <CardDescription>Documentation reference for leadership review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-500 leading-relaxed">
              For full details on the 13 pending departmental business decisions, consult the
              project technical documentation:
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-[#0A1F44] p-3 rounded-lg bg-slate-100/70 border border-slate-200">
              <FileText className="w-4 h-4 text-[#E8871A]" />
              <span>docs/PENDING_BUSINESS_DECISIONS.md</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

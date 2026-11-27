import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDate } from "@/lib/dates";
import { ArrowRight, Clock, AlertCircle, RotateCcw, FileCheck2 } from "lucide-react";

interface PendingActionsProps {
  pendingActions: {
    awaitingReviewItems: Array<{
      id: string;
      title: string;
      jobId: string;
      jobTitle: string;
      employeeName: string;
      submittedAt: Date | null;
    }>;
    overdueItems: Array<{
      id: string;
      title: string;
      jobId: string;
      jobTitle: string;
      employeeName: string;
      targetDate: Date | null;
    }>;
    revisionItems: Array<{
      id: string;
      title: string;
      jobId: string;
      jobTitle: string;
      employeeName: string;
    }>;
    recentSubmissions: Array<{
      id: string;
      deliverableId: string;
      deliverableTitle: string;
      jobId: string;
      jobTitle: string;
      submittedByName: string;
      submittedAt: Date;
    }>;
  };
}

export function PendingActionsPanel({ pendingActions }: PendingActionsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Awaiting Manager Review */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#4F46E5]" />
              Awaiting Review
            </CardTitle>
            <CardDescription>Submitted deliverables ready for rating and approval</CardDescription>
          </div>
          <Link href="/approvals" className="text-xs font-medium text-[#4F46E5] hover:underline">
            Review Queue
          </Link>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {pendingActions.awaitingReviewItems.length === 0 ? (
            <p className="text-xs text-[#64748B] py-4 text-center">
              No submissions awaiting review.
            </p>
          ) : (
            pendingActions.awaitingReviewItems.map((item) => (
              <Link
                key={item.id}
                href={`/jobs/${item.jobId}`}
                className="flex items-center justify-between p-3 rounded-lg border border-[#E5E7EB] hover:bg-[#F7F8FC] transition-colors"
              >
                <div>
                  <p className="text-xs font-semibold text-[#202638]">
                    {item.jobTitle} — {item.title}
                  </p>
                  <p className="text-[11px] text-[#64748B]">
                    By {item.employeeName} • {formatDate(item.submittedAt)}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#4F46E5]" />
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      {/* Overdue & Revisions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#E11D48]" />
            Overdue &amp; Revision Attention
          </CardTitle>
          <CardDescription>
            Deliverables past target date or currently in revision
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {pendingActions.overdueItems.length === 0 && pendingActions.revisionItems.length === 0 ? (
            <p className="text-xs text-[#64748B] py-4 text-center">
              No overdue deliverables or pending revisions.
            </p>
          ) : (
            <>
              {pendingActions.overdueItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/jobs/${item.jobId}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-rose-200 bg-rose-50/40 hover:bg-rose-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-3.5 h-3.5 text-[#E11D48] shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-[#202638]">
                        {item.jobTitle} — {item.title}
                      </p>
                      <p className="text-[11px] text-[#E11D48]">
                        Owner: {item.employeeName} • Due {formatDate(item.targetDate)}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#E11D48]" />
                </Link>
              ))}
              {pendingActions.revisionItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/jobs/${item.jobId}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-violet-200 bg-violet-50/40 hover:bg-violet-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <RotateCcw className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-[#202638]">
                        {item.jobTitle} — {item.title}
                      </p>
                      <p className="text-[11px] text-[#7C3AED]">
                        Revision Requested • {item.employeeName}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#7C3AED]" />
                </Link>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

